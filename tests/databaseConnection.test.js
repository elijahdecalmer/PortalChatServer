import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { connect, closeDatabase, clearDatabase } from './setup'; // Assuming these functions are already setup

describe('Database Connection Test', () => {
  beforeAll(async () => await connect()); // Connect to the in-memory MongoDB
  afterAll(async () => await closeDatabase()); // Close connection after test
  afterEach(async () => await clearDatabase()); // Clear the database after each test

  it('should write a user to the database and read it back', async () => {
    // Create a new user
    const newUser = new User({
      name: 'Test User',
      username: 'testuser',
      password: 'password123',
    });

    // Save the user to the database
    await newUser.save();

    // Read the user from the database
    const userFromDb = await User.findOne({ username: 'testuser' });

    // Validate the read data
    expect(userFromDb).not.toBeNull();
    expect(userFromDb.name).toEqual('Test User');
    expect(userFromDb.username).toEqual('testuser');
  });
});
