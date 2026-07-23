# Frontend Development Guide

Welcome to the **JARVIS-X** Frontend Development Guide. JARVIS-X is an enterprise-grade, Iron Man-inspired AI Operating System designed to deliver real-time multi-modal intelligence, voice interface control, computer vision perception, autonomous task execution, and ambient desktop overlay functionality.

This document serves as the authoritative, implementation-ready architectural reference and code standard for building, scaling, and maintaining the frontend user interface layer of JARVIS-X.

---

## 1. Purpose

The frontend of JARVIS-X is the primary interaction interface between the user and the multi-modal AI Operating System. Its core responsibilities within the system architecture include:

- **Ambient Desktop Overlay & HUD**: Rendering a translucent, glassmorphic heads-up display (HUD) that floats seamlessly over the host operating system.
- **Real-Time Visual Telemetry**: Displaying live audio spectrum visualizers, system resource monitors (CPU/GPU/RAM), vision perception bounding boxes, and active background task pipelines.
- **Multi-Modal User Interaction**: Providing low-latency feedback for voice activation, text input, spatial gesture tracking, and shortcut controls.
- **Subsystem Orchestration View**: Exposing intuitive control panels for managing memory contexts (RAG), AI model selection, plugin integrations, and automated workflows.

---

## 2. Frontend Vision

The frontend design vision for JARVIS-X combines high-tech futuristic aesthetics inspired by Iron Man's JARVIS with the refined simplicity of modern premium software (such as macOS, visionOS, Linear, and Raycast).

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │  JARVIS-X AMBIENT OVERLAY HUD                                  [─][□][✕] │
 ├─────────────────────────────────────────────────────────────────────────┤
 │  ┌───────────────────────┐  ┌────────────────────────────────────────┐  │
 │  │ VOICE SPECTRUM        │  │ SYSTEM TELEMETRY                       │  │
 │  │ ░▒▓█▓▒░▒▓█ 120Hz      │  │ CPU: 14%  | GPU: 22%  | RAM: 8.4GB     │  │
 │  └───────────────────────┘  └────────────────────────────────────────┘  │
 │                                                                         │
 │  ┌───────────────────────────────────────────────────────────────────┐  │
 │  │ "Jarvis, summarize the latest build performance metrics."         │  │
 │  └───────────────────────────────────────────────────────────────────┘  │
 │                                                                         │
 │  ┌───────────────────────┐  ┌────────────────────────────────────────┐  │
 │  │ VISION STREAM OVERLAY │  │ STREAMING AI RESPONSE (Ollama / Llama) │  │
 │  │ [Face Identified: 99%]│  │ "Build completed in 4.2s. Zero errors  │  │
 │  │ [Target: Workstation] │  │ detected across all 11 subservices."   │  │
 │  └───────────────────────┘  └────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────┘
```

### Key Design Pillars

1. **Futuristic Glassmorphism**: Translucent backdrop blurring, subtle neon cyan/gold gradients, thin borders (`border-white/10`), and deep obsidian dark mode surfaces (`#050811`).
2. **Ultra-Low Latency Telemetry**: 60 FPS / 120 FPS audio visualizers and real-time streaming text with zero UI lag or dropped frames.
3. **Desktop-First Ergonomics**: Optimized for frameless Electron overlay windows, global keybindings (e.g., `Option+Space` / `Alt+Space`), and screen-edge docking.
4. **Context-Aware Micro-Interactions**: Dynamic Framer Motion animations that react dynamically to speech activity, AI reasoning state, and vision target detection.

---

## 3. Technology Stack

JARVIS-X leverages a modern, high-performance web and desktop technology stack carefully selected for reactivity, type safety, modularity, and low resource overhead.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND TECH STACK                           │
├─────────────┬──────────────────────────┬────────────────────────────────┤
│ Layer       │ Technology               │ Version & Primary Role         │
├─────────────┼──────────────────────────┼────────────────────────────────┤
│ Framework   │ React                    │ v18.x / v19.x (Declarative UI) │
│ Framework   │ Next.js (App Router)     │ v14.x / v15.x (SSR/SSG & Build)│
│ Language    │ TypeScript               │ v5.x (Strict Type Safety)      │
│ Styling     │ Tailwind CSS             │ v3.4+ / v4.x (Utility CSS)     │
│ Desktop Shell│ Electron                │ v30.x+ (Native Desktop Window) │
│ Motion      │ Framer Motion            │ v11.x (Physics Animations)     │
│ Client State│ Zustand                  │ v4.5+ (Global Store)           │
│ Server State│ React Query (TanStack)   │ v5.x (API Caching & Streaming) │
└─────────────┴──────────────────────────┴────────────────────────────────┘
```

### Technology Rationale

- **React**: Provides declarative, component-driven UI architecture with Concurrent Mode rendering for real-time telemetry updates without blocking the main UI thread.
- **Next.js (App Router)**: Serves as the web framework and build engine, offering route optimization, fast static export capabilities for Electron, and server-side utilities.
- **TypeScript**: Guarantees end-to-end type safety across IPC payload contracts, WebSocket frames, REST DTOs, and component props.
- **Tailwind CSS**: Enables rapid inline utility styling, customizable design tokens (HSL colors, glass utilities), and minimal runtime CSS footprint.
- **Electron**: Wraps the Next.js frontend into a native cross-platform desktop application with frameless glass windows, system tray controls, and hardware access.
- **Framer Motion**: Powers smooth, spring-physics-based animations for audio waveforms, modal overlays, HUD panel toggles, and reactive feedback states.
- **Zustand**: Lightweight (1KB), hook-based global state manager that avoids unnecessary re-renders through atomic state selectors and slice patterns.
- **React Query (TanStack Query)**: Manages asynchronous server state, automated API polling, query caching, optimistic UI updates, and WebSocket re-connection states.

---

## 4. Frontend Architecture

The frontend application operates as a reactive hub communicating with local microservices and native desktop APIs.

```
                                  ┌───────────────────────────┐
                                  │      ELECTRON SHELL       │
                                  │  (Native Desktop Window)  │
                                  └─────────────┬─────────────┘
                                                │ (IPC Bridge)
┌───────────────────────────────────────────────▼───────────────────────────────────────────────┐
│                                   FRONTEND CORE APPLICATION                                   │
│                                                                                               │
│  ┌───────────────────────┐   ┌────────────────────────┐   ┌────────────────────────────────┐  │
│  │   ZUSTAND STATE STORE │◄──┤  REACT QUERY CACHE LAYER│◄──┤  WEBSOCKET & REST SERVICE IPC  │  │
│  └───────────┬───────────┘   └───────────┬────────────┘   └───────────────▲────────────────┘  │
│              │                           │                                │                   │
│  ┌───────────▼───────────────────────────▼────────────┐                   │                   │
│  │               REACT UI COMPONENT TREE               │                   │                   │
│  │  (HUD Overlay | Audio Spectrum | Vision | Chat Stream)  │                   │                   │
│  └────────────────────────────────────────────────────┘                   │                   │
└───────────────────────────────────────────────┬───────────────────────────┼───────────────────┘
                                                │                           │
                   ┌────────────────────────────┼───────────────────────────┼───────────────────┐
                   │                            │                           │                   │
        ┌──────────▼──────────┐      ┌──────────▼──────────┐     ┌──────────┴──────────┐        │
        │   02_Backend API    │      │    03_AI Engine     │     │   08_Desktop IPC    │        │
        │  (FastAPI / Node)   │      │ (LLM / Voice/Vision)│     │  (OS Hotkeys / Cam) │        │
        └─────────────────────┘      └─────────────────────┘     └─────────────────────┘        │
```

### Subsystem Interaction Mechanics

1. **Backend Integration**: Communicates via WebSockets (`/ws/telemetry`) for streaming system telemetry (CPU, GPU, RAM, network) and REST APIs (`/api/v1/system`) for configuration and management.
2. **AI Engine Integration**: Receives SSE (Server-Sent Events) or WebSocket streaming tokens from local LLMs (Ollama / PyTorch) and renders incremental text with token-level highlighting.
3. **Memory Engine (RAG)**: Queries vector search contexts (`/api/v1/memory/search`) and displays citation cards, document fragments, and relevance confidence scores.
4. **Plugin Architecture**: Dynamically loads plugin widgets and action buttons registered via the plugin registry (`Development/06_Plugins/`).
5. **Automation Engine**: Connects to background workflow execution queues (`/api/v1/automation/jobs`), displaying live job progress bars and execution logs.
6. **Voice System**: Ingests raw Web Audio API microphone streams, calculates real-time FFT frequency spectrums for visualizers, and renders live speech-to-text transcriptions.
7. **Vision System**: Renders live WebRTC or IPC video streams from local cameras with SVG canvas overlays for object detection bounding boxes and facial recognition targets.

---

## 5. Folder Structure

The frontend project directory follows a scalable, modular architecture structured for Next.js App Router and Electron integration.

```
Development/01_Frontend/
├── app/                        # Next.js App Router pages, layouts, and API routes
│   ├── (dashboard)/            # Main full-screen desktop dashboard route group
│   │   ├── analytics/          # System telemetry & performance analytics page
│   │   ├── memory/             # RAG memory vault & document inspector page
│   │   ├── plugins/            # Plugin manager & skill configuration page
│   │   ├── settings/           # System preferences & API keys page
│   │   ├── page.tsx            # Dashboard home view
│   │   └── layout.tsx          # Main dashboard shell layout (Sidebar + Header)
│   ├── (overlay)/              # Frameless ambient HUD overlay route group
│   │   ├── hud/                # Minimal floating HUD overlay view
│   │   └── layout.tsx          # Transparent window shell layout
│   ├── api/                    # Next.js API proxy routes
│   ├── favicon.ico             # App icon asset
│   ├── globals.css             # Global Tailwind directives & custom CSS tokens
│   └── layout.tsx              # Root HTML/Body wrapper layout
├── components/                 # Atomic UI Component Hierarchy
│   ├── ui/                     # Primitives (Button, Card, Input, Modal, Badge, Tooltip)
│   ├── visualizers/            # Audio spectrum, particle sphere, visual telemetry canvas
│   ├── vision/                 # Camera canvas, bounding box overlay, face tracking HUD
│   ├── chat/                   # Streaming message bubble, prompt box, token inspector
│   ├── memory/                 # Vector search result cards, knowledge graph nodes
│   ├── automation/             # Workflow node graph, job execution status items
│   ├── telemetry/              # Resource usage gauges, CPU/GPU sparkline charts
│   └── shared/                 # Glassmorphic containers, status indicator dots
├── layouts/                    # Application shell layouts
│   ├── Header.tsx              # System header bar with clock, network status, OS controls
│   ├── Sidebar.tsx             # Collapsible navigation rail with glowing indicator tabs
│   └── HUDOverlayLayout.tsx    # Frameless transparent overlay wrapper
├── hooks/                      # Custom React Hooks
│   ├── useAudioSpectrum.ts     # Web Audio API FFT analyzer & frequency array hook
│   ├── useStreamingLLM.ts      # SSE token stream consumption & buffer management hook
│   ├── useElectronIPC.ts       # Type-safe Electron main/renderer IPC communication hook
│   ├── useTelemetry.ts         # System metrics polling & WebSocket hook
│   └── useKeyboardShortcuts.ts # Global desktop keybinding listener hook
├── services/                   # Service Layer & API Clients
│   ├── api.client.ts           # Axios / Fetch HTTP client instance with interceptors
│   ├── websocket.service.ts    # Reconnecting WebSocket client manager
│   └── electron.service.ts     # Electron IPC bridge wrapper
├── lib/                        # Third-Party Utility Initializations
│   ├── query-client.ts         # React Query Client singleton instance
│   ├── utils.ts                # Classnames joiner (`clsx` + `tailwind-merge`)
│   └── constants.ts            # Application constants, ports, default endpoints
├── utils/                      # Pure Helper Functions
│   ├── audio-math.ts           # Decibel calculation & FFT smoothing algorithms
│   ├── formatters.ts           # Byte size, timestamp, latency & token count formatters
│   └── validators.ts           # Zod schema validators for API responses
├── store/                      # Zustand Global State Stores
│   ├── useUIStore.ts           # UI state (active tab, sidebar state, HUD visibility)
│   ├── useVoiceStore.ts        # Voice state (recording state, transcript, volume)
│   ├── useVisionStore.ts       # Vision state (camera active, detected objects array)
│   ├── useAIStore.ts           # AI model state (selected model, active prompt, token stream)
│   └── useSettingsStore.ts     # User preferences, theme, local endpoints configuration
├── styles/                     # Design Tokens & Theme Styles
│   ├── glassmorphism.css       # Backdrop blur & glowing neon utility classes
│   └── variables.css           # CSS custom properties (color tokens, font stacks)
├── assets/                     # Static Graphic & Audio Assets
│   ├── icons/                  # Custom SVG icons
│   ├── sounds/                 # JARVIS feedback sound effects (wav/mp3)
│   └── images/                 # HUD background textures & logo marks
├── animations/                 # Framer Motion Animation Variants
│   ├── HUDVariants.ts          # HUD fade-in, scale, and holographic reveal motion configs
│   └── SpringConfigs.ts        # Reusable physics spring parameters (stiffness, damping)
└── types/                      # TypeScript Global Declarations
    ├── ipc.d.ts                # Electron IPC channels & payload interfaces
    ├── api.d.ts                # REST & WebSocket API response type definitions
    ├── telemetry.d.ts          # System resource telemetry data structures
    └── voice.d.ts              # Audio frame & speech transcript types
```

---

## 6. Component Design

JARVIS-X strictly enforces the **Atomic Design Methodology** adapted for complex desktop software interfaces.

```
       ┌────────────────────────────────────────────────────────┐
       │                        PAGES                           │
       │           (Full Views e.g. AnalyticsPage)              │
       ├────────────────────────────────────────────────────────┤
       │                      TEMPLATES                         │
       │         (Page Shells e.g. DashboardLayout)             │
       ├────────────────────────────────────────────────────────┤
       │                      ORGANISMS                         │
       │       (Complex Features e.g. AudioVisualizerHUD)       │
       ├────────────────────────────────────────────────────────┤
       │                      MOLECULES                         │
       │        (Composite Elements e.g. StatCard, Search)      │
       ├────────────────────────────────────────────────────────┤
       │                        ATOMS                           │
       │          (Primitives e.g. Button, Badge, Glow)         │
       └────────────────────────────────────────────────────────┘
```

### Component Categories

1. **Atoms (`components/ui/`)**: Basic immutable UI building blocks.
   - Example: `GlowButton.tsx`, `StatusBadge.tsx`, `GlassInput.tsx`.
   - *Rule*: Must be purely presentational, stateless (or local UI state only), and accept standard React HTML props.

2. **Molecules (`components/shared/`, `components/telemetry/`)**: Combinations of two or more atoms working together.
   - Example: `MetricStatCard.tsx` (Badge + Label + Value + Sparkline), `VoiceSearchInput.tsx`.
   - *Rule*: Handles minor layout composition without direct global state dependencies.

3. **Organisms (`components/visualizers/`, `components/chat/`, `components/vision/`)**: Standalone, feature-complete UI sections containing complex logic.
   - Example: `AudioSpectrumVisualizer.tsx`, `StreamingChatFeed.tsx`, `CameraTargetOverlay.tsx`.
   - *Rule*: Subscribes to Zustand store slices and React Query hooks to render real-time state.

4. **Layout Components (`layouts/`)**: Frame structure for pages and overlay windows.
   - Example: `Header.tsx`, `Sidebar.tsx`, `HUDOverlayLayout.tsx`.
   - *Rule*: Controls grid positioning, responsive breakpoints, and overall viewport bounds.

5. **Feature Components**: Domain-specific UI blocks (e.g., `AutomationGraph.tsx` in `components/automation/`).

---

## 7. Routing Strategy

JARVIS-X uses Next.js **App Router** for layout-driven, performant navigation.

### 7.1 Route Architecture

| Route Path | Route Group | Description | Access / Shell |
| :--- | :--- | :--- | :--- |
| `/` | `(dashboard)` | Main JARVIS-X Command Center Dashboard | Full Dashboard Shell |
| `/analytics` | `(dashboard)` | Real-time system telemetry & hardware analytics | Full Dashboard Shell |
| `/memory` | `(dashboard)` | Vector RAG memory search & knowledge vault | Full Dashboard Shell |
| `/plugins` | `(dashboard)` | Plugin marketplace & active skill manager | Full Dashboard Shell |
| `/settings` | `(dashboard)` | Global preferences, API keys & endpoint config | Full Dashboard Shell |
| `/hud` | `(overlay)` | Translucent frameless overlay for Electron HUD mode | Frameless Overlay Shell |

---

### 7.2 Code Splitting & Dynamic Imports

All heavy UI modules (such as WebGL audio visualizers, Canvas video stream processors, and interactive graph nodes) must be lazy-loaded using `next/dynamic` to minimize initial bundle size and startup latency:

```tsx
import dynamic from 'next/dynamic';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

// Dynamic import with SSR disabled for Electron-only Canvas visualizers
export const AudioSpectrumVisualizer = dynamic(
  () => import('@/components/visualizers/AudioSpectrumVisualizer'),
  {
    loading: () => <SkeletonLoader className="h-48 w-full rounded-xl" />,
    ssr: false,
  }
);
```

---

## 8. State Management

JARVIS-X uses a hybrid state management approach tailored for high-frequency real-time updates.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       STATE MANAGEMENT MATRIX                           │
├─────────────────┬───────────────────────┬───────────────────────────────┤
│ State Type      │ Tool / Technology     │ Use Case Example              │
├─────────────────┼───────────────────────┼───────────────────────────────┤
│ Global UI State │ Zustand               │ Active tab, HUD visibility,   │
│                 │                       │ active drawer, theme mode     │
│ Real-Time Stream│ Zustand (No-persist)  │ Audio FFT spectrum data,      │
│                 │                       │ live LLM streaming tokens     │
│ Server API State│ React Query           │ REST responses, settings data,│
│                 │                       │ memory search results         │
│ Form/Local State│ React `useState`      │ Modal open state, input values│
│ Device Hardware │ Electron IPC / Hooks  │ Camera status, OS battery info│
└─────────────────┴───────────────────────┴───────────────────────────────┘
```

### 8.1 Zustand Architecture & Slice Pattern

Global client state is divided into focused, modular Zustand slices:

```typescript
// store/useVoiceStore.ts
import { create } from 'zustand';

interface VoiceState {
  isListening: boolean;
  transcript: string;
  volumeLevel: number;
  speechEngine: 'whisper' | 'vosk';
  setIsListening: (listening: boolean) => void;
  setTranscript: (text: string) => void;
  setVolumeLevel: (level: number) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  isListening: false,
  transcript: '',
  volumeLevel: 0,
  speechEngine: 'whisper',
  setIsListening: (listening) => set({ isListening: listening }),
  setTranscript: (text) => set({ transcript: text }),
  setVolumeLevel: (level) => set({ volumeLevel: level }),
}));
```

> [!TIP]
> **Performance Rule**: Always use narrow atomic selectors when subscribing to Zustand stores to prevent unnecessary component re-renders during high-frequency audio or token updates:
> ```tsx
> // Correct: Only re-renders when isListening changes
> const isListening = useVoiceStore((state) => state.isListening);
> ```

---

## 9. Styling System

The styling engine is powered by **Tailwind CSS** augmented with custom HSL design tokens and specialized glassmorphic utilities.

### 9.1 Core Color Palette & Design Tokens

```
                    JARVIS-X COLOR PALETTE & DESIGN TOKENS
                    
┌───────────────────────┬─────────────┬─────────────────────────────────┐
│ Token Name            │ Hex Code    │ UI Application                  │
├───────────────────────┼─────────────┼─────────────────────────────────┤
│ `--jarvis-cyan`       │ `#00F0FF`   │ Primary active glow, HUD links  │
│ `--jarvis-blue`       │ `#0072FF`   │ Secondary gradient & accents    │
│ `--jarvis-obsidian`   │ `#050811`   │ Dark background surface         │
│ `--jarvis-card-bg`    │ `#0B132B`   │ Glass card surface overlay      │
│ `--jarvis-amber`      │ `#FFB800`   │ Warning state & alert glow      │
│ `--jarvis-crimson`    │ `#FF2A6D`   │ Error state & critical alerts   │
│ `--jarvis-emerald`    │ `#05FFA1`   │ Success state & system online   │
└───────────────────────┴─────────────┴─────────────────────────────────┘
```

---

### 9.2 Custom Glassmorphism Utilities

Defined inside `styles/glassmorphism.css`:

```css
@layer utilities {
  /* Translucent Futuristic Glass Container */
  .jarvis-glass-card {
    background: rgba(11, 19, 43, 0.55);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }

  /* Glowing Holographic Border Accent */
  .jarvis-glow-cyan {
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.35),
                inset 0 0 15px rgba(0, 240, 255, 0.15);
    border-color: rgba(0, 240, 255, 0.5);
  }
}
```

---

## 10. Performance Optimization

To ensure real-time telemetry rendering without blocking the UI thread, the frontend adheres to strict performance guidelines:

1. **60 FPS Audio Visualizers**: Audio spectrum canvas renderings must utilize `requestAnimationFrame()` and offscreen canvas buffers. Avoid React state mutations inside the 60 FPS animation loop.
2. **Component Memoization**: Wrap heavy list items and complex SVG graphics in `React.memo()` with custom comparison functions.
3. **Event Throttling & Debouncing**: Throttle high-frequency resize and mousemove listeners using `lodash-es/throttle` (e.g., 50ms interval).
4. **DOM Mutation Avoidance**: Canvas particle effects and video bounding box overlays must mutate Canvas context directly rather than generating DOM elements.

---

## 11. Accessibility (a11y)

JARVIS-X maintains high accessibility standards across both desktop and web execution modes:

- **Keyboard Navigation**: Full keyboard navigation support (`Tab`, `Shift+Tab`, `Arrow` keys). Global shortcut overlay accessible via `?` or `Cmd+/`.
- **Focus Management**: High-visibility focus indicators (`ring-2 ring-jarvis-cyan`) on all interactive buttons, inputs, and tab elements.
- **Screen Reader Support**: Use standard ARIA roles (`role="status"`, `role="log"`, `aria-live="polite"`) for live speech-to-text transcripts and system alert broadcasts.
- **Color Contrast**: All primary text elements maintain a minimum contrast ratio of **7:1** against the `#050811` background, satisfying WCAG AAA standards.

---

## 12. Error Handling

```
                              ┌────────────────────────┐
                              │  REACT COMPONENT TREE  │
                              └───────────┬────────────┘
                                          │ (Throws Error)
                              ┌───────────▼────────────┐
                              │ REACT ERROR BOUNDARY   │
                              └───────────┬────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  │                                               │
      ┌───────────▼───────────┐                       ┌───────────▼───────────┐
      │  RENDER FALLBACK UI   │                       │ LOG TO SYSTEM BACKEND │
      │ ("JARVIS Subsystem    │                       │  (POST /api/v1/logs)  │
      │   Recovery Mode")     │                       └───────────────────────┘
      └───────────────────────┘
```

1. **Error Boundaries**: Every major page and standalone widget is wrapped in a React Error Boundary (`components/ui/ErrorBoundary.tsx`) to prevent full app crashes if a single widget fails.
2. **Graceful Degradation**: If WebGL or local GPU acceleration is unavailable, the audio visualizer automatically falls back to an optimized 2D Canvas or SVG CSS bar graph.
3. **Automated Re-connection**: WebSockets feature exponential backoff retry algorithms (retrying at 1s, 2s, 4s, 8s intervals up to 30s max).

---

## 13. Frontend Testing

The testing suite ensures quality across all levels of the frontend application:

| Test Level | Tool | Target Scope | Execution Command |
| :--- | :--- | :--- | :--- |
| **Unit Testing** | Vitest | Helper functions, formatters, audio math | `pnpm run test:unit` |
| **Component Testing** | React Testing Library | UI primitives, buttons, modals, forms | `pnpm run test:components` |
| **Snapshot Testing** | Storybook / Vitest | UI component visual regression check | `pnpm run test:snapshot` |
| **End-to-End Testing** | Playwright | Full user flows & Electron IPC overlay | `pnpm run test:e2e` |

---

## 14. Coding Standards

### 14.1 Naming Conventions

- **Folders**: Lowercase with hyphens or camelCase (`components/visualizers`, `app/(dashboard)`).
- **Component Files**: PascalCase ending in `.tsx` (e.g., `AudioSpectrumVisualizer.tsx`).
- **Hook Files**: CamelCase starting with `use` ending in `.ts` (e.g., `useAudioSpectrum.ts`).
- **Service Files**: Dot notation ending in `.service.ts` (e.g., `websocket.service.ts`).
- **Type Files**: Dot notation ending in `.d.ts` or `.types.ts` (e.g., `telemetry.types.ts`).

---

### 14.2 Code Formatting & Documentation

- **Prettier Config**: Single quotes, 2 spaces indentation, trailing commas (`es5`), print width 100.
- **JSDoc Requirement**: All custom hooks, complex utility functions, and exported service methods must include JSDoc comments:

```typescript
/**
 * Processes incoming Web Audio API frequency data and returns smoothed decibel values.
 *
 * @param frequencyData - Uint8Array raw FFT frequency bin data.
 * @param smoothingFactor - Factor between 0.0 and 1.0 for exponential moving average.
 * @returns Normalized float array with values between 0.0 and 1.0.
 */
export function calculateSmoothedSpectrum(
  frequencyData: Uint8Array,
  smoothingFactor: number = 0.8
): Float32Array {
  // Implementation...
}
```

---

## 15. Best Practices

1. **Decouple UI from Network Contracts**: Always map raw backend DTOs to clean internal TypeScript interfaces inside service adapters.
2. **Keep Stores Atomic**: Avoid bloated single-file state stores. Divide stores by domain responsibility (`voice`, `vision`, `ai`, `ui`).
3. **Clean Up Effects**: Always return clean-up functions in `useEffect` for audio stream listeners, WebSockets, animation frames, and timer intervals.
4. **Zero Inline Styles**: Use Tailwind classes or custom CSS utility classes. Avoid hardcoded inline style objects (`style={{ margin: 10 }}`).

---

## 16. Acceptance Criteria

Frontend development work is considered complete and ready for pull request merge when:

- [ ] **Type Safety Verified**: `pnpm run typecheck` passes cleanly with zero TypeScript errors under strict mode.
- [ ] **Linting & Formatting**: `pnpm run lint` and `pnpm run format` pass with zero warnings or errors.
- [ ] **Performance Audit**: Canvas audio visualizers render at steady **60 FPS** without dropping frames during LLM token streaming.
- [ ] **Accessibility Compliance**: Keyboard navigation operates without focus traps; screen reader live regions trigger properly for voice output.
- [ ] **Test Suite Passing**: Unit and component test suites achieve minimum **80% line coverage**.
- [ ] **Electron Compatibility**: Tested and verified inside both standard browser and frameless Electron desktop window overlay modes.

---

## 17. Conclusion

Following this Frontend Development Guide guarantees that the JARVIS-X interface remains responsive, visually stunning, modular, and maintainable. By standardizing component design, state architecture, styling tokens, and performance optimizations, frontend contributors can deliver a world-class AI Operating System user experience.
