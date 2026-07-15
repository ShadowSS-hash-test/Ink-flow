
# Ink-flow

A real-time collaborative whiteboard app. Create a room, share the link, and draw together live — with synced strokes, live cursors, and persistent boards you can save and revisit later.

🔗 **Live demo:** https://ink-flow-chi.vercel.app/

## Features

- **Real-time collaborative drawing** — strokes sync instantly across all participants in a room via Socket.IO, capped at 3 concurrent users per room.
- **Live cursor tracking** — every user gets a colored cursor that other participants can see moving in real time.
- **Room-based sessions** — create a new room (unique ID generated with `nanoid`) or join an existing one; late joiners get replayed the room's current drawing history.
- **Persistent boards** — save boards to the database and reload them later, with full create/update/fetch/delete support scoped to the logged-in user.
- **Offline mode** — draw on a local, non-networked canvas without needing a room or connection.
- **Authentication** — signup/login with hashed passwords (bcrypt) and JWT-based sessions (short-lived access token + longer-lived refresh token, both as httpOnly cookies). The frontend Axios instance auto-refreshes expired access tokens and retries failed requests transparently.
- **User dashboard** — view and manage saved boards, update profile, change password, or delete account.

## Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS 4
- Zustand (client state)
- React Router
- Socket.IO client
- Axios
- react-hot-toast, lucide-react

**Backend**
- Node.js + Express 5
- Socket.IO (real-time engine)
- PostgreSQL via [Neon](https://neon.tech) serverless driver
- JWT (`jsonwebtoken`) for auth
- bcrypt for password hashing
- cookie-parser, cors, nanoid

## Project Structure

```
Ink-flow/
├── backend/
│   ├── controllers/       # auth, user, drawing business logic
│   ├── middlewares/       # JWT verification
│   ├── routes/            # /api/auth, /api/user, /api/drawings
│   ├── lib/sockets.js     # Socket.IO server + room/cursor/drawing events
│   ├── util/db.js         # Postgres (Neon) connection pool
│   ├── util/initDB.js     # creates users & drawings tables on boot
│   └── index.js           # Express app entry point
└── frontend/
    └── src/
        ├── pages/          # LandingPage, Login, Signup, Whiteboard,
        │                   # OfflineWhiteboard, UserDashboard
        ├── components/     # Navbar, Sidebar, MyBoards, Toolbutton, SettingsTab
        ├── stores/         # useUserStore, useDrawingStore (Zustand)
        └── util/           # axios instance, ProtectedRoutes
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A PostgreSQL database (this project is built against [Neon](https://neon.tech)'s serverless driver, but any Postgres connection string should work)

### 1. Clone the repo

```bash
git clone https://github.com/ShadowSS-hash-test/Ink-flow.git
cd Ink-flow
```

### 2. Install dependencies

```bash
# backend (from project root)
npm install

# frontend
cd frontend
npm install
cd ..
```

### 3. Configure environment variables

Create a `.env` file in the **project root**:

```env
PORT=5000
DATABASE_URL=your_postgres_connection_string
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Create a `.env` file inside **`frontend/`**:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_NODE_ENV=Development
```

### 4. Run the app

```bash
# from project root — starts the backend (auto-creates tables on first boot)
npm run dev

# in a separate terminal
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000` by default.

## API Overview

| Route | Method | Description |
|---|---|---|
| `/api/auth/signup` | POST | Register a new user |
| `/api/auth/signin` | POST | Log in |
| `/api/auth/refresh-token` | POST | Issue a new access token from the refresh cookie |
| `/api/auth/profile` | GET | Get the current user's profile *(protected)* |
| `/api/auth/logout` | GET | Clear auth cookies *(protected)* |
| `/api/user/updateProfile` | POST | Update profile details *(protected)* |
| `/api/user/updatePassword` | POST | Change password *(protected)* |
| `/api/user/deleteAccount` | POST | Delete account *(protected)* |
| `/api/drawings/createBoard` | POST | Create a new board *(protected)* |
| `/api/drawings/fetchBoards` | GET | List the user's saved boards *(protected)* |
| `/api/drawings/updateBoard` | POST | Save/update board elements *(protected)* |
| `/api/drawings/:boardId` | DELETE | Delete a board *(protected)* |

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `joinRoom` | client → server | Create (`roomID: "create"`) or join a room |
| `roomCreated` | server → client | Returns the newly generated room ID |
| `drawing` | both | Broadcasts a drawing stroke to the room |
| `cursorMove` / `cursorUpdate` | both | Live cursor position sync |
| `active-users` | server → client | Current users + assigned colors in the room |
| `clearCanvas` | both | Clears the shared canvas for everyone in the room |
| `user-joined` / `user-left` | server → client | Room membership updates |

