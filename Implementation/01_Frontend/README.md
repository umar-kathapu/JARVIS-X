# 01_Frontend

## Purpose
The `01_Frontend` folder contains the user interface application for JARVIS-X. Built with React 18/19, Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion, it renders a high-performance desktop HUD dashboard, real-time 60 FPS audio visualizers, computer vision overlays, system telemetry gauges, and interactive control panels.

---

## Responsibilities
- **Ambient HUD Overlay**: Rendering translucent glassmorphic components (`#050811` background, `#00F0FF` neon accents, `backdrop-blur`).
- **Real-Time Visual Telemetry**: Rendering 60 FPS WebGL/Canvas audio spectrum visualizers, CPU/GPU sparkline charts, and camera bounding boxes.
- **Streaming Chat Feed**: Displaying incremental token-by-token LLM streaming text responses.
- **Client State Management**: Managing UI preferences, active drawers, and real-time state using atomic Zustand stores.
- **API Caching**: Handling asynchronous server state polling and caching via React Query (TanStack Query).

---

## Files Created in this Folder
- `app/`: Next.js App Router pages (`(dashboard)`, `(overlay)`, `settings`, `analytics`).
- `components/ui/`: Atomic UI primitives (Buttons, Cards, Modals, Badges, Inputs).
- `components/visualizers/`: Canvas & WebGL audio frequency spectrum visualizers.
- `components/vision/`: Camera video stream overlay with object detection bounding boxes.
- `hooks/`: Custom React hooks (`useAudioSpectrum`, `useStreamingLLM`, `useElectronIPC`).
- `store/`: Zustand global state stores (`useUIStore`, `useVoiceStore`, `useAIStore`).
- `styles/`: Tailwind CSS directives and custom glassmorphism utility classes.

---

## Development Workflow
1. Navigate to `Implementation/01_Frontend/`.
2. Run `pnpm dev` to launch the Next.js development server at `http://localhost:3000`.
3. Run `pnpm run lint` and `pnpm run typecheck` to verify code quality.
4. Execute `pnpm run test:components` to run Vitest component test suites.

---

## System Integration
The frontend connects directly to `02_Backend` via REST endpoints (`/api/v1/`) and WebSockets (`/ws/telemetry`), subscribes to `04_AI` streaming LLM tokens, displays `03_Database` memory search results, renders `06_Plugins` skill widgets, and runs inside the native `08_Desktop` Electron window wrapper.
