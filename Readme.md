# 🈸 Chat-Server 💬

A real-time chat application built with Express.js, Socket.IO, and MongoDB, featuring user authentication, group chats, and direct messaging.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Groups](#groups)
- [Socket.IO Events](#socketio-events)
- [Project Structure](#project-structure)
- [TypeScript Models](#typescript-models)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure signup and login with JWT
- **User Management**: Create, read, update, and delete user profiles
- **Group Chats**: Create and manage chat groups
- **Real-time Messaging**: Direct messages and group chat functionality
- **Message Persistence**: Store messages in MongoDB
- **TypeScript**: Type safety throughout the codebase
- **Security**: CORS protection, helmet security headers, and MongoDB query sanitization
- **Error Handling**: Comprehensive error handling with custom error types

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, express-mongo-sanitize
- **TypeScript**: Static typing and interfaces
- **Development**: Nodemon, concurrently, ESLint

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Anup-Naik/Chat-Server.git
   cd Chat-Server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (see [Environment Setup](#environment-setup))

4. Build the TypeScript files:

   ```bash
   npm run build
   ```

5. Start the server:

   ```bash
   npm start
   ```

6. For development with auto-reload:
   ```bash
   npm run dev
   ```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGO_URL=mongodb://localhost:27017/chat-app
JWT_SECRET=your_jwt_secret_key
```

## API Documentation

### Authentication

#### Sign Up

- **URL**: `/api/v1/signup`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "user123",
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "avatar": "url_to_avatar" // optional
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "token": "jwt_token_here",
      "data": {
        "_id": "user_id",
        "username": "user123",
        "email": "user@example.com",
        "avatar": "url_to_avatar"
      }
    }
  }
  ```

#### Login

- **URL**: `/api/v1/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "token": "jwt_token_here",
      "data": {
        "_id": "user_id",
        "username": "user123",
        "email": "user@example.com",
        "avatar": "url_to_avatar"
      }
    }
  }
  ```

### Users

All user endpoints require authentication. Include the JWT token in the request headers:

```
Authorization: Bearer <jwt_token>
```

#### Get All Users

- **URL**: `/api/v1/users/`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `filter[username]`: Filter by username
  - `filter[email]`: Filter by email
  - `sort[username]`: Sort by username (1 for ascending, -1 for descending)
  - `sort[email]`: Sort by email (1 for ascending, -1 for descending)
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "items": 10,
      "data": [
        {
          "_id": "user_id",
          "username": "user123",
          "email": "user@example.com",
          "avatar": "url_to_avatar"
        }
      ]
    }
  }
  ```

#### Get User by ID

- **URL**: `/api/v1/users/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "data": {
        "_id": "user_id",
        "username": "user123",
        "email": "user@example.com",
        "avatar": "url_to_avatar"
      }
    }
  }
  ```

#### Update User

- **URL**: `/api/v1/users/:id`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "username": "newusername",
    "email": "newemail@example.com",
    "password": "newpassword",
    "avatar": "new_avatar_url"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "data": {
        "_id": "user_id",
        "username": "newusername",
        "email": "newemail@example.com",
        "avatar": "new_avatar_url"
      }
    }
  }
  ```

#### Delete User

- **URL**: `/api/v1/users/:id`
- **Method**: `DELETE`
- **Response**: Status 204 (No Content)

### Groups

All group endpoints require authentication. Include the JWT token in the request headers as described above.

#### Create Group

- **URL**: `/api/v1/groups/`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Group Name",
    "avatar": "group_avatar_url", // optional
    "users": ["user_id_1", "user_id_2"]
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "data": {
        "_id": "group_id",
        "name": "Group Name",
        "avatar": "group_avatar_url",
        "users": ["user_id_1", "user_id_2"]
      }
    }
  }
  ```

#### Get All Groups

- **URL**: `/api/v1/groups/`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `filter[userId]`: Filter by user ID
  - `sort[name]`: Sort by name (1 for ascending, -1 for descending)
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "items": 5,
      "data": [
        {
          "_id": "group_id",
          "name": "Group Name",
          "avatar": "group_avatar_url",
          "users": [
            {
              "_id": "user_id_1",
              "username": "user123",
              "email": "user@example.com"
            }
          ]
        }
      ]
    }
  }
  ```

#### Get Group by ID

- **URL**: `/api/v1/groups/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "data": {
        "_id": "group_id",
        "name": "Group Name",
        "avatar": "group_avatar_url",
        "users": [
          {
            "_id": "user_id_1",
            "username": "user123",
            "email": "user@example.com"
          }
        ]
      }
    }
  }
  ```

#### Update Group

- **URL**: `/api/v1/groups/:id`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "name": "New Group Name",
    "avatar": "new_group_avatar_url"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "data": {
        "_id": "group_id",
        "name": "New Group Name",
        "avatar": "new_group_avatar_url",
        "users": ["user_id_1", "user_id_2"]
      }
    }
  }
  ```

#### Delete Group

- **URL**: `/api/v1/groups/:id`
- **Method**: `DELETE`
- **Response**: Status 204 (No Content)

## Socket.IO Events

The Chat-Server uses Socket.IO for real-time communication. Clients connect to the server using a JWT token for authentication.

### Connection Setup

```javascript
const socket = io("http://localhost:3000", {
  auth: {
    jwt: "your_jwt_token",
  },
});
```

### Client Events

#### Send Message

```javascript
socket.emit("message", {
  content: "Hello world!",
  recipient: "user_id_or_group_id",
  recipientType: "user", // or 'group'
});
```
#### Send Your PublicKey For End-to-End Encryption

```js
socket.on("publickey:request",()=>{
  //Get Your PublicKey
   socket.emit("publickey:response", your_public_key);
})
```

#### Get Recipient PublicKey

```js
socket.emit("publickey:recipientkey", recipient);
```
```js
socket.on("publickey:recipientkey",(recipientKey)=>{
  //Your Code
})
```

#### Send Encrypted Message

```js
socket.emit("encryptedSend", {
  content: "your-encrypted-message",
  recipient: "user_id",
  recipientType: "user", // Currently Only for Users
});
```

#### Join Group

```javascript
socket.emit("joinGroup", "group_id");
```

#### Disconnect

```javascript
socket.disconnect();
```

### Server Events

#### Receive Message

```javascript
socket.on("message", (message) => {
  console.log("New message:", message);
  // message: { content, sender, recipient, recipientType, timestamp }
});
```

#### Message Sent Confirmation

```javascript
socket.on("message:sent", (status) => {
  console.log("Message sent:", status);
});
```

#### Group Joined

```javascript
socket.on("groupJoined", (data) => {
  console.log("Joined group:", data.groupId);
});
```

#### Error Handling

```javascript
socket.on("error", (error) => {
  console.error("Socket error:", error);
});
```

## Project Structure

```
chat-server/
├── dist/                   # Compiled TypeScript output
├── node_modules/           # Dependencies
├── src/
│   ├── controllers/        # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── controller.d.ts
│   │   ├── ControllerApiFactory.ts
│   │   ├── group.controller.ts
│   │   └── user.controller.ts
│   ├── models/             # Database models
│   │   ├── CRUD.ts
│   │   ├── group.model.ts
│   │   ├── model.d.ts
│   │   └── user.model.ts
│   ├── routes/             # API routes
│   │   ├── auth.routes.ts
│   │   ├── group.routes.ts
│   │   └── user.routes.ts
│   ├── utils/              # Utility functions
│   │   ├── catchAsync.ts
│   │   ├── customError.ts
│   │   └── queryHandler.ts
│   ├── app.ts              # Express app setup
│   ├── server.config.ts    # Server configuration
│   └── server.ts           # Server entry point
├── .env                    # Environment variables
├── .gitignore
├── eslint.config.js        # ESLint configuration
├── package.json
├── README.md
└── tsconfig.json           # TypeScript configuration
```

## TypeScript Models

### User Model

```typescript
interface IUser {
  username: string;
  email: string;
  password: string;
  avatar: string;
}
```

### Group Model

```typescript
interface IGroup {
  name: string;
  avatar: string;
  users: Types.ObjectId[] | IUser[];
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
