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

### Local Installation

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

## Deploy to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dr-fatma-pharmacy.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Add Environment Variable:
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://Kandil_db_user:Kandil_db_user@cluster0.tm2rhiq.mongodb.net/pharmacy_db?retryWrites=true&w=majority`
5. Click "Deploy"

### Step 3: MongoDB Atlas Network Access
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to: Network Access → Add IP Address
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. This allows Vercel's servers to connect to your database

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
