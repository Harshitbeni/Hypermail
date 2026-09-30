# Agentation Integration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Agentation as a development-only visual feedback overlay without including it in production output.

**Architecture:** A focused `DevAgentation` component will own the compile-time development guard, lazy named-export mapping, Suspense boundary, and isolated error boundary. The React entry point will mount it beside the existing application, leaving the mail UI and its data flow unchanged.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Agentation

---

## Chunk 1: Development-only integration

### Task 1: Install Agentation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install the package**

Run:

```bash
npm install --save-dev agentation
```

Expected: npm exits successfully, adds `agentation` to `devDependencies`,
and updates `package-lock.json`.

- [ ] **Step 2: Confirm the dependency**

Run:

```bash
npm ls agentation
```

Expected: npm prints one installed `agentation` version with no dependency error.

### Task 2: Add the development loader

**Files:**
- Create: `src/components/dev/DevAgentation.tsx`

- [ ] **Step 1: Create the focused loader**

Create `src/components/dev/DevAgentation.tsx`:

```tsx
import {
  Component,
  lazy,
  Suspense,
  type ErrorInfo,
  type ReactNode,
} from "react"

const Agentation = import.meta.env.DEV
  ? lazy(() =>
      import("agentation").then(({ Agentation }) => ({
        default: Agentation,
      })),
    )
  : null

interface AgentationErrorBoundaryProps {
  children: ReactNode
}

interface AgentationErrorBoundaryState {
  hasError: boolean
}

class AgentationErrorBoundary extends Component<
  AgentationErrorBoundaryProps,
  AgentationErrorBoundaryState
> {
  state: AgentationErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AgentationErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Agentation failed to load or render.", error, errorInfo)
  }

  render() {
    return this.state.hasError ? null : this.props.children
  }
}

export function DevAgentation() {
  if (!Agentation) {
    return null
  }

  return (
    <AgentationErrorBoundary>
      <Suspense fallback={null}>
        <Agentation />
      </Suspense>
    </AgentationErrorBoundary>
  )
}
```

The compile-time `import.meta.env.DEV` condition must surround the lazy import. This lets Vite remove the Agentation import from production rather than merely hiding its UI.

- [ ] **Step 2: Type-check the loader**

Run:

```bash
npm run typecheck
```

Expected: TypeScript exits successfully.

### Task 3: Mount Agentation at the application root

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Import and render the loader**

Update `src/main.tsx` to:

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App"
import { DevAgentation } from "./components/dev/DevAgentation"
import "./styles.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <DevAgentation />
  </StrictMode>,
)
```

- [ ] **Step 2: Run static checks**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: Both commands exit successfully with no diagnostics.

### Task 4: Verify development and production behavior

**Files:**
- Verify generated output: `dist/`

- [ ] **Step 1: Build the production application**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite finish successfully and generate `dist/`.

- [ ] **Step 2: Confirm Agentation is absent from production**

Run:

```bash
if rg -i "agentation" dist; then
  echo "Agentation unexpectedly appears in production output"
  exit 1
fi
```

Expected: No matches and exit code 0.

- [ ] **Step 3: Smoke-test the development overlay**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local HTTP URL and remains running. Open that exact URL
in a browser, then confirm:

1. The mail prototype renders normally.
2. The Agentation control is visible and interactive.
3. The browser console has no Agentation loading or rendering errors.
