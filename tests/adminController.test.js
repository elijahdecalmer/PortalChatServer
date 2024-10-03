process.env.NODE_ENV = 'test';

import { connect, closeDatabase, clearDatabase } from './setup.js';
import request from 'supertest';
import app from '../src/server.js';
import { UserRole } from '../src/models/User.js';

describe('Admin Controller', () => {
  beforeAll(async () => await connect());
  afterAll(async () => await closeDatabase());
  afterEach(async () => await clearDatabase());

  it('should promote a user to group admin', async () => {
    // First, register the Super Admin using the /api/auth/register endpoint
    const superAdminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Super Admin',
        username: 'superadmin',
        password: 'password123',
        role: UserRole.SUPER_ADMIN,
      });
    
    const superAdmin = superAdminResponse.body; // This contains the user object with the token

    // Now register a regular chat user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        username: 'johndoe',
        password: 'password123',
      });
    
    const user = userResponse.body;

    // Use the Super Admin's token in the Authorization header to promote the user
    const res = await request(app)
      .post('/api/admin/promote/group-admin')
      .set('Authorization', superAdmin.token)  // Use the token from the registered Super Admin
      .send({ usernameToPromote: 'johndoe' });

    // Assert the results
    expect(res.statusCode).toEqual(201);
    expect(res.text).toEqual('User promoted to group admin');

    // Check that the user's role has been updated
    const updatedUserResponse = await request(app)
      .post('/api/auth/login') // Assuming we have a login endpoint to fetch updated user data
      .send({
        username: 'johndoe',
        password: 'password123'
      });

    const updatedUser = updatedUserResponse.body;
    expect(updatedUser.role).toEqual(UserRole.GROUP_ADMIN);
  });

  it('should not allow non-super admins to promote to group admin', async () => {
    // Register a regular user to test insufficient permissions
    const regularUserResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular User',
        username: 'regularuser',
        password: 'password123',
      });

    const regularUser = regularUserResponse.body;

    // Try to promote a user using the regular user's token
    const res = await request(app)
      .post('/api/admin/promote/group-admin')
      .set('Authorization', regularUser.token)  // Use the regular user's token
      .send({ usernameToPromote: 'randomuser' });

    // Assert the results
    expect(res.statusCode).toEqual(401);
    expect(res.text).toEqual('Unauthorized to promote user to group admin');
  });

  // New test to promote a user to Super Admin
  it('should promote a user to super admin', async () => {
    // First, register the Super Admin using the /api/auth/register endpoint
    const superAdminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Super Admin',
        username: 'superadmin',
        password: 'password123',
        role: UserRole.SUPER_ADMIN,
      });

    const superAdmin = superAdminResponse.body; // Contains the Super Admin's user object with token

    // Register a regular user who will be promoted
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        username: 'janedoe',
        password: 'password123',
      });

    const user = userResponse.body;

    // Use the Super Admin's token in the Authorization header to promote the user
    const res = await request(app)
      .post('/api/admin/promote/super-admin')
      .set('Authorization', superAdmin.token)  // Use the token from the registered Super Admin
      .send({ usernameToPromote: 'janedoe' });

    // Assert the results
    expect(res.statusCode).toEqual(201);
    expect(res.text).toEqual('User promoted to super admin');

    // Check that the user's role has been updated
    const updatedUserResponse = await request(app)
      .post('/api/auth/login') // Assuming we have a login endpoint to fetch updated user data
      .send({
        username: 'janedoe',
        password: 'password123'
      });

    const updatedUser = updatedUserResponse.body;
    expect(updatedUser.role).toEqual(UserRole.SUPER_ADMIN);
  });

  // Test to ensure non-super admins cannot promote to super admin
  it('should not allow non-super admins to promote to super admin', async () => {
    // Register a regular user to test insufficient permissions
    const regularUserResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular User',
        username: 'regularuser',
        password: 'password123',
      });

    const regularUser = regularUserResponse.body;

    // Try to promote a user using the regular user's token
    const res = await request(app)
      .post('/api/admin/promote/super-admin')
      .set('Authorization', regularUser.token)  // Use the regular user's token
      .send({ usernameToPromote: 'randomuser' });

    // Assert the results
    expect(res.statusCode).toEqual(401);
    expect(res.text).toEqual('Unauthorized to promote user to super admin');
  });
});
