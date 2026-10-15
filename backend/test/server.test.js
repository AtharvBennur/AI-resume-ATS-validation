const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { issueToken, updateMe } = require('../controllers/authController');
const { rewriteSection } = require('../controllers/aiController');

process.env.JWT_SECRET = 'test-secret';
const app = require('../server');

test('issued JWTs do not expire', () => {
  const token = issueToken({ _id: { toString: () => 'test-user' } });
  assert.equal(jwt.decode(token).exp, undefined);
});

test('GET /api/health returns service status', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    status: 'ok',
    service: 'fsd-resume-backend',
    database: 'disconnected'
  });
});

test('registration validates required fields before database access', async () => {
  const response = await request(app).post('/api/auth/register').send({ email: 'bad', password: 'short' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Validation failed');
  assert.ok(response.body.details.name);
});

test('protected endpoint rejects missing credentials', async () => {
  const response = await request(app).get('/api/auth/me');
  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Authentication token required');
});

test('profile update endpoint rejects missing credentials', async () => {
  const response = await request(app).patch('/api/auth/me').send({ name: 'Updated Name' });
  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Authentication token required');
});

test('AI rewrite endpoint requires authentication', async () => {
  const response = await request(app).post('/api/ai/rewrite').send({});
  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Authentication token required');
});

test('resume import endpoint requires authentication', async () => {
  const response = await request(app).post('/api/ai/resume/import');
  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Authentication token required');
});

test('ATS validation endpoint requires authentication', async () => {
  const response = await request(app).post('/api/ai/ats/validate');
  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Authentication token required');
});

test('ATS report history requires authentication', async () => {
  const response = await request(app).get('/api/ai/ats/reports/507f1f77bcf86cd799439011');
  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Authentication token required');
});

test('job matching requires authentication', async () => {
  const response = await request(app).post('/api/ai/job-match').send({});
  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Authentication token required');
});

test('ATS validation rejects unsupported file types', async () => {
  const originalFindById = User.findById;
  User.findById = async (id) => ({ _id: id });
  const token = jwt.sign({ sub: 'test-user' }, process.env.JWT_SECRET);
  try {
    const response = await request(app)
      .post('/api/ai/ats/validate')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', Buffer.from('not a resume'), { filename: 'resume.txt', contentType: 'text/plain' });
    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'Upload a PDF or DOCX resume');
  } finally {
    User.findById = originalFindById;
  }
});

test('resume endpoints require authentication', async () => {
  const response = await request(app).get('/api/resumes');
  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Authentication token required');
});

function createMockResponse() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test('profile update validates the name before saving', async () => {
  let saved = false;
  const response = createMockResponse();
  await updateMe({
    body: { name: ' A ' },
    user: { save: async () => { saved = true; } }
  }, response);
  assert.equal(response.statusCode, 400);
  assert.equal(saved, false);
  assert.equal(response.body.error, 'Validation failed');
});

test('profile update saves and returns the authenticated user name', async () => {
  const user = {
    _id: { toString: () => 'test-user' },
    name: 'Old Name',
    email: 'test@example.com',
    save: async function save() {}
  };
  const response = createMockResponse();
  await updateMe({ body: { name: '  New Name  ' }, user }, response);
  assert.deepEqual(response.body, {
    user: { id: 'test-user', name: 'New Name', email: 'test@example.com' }
  });
});

test('AI rewrite validates that section text is supplied', async () => {
  const response = createMockResponse();
  await rewriteSection({ body: {} }, response, assert.fail);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.error, /Resume text/);
});

test('AI rewrite reports missing Groq configuration', async () => {
  const previousGroqKey = process.env.GROQ_API_KEY;
  const previousGroqModel = process.env.GROQ_MODEL;
  const previousOpenAIKey = process.env.OPENAI_API_KEY;
  delete process.env.GROQ_API_KEY;
  delete process.env.GROQ_MODEL;
  delete process.env.OPENAI_API_KEY;
  const response = createMockResponse();
  try {
    await rewriteSection({ body: { text: 'Built a web app', section: 'Experience' } }, response, assert.fail);
    assert.equal(response.statusCode, 503);
    assert.match(response.body.error, /GROQ_API_KEY/);
  } finally {
    if (previousGroqKey) process.env.GROQ_API_KEY = previousGroqKey;
    if (previousGroqModel) process.env.GROQ_MODEL = previousGroqModel;
    if (previousOpenAIKey) process.env.OPENAI_API_KEY = previousOpenAIKey;
  }
});

test('AI rewrite sends the entered section text and returns the provider response', async () => {
  const previousGroqKey = process.env.GROQ_API_KEY;
  const previousGroqModel = process.env.GROQ_MODEL;
  const previousFetch = global.fetch;
  process.env.GROQ_API_KEY = 'test-key';
  process.env.GROQ_MODEL = 'test-model';
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
    assert.match(options.headers.Authorization, /^Bearer test-key$/);
    assert.match(options.body, /Built a web app/);
    return { ok: true, json: async () => ({ choices: [{ message: { content: 'Cloud engineer with AWS experience.' } }] }) };
  };
  const response = createMockResponse();
  try {
    await rewriteSection({ body: { text: 'Built a web app', section: 'Experience' } }, response, assert.fail);
    assert.deepEqual(response.body, { success: true, text: 'Cloud engineer with AWS experience.' });
  } finally {
    global.fetch = previousFetch;
    if (previousGroqKey) process.env.GROQ_API_KEY = previousGroqKey;
    else delete process.env.GROQ_API_KEY;
    if (previousGroqModel) process.env.GROQ_MODEL = previousGroqModel;
    else delete process.env.GROQ_MODEL;
  }
});
