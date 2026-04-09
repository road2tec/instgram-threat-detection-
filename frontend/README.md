# Cyber Incident Feed Monitoring Tool - Frontend

React + Vite frontend application for monitoring and analyzing cyber security incidents.

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── StatCard.jsx
│   │   └── IncidentCard.jsx
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx
│   │   ├── IncidentsList.jsx
│   │   ├── IncidentDetail.jsx
│   │   └── Analytics.jsx
│   ├── services/          # API services
│   │   └── api.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies
└── .env                   # Environment variables
```

## Features

- Dashboard with real-time incident statistics
- Incident list with filtering capabilities
- Detailed incident view
- Analytics with charts and visualizations
- Responsive design
- Modern UI with smooth animations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with the Flask backend API at `http://localhost:5000/api`. Configure the API URL in the `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```
