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
