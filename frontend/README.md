# Akash React Portfolio

This is a React + Vite conversion of the uploaded vanilla HTML/CSS/JavaScript portfolio.

## Included
- React component structure
- Responsive desktop/tablet/mobile layout
- Hash-based tab navigation
- Mobile navigation
- Loading screen
- Typing animation
- Dark/light theme switch with localStorage
- Scroll progress and scroll-to-top button
- Interactive project filters
- Project details modal
- Skills progress cards
- Copy-email interaction
- Contact form wired to your existing backend
- Visitor tracking and CV-download tracking
- Reduced-motion support

## Run

```bash
npm install
npm run dev
```

Open the URL shown by Vite, normally:

`http://localhost:5173`

## Existing Node.js backend

The React app uses:

`http://localhost:5000/api`

To use another backend URL, create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Your backend should provide:
- `POST /api/contact`
- `POST /api/visitors/track`
- `POST /api/resume/track`

If those routes are unavailable, the rest of the portfolio still works; tracking silently fails and the contact form displays a useful error.

## Important

Replace the placeholder project links/content when your final GitHub repositories are ready.
The existing CV link and social links from the uploaded portfolio have been preserved.
