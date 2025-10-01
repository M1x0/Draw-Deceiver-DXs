# Overview

This is a real-time multiplayer drawing and guessing game built with a React frontend and Express/WebSocket backend. Players create or join game rooms where they take turns drawing words while others try to guess them. The game features **15 unique game modes** with distinct mechanics, customizable settings, and real-time synchronization across all players.

The application uses a full-stack TypeScript architecture with Vite for development, WebSocket for real-time communication, and shadcn/ui components for the interface. Game state is managed in-memory on the server, with no persistent database required.

## Game Modes (15 Total)

**Standard Modes:**
1. **classic_deceiver** - 1 target + deceivers gameplay
2. **double_deceiver** - 2 targets + deceivers

**Drawing Phase Modes (9):**
3. **tool_lockout** - Random tools disabled (server disables 1-2 tools)
4. **camouflage_palette** - Limited to 3-4 similar colors
5. **fog_of_war** - Limited visibility (100px radius around cursor)
6. **stencil_zones** - Draw only in 3-4 specific zones
7. **mirror_mayhem** - Drawing is mirrored horizontally
8. **echo_brush** - Strokes duplicate with 500ms delay
9. **eraser_roulette** - Eraser randomly activates (15% chance/2s)
10. **time_bomb** - Canvas clears randomly every 5-15 seconds
11. **shadow_lines** - See other players' strokes with 25% opacity

**Special Flow Modes (2):**
12. **relay_draw** - Players take turns drawing in sequence
13. **ping_pong_guess** - Alternates drawing/guessing 4 times per round

**Guessing Phase Modes (2):**
14. **whisper_hints** - Display 2-3 cryptic hints during guessing
15. **sudden_death** - Wrong guesses eliminate players from round

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter for lightweight client-side routing (/, /game, /404)
- **State Management**: React Query (@tanstack/react-query) for async state with custom query client configuration
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **Styling**: Tailwind CSS with custom design tokens, CSS variables for theming, and "new-york" style variant
- **Real-time Communication**: Custom WebSocket client wrapper (`GameWebSocket` class) with reconnection logic and event-based messaging

**Key Design Decisions**:
- Component-based architecture with clear separation between game phases (lobby, drawing, guessing, results)
- Canvas rendering handled via native Canvas API with custom utilities for stroke drawing and history management
- Form handling with React Hook Form and Zod validation via @hookform/resolvers
- Toast notifications for user feedback using custom hook pattern

## Backend Architecture

**Server**: Express.js with WebSocket server on the `/ws` path
- **Real-time Protocol**: WebSocket (ws library) with heartbeat mechanism for connection health monitoring
- **Game State Management**: In-memory game manager singleton (`GameManager` class) maintaining all room and player state
- **Session Management**: WebSocket connections mapped to player IDs with automatic cleanup on disconnect
- **Message Validation**: Zod schemas for type-safe WebSocket message parsing

**Core Components**:
1. **GameManager**: Central orchestrator managing rooms, players, rounds, and game flow
   - Room lifecycle (create, join, start, end)
   - Player management with avatar generation and scoring
   - Round progression and phase transitions
   - Chat message handling per room
   
2. **Word Database**: Static word pairs with difficulty-tiered decoys for the guessing mechanic
   - Categorized by type (animals, objects, food, actions, places, abstract)
   - Multi-language support structure (currently English)
   - Random word selection with configurable difficulty

3. **Game Flow**: Phase-based state machine
   - Lobby → Drawing → Guessing → Results → Round End
   - Role assignment (target drawer vs. deceivers)
   - Scoring system with point awards for correct guesses

**Design Rationale**:
- In-memory storage chosen for simplicity since game sessions are ephemeral and don't require persistence
- WebSocket over HTTP polling for low-latency real-time updates crucial for drawing synchronization
- Centralized GameManager pattern ensures consistent game state across all connected clients
- Message-based architecture with typed schemas prevents runtime errors from malformed client data

## Build and Development

**Development**: 
- Vite dev server with HMR and custom middleware mode
- TSX for TypeScript execution without compilation step
- Server-side rendering of index.html template in development

**Production Build**:
- Vite bundles frontend to `dist/public`
- esbuild bundles server to `dist/index.js` with ESM format
- Static file serving of built assets

**Configuration**:
- TypeScript with strict mode and path aliases (@/, @shared/, @assets/)
- ESBuild for fast server bundling with external packages
- PostCSS with Tailwind and Autoprefixer

## External Dependencies

**Database**: 
- Drizzle ORM configured for PostgreSQL via @neondatabase/serverless
- Database migrations in `./migrations` directory
- Schema defined in `shared/schema.ts`
- **Note**: Currently, the game uses in-memory storage and doesn't actively use the database, but the infrastructure is configured for future persistence needs

**Third-Party Services**:
- Neon Database (serverless Postgres) - configured but not actively used
- WebSocket server runs on same host as Express server

**Key Libraries**:
- **UI**: Radix UI primitives, class-variance-authority for variant management
- **Forms**: React Hook Form with Zod resolvers
- **Utilities**: nanoid for ID generation, date-fns for date handling
- **Drawing**: Native HTML5 Canvas API
- **Real-time**: ws (WebSocket) library with custom client wrapper

**Development Tools**:
- Replit-specific plugins for cartographer, dev banner, and runtime error overlay
- Vite plugin ecosystem for React and development experience