# CONNECT - Context-Separated Fast-Sync Chat Application

## Problem

Managing conversations between friends can get messy when everything lives in a single chat thread. Important information like shared expenses, tasks, college printouts, meetings, and casual banter gets mixed up, making it difficult to find specific context when needed. There is a need for a clean, organized way for friends to communicate with context-separated conversation spaces.

## Solution

**CONNECT** is a real-time, private chat web application designed for friends to communicate across dedicated, topic-based channels (Payments, General, Tasks, College Xerox & Prints, Meetings, and more). Powered by a **Fast-Sync WebSocket & Dual-Database Architecture**, CONNECT keeps conversations contextually separated while delivering sub-millisecond typing indicators, optimistic UI message delivery, delta reconnection syncing, and automated expense tracking—all in one workspace.

## Tech Stack

### Frontend
- **React 19.0.1** - UI framework
- **TypeScript 7.0.2** - End-to-end type safety
- **Vite 8.3.0** - Build tool and dev server
- **Socket.io Client** - Bi-directional real-time WebSocket communication
- **React Router DOM 7.18.4** - Client-side routing
- **Tailwind CSS 4.3.3** - Styling


### Backend & Real-Time Engine
- **Node.js & Express.js 4.21.2** - REST API & HTTP server framework
- **Socket.io** - Real-time event gateway (Room multiplexing, ACK receipts, auto-reconnection buffering)
- **JWT / Supabase Auth** - Secure session authentication

### Database & Storage Layer
- **PostgreSQL (via Supabase)** - Primary ACID-compliant database utilizing `JSONB` for polymorphic rich messages (Expenses, Polls, Meetings, Printouts) and cursor-based pagination
- **Redis (Upstash / Redis Cloud)** - In-memory data store for sub-millisecond presence (`Online`/`Last Seen`), ephemeral typing indicators, and unread channel counters
- **Supabase Storage** - Cloud object storage for documents, Xerox PDFs, images, and audio notes

## Team Details

- **Abilash Kumar** - Backend Architecture, Real-Time WebSocket Engine & Database Design
- **Devaroopa** - Frontend Architecture, UI/UX & Client State Management

## Project Features

- **Context-Separated Channels**: Dedicated topic channels (General, Daily Expenses, College Xerox & Prints, Meetings & Events, Project Work, etc.)
- **Fast-Sync Real-Time Messaging**:
  - **Optimistic UI Updates**: Instant 0ms local rendering with `client_msg_id` deduplication and server `ACK` tick progression (Sending → Sent → Delivered → Read)
  - **Delta Sync on Reconnect**: Synchronizes only missed messages since `last_synced_message_id` upon network restoration
  - **Ephemeral Presence via Redis**: Real-time typing indicators per channel and live online/offline status
- **Expense & Payment Ledger**: Track shared expenses, splits, and settlements with real-time balance recalculation
- **Multi-Tab & Multi-Device Sync**: Synchronizes state across browser tabs (`BroadcastChannel`) and devices (`Socket.io` rooms)
- **Notes Hub**: Centralized view of starred/important messages and pinned content across all channels
- **Custom Theming**: Dark/Light mode and per-channel custom chat wallpapers

## Getting Started

### Prerequisites
- Node.js (v20+ LTS recommended)
- Supabase Project (PostgreSQL + Storage)
- Redis Instance (Local, Upstash, or Redis Cloud)

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env.local` file in the root directory:
```env
# Server Config
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis
REDIS_URL=your_redis_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Client Config (exposed)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SOCKET_URL=http://localhost:3000
```

### Running the App

#### Development (Frontend + Backend with Hot Reload)
```bash
npm run dev
```
This starts both the Vite dev server and the Socket.io-enabled Express backend.

#### Production Build & Serve
```bash
npm run build
npm start
```
- `npm run build` - Builds the frontend to `dist/`
- `npm start` - Runs the production server with Socket.io WebSocket gateway

#### Other Scripts
```bash
npm run preview  # Preview built app
npm run clean    # Remove dist folder
npm run lint     # TypeScript type checking
```

## Project Structure

```text
connect-main/
├── src/
│   ├── components/        # UI components (ChatPane, Sidebar, Modals, etc.)
│   ├── context/           # React Context (ConnectContext - state management)
│   ├── data/              # Seed data (users, channels, messages, stickers)
│   ├── pages/             # Route pages (ChannelPage, NotesPage, etc.)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions (socket, api helpers, etc.)
│   ├── App.tsx            # Main app with routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── server/               # Backend source (to be implemented)
│   ├── config/           # DB, Redis, Supabase config
│   ├── controllers/      # REST API controllers
│   ├── middlewares/      # Auth, error handling, validation
│   ├── models/           # Database schema & types
│   ├── routes/           # API routes
│   ├── sockets/          # Socket.io event handlers
│   └── utils/            # Backend utilities
├── public/               # Static assets
├── dist/                 # Build output (after build)
├── server.js             # Express + Socket.io server entry (current base)
└── README.md             # This file
```

## Implementation Roadmap

1. **Phase 1: Backend Foundation** - Set up Express + Socket.io server with Redis and Supabase connections
2. **Phase 2: Authentication** - JWT/Supabase Auth integration with protected routes
3. **Phase 3: Real-Time Engine** - Implement Socket.io events for messaging, typing, presence
4. **Phase 4: Database Schema** - Design PostgreSQL tables for users, channels, messages with JSONB
5. **Phase 5: Fast-Sync Logic** - Implement optimistic UI, ACK receipts, delta sync on reconnect
6. **Phase 6: File Storage** - Supabase Storage integration for media uploads
7. **Phase 7: Final Integration & Testing** - End-to-end testing and optimization


