# World Cup Draw Simulator

A React-based frontend application for simulating and managing World Cup tournament draws for fans who want to prove their knowledge by predicting the group stages and bracket, similar to [2026 World Cup Sim](https://www.2026worldcupsim.com/). 

Problem Solved: Since there is a new format for the world cup this year, many of the previous websites that were used for bracket prediction no longer work. This website is built to fill in that gap by making it work for the new format along with giving information like stats and betting odds to help users make predictions.

Target Audience: Soccer fans who want to prove they can predict the world cup better than others.

## Project Structure

```
CS390_TeamProject/
│
├── backend/                        # Node.js/Express Backend Server
│   ├── .env                        # Environment variables (MongoDB URI, JWT_SECRET, PORT)
│   ├── db.js                       # MongoDB connection configuration
│   ├── server.js                   # Express server entry point
│   ├── package.json                # Backend dependencies
│   ├── package-lock.json           # Dependency lock file
│   │
│   ├── models/                     # MongoDB Mongoose Models
│   │   ├── User.js                 # User schema (username, email, password)
│   │   ├── Bracket.js              # Bracket prediction model
│   │   ├── Match.js                # Match model
│   │   └── Team.js                 # Team model
│   │
│   ├── routes/                     # API Route Handlers
│   │   ├── auth.js                 # Authentication routes (POST /auth/login, POST /auth/register)
│   │   ├── betting.js              # Betting Odds routes   (POST /clear-cache, GET /group-winner, GET /odds)
│   │   └── glaze.js                 # Glaze routes          (POST /bracket)
│   │
│   └── middleware/                 # Express Middleware
│       └── auth.js                 # JWT authentication middleware (if exists)
│
├── world-cup-sim/                  # React Frontend Application
│   ├── public/                     # Static assets
│   │   └── vite.svg                # Vite logo
│   │
│   ├── src/                        # Source code
│   │   ├── api/                    # API Configuration
│   │   │   └── api.js              # Axios instance with JWT interceptors
│   │   │
│   │   ├── components/             # Reusable React Components
│   │   │   └── ProtectedRoute.jsx  # Route protection wrapper
│   │   │
│   │   ├── pages/                  # Page Components
│   │   │   ├── AccountSettingsPage.jsx # User Settings interface
│   │   │   ├── BettingOddsPage.jsx # Betting Odds interface
│   │   │   ├── DashboardPage.jsx   # Main dashboard (groups, brackets, knockout)
│   │   │   ├── DrawSimulatorPage.jsx # Draw simulation interface
│   │   │   ├── DrawResultPage.jsx  # Display draw results
│   │   │   ├── LoginPage.jsx       # User login interface
│   │   │   ├── PredictorPage.jsx   # Predicting Page interface
│   │   │   ├── RegisterPage.jsx    # User registration interface
│   │   │   ├── SimulatorPage.jsx   # Simulation Page interface
│   │   │   ├── AuthPages.css       # Shared auth page styles
│   │   │   ├── BettingOddsPage.css # Shared betting page styles
│   │   │   ├── DashboardPage.css   # Dashboard styles
│   │   │   ├── DrawSimulatorPage.css # Simulator styles
│   │   │   ├── DrawResultPage.css  # Results page styles
│   │   │   ├── PredictorPage.css   # Predicting Page styles
│   │   │   └── SimulatorPage.css   # Simulator Page styles
│   │   │
│   │   ├── assets/                 # Static assets
│   │   │   └── react.svg           # React logo
│   │   │
│   │   ├── App.jsx                 # Main app component (routing setup)
│   │   ├── App.css                 # Global app styles
│   │   ├── main.jsx                # Application entry point
│   │   └── index.css               # Global CSS reset/styles
│   │
│   ├── index.html                  # HTML template
│   ├── package.json                # Frontend dependencies
│   ├── package-lock.json           # Dependency lock file
│   ├── vite.config.js              # Vite build configuration
│   ├── eslint.config.js            # ESLint configuration
│   ├── .gitignore                  # Git ignore rules
│   └── README.md                   # Frontend documentation
│
├── template.html                   # HTML template/reference design
├── possibilities.csv                # FIFA 2026 third-place possibilities data
└── README.md                       # Project documentation (this file)
```

## Frontend Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the React app directory:
```bash
cd world-cup-sim
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Backend Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the React app directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:5001`.


## Features

### Authentication
- User registration with email validation
- User login with JWT token storage
- Protected routes requiring authentication
- Automatic token refresh and 401 error handling

### Brackets
- Create new Brackets
- Select Standings for Each Group
- Select Teams in Each Round of the 
- Have an AI Generated Response on how good your bracket is after completing it
- ![alt text](https://github.com/cfederoff/cs390teamproject2025/blob/main/GroupStagesScreenshot.png "Logo Title Text 1")

### Draw Simulator
- Simulate World Cup group stage draws
- Random team assignment to 8 groups (A-H)
- Support for 32 qualified teams
- ![alt text](https://github.com/cfederoff/cs390teamproject2025/blob/main/SimulationScreenShot.png "Logo Title Text 1")

## Stats and Odds
- See Stats and Odds for Each Group in the World Cup
- When Selecting the Bracket, see the odds for any combinations of teams facing each other
![alt text](https://github.com/cfederoff/cs390teamproject2025/blob/main/BettingOddsScreenshot.png "Logo Title Text 1")

## API Integration

The frontend is configured to communicate with a backend API at `http://localhost:5000/api`.

### API Endpoints Used

- **Authentication**
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login

- **Betting Odds**
  - `POST /api/clear-cache` - Clears previous odds informations
  - `GET /api/group-winner` - Finds which teams won each group
  - `GET /api/odds` - Fetch odds for specific teams
- **Glazing**
  - `Post /api/bracket` - Glazes the current bracket made

### API Configuration

The API client is configured in `src/api/api.js`:
- Base URL: `http://localhost:5000/api`
- JWT token automatically attached to requests via interceptors
- Automatic redirect to login on 401 errors
- Token stored in `localStorage` for persistence

## Technologies Used

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with glassmorphism effects
- **MongoDB** - Database to store User Information
- **Gemini** - AI powered responses to glaze brackets

## State Management

- `useState` hooks for component-level state
- `useEffect` hooks for side effects and data fetching
- `localStorage` for JWT token persistence
- React Router for navigation state

## Protected Routes

Routes requiring authentication:
- `/dashboard`
- `/draw-simulator`
- `/draw-result/:drawId`

Unauthenticated users are automatically redirected to `/login`.

## Styling

The application uses a modern design inspired by the template:
- Gradient backgrounds (`#0a1a2a` to `#003b5c`)
- Glassmorphism effects with backdrop blur
- Smooth transitions and hover effects
- Responsive grid layouts
- Consistent color scheme with accent colors (`#00c6ff`, `#0072ff`)

## Development Notes

- The `template.html` file in the root directory serves as a design reference
- Qualified teams are defined in `DrawSimulatorPage.jsx` and can be easily updated
- API base URL can be changed in `src/api/api.js`
- All protected routes check for JWT token in `localStorage`

Deployment Links
Front End: https://cs390teamprojectfinalversion.vercel.app
Back End: https://cs390-teamproject.onrender.com 
