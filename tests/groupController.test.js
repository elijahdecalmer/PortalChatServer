process.env.NODE_ENV = 'test';

import { connect, closeDatabase, clearDatabase } from './setup.js';
import request from 'supertest';
import app from '../src/server.js';
import { User, UserRole } from '../src/models/User.js';
import { Group } from '../src/models/Group.js';
import { Channel } from '../src/models/Channel.js';

describe('Group Controller', () => {
  beforeAll(async () => await connect());
  afterAll(async () => await closeDatabase());
  afterEach(async () => await clearDatabase());

  // Test for group creation by a Group Admin
  it('should create a new group', async () => {
    const groupAdmin = new User({
      name: 'Group Admin',
      username: 'groupadmin',
      password: 'password123',
      role: UserRole.GROUP_ADMIN,
      token: 'groupadmin-token',
    });
    await groupAdmin.save();

    const res = await request(app)
      .post('/api/groups/createGroup')
      .set('Authorization', 'groupadmin-token')
      .send({
        groupName: 'Test Group',
        groupDescription: 'This is a test group',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual('Test Group');
    const group = await Group.findOne({ name: 'Test Group' });
    expect(group).toBeTruthy();
    expect(group.admins).toContainEqual(groupAdmin._id);
  });

  // Test for unauthorized group creation (non-admin users)
  it('should not allow a non-admin to create a group', async () => {
    const regularUser = new User({
      name: 'Regular User',
      username: 'regularuser',
      password: 'password123',
      role: UserRole.CHAT_USER,
      token: 'user-token',
    });
    await regularUser.save();

    const res = await request(app)
      .post('/api/groups/createGroup')
      .set('Authorization', 'user-token')
      .send({
        groupName: 'Unauthorized Group',
        groupDescription: 'This should fail',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.text).toEqual('Unauthorized to create group');
  });

  // Test for fetching all groups
  it('should fetch all groups', async () => {
    const superAdmin = new User({
      name: 'Super Admin',
      username: 'superadmin',
      password: 'password123',
      role: UserRole.SUPER_ADMIN,
      token: 'superadmin-token',
    });
    await superAdmin.save();

    const group1 = new Group({
      name: 'Group 1',
      description: 'Description for group 1',
      admins: [superAdmin._id],
      members: [superAdmin._id],
    });
    const group2 = new Group({
      name: 'Group 2',
      description: 'Description for group 2',
      admins: [superAdmin._id],
      members: [superAdmin._id],
    });
    await group1.save();
    await group2.save();

    const res = await request(app)
      .post('/api/groups/all')
      .set('Authorization', 'superadmin-token');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body[0].name).toEqual('Group 1');
    expect(res.body[1].name).toEqual('Group 2');
  });

  // Test for fetching user-specific groups
  it('should fetch user-specific groups', async () => {
    const groupAdmin = new User({
      name: 'Group Admin',
      username: 'groupadmin',
      password: 'password123',
      role: UserRole.GROUP_ADMIN,
      token: 'groupadmin-token',
    });
    await groupAdmin.save();

    const group = new Group({
      name: 'Admin Group',
      description: 'A group for admin',
      admins: [groupAdmin._id],
      members: [groupAdmin._id],
    });
    await group.save();

    const res = await request(app)
      .post('/api/groups/myGroups')
      .set('Authorization', 'groupadmin-token');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].name).toEqual('Admin Group');
  });

  // Test for deleting a group by an admin
  it('should delete a group', async () => {
    const groupAdmin = new User({
      name: 'Group Admin',
      username: 'groupadmin',
      password: 'password123',
      role: UserRole.GROUP_ADMIN,
      token: 'groupadmin-token',
    });
    await groupAdmin.save();

    const group = new Group({
      name: 'Delete Group',
      description: 'A group to be deleted',
      admins: [groupAdmin._id],
      members: [groupAdmin._id],
    });
    await group.save();

    const res = await request(app)
      .post('/api/groups/deleteGroup')
      .set('Authorization', 'groupadmin-token')
      .send({ groupId: group._id });

    expect(res.statusCode).toEqual(200);

    expect(res.text).toEqual('Group deleted');
    const deletedGroup = await Group.findById(group._id);
    expect(deletedGroup).toBeNull();
  });

  // Test for adding a channel to a group
  it('should create a new channel within a group', async () => {
    const groupAdmin = new User({
      name: 'Group Admin',
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
      .post('/api/groups/createChannel')
      .set('Authorization', 'groupadmin-token')
      .send({
        groupId: group._id,
        channelName: 'Test Channel',
        channelDescription: 'This is a test channel',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.channels.length).toEqual(1);
    expect(res.body.channels[0].name).toEqual('Test Channel');
  });

  // Test for deleting a channel from a group
  it('should delete a channel from a group', async () => {
    const groupAdmin = new User({
      name: 'Group Admin',
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
      .post('/api/groups/deleteChannel')
      .set('Authorization', 'groupadmin-token')
      .send({
        groupId: group._id,
        channelId: group.channels[0]._id,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual(`Channel ${group.channels[0]._id} deleted`);

    const updatedGroup = await Group.findById(group._id);
    expect(updatedGroup.channels.length).toEqual(0);
  });

  // Test for requesting access to a group
  it('should allow a user to request access to a group', async () => {
    const groupAdmin = new User({
      name: 'Group Admin',
      username: 'groupadmin',
      password: 'password123',
      role: UserRole.GROUP_ADMIN,
      token: 'groupadmin-token',
    });
    await groupAdmin.save();

    const regularUser = new User({
      name: 'Regular User',
      username: 'regularuser',
      password: 'password123',
      token: 'user-token',
    });
    await regularUser.save();

    const group = new Group({
      name: 'Public Group',
      description: 'A group anyone can request access to',
      admins: [groupAdmin._id],
    });
    await group.save();

    const res = await request(app)
      .post('/api/groups/requestAccess')
      .set('Authorization', 'user-token')
      .send({
        groupId: group._id,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Request sent');
  });

  // Test for approving a request to join a group
  it('should allow an admin to approve a user request to join the group', async () => {
    const groupAdmin = new User({
      name: 'Group Admin',
      username: 'groupadmin',
      password: 'password123',
      role: UserRole.GROUP_ADMIN,
      token: 'groupadmin-token',
    });
    await groupAdmin.save();

    const regularUser = new User({
      name: 'Regular User',
      username: 'regularuser',
      password: 'password123',
      token: 'user-token',
    });
    await regularUser.save();

    const group = new Group({
      name: 'Public Group',
      description: 'A group anyone can request access to',
      admins: [groupAdmin._id],
      memberRequests: [regularUser._id],
    });
    await group.save();

    const res = await request(app)
      .post('/api/groups/acceptAccess')
      .set('Authorization', 'groupadmin-token')
      .send({
        groupId: group._id,
        userId: regularUser._id,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Request approved');
  });
});
