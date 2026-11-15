# PizzaCraft — Custom Pizza Delivery

PizzaCraft is a full-stack custom pizza delivery application. Customers build a pizza from fresh ingredients, pay with Razorpay test checkout, and track delivery status in real time. Admins manage live orders, update statuses, and maintain inventory.

## Features

### Customers

- Register, verify email, log in, and reset passwords.
- Choose a base, sauce, cheese, and multiple vegetables.
- See stock availability and a live price summary.
- Pay using Razorpay test mode.
- View ingredient breakdown, delivery address, payment ID, and live order status.

### Admins

- View live orders and customer contact information.
- Receive new orders through Socket.io without refreshing.
- Update order status: Order Received, In Kitchen, or Sent to Delivery.
- Review inventory grouped by category.
- See low-stock warnings, restock ingredients by 10, and add new ingredients.
- Receive scheduled low-stock email alerts.

## Tech stack

- Frontend: React 19, Vite, React Router, Axios, Tailwind CSS, Socket.io client, Lucide React
- Backend: Node.js, Express 5, MongoDB, Mongoose, JWT, Nodemailer, Razorpay, Socket.io, node-cron

## Local setup

### Backend

1. Install Node.js and MongoDB or create a MongoDB Atlas database.
2. From `Backend/`, install dependencies:

   ```bash
   npm install
   ```

3. Create `Backend/.env` using `.env.example`:

   ```env
   PORT=3000
   MONGO_DB_URI=your_mongodb_connection_string
   JWT_SECRET=your_long_random_secret
   CLIENT_URL=http://localhost:5173
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_test_secret
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   ADMIN_EMAIL=your_alert_email
   ```

4. Seed the admin account and ingredients:

   ```bash
   npm run seed
   ```

5. Start the API:

   ```bash
   npm run dev
   ```

The backend runs on port `3000`.

### Frontend

1. From `Frontend/`, install dependencies:

   ```bash
   npm install
   ```

2. Create `Frontend/.env` using `.env.example`:

   ```env
   VITE_API_URL=http://localhost:3000
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
   ```

3. Start the Vite app:

   ```bash
   npm run dev
   ```

## Seeded admin credentials

```text
Email: admin@pizzadelivery.com
Password: admin123
```

Change the seeded password before using the application beyond local testing.

## Screenshots

Add screenshots here for:

- Customer pizza builder
- Razorpay checkout
- Live order tracking
- Admin live orders
- Admin inventory manager
