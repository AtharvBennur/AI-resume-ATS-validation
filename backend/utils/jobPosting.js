const dns = require('node:dns').promises;
const https = require('node:https');
const net = require('node:net');

const maxResponseBytes = 2 * 1024 * 1024;
const maxRedirects = 3;
const blockedIPv4 = new net.BlockList();
[
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4]
].forEach(([address, prefix]) => blockedIPv4.addSubnet(address, prefix, 'ipv4'));

const blockedIPv6 = new net.BlockList();
[
  ['::', 128], ['::1', 128], ['::ffff:0:0', 96], ['64:ff9b::', 96],
  ['100::', 64], ['2001::', 23], ['2001:db8::', 32], ['2002::', 16],
  ['3fff::', 20], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8]
].forEach(([address, prefix]) => blockedIPv6.addSubnet(address, prefix, 'ipv6'));

function createRequestError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isPublicAddress(address, family) {
  if (family === 4) return !blockedIPv4.check(address, 'ipv4');
  if (family !== 6 || blockedIPv6.check(address, 'ipv6')) return false;
  const firstSegment = Number.parseInt(address.split(':')[0] || '0', 16);
  return firstSegment >= 0x2000 && firstSegment <= 0x3fff;
}

async function validatePostingUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw createRequestError('Enter a valid public job posting URL.', 400);
  }

  if (url.protocol !== 'https:' || url.port && url.port !== '443' || url.username || url.password) {
    throw createRequestError('Use a public HTTPS job posting URL without credentials or a custom port.', 400);
  }

  const literalFamily = net.isIP(url.hostname);
  let addresses;
  try {
    addresses = literalFamily
      ? [{ address: url.hostname, family: literalFamily }]
      : await dns.lookup(url.hostname, { all: true, verbatim: true });
  } catch {
    throw createRequestError('The job posting domain could not be resolved.', 422);
  }

  if (!addresses.length || addresses.some(({ address, family }) => !isPublicAddress(address, family))) {
    throw createRequestError('The job posting URL must resolve only to public internet addresses.', 400);
  }

  url.hash = '';
  return { url, address: addresses[0] };
}

function requestHtml(url, address) {
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: url.hostname,
      port: 443,
      path: `${url.pathname}${url.search}`,
      method: 'GET',
      servername: url.hostname,
      lookup: (_hostname, _options, callback) => callback(null, address.address, address.family),
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'AIResumeATSValidator/1.0'
      }
    }, (response) => {
      const status = response.statusCode || 0;
      if (status >= 300 && status < 400 && response.headers.location) {
        response.resume();
        resolve({ redirect: response.headers.location });
        return;
      }
      if (status < 200 || status >= 300) {
        response.resume();
        reject(createRequestError(`The job posting returned HTTP ${status}.`, 422));
        return;
      }

      const contentType = response.headers['content-type'] || '';
      if (!/^(text\/html|application\/xhtml\+xml)(?:;|$)/i.test(contentType)) {
        response.resume();
        reject(createRequestError('The job posting URL did not return an HTML page.', 422));
        return;
      }
      const declaredLength = Number(response.headers['content-length'] || 0);
      if (declaredLength > maxResponseBytes) {
        response.resume();
        reject(createRequestError('The job posting page is too large to read.', 422));
        return;
      }

      const chunks = [];
      let byteCount = 0;
      response.on('data', (chunk) => {
        byteCount += chunk.length;
        if (byteCount > maxResponseBytes) {
          response.destroy(createRequestError('The job posting page is too large to read.', 422));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8') }));
      response.on('error', reject);
    });

    request.setTimeout(8000, () => request.destroy(createRequestError('Timed out while reading the job posting.', 504)));
    request.on('error', reject);
    request.end();
  });
}

function htmlToText(html) {
  return html
    .replace(/<(script|style|noscript|svg|iframe|header|footer|nav|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => {
      const point = Number(code);
      return point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : ' ';
    })
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => {
      const point = Number.parseInt(code, 16);
      return point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : ' ';
    })
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchJobPostingText(value) {
  let currentUrl = value;
  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const { url, address } = await validatePostingUrl(currentUrl);
    const result = await requestHtml(url, address);
    if (result.redirect) {
      if (redirectCount === maxRedirects) {
        throw createRequestError('The job posting redirected too many times.', 422);
      }
      currentUrl = new URL(result.redirect, url).toString();
      continue;
    }

    const text = htmlToText(result.html);
    if (text.length < 80) {
      throw createRequestError('Not enough readable job details were found on that page. Try a direct job listing URL.', 422);
    }
    return { text: text.slice(0, 30000), url: url.toString() };
  }

  throw createRequestError('The job posting could not be read.', 422);
}

module.exports = { fetchJobPostingText, htmlToText, isPublicAddress, validatePostingUrl };
