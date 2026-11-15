# 🍕 PizzaCraft

### Custom pizza delivery, built for hungry customers and efficient kitchens

PizzaCraft is a full-stack pizza delivery platform where customers create their own pizzas, pay securely with Razorpay, and follow each order in real time. Store administrators get a dedicated control room for live orders, inventory, restocking, and low-stock notifications.

> **Project:** `WebDev-L3-T1-PizzaDelivery`  
> **Application type:** Full-stack MERN-style web application  
> **Status:** ✅ Four implementation phases complete

---

## ✨ Highlights

| Customer experience | Store management |
| --- | --- |
| 🧑‍🍳 Four-step pizza builder | 📦 Inventory management |
| 💳 Razorpay test-mode checkout | 🛎️ Live incoming orders |
| 📍 Delivery address and order summary | 🔄 Real-time order status updates |
| 🚚 Live order tracking | ⚠️ Low-stock highlighting |
| 🔐 Email verification and password reset | ➕ One-click +10 restocking |
| 📱 Responsive PizzaCraft interface | 📧 Scheduled stock alert emails |

## 🧭 How it works

### 🛒 Customer journey

1. Register with a name, email, and password.
2. Verify the account through the emailed verification link.
3. Choose a **base**, **sauce**, **cheese**, and optional **vegetables**.
4. Adjust quantity, enter a delivery address, and review the live total.
5. Complete payment through Razorpay Test Mode.
6. Track the order through:
   - `Order Received`
   - `In Kitchen`
   - `Sent to Delivery`

### 👨‍💼 Admin journey

1. Log in using the seeded administrator account.
2. Watch new paid orders appear in the Live Orders tab through Socket.io.
3. Review customer details, ingredients, payment status, and address.
4. Update the order status for the customer’s live tracker.
5. Switch to Inventory Manager to review stock by category.
6. Restock low ingredients or add new ingredients.

## 🗂️ Project structure

```text
OIBSIP/
├── README.md
└── WebDev-L3-T1-PizzaDelivery/
    ├── Backend/
    │   ├── .env.example
    │   ├── package.json
    │   ├── server.js                 # HTTP, Socket.io, DB and cron startup
    │   ├── seed.js                   # Admin and ingredient seeder
    │   └── src/
    │       ├── app.js                # Express app and API mounting
    │       ├── controllers/
    │       │   ├── authController.js # Registration and password flows
    │       │   └── orderController.js# Payments, orders and stock deduction
    │       ├── db/
    │       │   └── db.js             # MongoDB connection
    │       ├── jobs/
    │       │   └── stockAlertJob.js  # Every-15-minute low-stock alerts
    │       ├── middleware/
    │       │   └── authMiddleware.js # JWT protection and admin access
    │       ├── models/
    │       │   ├── User.js
    │       │   ├── InventoryItem.js
    │       │   └── Order.js
    │       ├── routes/
    │       │   ├── authRoutes.js
    │       │   ├── inventoryRoutes.js
    │       │   └── orderRoutes.js
    │       └── utils/
    │           └── sendEmail.js       # Gmail/Nodemailer delivery
    │
    └── Frontend/
        ├── .env.example
        ├── index.html
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── api/
            │   └── axios.js          # API client and JWT interceptor
            ├── components/
            │   ├── Navbar.jsx
            │   ├── PizzaBuilder.jsx
            │   └── StatusTracker.jsx
            ├── context/
            │   ├── AuthContext.jsx
            │   ├── contextValue.js
            │   └── useAuth.js
            ├── pages/
            │   ├── AdminDashboard.jsx
            │   ├── CustomerDashboard.jsx
            │   ├── OrderTracking.jsx
            │   ├── Login.jsx
            │   ├── Register.jsx
            │   ├── VerifyEmail.jsx
            │   ├── ForgotPassword.jsx
            │   └── ResetPassword.jsx
            ├── App.jsx
            ├── App.css
            └── index.css
```

## 🛠️ Technology stack

### Frontend

- ⚛️ React 19
- ⚡ Vite
- 🧭 React Router
- 📡 Axios
- 🎨 Tailwind CSS and custom CSS
- 🔌 Socket.io Client
- 🖼️ Lucide React icons

### Backend

- 🟢 Node.js and Express 5
- 🍃 MongoDB and Mongoose
- 🔑 JWT and bcryptjs authentication
- ✉️ Nodemailer with Gmail SMTP
- 💳 Razorpay payments
- 🔌 Socket.io real-time events
- ⏰ node-cron scheduled jobs

## 🔌 API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API availability |
| `POST` | `/api/auth/register` | Register a customer |
| `GET` | `/api/auth/verify/:token` | Verify an email |
| `POST` | `/api/auth/login` | Authenticate a user |
| `POST` | `/api/auth/forgot-password` | Request a reset link |
| `POST` | `/api/auth/reset-password/:token` | Set a new password |
| `GET` | `/api/inventory` | List ingredients |
| `POST` | `/api/inventory` | Add an ingredient as admin |
| `PUT` | `/api/inventory/:id/restock` | Increase stock as admin |
| `POST` | `/api/orders/razorpay` | Create a Razorpay order |
| `POST` | `/api/orders/verify` | Verify payment and save the order |
| `GET` | `/api/orders/myorders` | List the customer’s orders |
| `GET` | `/api/orders` | List all orders as admin |
| `PUT` | `/api/orders/:id/status` | Update status as admin |

### Real-time events

- `newOrder` — emitted when a paid order is saved.
- `orderStatus_<orderId>` — emitted when an administrator changes an order status.

## 🚀 Local setup

### Prerequisites

- Node.js 18+
- MongoDB local instance or MongoDB Atlas
- Razorpay Test Mode account
- Gmail account with 2-Step Verification and an App Password

### 1. Configure the backend

```powershell
cd WebDev-L3-T1-PizzaDelivery\Backend
npm install
```

Copy `.env.example` to `.env` and add your private values:

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

Seed the database and start the API:

```powershell
npm run seed
npm run dev
```

Backend URL: `http://localhost:3000`

### 2. Configure the frontend

Open a second terminal:

```powershell
cd WebDev-L3-T1-PizzaDelivery\Frontend
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

Start the frontend:

```powershell
npm run dev
```

Frontend URL: `http://localhost:5173`

## 🔐 Demo administrator

The seeder creates this local development account:

```text
Email:    admin@pizzadelivery.com
Password: admin123
```

Change the password before using the application outside local testing.

## 🧪 Validation

Run the frontend checks from `WebDev-L3-T1-PizzaDelivery/Frontend/`:

```powershell
npm run lint
npm run build
```

The backend JavaScript files can be syntax-checked with:

```powershell
Get-ChildItem -Recurse -File .\src | ForEach-Object { node --check $_.FullName }
```

## 🔒 Security notes

- Never commit `Backend/.env` or `Frontend/.env`.
- Only publish `.env.example` files with blank or placeholder values.
- Keep `RAZORPAY_KEY_SECRET`, `JWT_SECRET`, email credentials, and MongoDB credentials on the backend.
- Use Razorpay Test Mode credentials during local development.
- Use a Gmail App Password instead of a normal Gmail password.

## 🖼️ Screenshots

Add project screenshots to this section when available:

| Screen | Screenshot |
| --- | --- |
| 🍕 Customer pizza builder | `screenshots/customer-builder.png` |
| 💳 Razorpay checkout | `screenshots/razorpay-checkout.png` |
| 🚚 Live order tracking | `screenshots/order-tracking.png` |
| 📦 Admin live orders | `screenshots/admin-orders.png` |
| 📊 Inventory manager | `screenshots/inventory-manager.png` |


