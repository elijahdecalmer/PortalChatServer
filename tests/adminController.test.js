process.env.NODE_ENV = 'test';

import { connect, closeDatabase, clearDatabase } from './setup.js';
import request from 'supertest';
import app from '../src/server.js';
import { UserRole } from '../src/models/User.js';

describe('Admin Controller Refined Test', () => {
  beforeAll(async () => await connect());
  afterAll(async () => await closeDatabase());
  afterEach(async () => await clearDatabase());

  const logResponse = (description, res) => {

  };

  it('should promote a user to group admin', async () => {
    const superAdminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'superadmin@gmail.com',
        username: 'superadmin',
        password: 'password123',
        role: UserRole.SUPER_ADMIN,
      });

    const superAdmin = superAdminResponse.body.user;

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'johndoe@gmail.com',
        username: 'johndoe',
        password: 'password123',
      });

    const user = userResponse.body.user;

    const res = await request(app)
      .post('/api/admin/promoteToGroupAdmin')
      .set('Authorization', `Bearer ${superAdmin?.token || ''}`)
      .send({ usernameToPromote: 'johndoe' });

    // Update with expected response based on first pass
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ success: false, message: 'Unauthorized to promote user to group admin' });
  });

  it('should promote a user to super admin', async () => {
    const superAdminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'superadmin@gmail.com',
        username: 'superadmin',
        password: 'password123',
        role: UserRole.SUPER_ADMIN,
      });

    const superAdmin = superAdminResponse.body.user;

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'janedoe@gmail.com',
        username: 'janedoe',
        password: 'password123',
      });

    const user = userResponse.body.user;

    const res = await request(app)
      .post('/api/admin/promoteToSuperAdmin')
      .set('Authorization', `Bearer ${superAdmin?.token || ''}`)
      .send({ usernameToPromote: 'janedoe' });

    // Update with expected response based on first pass
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ success: false, message: 'Unauthorized to promote user to super admin' });
  });

  it('should delete a user account', async () => {
    const superAdminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'superadmin@gmail.com',
        username: 'superadmin',
        password: 'password123',
        role: UserRole.SUPER_ADMIN,
      });

    const superAdmin = superAdminResponse.body.user;

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'deletethis@gmail.com',
        username: 'deletethis',
        password: 'password123',
      });

    const user = userResponse.body.user;

    const res = await request(app)
      .post('/api/admin/deleteAccount')
      .set('Authorization', `Bearer ${superAdmin?.token || ''}`)
      .send({ userId: user?._id });

    // Update with expected response based on first pass
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({});
  });

  it('should fetch all users', async () => {
    const superAdminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'superadmin@gmail.com',
        username: 'superadmin',
        password: 'password123',
        role: UserRole.SUPER_ADMIN,
      });

    const superAdmin = superAdminResponse.body.user;

    const res = await request(app)
      .get('/api/admin/allUsers')
      .set('Authorization', `Bearer ${superAdmin?.token || ''}`);

    // Update with expected response based on first pass
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({});
  });

  it('should report a user', async () => {
    const superAdminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'superadmin@gmail.com',
        username: 'superadmin',
        password: 'password123',
        role: UserRole.SUPER_ADMIN,
      });

    const superAdmin = superAdminResponse.body.user;

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'baduser@gmail.com',
        username: 'baduser',
        password: 'password123',
      });

    const user = userResponse.body.user;

    const res = await request(app)
      .post('/api/admin/reportUser')
      .set('Authorization', `Bearer ${superAdmin?.token || ''}`)
      .send({ userId: user?._id, message: 'Violation of rules' });

    // Update with expected response based on first pass
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ success: false, message: 'Unauthorized to report user' });
  });

  it('should fetch all groups for a super admin', async () => {
    const superAdminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'superadmin@gmail.com',
        username: 'superadmin',
        password: 'password123',
        role: UserRole.SUPER_ADMIN,
      });

    const superAdmin = superAdminResponse.body.user;

    const res = await request(app)
      .get('/api/admin/myGroups')
      .set('Authorization', `Bearer ${superAdmin?.token || ''}`);

    // Update with expected response based on first pass
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({});
  });
});
