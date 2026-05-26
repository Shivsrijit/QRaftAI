# Local Development Setup Guide

This guide will walk you through setting up and running the VedaAI Assessment Creator on your local machine from scratch.

---

## 📋 Prerequisites

Ensure you have the following installed on your system before proceeding:
1.  **Node.js**: Version 18.0.0 or higher is required.
2.  **npm**: Usually bundled with Node.js.
3.  **MongoDB**: A running local instance (`mongodb://localhost:27017`) or a remote MongoDB Atlas connection URI.
4.  **Redis** *(Optional but recommended)*: A running local Redis instance (`redis://127.0.0.1:6379`) to power the production background job queue. If Redis is not available, the backend will automatically and gracefully fall back to an **In-Memory Asynchronous Queue** so that you can still generate assignments smoothly.

---

## 🛠️ Step-by-Step Installation

### Step 1: Clone the Repository
Open your terminal and navigate to the project directory:
```bash
cd "VEDA AI"
```

---

### Step 2: Configure the Backend

1.  Navigate into the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Create an environment configuration file named `.env` in the root of the `backend/` folder:
    ```env
    PORT=5001
    WS_PORT=5002
    MONGODB_URI=mongodb+srv://your-mongodb-uri-here
    REDIS_URL=redis://127.0.0.1:6379
    GEMINI_API_KEY=AIzaSy...your-actual-gemini-key
    ```
    
    > ⚠️ **Note**: Make sure to replace `MONGODB_URI` with your actual MongoDB connection string and `GEMINI_API_KEY` with your Google Gemini developer key. If you don't have a Gemini API key yet, you can obtain one from the [Google AI Studio](https://aistudio.google.com/).

4.  Start the backend in development mode:
    ```bash
    npm run dev
    ```
    The console will log startup confirmations, including the HTTP port (`5001`), the WebSocket port (`5002`), database connection status, and whether it connected to Redis or fell back to the local in-memory queue.

---

### Step 3: Configure the Frontend

1.  Open a new terminal window and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Start the Next.js development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to:
    ```
    http://localhost:3000
    ```
    You will see the fully interactive VedaAI dashboard loading seamlessly.

---

## 🏗️ Building for Production

If you are deploying VedaAI to a production environment, follow these build steps:

### Build Backend
```bash
cd backend
npm run build
# Starts the compiled JavaScript server from the dist/ folder
npm start
```

### Build Frontend
```bash
cd frontend
npm run build
# Starts the production Next.js server
npm run start
```

---

## 🔍 Troubleshooting & FAQs

### Q1: The backend says "Redis server not detected. Fallback: Running an in-memory queue." Is this an error?
**No.** This is a built-in resiliency feature. We designed the backend to detect if Redis is offline. If so, it boots up an in-memory scheduler that executes the exact same Gemini AI pipelines asynchronously. You do not need to install Redis to test the application locally.

### Q2: I clicked "Download as PDF" and nothing happened.
Make sure the backend is running. The frontend does not compile PDFs locally; it fetches them on-the-fly from the backend at `http://localhost:5001/api/assignments/:id/download`. Also, check your browser permissions. The application uses the modern **FileSystem Write API** (`showSaveFilePicker`) to let you choose where to save the file. If your browser does not support this, it will fall back to a standard anchor download.

### Q3: How do I toggle Dark Mode?
Click on **Settings** in the sidebar, type in your school name/avatar preferences if desired, and toggle the theme switch. The dark theme is written entirely in Vanilla CSS and applies immediately across all views.
