# JARVIS-X UI System Specification

**Document Version:** 1.0.0-draft  
**Last Updated:** 2026-07-23  
**Status:** Active Draft  
**Target System:** JARVIS-X Desktop Shell & Overlay Applications  

---

## 1. Purpose
The purpose of the JARVIS-X User Interface (UI) System Specification is to establish an unyielding foundation for all visual, spatial, interactive, and motion elements across the JARVIS-X platform. As an AI-first Operating System inspired by the seamless intelligence and visual sophistication of Iron Man's JARVIS, the interface must bridge high-density system metrics, multi-modal voice/vision feeds, and complex agent reasoning loops with absolute clarity.

A unified design language ensures:
*   **Predictable Interaction Models:** Eliminates cognitive overhead when switching between terminal execution, voice HUD overlays, and workspace views.
*   **Architectural Scalability:** Enables rapid onboarding of third-party plugins and new system modules without design fragmentation.
*   **Visual Distinction:** Delivers a premium, state-of-the-art futuristic aesthetic that wows users on first launch while maintaining professional utility.

---

## 2. UI Design Philosophy
JARVIS-X follows an **Intent-Driven, Ambient Intelligence** design philosophy anchored in ten core pillars:

1.  **Modern:** Rejects legacy desktop paradigms in favor of fluid, borderless surfaces, high-fidelity micro-interactions, and real-time state visualizers.
2.  **Minimal:** Prioritizes content and agent outputs. Controls remain hidden or ambient until contextually relevant.
3.  **Premium:** Employs vibrant dark-mode surfaces, sleek geometric ratios, refined typography, and subtle metallic/glowing accents.
4.  **Glassmorphism:** Leverages multi-layered translucent planes (`backdrop-filter: blur()`), subtle border highlights, and elevation shadows to represent depth and context hierarchy.
5.  **AI-First Experience:** Design elements adapt dynamically based on model confidence, active agent planning states, and real-time sensory inputs (voice waveforms, screen vision indicators).
6.  **Smooth Animations:** Motion is purposeful, communicative, and physics-inspired (cubic-bezier easing), ensuring transitions explain spatial relationships.
7.  **Accessibility:** Combines futuristic visuals with strict WCAG 2.1 AA compliance, robust high-contrast tokens, keyboard-first navigation, and screen reader support.
8.  **Productivity-Focused:** Optimized for ultra-low interaction latency, global command palette workflows, keyboard shortcuts, and minimal click depth.
9.  **Responsive:** Adapts fluidly across screen densities, multi-monitor setups, floating overlay sizes, and responsive window viewports.
10. **Scalable:** Built upon strict CSS token systems, component contracts, and modular atomic design primitives.

---

## 3. Design Goals
*   **Simplicity:** Reduce complex system states (agent planning, vector search, tool sandboxing) into clear, consumable visual cards.
*   **Consistency:** Maintain unified spacing, typography, colors, and motion physics across all windows, HUD overlays, and notification toasts.
*   **Speed:** Ensure UI interactions respond within <16ms (60 FPS) with instant feedback for hotkeys and voice inputs.
*   **Visual Hierarchy:** Use depth, weight, scale, and subtle glows to guide user attention to critical actions and system notifications.
*   **User Focus:** Keep the active workspace free from visual clutter; ambient telemetry remains peripheral until activated.
*   **Low Cognitive Load:** Present complex agent reasoning paths as structured, collapsible execution cards rather than raw log dumps.

---

## 4. Overall UI Architecture
The UI is organized as a unified single-page container operating within the desktop shell, structured into distinct functional boundaries:

```
+-----------------------------------------------------------------------------------+
| APPLICATION SHELL                                                                 |
| +-------------------------------------------------------------------------------+ |
| | GLOBAL HEADER / SYSTEM TRAY                                                    | |
| +-------------------+-----------------------------------+-----------------------+ |
| | SIDEBAR           | MAIN WORKSPACE                    | RIGHT CONTEXT PANEL   | |
| | - Nav Items       | - Active Tool / Page              | - Agent Thought Feed  | |
| | - Quick Status    | - AI Workspace Canvas             | - Active Memory Cards | |
| | - Workspace Switch| - Interactive Terminals / Views   | - Sensory Telemetry   | |
| +-------------------+-----------------------------------+-----------------------+ |
| | FOOTER / STATUS BAR                                                           | |
| +-------------------------------------------------------------------------------+ |
| +-------------------------------------------------------------------------------+ |
| | FLOATING OVERLAYS & HUD (Global Command Palette, Voice Waveform, Toast Layer) | |
| +-------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

*   **Application Shell:** Root layout provider controlling theme tokens, global keyboard listeners, and process IPC event bindings.
*   **Navigation System:** Houses primary workspace routes, recents, and command palette triggers.
*   **Pages / Views:** Modular route containers (e.g., Dashboard, Automation Studio, Memory Browser, Security Audit).
*   **Components:** Reusable atomic primitives (Buttons, Inputs, Cards, Badges, Modals).
*   **Dialogs & Modals:** High-priority confirmation layers for sandboxed system permissions and critical user prompts.
*   **Notifications:** Non-disruptive toast layers and HUD alerts.
*   **Widgets:** Embedded real-time telemetry panels (CPU/GPU load, API token usage, VAD audio waveforms).
*   **AI Workspace:** Interactive conversational and agent execution canvas.

---

## 5. Layout Structure

### 5.1 Sidebar (Collapsible Navigation & Status)
*   **Responsibilities:** Main navigation routes, workspace switching, system health indicators (Local vs. Cloud model state), quick settings trigger.
*   **Dimensions:** Expanded width: `260px`, Collapsed width: `68px`.
*   **Behavior:** Smooth width transition with icon-only pinning mode.

### 5.2 Header (Global Control & Search)
*   **Responsibilities:** Active window title/breadcrumb, global command palette search trigger (`Ctrl+K` / `Cmd+K`), active profile indicator, minimize/maximize/close window controls.
*   **Height:** Fixed `52px`.

### 5.3 Main Workspace (Primary Content Canvas)
*   **Responsibilities:** Primary surface for active views, code comparison diffs, execution logs, and interactive AI workspace canvases.
*   **Behavior:** Flexible layout (`flex: 1`), automatically handles scrollable sub-panes without leaking document scroll.

### 5.4 Right Context Panel (Agent Telemetry & Memory)
*   **Responsibilities:** Real-time stream of agent thoughts, active memory retrieval cards, active screen capture previews, and step-by-step tool execution progress.
*   **Width:** Fixed `320px` (Collapsible).

### 5.5 Footer / Status Bar (System Heartbeat)
*   **Responsibilities:** Active model status (e.g., `Gemini 1.5 Pro` / `Gemma 2 Local`), latency counters, IPC connection heartbeat, background task queue indicators.
*   **Height:** Fixed `28px`.

---

## 6. Navigation System
*   **Sidebar Navigation:** Primary route switching with persistent active state indicators and keyboard hotkey numbers (`Alt+1` through `Alt+9`).
*   **Global Command Palette (`Ctrl+K` / `Cmd+K`):** Spotlight-style floating input modal allowing instant command searching, page jumping, tool invocation, and settings access.
*   **Breadcrumbs:** Contextual path indicators displayed in the header (e.g., `Specifications > 03_UI > UI_SYSTEM_SPECIFICATION.md`).
*   **Keyboard Shortcuts:** Global hotkey bindings (`Esc` to dismiss overlays, `Ctrl+/` for shortcut cheat sheet, `Alt+Space` to trigger Voice HUD).

---

## 7. Theme System
JARVIS-X implements a tokenized theme engine based on CSS custom properties.

*   **Dark Theme (Default):** Deep space obsidian backgrounds (`#080B10`), sleek translucent panels (`rgba(15, 23, 42, 0.75)`), cyan/blue neon accents (`#00F0FF`, `#3B82F6`), and high-contrast text.
*   **Light Theme:** Clean high-clarity slate backgrounds (`#F8FAFC`), crisp frosted glass panels (`rgba(255, 255, 255, 0.8)`), deep cobalt accents (`#2563EB`), and rich charcoal text.
*   **System Theme:** Automatically matches the host operating system's light/dark mode preference via `prefers-color-scheme`.
*   **Dynamic Accent Colors:** Accent tokens can dynamically adjust based on agent state:
    *   *Cyan/Blue (`#00F0FF`):* Normal Idle / Information.
    *   *Purple/Violet (`#A855F7`):* AI Reasoning / Complex Planning.
    *   *Emerald (`#10B981`):* Successful Execution / Verification.
    *   *Amber (`#F59E0B`):* Awaiting User Approval / Warning.
    *   *Rose/Red (`#EF4444`):* Permission Denied / Execution Error.

---

## 8. Typography
JARVIS-X employs modern sans-serif typography for UI interfaces (Inter / Outfit) and precision monospace typefaces for code/terminal data (JetBrains Mono / Fira Code).

| Level | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `32px` (`2rem`) | Bold (700) | `1.2` | `-0.02em` | Main HUD Headers, Hero titles |
| **Heading 1** | `24px` (`1.5rem`) | SemiBold (600) | `1.3` | `-0.01em` | Page titles, View section headers |
| **Heading 2** | `20px` (`1.25rem`)| SemiBold (600) | `1.35` | `0em` | Card titles, Modal headers |
| **Heading 3** | `16px` (`1rem`) | Medium (500) | `1.4` | `0em` | Sub-section headers, Widget titles |
| **Body Large**| `15px` (`0.9375rem`)| Regular (400) | `1.5` | `0em` | AI Chat responses, Main body text |
| **Body Regular**|`14px` (`0.875rem`)| Regular (400) | `1.5` | `0em` | Standard labels, Input field text |
| **Caption** | `12px` (`0.75rem`) | Medium (500) | `1.4` | `0.02em` | Timestamp tags, Badges, Status labels |
| **Monospace** | `13px` (`0.8125rem`)| Regular (400) | `1.6` | `0em` | Code blocks, Terminal logs, Command dry-runs |

---

## 9. Color System (Token-Based)
Color values are strictly consumed via CSS Custom Properties. Hardcoded hex/rgb values in components are forbidden.

### 9.1 Base Tokens
```css
:root {
  /* Surface Tokens */
  --bg-app: #080b10;
  --bg-surface-0: rgba(15, 23, 42, 0.6);
  --bg-surface-1: rgba(30, 41, 59, 0.75);
  --bg-surface-2: rgba(51, 65, 85, 0.85);
  --bg-glass: rgba(15, 23, 42, 0.65);

  /* Border Tokens */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.18);
  --border-accent: rgba(0, 240, 255, 0.4);

  /* Text Tokens */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-inverse: #0f172a;

  /* Brand & Accent Tokens */
  --accent-primary: #00f0ff;
  --accent-primary-glow: rgba(0, 240, 255, 0.25);
  --accent-secondary: #3b82f6;
  --accent-purple: #a855f7;

  /* Semantic Feedback Tokens */
  --status-success: #10b981;
  --status-success-bg: rgba(16, 185, 129, 0.15);
  --status-warning: #f59e0b;
  --status-warning-bg: rgba(245, 158, 11, 0.15);
  --status-error: #ef4444;
  --status-error-bg: rgba(239, 68, 68, 0.15);
  --status-info: #06b6d4;
  --status-info-bg: rgba(6, 182, 212, 0.15);

  /* Effects */
  --blur-glass: blur(16px);
  --shadow-glow: 0 0 20px rgba(0, 240, 255, 0.15);
  --shadow-elevation: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
}
```

---

## 10. Iconography
*   **Icon Library:** Lucide Icons (SVG-based, clean vector geometry).
*   **Sizing Standard:** Small: `16px`, Regular: `20px`, Large: `24px`, Hero: `32px`.
*   **Stroke Width:** Fixed at `1.75px` for consistent visual weight.
*   **Color Matching:** Icons inherit text color (`currentColor`) by default or match semantic status tokens.

---

## 11. Component Design Principles

### 11.1 Buttons
*   **Variants:** Primary (Neon Fill/Glow), Secondary (Glass Surface with Subtle Border), Ghost (Icon/Text only), Destructive (Rose Fill).
*   **States:** Hover (Brightness boost + subtle scale `1.02`), Active (`scale(0.98)`), Focused (Glowing outline), Disabled (`opacity: 0.4`, `pointer-events: none`).

### 11.2 Cards
*   **Style:** Glassmorphism surface (`--bg-surface-1`), rounded corners (`12px`), subtle inset border (`--border-subtle`).
*   **Interactivity:** Interactive cards feature subtle glowing borders on hover (`--border-accent`) and micro-elevation transitions.

### 11.3 Input Fields
*   **Style:** Recessed dark surfaces (`rgba(0, 0, 0, 0.3)`), explicit focus rings (`--accent-primary-glow`), inline clear buttons, and integrated hotkey hints.

### 11.4 Tables & Lists
*   **Style:** Borderless rows with alternating row highlights (`rgba(255,255,255,0.02)`), sticky header bars, and responsive cell truncation.

### 11.5 AI Chat & Thought Components
*   **User Messages:** Right-aligned cards with subtle blue tint.
*   **Assistant Responses:** Left-aligned stream with typing effect, markdown code block formatting, and embedded action approval cards.
*   **Thought Accords:** Collapsible sub-cards showing raw LLM step-by-step reasoning and vector memory matches.

---

## 12. Animation System
Motion is governed by centralized CSS transition tokens:

```css
:root {
  --ease-out-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-smooth: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
}
```

*   **Hover Transitions:** `150ms` using `--ease-out-smooth`.
*   **Page / View Slide Transitions:** `250ms` opacity + 8px vertical translate.
*   **Modal Popovers:** Scale in from `0.95` to `1.0` with backdrop blur fade in `200ms`.
*   **AI Thinking Animations:** Pulsing neon ambient border glow using an infinite keyframe pulse loop (`1.5s` cycle).

---

## 13. Responsive Design
Breakpoints enforce fluid layout shifts:

*   **Desktop Extra-Wide (`>= 1440px`):** Full layout (Sidebar + Main Workspace + Right Context Panel).
*   **Desktop Standard (`1024px - 1439px`):** Sidebar defaults to icon-only pinned mode (`68px`), Right Context Panel becomes collapsible slide-over drawer.
*   **Tablet / Small Window (`768px - 1023px`):** Sidebar hidden behind hamburger overlay, main workspace takes 100% width.
*   **Floating HUD / Compact Mode (`< 768px`):** Minimal overlay view displaying only voice waveforms, search bar, and toast alerts.

---

## 14. Accessibility (WCAG 2.1 AA Compliance)
*   **Keyboard Navigation:** All interactive controls (buttons, links, inputs, cards) must feature visible focus rings (`2px solid --accent-primary`) and logical `tabindex` ordering.
*   **Screen Reader Support:** Semantic HTML5 elements (`<main>`, `<nav>`, `<aside>`, `<header>`) complemented by explicit `aria-live="polite"` regions for AI responses and status changes.
*   **Color Contrast:** All body text maintains a minimum contrast ratio of `4.5:1` against background surfaces (`7:1` preferred).
*   **Font Scaling:** UI layout scales proportionally using `rem` units, supporting up to `200%` OS font size scaling without content clipping.

---

## 15. Performance Guidelines
*   **GPU Acceleration:** Use `transform` and `opacity` properties exclusively for CSS animations to avoid browser layout repaints.
*   **Virtualization:** Long data lists, logs, and chat histories must utilize window virtualization (rendering only visible DOM rows).
*   **Debounced Input Handling:** Search fields, resize listeners, and audio waveform renders must be throttled/debounced to prevent main thread blocking.
*   **60 FPS Requirement:** No UI frame drop under standard operating conditions.

---

## 16. Error UI & Edge States
*   **Empty States:** Clear vector graphics, descriptive guidance text, and a prominent primary call-to-action button (e.g., "No active memories found. Click to index workspace").
*   **Loading States:** Skeleton loading screens matching card layouts instead of generic spinning indicators.
*   **Error Pages / Toasts:** Structured error cards displaying a friendly summary, detailed error trace (collapsible), and explicit "Retry Action" or "Rollback" buttons.

---

## 17. Future UI Expansion
Future modules (e.g., Vision Dashboard, Custom Workflow Builders, Multi-Agent Swarm Visualizers) must integrate into the UI system by:
1.  Consuming atomic primitives from the central component library.
2.  Registering routes via the global Navigation Registry.
3.  Exposing actions to the Global Command Palette (`Ctrl+K`).
4.  Adhering to theme token contracts without inline overrides.

---

## 18. Best Practices
1.  **Never Use Hardcoded Styles:** Always consume design tokens for colors, padding, font sizes, and z-index values.
2.  **Keep Components Pure & Modular:** Separate presentational UI components from IPC data-fetching logic.
3.  **Always Provide Visual Feedback:** Every button click, hotkey, or background agent action must trigger immediate visual confirmation.
4.  **Graceful Degradation:** Ensure UI components handle missing data, offline status, or model rate limits without layout breaking.

---

## 19. Acceptance Criteria
*   [ ] 100% of visual colors, fonts, and spacing derive from CSS custom property tokens.
*   [ ] Keyboard-only navigation allows execution of all primary user workflows without mouse input.
*   [ ] UI renders smoothly at 60 FPS across all window resize and animation states.
*   [ ] Light, Dark, and Dynamic Accent themes switch instantly without requiring page reloads.
*   [ ] Zero layout breakage when text scaling is increased up to 200%.

---

## 20. Conclusion
This UI System Specification serves as the definitive visual and interactive blueprint for JARVIS-X. By combining futuristic glassmorphic aesthetics, ultra-responsive interaction patterns, strict tokenized design systems, and AI-first contextual workspaces, JARVIS-X delivers a truly state-of-the-art AI Operating System interface that is visually breathtaking, deeply accessible, and built for uncompromised productivity.
