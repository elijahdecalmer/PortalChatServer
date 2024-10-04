process.env.NODE_ENV = 'test';

import { connect, closeDatabase, clearDatabase } from './setup.js';
import request from 'supertest';
import app from '../src/server.js';
import { User, UserRole } from '../src/models/User.js';
import { Group } from '../src/models/Group.js';
import { Channel } from '../src/models/Channel.js';

describe('Channel Controller', () => {
  beforeAll(async () => await connect());
  afterAll(async () => await closeDatabase());
  afterEach(async () => await clearDatabase());

  // Test for adding a channel to a group
  it('should create a new channel within a group', async () => {
    const groupAdmin = new User({
      email: "groupadmin@gmail.com",
      username: 'groupadmin',
      password: 'password123',
      role: UserRole.GROUP_ADMIN,
      token: 'groupadmin-token',
    });
    await groupAdmin.save();

    const group = new Group({
      name: 'Channel Group',
      description: 'A group with channels',
      admins: [groupAdmin._id],
      members: [groupAdmin._id],
    });
    await group.save();

    const res = await request(app)
      .post('/api/channels/createChannel')
      .set('Authorization', 'groupadmin-token')
      .send({
        groupId: group._id,
        channelName: 'Test Channel',
        channelDescription: 'This is a test channel',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.group.channels.length).toEqual(1);
    expect(res.body.group.channels[0].name).toEqual('Test Channel');
  });

  // Test for deleting a channel from a group
  it('should delete a channel from a group', async () => {
    const groupAdmin = new User({
      email: "groupadmin@gmail.com",
      username: 'groupadmin',
      password: 'password123',
      role: UserRole.GROUP_ADMIN,
      token: 'groupadmin-token',
    });
    await groupAdmin.save();

    const channel = new Channel({
      name: 'Channel to be deleted',
      description: 'A channel for deletion',
    });

    const group = new Group({
      name: 'Channel Group',
      description: 'A group with channels',
      admins: [groupAdmin._id],
      members: [groupAdmin._id],
      channels: [channel],
    });
    await group.save();

    const res = await request(app)
      .post('/api/channels/deleteChannel')
      .set('Authorization', 'groupadmin-token')
      .send({
        groupId: group._id,
        channelId: group.channels[0]._id,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toEqual(`Channel ${group.channels[0]._id} deleted successfully`);

    const updatedGroup = await Group.findById(group._id);
    expect(updatedGroup.channels.length).toEqual(0);
  });
});
