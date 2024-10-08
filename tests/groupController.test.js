import request from 'supertest';
import app from '../src/server.js';
import { connect, closeDatabase, clearDatabase } from '../tests/setup.js';

describe('Group Controller Tests', () => {
  let token, groupId;

  beforeAll(async () => {
    await connect();
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'groupadmin@example.com',
        username: 'groupadmin',
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

  it('should create a group', async () => {
    const res = await request(app)
      .post('/api/groups/createGroup')
      .set('Authorization', `Bearer ${token}`)
      .send({ groupName: 'Test Group', groupDescription: 'This is a test group' });
    groupId = res.body.group?._id || '';
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });

  it('should get all groups', async () => {
    const res = await request(app)
      .post('/api/groups/all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });

  it('should delete a group', async () => {
    const res = await request(app)
      .post('/api/groups/deleteGroup')
      .set('Authorization', `Bearer ${token}`)
      .send({ groupId });
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });
});
