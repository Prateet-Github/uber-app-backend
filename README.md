# GetRides Backend 🚗

Backend API for GetRides - A ride-sharing platform built with Node.js and Express.

## 📋 Overview

GetRides Backend is a RESTful API server that powers the GetRides ride-sharing application. Built with Node.js and Express, it provides endpoints for user authentication, ride management, and real-time features.

**Frontend Repository**: [GetRides-frontend](https://github.com/Prateet-Github/GetRides-frontend)

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

---

## 📁 Project Structure

```
GetRides-backend/
├── configs/           # Configuration files
├── controllers/       # Request handlers
├── middlewares/       # Custom middleware
├── models/           # Database models
├── routes/           # API routes
├── .gitignore
├── package.json
├── package-lock.json
└── server.js         # Entry point
```

---

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prateet-Github/GetRides-backend.git
   cd GetRides-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000`

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Rides
- `POST /api/rides` - Create new ride
- `GET /api/rides` - Get all rides
- `GET /api/rides/:id` - Get ride by ID
- `PUT /api/rides/:id` - Update ride
- `DELETE /api/rides/:id` - Delete ride

### Users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile

---

## 🗃️ Database Models

The application uses MongoDB with Mongoose for data modeling:

- **User Model** - User account information
- **Ride Model** - Ride details and booking information
- **Driver Model** - Driver profiles and vehicle information

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing
- CORS enabled
- Environment variable protection

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Prateet**
- GitHub: [@Prateet-Github](https://github.com/Prateet-Github)

---

## 🔗 Related Projects

- [GetRides Frontend](https://github.com/Prateet-Github/GetRides-frontend)

---

<div align="center">
  Made with ❤️ by Prateet
</div>
