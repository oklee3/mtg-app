# Magic: The Gathering Web App (Backend)

This is the Node.js/Express backend for the Magic: The Gathering card manager app.

## Setup

1. Copy `.env.example` to `.env` and set your MongoDB URI and server port.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/app.js` — Main Express app
- `src/db.js` — MongoDB connection
- `src/models/` — Mongoose models (e.g., Card)
- `src/routes/` — API routes
- `src/controllers/` — Route controllers

The server will connect to MongoDB and expose a REST API for the frontend. 