process.env.NODE_ENV = 'test';


import { connect, closeDatabase, clearDatabase } from './setup.js';
import request from 'supertest';
import app from '../src/server.js';
import { User } from '../src/models/User.js';

describe('User Controller', () => {
  beforeAll(async () => await connect());
  afterAll(async () => await closeDatabase());
  afterEach(async () => await clearDatabase());

  it('should get user profile', async () => {
    const user = new User({
      name: 'John Doe',
      username: 'johndoe',
      password: 'password123',
      token: 'user-token',
    });
    await user.save();

    const res = await request(app)
      .post('/api/users/profile')
      .set('Authorization', 'user-token');

    expect(res.statusCode).toEqual(200);
    expect(res.body.username).toEqual('johndoe');
  });
});
