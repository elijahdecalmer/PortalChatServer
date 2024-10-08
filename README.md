# REST API for Portal Chat

This repository contains the source code for the REST API of the Portal Chat application. The API facilitates messaging, video chat, and other functionalities, and is built using Node.js, MongoDB, Socket.io and Peer.Js. Below is an overview of the different components that make up the project.

## Project Structure

The project structure is organized to ensure maintainability and scalability, with distinct folders for different types of functionality:

- **src/**: This is the main directory that holds the source code. It includes all the necessary subfolders and files for configuring the server, defining routes, handling database operations, and more.
  - **config/**: Contains configuration files for the server setup, database connections, and other settings.

  - **controllers/**: Houses all the functions that interact with the MongoDB database. These functions are responsible for creating, updating, retrieving, and deleting data for different resources like users, messages, channels, and groups. The controllers are used by the routes to fulfill requests.

  - **middlewares/**: Holds middleware functions that handle tasks like authentication, validation, and request logging.

  - **models/**: Defines the MongoDB schemas and models for the application. These include models for `Channel`, `Group`, `Message`, `Report`, and `User`. Each model represents a different type of data that the API handles.

  - **routes/**: Contains route definitions for each of the main resources. Each route file maps HTTP requests to the appropriate controller functions, defining the endpoints used by clients to interact with the API.

  - **uploads/**: A directory where uploaded files, such as images and videos, are stored. This includes profile pictures, message attachments, and other media files.

  - **server.js**: The entry point for the application. It initializes the server, sets up socket connections, configures PeerJS for video chat, and starts the HTTP server.

  - **sockets.js**: Manages the setup and handling of WebSocket connections for real-time messaging functionality.

  - **tests/**: Contains unit tests for the controller functions, written using Jest. These tests ensure that all controller functions work as expected and interact properly with the MongoDB database.

## Features

- **User Management**: Handles registration, authentication, and user profile management.
- **Messaging**: Supports real-time messaging, including text and media messages, using Socket.io.
- **Channels and Groups**: Users can participate in different channels and groups for organized communication.
- **Video Chat**: Implements video chat functionality using PeerJS for peer-to-peer communication.
- **Media Uploads**: Users can upload images and videos, which are stored in the `uploads/` directory.
- **Reports**: Users can report messages or other users for inappropriate behavior.
- **Testing**: Comprehensive unit tests using Jest to ensure reliability of core functionality.

## Installation and Setup

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd PortalChatServer
   ```

2. **Start MongoDB (macOS)**

   ```bash
   brew services start mongodb/brew/mongodb-community@6.0
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Set Up Environment Variables**
   Create a `.env` file in the root directory and configure it with the necessary environment variables, such as database connection strings and server configuration.

5. **Run the Server**

   ```bash
   node src/server.js
   ```

6. **Testing**
   To run the tests, use:

   ```bash
   yarn test
   ```

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for creating RESTful APIs.
- **MongoDB**: NoSQL database for data storage.
- **Socket.io**: Enables real-time, bidirectional communication for messaging.
- **PeerJS**: Provides peer-to-peer video chat functionality.
- **Jest**: JavaScript testing framework for unit tests.

## API Overview

The REST API exposes several endpoints for interacting with the Portal Chat system. These endpoints allow for actions such as creating users, sending messages, joining channels, uploading media, and reporting users.

Each route is mapped to a specific controller, which processes the request, interacts with the database, and sends a response.

The API follows RESTful principles, with clear separation of concerns and resource-based routing.

### Token Authentication Middleware

The **tokenAuth** middleware is used to authenticate requests using a token-based approach. Each user has a `token` field that is generated upon account creation and is provided to the user upon login. The token is then sent by the client with every subsequent request, allowing the server to verify the user's identity without requiring the entire user object to be sent each time.

This middleware ensures that only authenticated users can access protected routes. The `tokenAuth` middleware works as follows:

- **Extract Token**: It extracts the token from the `Authorization` header of the request. If the token starts with `Bearer `, the prefix is removed.
- **Verify Token**: The middleware then searches the database for a user that matches the provided token.
- **Attach User to Request**: If a valid user is found, the user object is attached to the `req` object, allowing subsequent middleware and route handlers to access user-specific information easily.
- **Handle Unauthorized Access**: If the token is missing or invalid, the middleware responds with an appropriate error message.

This dummy authentication approach simplifies development by avoiding more complex token verification processes, while still providing a mechanism for identifying users in a secure manner.

### Admin Routes

- **POST /api/admin/promoteToGroupAdmin**: Promotes a user to Group Admin (Super Admin only).

  - **Parameters**: `usernameToPromote` (string) - The username of the user to promote.
  - **Purpose**: Allows a Super Admin to promote a user to Group Admin so they can manage groups.

- **POST /api/admin/promoteToSuperAdmin**: Promotes a user to Super Admin (Super Admin only).

  - **Parameters**: `usernameToPromote` (string) - The username of the user to promote.
  - **Purpose**: Allows a Super Admin to promote a user to Super Admin.

- **POST /api/admin/deleteUser**: Deletes a user's entire account (Super Admin only).

  - **Parameters**: `userId` (string) - The ID of the user to delete.
  - **Purpose**: Allows a Super Admin to delete a user account.

- **POST /api/admin/allUsers**: Retrieves all users (Super Admin only).

  - **Purpose**: Allows a Super Admin to get a list of all users.

- **POST /api/admin/reportUser**: Reports a user (Super or Group Admin can report).

  - **Parameters**: `userId` (string) - The ID of the user to report, `message` (string) - The reason for the report.
  - **Purpose**: Allows admins to report inappropriate behavior of users.

- **POST /api/admin/myGroups**: Retrieves all groups that the admin user manages.

  - **Purpose**: Allows admins to view the groups they are managing.

### Auth Routes

- **POST /api/auth/register**: Registers a new user.

  - **Parameters**: `email` (string), `username` (string), `password` (string), `role` (optional, string).
  - **Purpose**: Creates a new user account.

- **POST /api/auth/login**: Logs in a user.

  - **Parameters**: `username` (string), `password` (string).
  - **Purpose**: Authenticates a user and returns user information without the password.

- **POST /api/auth/deleteAccount**: Deletes the logged-in user's account.

  - **Purpose**: Allows the user to delete their own account.

- **POST /api/auth/refetchSelf**: Retrieves the logged-in user's profile.

  - **Purpose**: Returns the user's profile information, excluding the password.

### Channel Routes

- **POST /api/channels/createChannel**: Creates a new channel within a group.

  - **Parameters**: `groupId` (string) - The ID of the group, `channelName` (string), `channelDescription` (string).
  - **Purpose**: Allows admins to create channels for group communication.

- **POST /api/channels/deleteChannel**: Deletes a channel in a group.

  - **Parameters**: `groupId` (string), `channelId` (string).
  - **Purpose**: Allows admins to delete a specific channel.

- **POST /api/channels/banUser**: Bans a user from a channel.

  - **Parameters**: `channelId` (string), `userId` (string).
  - **Purpose**: Prevents a specific user from accessing a channel.

- **POST /api/channels/uploadFile**: Uploads a file to a channel.

  - **Parameters**: `file` (file) - The file to upload.
  - **Purpose**: Allows users to upload media to a channel.

- **POST /api/channels/details**: Retrieves channel details.

  - **Parameters**: `channelId` (string).
  - **Purpose**: Returns detailed information about a channel.

### Group Routes

- **POST /api/groups/createGroup**: Creates a new group (Group Admin or Super Admin).

  - **Parameters**: `groupName` (string), `groupDescription` (string).
  - **Purpose**: Allows admins to create a new group.

- **POST /api/groups/myGroups**: Retrieves all groups that the user belongs to.

  - **Purpose**: Allows users to view the groups they are a member of.

- **POST /api/groups/all**: Retrieves all groups.

  - **Purpose**: Allows users to see all existing groups to request access.

- **POST /api/groups/details**: Retrieves details of a specific group.

  - **Parameters**: `groupId` (string).
  - **Purpose**: Returns detailed information about a group.

- **POST /api/groups/deleteGroup**: Deletes a group (only Group Admin or Super Admin).

  - **Parameters**: `groupId` (string).
  - **Purpose**: Allows admins to delete a group.

- **POST /api/groups/requestAccess**: Requests access to join a group.

  - **Parameters**: `groupId` (string).
  - **Purpose**: Allows a user to request to join a group.

- **POST /api/groups/acceptAccess**: Approves a user's request to join a group.

  - **Parameters**: `groupId` (string), `userId` (string).
  - **Purpose**: Allows admins to approve users to join a group.

- **POST /api/groups/removeUser**: Removes a user from a group.

  - **Parameters**: `groupId` (string), `userId` (string).
  - **Purpose**: Allows admins to remove a user from a group.

- **POST /api/groups/rejectAccess**: Rejects a user's request to join a group.

  - **Parameters**: `groupId` (string), `userId` (string).
  - **Purpose**: Allows admins to reject users from joining a group.

- **POST /api/groups/leaveGroup**: Allows a user to leave a group they are a member of.

  - **Parameters**: `groupId` (string).
  - **Purpose**: Allows a user to leave a group.

### User Routes

- **POST /api/users/profile**: Retrieves the user's profile.

  - **Purpose**: Returns the user's profile information, excluding the password.

- **POST /api/users/updateAvatar**: Updates the user's avatar (upload image).

  - **Parameters**: `file` (file) - The image file to upload.
  - **Purpose**: Allows users to update their profile picture.

- **POST /api/users/bio**: Updates the user's bio.

  - **Parameters**: `bio` (string).
  - **Purpose**: Allows users to update their bio.

- **POST /api/users/delete**: Deletes the user's account.

  - **Purpose**: Allows the user to delete their own account.

## Data Structures

### User

The `User` model represents a user in the Portal Chat application. Each user can have various attributes such as a profile picture, bio, and role. The simplified token authentication mechanism is also implemented through this model.

- **Fields**:

  - `email` (String, required): User's email address.
  - `profilePictureRef` (String, optional): Reference to the user's profile picture.
  - `bio` (String, optional): User's bio.
  - `role` (String, required, default: `CHAT_USER`): Role of the user, which can be one of `CHAT_USER`, `GROUP_ADMIN`, or `SUPER_ADMIN`.
  - `username` (String, required, unique): Unique username of the user.
  - `password` (String, required): User's password (stored in plaintext for simplicity).
  - `token` (String, unique): Authentication token generated during user creation.
  - `groups` (Array of ObjectId, ref: `Group`): Groups that the user belongs to.
  - `groupRequests` (Array of ObjectId, ref: `Group`): Groups that the user has requested to join.
  - `reports` (Array of ObjectId, ref: `Report`): Reports related to the user.

- **Pre-save Hook**: Generates a random token for the user before saving if the token does not already exist.

### Report

The `Report` model is used to track user reports for inappropriate behavior. Each report contains a message and information about the reporter.

- **Fields**:
  - `message` (String, required): The reason for the report.
  - `reporter` (String, required): The username of the person who reported the issue.

### Message

The `Message` model represents a message within a channel. Messages can be of various types such as text, image, video, or audio.

- **Fields**:
  - `sender` (ObjectId, ref: `User`, required): Reference to the user who sent the message.
  - `messageType` (String, required): Type of the message (`TEXT`, `IMAGE`, `VIDEO`, `AUDIO`).
  - `text` (String, optional): Text content of the message if it is of type `TEXT`.
  - `mediaRef` (String, optional): Reference to the media file if the message is not of type `TEXT`.
  - `timestamp` (Date, default: current date, required): Timestamp when the message was sent.
  - `channel` (ObjectId, ref: `Channel`, required): Reference to the channel where the message was sent.

### Group

The `Group` model represents a chat group. Each group has multiple members and can have multiple admins. Groups also hold multiple channels for organized communication.

- **Fields**:
  - `admins` (Array of ObjectId, ref: `User`): References to users who are admins of the group.
  - `name` (String, required): Name of the group.
  - `description` (String, optional): Description of the group.
  - `members` (Array of ObjectId, ref: `User`): References to users who are members of the group.
  - `memberRequests` (Array of ObjectId, ref: `User`): Users who have requested to join the group.
  - `channels` (Array of ObjectId, ref: `Channel`): Channels associated with the group.

### Channel

The `Channel` model represents a channel within a group. Channels are used for sending messages between group members.

- **Fields**:
  - `name` (String, required): Name of the channel.
  - `description` (String, optional): Description of the channel.
  - `group` (ObjectId, ref: `Group`, required): Reference to the group that the channel belongs to.
  - `messages` (Array of ObjectId, ref: `Message`): Messages sent within the channel.
  - `bannedUsers` (Array of ObjectId, ref: `User`): Users who are banned from the channel.

##
