# Real-time Collaborative Task Board — Frontend

A responsive Kanban board application with drag-and-drop card management, real-time collaboration, and role-based access control. Built with React, Redux Toolkit, Tailwind CSS, and @dnd-kit.

## Tech Stack

- **Framework:** React 19 (Vite)
- **State Management:** Redux Toolkit (createSlice, createAsyncThunk)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v6 (centralized route config with meta)
- **Drag-and-Drop:** @dnd-kit (core + sortable)
- **Forms:** Formik + Yup
- **HTTP Client:** Axios (centralized instance with interceptors)
- **Real-time:** socket.io-client
- **Notifications:** react-hot-toast

## Getting Started

### Prerequisites

- Node.js >= 18.x
- Backend server running on port 5000

### Installation

```bash
# Clone the repository
git clone https://github.com/rahulchotaliya05/task-management-frontend.git
cd task-management-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Configure Environment

Open `.env` and set your backend URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Run the Application

```bash
# Development
npm run dev

# Production build
npm run build


```

App starts on `http://localhost:5173`

## Project Structure

```
src/
├── api/                  # Centralized HTTP layer
│   ├── axiosInstance.js  # Axios config, interceptors, token refresh
│   ├── apiClient.js      # Clean wrapper (get, post, put, patch, delete)
│   ├── auth.api.js       # Auth endpoints
│   ├── board.api.js      # Board endpoints
│   ├── card.api.js       # Card endpoints
│   ├── column.api.js     # Column endpoints
│   └── user.api.js       # User endpoints
├── app/
│   └── store.js          # Redux store configuration
├── components/
│   ├── common/           # Reusable UI (Button, Input, Select, Modal, Loader, ConfirmModal)
│   ├── layout/           # Layout, Header, Sidebar
│   └── board/            # TaskCard, CardModal, SortableCard, DroppableColumn
├── features/
│   ├── auth/             # Login, Register, authSlice, validation
│   ├── boards/           # BoardList, BoardDetail, boardSlice, card validation
│   └── admin/            # AdminBoardsPage, AdminBoardDetail
├── hooks/
│   ├── useDebounce.js    # Debounce hook for search inputs
│   └── useSocket.js      # Socket.io connection and event handling
├── routes/
│   ├── routes.jsx        # Centralized route config with meta (requiresAuth, requiredRole)
│   ├── AppRoutes.jsx     # Route renderer with guards
│   └── ProtectedRoute.jsx
├── socket/
│   └── socket.js         # Socket.io client instance
├── App.jsx               # Root component (auth initialization)
├── main.jsx              # Entry point (Provider, Router, Toaster)
└── index.css             # Tailwind import + custom scrollbar styles
```

## Architecture Decisions

### State Management — Why Redux Toolkit

| Concern | Approach |
|---------|----------|
| Global auth state | authSlice — user, isAuthenticated, loading, error |
| Board data | boardSlice — boards, currentBoard, columns, cards |
| Async operations | createAsyncThunk with consistent rejected/fulfilled handling |
| Optimistic updates | Reducers for optimisticMoveCard with rollback via setCards |
| Why not Context | Context triggers re-renders on all consumers. Redux with selectors renders only affected components. |
| Why not Zustand | Redux Toolkit has better DevTools, middleware support, and is more widely adopted in production codebases. |

### Performance Optimization

**Memoized card grouping (useMemo):**


**Why:** Cards array can contain 40+ items across multiple columns. Without memoization, this grouping/sorting runs on every render (parent state changes, unrelated prop updates). With useMemo, it only recalculates when `cards` or `columns` actually change.

### API Layer Design

```
axiosInstance.js → interceptors (token attach, auto-refresh on 401)
      ↓
apiClient.js → clean interface { get, post, put, patch, delete }
      ↓
*.api.js → feature-specific methods (boardAPI.getAll, cardAPI.move, etc.)
```

- **Token refresh flow:** 401 response → check if it's an auth endpoint (skip if yes) → call /auth/refresh → retry original request with new token → if refresh fails → redirect to login
- **No infinite loops:** Auth endpoint responses are never retried

### Real-time Updates

- Socket connects when user opens a board, joins room by board ID
- Listens for card events (created, updated, moved, deleted) + user presence (joined, left)
- On receiving events from other users → refetch board data from API (source of truth is backend)
- On disconnect/unmount → leaves room, removes listeners, disconnects socket
- Reconnection handled by socket.io client automatically

### Drag-and-Drop Implementation

| Component | Purpose |
|-----------|---------|
| DndContext | Wraps the board, provides sensor + collision detection |
| SortableContext | Per-column, enables card sorting |
| SortableCard | Wrapper with useSortable (transform, transition, opacity) |
| DroppableColumn | Wrapper with useDroppable (highlight ring on hover) |
| DragOverlay | Ghost card shown while dragging |

**Optimistic flow:**
1. User drags card → optimisticMoveCard reducer updates positions immediately
2. API call fires in background (POST /cards/:id/move)
3. Success → no action needed (state already correct)
4. Failure → rollback to previousCards snapshot, show error toast

### Routing

Centralized config with meta fields:

```javascript
{
  path: "admin/boards",
  element: <AdminBoardsPage />,
  requiredRole: "admin",
}
```

- `requiresAuth` — wraps in ProtectedRoute (redirects to /login if not authenticated)
- `requiredRole` — wraps in RoleGuard (redirects to /boards if wrong role)
- Auth initialization — App checks for existing token on mount, fetches user before rendering routes

### Code Splitting (Lazy Loading)

All page-level components are lazy-loaded using `React.lazy()` + `Suspense`:

```javascript
const BoardDetailPage = lazy(() => import("../features/boards/BoardDetailPage"));
```

**Build output:**
| Chunk | Size | Gzipped |
|-------|------|---------|
| Main bundle (shared libs) | 328 KB | 108 KB |
| BoardDetailPage (dnd-kit) | 102 KB | 32 KB |
| AdminBoardDetail | 7.6 KB | 2.2 KB |
| AdminBoardsPage | 4.9 KB | 1.7 KB |
| BoardListPage | 4.8 KB | 1.6 KB |
| LoginPage | 1.6 KB | 0.7 KB |
| RegisterPage | 2.2 KB | 0.9 KB |

Users only download the code they need. The heavy @dnd-kit bundle (102KB) is loaded only when user opens a board — not on login or board list page.

### Search

- All search goes through backend API (source of truth)
- useDebounce hook (400ms) prevents excessive API calls while typing
- Board list search: `GET /boards?search=term`
- Card search within board: `GET /boards/:id?search=term`

## Key Technical Decisions

| Decision | Why |
|----------|-----|

| Refetch after mutations | After card create/update/delete, refetch board from API instead of local state manipulation. Prevents duplicate cards from socket event + local add racing. |
| Backend search only | Frontend doesn't filter data. Debounced API calls ensure source of truth is always the database. |
| Separate validation files | `auth.validation.js`, `card.validation.js` — keeps form logic testable and reusable, not embedded in components. |
| ConfirmModal component | Reusable confirmation dialog instead of window.confirm(). Consistent UX across all destructive actions. |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskboard.com | admin123 |
| User | john@taskboard.com | user123 |

Admin sees sidebar with Home + Manage Boards. Regular users see only boards they are assigned to.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build |

| `npm run lint` | Run ESLint |

## Docker

```bash
# Standalone frontend container
docker build -t taskboard-frontend .
docker run -p 80:80 taskboard-frontend
```

Or use the full stack docker-compose from the backend repository:

```bash
# From backend repo root
cp docker.env.example docker.env
docker compose up --build
```

This starts MongoDB + Backend (port 5000) + Frontend (port 80). Access app at `http://localhost`.

## Browser Support

Tested on latest Chrome, Firefox, and Edge. Responsive layout works on desktop and tablet viewports.


