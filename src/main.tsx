import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App"
import { DevAgentation } from "./components/dev/DevAgentation"
import { TooltipProvider } from "./components/ui/tooltip"
import { applyFontSmoothing, readFontSmoothing } from "./lib/font-smoothing"
import "./styles.css"

applyFontSmoothing(readFontSmoothing())

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
      <DevAgentation />
    </TooltipProvider>
  </StrictMode>,
)
