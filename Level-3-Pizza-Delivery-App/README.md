# 🍕 PizzaHub – Full Stack Pizza Delivery App

## Project Overview

PizzaHub is a full-stack pizza delivery web application that allows customers to browse pizzas, add items to their cart, place orders, and track their delivery status in real time.

## Features

- User Registration and Login
- Secure JWT Authentication
- Browse Pizza Menu
- Shopping Cart and Quantity Management
- Cash on Delivery (COD)
- Online Payments using Razorpay
- My Orders and Order History
- Admin Dashboard
- Order Status Management
- Real-Time Order Tracking using Socket.IO
- MongoDB Database Integration

## Technologies Used

**Frontend**

- React.js
- Vite
- CSS
- Axios
- React Router
- Socket.IO Client

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.IO
- Razorpay

## Project Structure

```text
Level-3-Pizza-Delivery-App/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── screenshots/
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/meetjani1502/OIBSIP.git
cd OIBSIP/Level-3-Pizza-Delivery-App
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file and configure:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/pizzahub
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL shown in your terminal.

## Payment Integration

PizzaHub integrates Razorpay Test Mode for online payment testing. Cash on Delivery is also supported.

**Note:** Use your own Razorpay test credentials. Never upload `.env` or API secrets to GitHub.

## Screenshots

Project screenshots are available in the `screenshots/` folder.

## Developer

**Meet Jani**

GitHub: https://github.com/meetjani1502

## Project

Oasis Infobyte Internship – Level 3  
Task: Pizza Delivery Full-Stack Application
