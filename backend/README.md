# Portfolio Backend API

A clean, production-ready Node.js + Express + MongoDB backend for Akash's personal developer portfolio (React + Vite frontend).

## Features

- REST API for contact form, projects, and visitor tracking
- MongoDB (Mongoose) data storage
- JWT-based admin authentication for protected stats endpoint
- Optional email notifications via Nodemailer (contact form still works without it)
- Security: Helmet, CORS, rate limiting, input validation, body size limits
- Centralized error handling with clean JSON responses
- Beginner-friendly MVC-style folder structure

## Folder Structure

```
portfolio-backend/
├── server.js
├── package.json
├── .env
├── .env.example
├── .gitignore
├── README.md
├── src/
│   ├── config/db.js
│   ├── models/ (Contact.js, Project.js, Visitor.js)
│   ├── controllers/ (contact, project, visitor, health, auth)
│   ├── routes/ (contact, project, visitor, health, auth)
│   ├── middleware/ (errorMiddleware.js, authMiddleware.js)
│   └── utils/ (sendEmail.js, generateToken.js)
└── scripts/
    ├── seedProjects.js
    └── generateAdminHash.js
```

---

## 1. Install Node.js

Download and install Node.js (v18 or later) from https://nodejs.org.

Check it installed correctly:

```bash
node -v
npm -v
```

## 2. Install Dependencies

From inside the `portfolio-backend` folder:

```bash
npm install
```

## 3. Create Your `.env` File

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

You'll need to fill in at minimum: `MONGO_URI` and `JWT_SECRET`. Everything else (SMTP, admin login) can be added when you're ready to use those features.

## 4. Create a MongoDB Atlas Database

1. Go to https://www.mongodb.com/cloud/atlas and create a free account.
2. Create a new **Cluster** (the free M0 tier is enough).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` to allow access from anywhere while developing).
5. Click **Connect** → **Drivers**, and copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   ```
6. Paste it into `.env` as `MONGO_URI`, adding a database name before the `?`, e.g.:
   ```
   MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

> The server will refuse to start if `MONGO_URI` is missing or the connection fails — this is intentional, so you always know your database is actually connected.

## 5. Generate Your Admin Password Hash

The admin password is never stored in plain text. Generate a bcrypt hash:

```bash
npm run generate:admin-hash -- "YourStrongPassword123!"
```

Copy the printed hash into `.env`:

```env
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD_HASH=<paste the generated hash here>
```

Also set a strong, random `JWT_SECRET` in `.env` (any long random string works — e.g. generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).

## 6. Start the Server

Development (auto-restarts on file changes):

```bash
npm run dev
```

Production:

```bash
npm start
```

The API will be available at `http://localhost:5000`.

## 7. Seed Your Projects

Populate the database with your current portfolio projects (Personal Portfolio, Menskart E-commerce, AI WeatherWise):

```bash
npm run seed:projects
```

Run this again any time you want to reset the projects collection back to this list.

---

## API Endpoints

| Method | Endpoint               | Access | Description                          |
|--------|-------------------------|--------|---------------------------------------|
| GET    | `/api/health`           | Public | Server & database health check        |
| GET    | `/api/projects`         | Public | Get all active projects               |
| GET    | `/api/projects/:id`     | Public | Get a single project                  |
| POST   | `/api/contact`          | Public | Submit the contact form               |
| POST   | `/api/visitors/track`   | Public | Record a page visit                   |
| POST   | `/api/auth/login`       | Public | Admin login (returns a JWT)           |
| GET    | `/api/visitors/stats`   | Admin  | Visitor statistics (requires JWT)     |

---

## 8. Testing with Postman

Create a new collection in Postman and add the requests below. Set a collection variable `base_url = http://localhost:5000/api`.

### GET `{{base_url}}/health`
Expected response:
```json
{
  "success": true,
  "status": "OK",
  "database": "connected",
  "uptime": 42.5,
  "timestamp": "2026-09-22T10:00:00.000Z"
}
```

### GET `{{base_url}}/projects`
Expected response:
```json
{
  "success": true,
  "count": 3,
  "data": [ { "title": "Personal Portfolio", "...": "..." } ]
}
```

### GET `{{base_url}}/projects/:id`
Replace `:id` with a real `_id` from the previous response.

### POST `{{base_url}}/contact`
Body → raw → JSON:
```json
{
  "name": "Akash",
  "email": "example@gmail.com",
  "subject": "Portfolio enquiry",
  "message": "Hello Akash, I'd love to connect regarding a project opportunity."
}
```
Expected response:
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": { "id": "...", "status": "new", "createdAt": "..." }
}
```

### POST `{{base_url}}/visitors/track`
Body → raw → JSON:
```json
{
  "page": "/",
  "referrer": "https://google.com"
}
```

### POST `{{base_url}}/auth/login`
Body → raw → JSON:
```json
{
  "email": "your-email@example.com",
  "password": "YourStrongPassword123!"
}
```
Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi..."
}
```
Copy the `token` value for the next request.

### GET `{{base_url}}/visitors/stats`
Headers → `Authorization: Bearer <paste token here>`

Expected response:
```json
{
  "success": true,
  "data": {
    "totalVisitors": 12,
    "visitorsLast7Days": 5,
    "visitsByPage": [ { "page": "/", "count": 8 } ],
    "topReferrers": [ { "referrer": "direct", "count": 6 } ]
  }
}
```

---

## 9. Connecting Your React Frontend

Your frontend already reads the API base URL like this:

```js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
```

Add to your **frontend's** `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Contact form
```js
async function submitContactForm(formData) {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData), // { name, email, subject, message }
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to send message");
  }
  return data;
}
```

### Fetch projects
```js
async function fetchProjects() {
  const res = await fetch(`${API_BASE_URL}/projects`);
  const data = await res.json();
  return data.data; // array of projects
}
```

### Track a visit (e.g. in your top-level App component)
```js
useEffect(() => {
  fetch(`${API_BASE_URL}/visitors/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page: window.location.pathname,
      referrer: document.referrer || "direct",
    }),
  }).catch(() => {}); // tracking failures shouldn't break the site
}, []);
```

### Health check
```js
async function checkApiHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}
```

---

## 10. Deployment

You can deploy this backend to any Node-friendly host — Render, Railway, and Fly.io all have generous free tiers.

**General steps (using Render as an example):**

1. Push this backend to its own GitHub repository (your `.env` is git-ignored, so secrets won't be uploaded).
2. In Render, create a new **Web Service** connected to that repo.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Add all the variables from `.env.example` under Render's **Environment** settings, with your real values (MongoDB Atlas URI, JWT secret, admin credentials, SMTP if used).
5. Set `FRONTEND_URL` to your deployed frontend's URL (e.g. your Vercel/Netlify domain) so CORS allows it.
6. Deploy. Once live, update your frontend's `VITE_API_BASE_URL` to point at the deployed backend URL (e.g. `https://your-app.onrender.com/api`).
7. Confirm everything works by visiting `https://your-app.onrender.com/api/health`.

**Note on MongoDB Atlas Network Access:** if you used `0.0.0.0/0` during development, consider restricting it, or at minimum keep your database user's password strong, since the cluster is reachable from the internet.

---

## Security Notes

- Never commit `.env` — it's already in `.gitignore`.
- `MONGO_URI`, `JWT_SECRET`, `SMTP_PASS`, `ADMIN_PASSWORD_HASH` are only ever read from environment variables, never hardcoded.
- Passwords are never returned in any API response.
- `/api/visitors/stats` requires a valid admin JWT — it is not publicly accessible.
- In production (`NODE_ENV=production`), error responses never leak stack traces.
