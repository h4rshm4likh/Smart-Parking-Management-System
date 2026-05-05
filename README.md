# Smart Parking System

This is a complete full-stack web application designed for booking and managing parking slots in real-time. It includes a React frontend, Node.js/Express backend, MySQL database, and Antigravity Connect webhook simulation.

## Folder Structure

```
smart-parking-system/
│
├── backend/                  # Node.js + Express
│   ├── config/               # Database connection
│   ├── controllers/          # Business logic
│   ├── middleware/           # JWT and auth checks
│   ├── routes/               # Express API endpoints
│   ├── .env                  # Environment variables
│   ├── server.js             # Entry point
│   └── package.json          # Dependencies
│
├── frontend/                 # React + Vite + Tailwind + TypeScript
│   ├── src/
│   │   ├── components/ui/    # Shadcn-like components (e.g., Sparkles)
│   │   ├── lib/              # Utility functions
│   │   ├── App.tsx           # Main Landing Page / Router
│   │   ├── index.css         # Tailwind base styles
│   │   └── main.tsx          # Vite React entry point
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json          # Dependencies
│
└── database/
    └── schema.sql            # MySQL Database Setup Script
```

## API Endpoints List

### Authentication
* `POST /api/auth/register` - Register a new user
* `POST /api/auth/login` - Login to receive a JWT token
* `GET /api/auth/me` - Get current user profile (Auth Required)

### Parking Slots
* `GET /api/slots` - Get all available and booked slots
* `GET /api/slots/:id` - Get details of a specific slot
* `POST /api/slots` - Create a new slot (Admin Only)
* `PUT /api/slots/:id` - Update slot details/status (Admin Only)
* `DELETE /api/slots/:id` - Remove a slot (Admin Only)

### Bookings
* `GET /api/bookings/mybookings` - Get bookings for the logged-in user (Auth Required)
* `GET /api/bookings` - Get all bookings (Admin Only)
* `POST /api/bookings` - Book a slot, process payment, and update status (Auth Required)

### Antigravity Connect
* `POST /api/antigravity/webhook` - Simulate real-time hardware status updates (e.g. from an IoT camera or sensor detecting a car).

## Setup Instructions

### 1. Database Setup
1. Ensure you have MySQL running locally.
2. Open your terminal and log into MySQL: `mysql -u root -p`
3. Run the schema file to create the database and tables:
   ```sql
   source /absolute/path/to/smart-parking-system/database/schema.sql;
   ```

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Open `.env` and configure your `DB_USER` and `DB_PASSWORD` to match your local MySQL setup.
3. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```
   *(Wait for "Server running on port 5000")*

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies and start the React app:
   ```bash
   npm install
   npm run dev
   ```
3. Open the browser to the provided localhost URL. You will see the Sparkles landing page!
