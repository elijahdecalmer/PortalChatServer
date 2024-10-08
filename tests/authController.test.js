import { connect, closeDatabase, clearDatabase } from './setup.js';
import request from 'supertest';
import app from '../src/server.js';

describe('Auth Controller Test', () => {
  beforeAll(async () => await connect());
  afterAll(async () => await closeDatabase());
  afterEach(async () => await clearDatabase());

  const logResponse = (description, res) => {

  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@gmail.com',
        username: 'newuser',
        password: 'password123',
      });

    logResponse('Register User', res);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('newuser');
  });

  it('should login user successfully', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'loginuser@gmail.com',
      username: 'loginuser',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      username: 'loginuser',
      password: 'password123',
    });

    logResponse('Login User', res);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('loginuser');
  });

  it('should fail login with incorrect password', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'wrongpassword@gmail.com',
      username: 'wrongpassworduser',
      password: 'correctpassword',
    });

    const res = await request(app).post('/api/auth/login').send({
      username: 'wrongpassworduser',
      password: 'incorrectpassword',
    });

    logResponse('Login User with Incorrect Password', res);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid password');
  });

  it('should delete a user account', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      email: 'deleteuser@gmail.com',
      username: 'deleteuser',
      password: 'password123',
    });

    const userToken = registerRes.body.user.token;

    const res = await request(app)
      .post('/api/auth/deleteAccount')
      .set('Authorization', `Bearer ${userToken}`);

    logResponse('Delete User Account', res);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('User deleted');
  });

  it('should fail to refetch user profile when not logged in', async () => {
    const res = await request(app).post('/api/auth/refetchSelf');
    logResponse('Refetch User Profile', res);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      "message": "Token required",
      "success": false
    });
  });
});
