# 💰 SpendWise — Smart Student Expense Management System

Full-stack app: React + Node.js/Express + MongoDB

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas free tier)
- npm or yarn

---

## 📦 Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/spendwise
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

> For MongoDB Atlas, replace MONGO_URI with your Atlas connection string.

Start backend:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Backend runs at: **http://localhost:5000**

---

## ⚛️ Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET  | /api/auth/me | Get current user |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/expenses | Get all expenses (with filters) |
| POST | /api/expenses | Add expense |
| PUT | /api/expenses/:id | Edit expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/expenses/analytics/summary | Analytics summary |

### Budget
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/budget | Get budget settings |
| POST | /api/budget | Set/update budget |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | /api/users/profile | Update profile |
| PUT | /api/users/currency | Update currency |
| DELETE | /api/users/reset | Reset all data |

---

## 🧱 Tech Stack
- **Frontend**: React 18, Chart.js, React Router v6, Axios
- **Backend**: Node.js, Express.js, JWT auth, bcrypt
- **Database**: MongoDB + Mongoose
- **Styling**: Custom CSS with CSS variables (dark theme)

---

## 📁 Project Structure

```
spendwise/
├── backend/
│   ├── config/         # DB connection
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth + App context
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── utils/       # API helpers
│   │   └── App.js
│   └── package.json
└── README.md
```
