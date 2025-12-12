# Dr. Fatma Pharmacy

A pharmacy management web application with MongoDB backend.

## Features

- User authentication (Login/Signup)
- Multiple user types: Admin, Pharmacist, Customer, Supplier, Deliverer
- Product browsing
- Shopping cart
- Admin dashboard

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## API Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "01234567890",
  "password": "password123",
  "address": "123 Main St",
  "usertype": "3"
}
```

User types:
- 1: Admin
- 2: Pharmacist
- 3: Customer
- 4: Supplier
- 5: Deliverer

#### POST /api/auth/login
Login to an existing account.

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Or login with phone:
```json
{
  "phone": "01234567890",
  "password": "password123"
}
```

#### GET /api/auth/me
Get current user info (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

## Project Structure

```
finaloop/
├── server.js          # Express server entry point
├── package.json       # Dependencies
├── models/
│   └── User.js        # MongoDB User model
├── routes/
│   └── auth.js        # Authentication routes
└── View/              # Frontend HTML files
    ├── Home.html
    ├── Home arabic.html
    ├── login.html
    ├── products.html
    ├── shopping-cart.html
    ├── admin.html
    ├── admin-signup.html
    ├── customer-signup.html
    ├── pharmacist-signup.html
    ├── supplier-signup.html
    └── deliverer-signup.html
```

## License

MIT
