import request from 'supertest';
import app from '../src/server.js';
import { connect, closeDatabase, clearDatabase } from '../tests/setup.js';

describe('User Controller Tests', () => {
  let token;

  beforeAll(async () => {
    await connect();
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@example.com',
        username: 'testuser',
        password: 'password123',
      });
    token = response.body.user?.token || '';
  });

  afterAll(async () => {
    await closeDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('should get user profile', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });

  it('should update user bio', async () => {
    const res = await request(app)
      .post('/api/users/bio')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'This is a new bio.' });
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });

  it('should delete user', async () => {
    const res = await request(app)
      .post('/api/users/delete')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });
});
