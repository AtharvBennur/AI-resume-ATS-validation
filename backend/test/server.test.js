const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.JWT_SECRET = 'test-secret';
const app = require('../server');

test('GET /api/health returns service status', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok', service: 'fsd-resume-backend' });
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
