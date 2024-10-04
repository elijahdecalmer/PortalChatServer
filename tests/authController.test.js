process.env.NODE_ENV = 'test';

import { connect, closeDatabase, clearDatabase } from './setup.js';
import request from 'supertest';
import app from '../src/server.js';
import { User } from '../src/models/User.js';

describe('Auth Controller', () => {
  beforeAll(async () => await connect());
  afterAll(async () => await closeDatabase());
  afterEach(async () => await clearDatabase());

  it('should register a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'johndoe@gmail.com',
      username: 'johndoe',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toEqual('johndoe');
    expect(res.body.user.password).toBeUndefined(); // Ensure password is not returned

    const user = await User.findOne({ username: 'johndoe' });
    expect(user).toBeTruthy(); // Ensure the user exists in the database
  });

  it('should login a user', async () => {
    const user = new User({
      email: 'johndoe@gmail.com',
      username: 'johndoe657686',
      password: 'password123',
      token: 'random-token',
    });
    await user.save();

    const res = await request(app).post('/api/auth/login').send({
      username: 'johndoe657686',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.token).toEqual('random-token'); // Verify the token is returned
    expect(res.body.user.password).toBeUndefined(); // Ensure password is not returned
  });
});
