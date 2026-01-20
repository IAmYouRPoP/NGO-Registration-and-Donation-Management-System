# NGO Registration and Donation Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application built to separate user registration from donation flow, ensuring data integrity, transparency, and ethical handling of payments.

---

##  Key Features
* **Role-Based Access Control (RBAC)**: Secure authentication with distinct dashboards for standard Users and Administrators.
* **Stripe Sandbox Integration**: End-to-end secure payment processing for NGO campaigns.
* **Real-time Admin Control Panel**: High-level oversight including donation tracking, registration management, and campaign-based filtering.
* **Automated Transaction Expiry**: Backend logic to maintain data accuracy by marking abandoned "Pending" payments as "Failed" after 30 minutes.
* **Data Export**: Built-in capability for administrators to export registration and donation data directly to CSV.

---

##  Tech Stack
* **Frontend**: React.js, React Router, CSS3.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB Atlas.
* **Payments**: Stripe API (Sandbox Mode).

---

##  Prerequisites
* **Node.js**: v18.x or higher.
* **npm**: v9.x or higher.
* **MongoDB Atlas Account**: Required for cloud database hosting.
* **Stripe Developer Account**: Required for API Test Mode keys.

---

##  Installation & Setup

### 1. Clone the Project

```bash
git clone [https://github.com/IAmYourPoP/NGO-Registration-and-Donation-Management-System.git](https://github.com/IAmYourPoP/NGO-Registration-and-Donation-Management-System.git)
cd NGO-Registration-and-Donation-Management-System
```

### 2. Backend Configuration
1.  **Navigate to the backend folder**:
    ```bash
    cd backend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**: Create a `.env` file in the `backend` root with these keys:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=your_secure_jwt_token_secret
    STRIPE_SECRET_KEY=your_stripe_test_secret_key
    ```
4.  **Database Connection**: The system connects to MongoDB Atlas using Mongoose. Ensure your IP address is whitelisted in the Atlas Network Access settings.
5.  **Start the Server**:
    ```bash
    node server.js
    ```

### 3. Frontend Configuration
1.  **Navigate to the frontend folder**:
    ```bash
    cd ../frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the React App**:
    ```bash
    npm start
    ```
   
---

##  Security & Logic Features

### Role-Based Access Control (RBAC)
The application implements JWT-based authentication to separate user levels:
* **Users**: Can view their personal donation history and initiate new donations via the Stripe gateway.
* **Admins**: Have exclusive access to the **Admin Control Panel**, allowing them to monitor all global donations and manage user registrations.

### Automated Cleanup Job
To ensure data integrity, the backend includes a `setInterval` task that runs every 10 minutes:
* It identifies any donation records with a `PENDING` status.
* If a record is older than 30 minutes (indicating the user abandoned the Stripe checkout), it is automatically marked as `FAILED`.
* This ensures the Admin Dashboard and User history accurately reflect actual successful transactions.

---

## 🧪 Testing and Demo

### Stripe Sandbox Details
To test the payment flow, use Stripe's standard test card:
* **Card Number**: `4242 4242 4242 4242`
* **Expiry**: Any future date (e.g., `12/30`)
* **CVC**: `123`



### Admin Access
Log in with an account that has `role: "admin"` in MongoDB to view the **Registration Management** tab and the **Export to CSV** functionality.

---

## 📁 Detailed Project Structure
```plaintext
├── backend/
│   ├── models/        # Mongoose schemas for Users and Donations
│   ├── routes/        # Auth and Donation API endpoints
│   ├── middleware/    # protect middleware for JWT verification
│   └── server.js      # Server entry point and automated cleanup logic
├── frontend/
│   ├── src/
│   │   ├── pages/     # Admin, Dashboard, Login, Donate, Success/Failure
│   │   ├── services/  # API call handlers
│   │   ├── styles/    # Dashboard and Admin CSS
│   │   └── App.js     # React Router and global state

```