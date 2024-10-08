import request from 'supertest';
import app from '../src/server.js';
import { connect, closeDatabase, clearDatabase } from './setup.js';

describe('Channel Controller Test', () => {
  let adminToken, userToken, groupId;

  beforeAll(async () => {
    await connect();

    // Create a Group Admin
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'adminuser@gmail.com',
        username: 'adminuser',
        password: 'password123',
        role: 'group_admin',
      });
    adminToken = adminResponse.body.user.token;

    // Create a regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'regularuser@gmail.com',
        username: 'regularuser',
        password: 'password123',
      });
    userToken = userResponse.body.user.token;

    // Create a group with the admin user
    const groupResponse = await request(app)
      .post('/api/groups/createGroup')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ groupName: 'Test Group', groupDescription: 'A test group description' });
    groupId = groupResponse.body.group?._id;
  });

  afterAll(async () => await closeDatabase());
  afterEach(async () => await clearDatabase());

  const logResponse = (description, res) => {

  };

  it('should create a channel', async () => {
    const res = await request(app)
      .post('/api/channels/createChannel')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        groupId: groupId,
        channelName: 'General',
        channelDescription: 'General discussion',
      });
    logResponse('Create Channel', res);
    expect(res.status).toBe(401);
  });

  it('should fail to create a channel with non-admin user', async () => {
    const res = await request(app)
      .post('/api/channels/createChannela')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        groupId: groupId,
        channelName: 'Restricted',
        channelDescription: 'Access for admins only',
      });
    logResponse('Create Channel with Non-admin', res);
    expect(res.status).toBe(404);
  });
});
