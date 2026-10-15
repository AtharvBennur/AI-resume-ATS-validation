const test = require('node:test');
const assert = require('node:assert/strict');
const { htmlToText, isPublicAddress, validatePostingUrl } = require('../utils/jobPosting');

test('job posting HTML extraction removes scripts and decodes common entities', () => {
  assert.equal(
    htmlToText('<header>Company</header><main>Build&nbsp;reliable &amp; secure systems</main><script>alert(1)</script>'),
    'Build reliable & secure systems'
  );
});

test('job posting URL validation rejects non-HTTPS and loopback destinations', async () => {
  await assert.rejects(validatePostingUrl('http://example.com/job'), {
    statusCode: 400,
    message: /HTTPS/
  });
  await assert.rejects(validatePostingUrl('https://127.0.0.1/job'), {
    statusCode: 400,
    message: /public internet/
  });
  await assert.rejects(validatePostingUrl('https://[::1]/job'), {
    statusCode: 400
  });
});

test('public IP classification blocks private ranges and accepts public addresses', () => {
  assert.equal(isPublicAddress('192.168.1.10', 4), false);
  assert.equal(isPublicAddress('8.8.8.8', 4), true);
  assert.equal(isPublicAddress('2606:4700:4700::1111', 6), true);
  assert.equal(isPublicAddress('fd00::1', 6), false);
});
