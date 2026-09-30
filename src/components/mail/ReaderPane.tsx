import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import {
  formatLaterUntil,
  formatReaderDate,
  type Email,
  type Folder,
  type Tag,
} from "../../data/mail"
import { mailShortcuts } from "../../lib/keyboard-shortcuts"
import { cn } from "../../lib/utils"
import { IconTooltipButton } from "../ui/icon-tooltip-button"
import { FilledIcons, OutlineIcons, type CentralIcon } from "./icons"
import { SenderAvatar } from "./SenderAvatar"

interface ReaderPaneProps {
  message: Email | null
  onToggleTag: (tag: Tag) => void
  onMove: (folder: Folder) => void
  aiRunId: number
  aiStatus: "idle" | "working" | "done"
  askAIOpen: boolean
  onToggleAskAI: () => void
  onBack: () => void
  onExitFocus: () => void
  onNavigatePrevious: () => void
  onNavigateNext: () => void
  canNavigatePrevious: boolean
  canNavigateNext: boolean
}

interface ToolbarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  shortcut?: readonly string[]
}

function ToolbarButton({
  label,
  shortcut,
  className,
  children,
  ...props
}: ToolbarButtonProps) {
  return (
    <IconTooltipButton
      className={cn("mail-action", className)}
      label={label}
      shortcut={shortcut}
      size="icon"
      tabIndex={0}
      {...props}
    >
      {children}
    </IconTooltipButton>
  )
}

interface TagButtonDef {
  tag: Tag
  label: string
  shortcut: readonly string[]
  Icon: CentralIcon
  ActiveIcon: CentralIcon
}

const TAG_BUTTONS: TagButtonDef[] = [
  {
    tag: "starred",
    label: "Star",
    shortcut: mailShortcuts.star,
    Icon: OutlineIcons.star,
    ActiveIcon: FilledIcons.star,
  },
  {
    tag: "waiting",
    label: "Wait",
    shortcut: mailShortcuts.wait,
    Icon: OutlineIcons.waiting,
    ActiveIcon: FilledIcons.waiting,
  },
  {
    tag: "later",
    label: "Later",
    shortcut: mailShortcuts.later,
    Icon: OutlineIcons.later,
    ActiveIcon: FilledIcons.later,
  },
]

export function ReaderPane({
  message,
  onToggleTag,
  onMove,
  aiRunId,
  aiStatus,
  askAIOpen,
  onToggleAskAI,
  onBack,
  onExitFocus,
  onNavigatePrevious,
  onNavigateNext,
  canNavigatePrevious,
  canNavigateNext,
}: ReaderPaneProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const detailsRef = useRef<HTMLDivElement>(null)
  const detailsInnerRef = useRef<HTMLDivElement>(null)
  const wasOpenRef = useRef(false)
  const messageId = message?.id ?? null

  const [menuState, setMenuState] = useState<"closed" | "open" | "closing">(
    "closed",
  )
  const overflowRef = useRef<HTMLDivElement>(null)
  const menuTimeoutRef = useRef<number | undefined>(undefined)
  const toolbarRef = useRef<HTMLElement>(null)
  const primaryActionsRef = useRef<HTMLDivElement>(null)
  const secondaryActionsRef = useRef<HTMLDivElement>(null)
  const [actionsOverflow, setActionsOverflow] = useState(false)

  const closeMenu = useCallback(() => {
    setMenuState((state) => (state === "closed" ? state : "closing"))
    window.clearTimeout(menuTimeoutRef.current)
    const closeMs =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--dropdown-close-dur",
        ),
      ) || 150
    menuTimeoutRef.current = window.setTimeout(
      () => setMenuState("closed"),
      closeMs,
    )
  }, [])

  useEffect(() => {
    if (menuState !== "open") return
    function onPointerDown(event: PointerEvent) {
      if (!overflowRef.current?.contains(event.target as Node)) closeMenu()
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [menuState, closeMenu])

  useEffect(() => {
    setDetailsOpen(false)
  }, [messageId])

  useLayoutEffect(() => {
    const toolbar = toolbarRef.current
    const primary = primaryActionsRef.current
    const secondary = secondaryActionsRef.current
    if (!toolbar || !primary || !secondary) return

    const expandedSecondaryWidth = 190
    const toolbarPaddingX = 12
    const minGap = 8

    const measure = () => {
      if (!askAIOpen) {
        setActionsOverflow(false)
        return
      }

      const primaryRect = primary.getBoundingClientRect()
      const secondaryRect = secondary.getBoundingClientRect()
      const toolbarWidth = toolbar.clientWidth
      const primaryWidth = primaryRect.width

      setActionsOverflow((current) => {
        if (!current) {
          return primaryRect.right + minGap / 2 > secondaryRect.left
        }
        return (
          toolbarWidth <
          primaryWidth + expandedSecondaryWidth + toolbarPaddingX + minGap
        )
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(toolbar)
    observer.observe(primary)
    observer.observe(secondary)
    return () => observer.disconnect()
  }, [askAIOpen, messageId, message?.tags, message?.laterUntil])

  // Card resize: tween the details wrapper between 0 and its content height.
  useLayoutEffect(() => {
    const el = detailsRef.current
    if (!el) return
    el.style.height = detailsOpen ? `${el.scrollHeight}px` : "0px"
  }, [detailsOpen, messageId])

  // Texts reveal exit: quiet fade-out instead of replaying the stagger.
  useEffect(() => {
    const el = detailsInnerRef.current
    if (wasOpenRef.current && !detailsOpen && el) {
      el.classList.add("is-hiding")
      const timeout = window.setTimeout(
        () => el.classList.remove("is-hiding"),
        200,
      )
      wasOpenRef.current = detailsOpen
      return () => window.clearTimeout(timeout)
    }
    wasOpenRef.current = detailsOpen
  }, [detailsOpen])

  const detailLines = message
    ? [
        { label: "To:", value: message.recipient },
        ...(message.cc?.length
          ? [{ label: "cc:", value: message.cc.join(", ") }]
          : []),
        ...(message.bcc?.length
          ? [{ label: "bcc:", value: message.bcc.join(", ") }]
          : []),
        ...(message.replyTo
          ? [{ label: "Reply to:", value: message.replyTo }]
          : []),
      ]
    : []

  return (
    <section
      aria-label="Selected message"
      className="reader t-page t-resize"
      data-page-id="2"
    >
      <header
        className={cn(
          "reader-toolbar",
          actionsOverflow && "reader-toolbar--actions-overflow",
        )}
        ref={toolbarRef}
      >
        <ToolbarButton
          className="reader-back"
          label="Back to messages"
          onClick={onBack}
        >
          <OutlineIcons.back ariaHidden size={16} />
        </ToolbarButton>
        <ToolbarButton
          className="reader-focus-toggle"
          label="Exit focus mode"
          onClick={onExitFocus}
          shortcut={mailShortcuts.focusMode}
        >
          <OutlineIcons.focus ariaHidden size={16} />
        </ToolbarButton>
        <span aria-hidden className="toolbar-divider reader-back-divider" />
        <div className="reader-focus-nav">
          <ToolbarButton
            disabled={!canNavigatePrevious}
            label="Previous message"
            onClick={onNavigatePrevious}
            shortcut={mailShortcuts.previousMessage}
          >
            <OutlineIcons.chevronTop ariaHidden size={16} />
          </ToolbarButton>
          <ToolbarButton
            disabled={!canNavigateNext}
            label="Next message"
            onClick={onNavigateNext}
            shortcut={mailShortcuts.nextMessage}
          >
            <OutlineIcons.chevronBottom ariaHidden size={16} />
          </ToolbarButton>
        </div>
        <span
          aria-hidden
          className="toolbar-divider reader-focus-nav-divider"
        />

        <div
          className="reader-toolbar__group primary-actions"
          ref={primaryActionsRef}
        >
          {TAG_BUTTONS.map(({ tag, label, shortcut, Icon, ActiveIcon }) => {
            const active = message?.tags.includes(tag) ?? false
            const Glyph = active ? ActiveIcon : Icon
            const laterUntil =
              tag === "later" && active ? (message?.laterUntil ?? null) : null
            return (
              <ToolbarButton
                aria-pressed={active}
                className={cn(
                  active && `active--${tag}`,
                  laterUntil && "with-date",
                )}
                disabled={!message}
                key={tag}
                label={label}
                onClick={() => onToggleTag(tag)}
                shortcut={shortcut}
              >
                <Glyph ariaHidden size={15} />
                {laterUntil ? (
                  <span className="mail-action__date">
                    {formatLaterUntil(laterUntil)}
                  </span>
                ) : null}
              </ToolbarButton>
            )
          })}
        </div>

        <div
          className="reader-toolbar__group secondary-actions"
          ref={secondaryActionsRef}
        >
          <div className="action-cluster">
            <ToolbarButton
              disabled={!message}
              label="Archive"
              onClick={() => onMove("archive")}
              shortcut={mailShortcuts.archive}
            >
              <OutlineIcons.archive ariaHidden size={15} />
            </ToolbarButton>
            <ToolbarButton
              disabled={!message}
              label="Delete"
              onClick={() => onMove("trash")}
              shortcut={mailShortcuts.delete}
            >
              <OutlineIcons.trash ariaHidden size={15} />
            </ToolbarButton>
          </div>
          <span aria-hidden className="toolbar-divider" />
          <div className="action-cluster">
            <ToolbarButton label="Reply" shortcut={mailShortcuts.reply}>
              <OutlineIcons.reply ariaHidden size={15} />
            </ToolbarButton>
            <ToolbarButton label="Forward" shortcut={mailShortcuts.forward}>
              <OutlineIcons.forward ariaHidden size={15} />
            </ToolbarButton>
          </div>
          <span aria-hidden className="toolbar-divider" />
          <div className="action-overflow" ref={overflowRef}>
            <ToolbarButton
              aria-expanded={menuState === "open"}
              label="More actions"
              onClick={() =>
                menuState === "open" ? closeMenu() : setMenuState("open")
              }
            >
              <OutlineIcons.more ariaHidden size={15} />
            </ToolbarButton>
            <div
              className={cn(
                "t-dropdown action-menu",
                menuState === "open" && "is-open",
                menuState === "closing" && "is-closing",
              )}
              data-origin="top-right"
              role="menu"
            >
              <button
                className="action-menu__item"
                disabled={!message}
                onClick={() => {
                  onMove("archive")
                  closeMenu()
                }}
                role="menuitem"
                type="button"
              >
                <OutlineIcons.archive ariaHidden size={14} />
                Archive
              </button>
              <button
                className="action-menu__item"
                disabled={!message}
                onClick={() => {
                  onMove("trash")
                  closeMenu()
                }}
                role="menuitem"
                type="button"
              >
                <OutlineIcons.trash ariaHidden size={14} />
                Delete
              </button>
              <span aria-hidden className="action-menu__divider" />
              <button className="action-menu__item" role="menuitem" type="button">
                <OutlineIcons.reply ariaHidden size={14} />
                Reply
              </button>
              <button className="action-menu__item" role="menuitem" type="button">
                <OutlineIcons.forward ariaHidden size={14} />
                Forward
              </button>
            </div>
          </div>
          <div className="action-cluster single">
            <ToolbarButton
              aria-pressed={askAIOpen}
              className={cn(
                "reader-ask-ai",
                askAIOpen && "active--ask-ai",
              )}
              data-ai-status={aiStatus}
              label={
                aiStatus === "working"
                  ? "Ask AI, working"
                  : aiStatus === "done"
                    ? "Ask AI, response ready"
                    : "Ask AI"
              }
              onClick={onToggleAskAI}
              shortcut={mailShortcuts.askAI}
            >
              <FilledIcons.sparkle
                ariaHidden
                className="sparkle-icon"
                key={aiRunId}
                size={16}
              />
            </ToolbarButton>
          </div>
        </div>
      </header>

      {message ? (
        <>
          <div className="reader-header">
            <h2>{message.subject}</h2>
            <div className="sender-row">
              <SenderAvatar email={message.senderEmail} name={message.senderName} />
              <div className="sender-copy">
                <button
                  aria-expanded={detailsOpen}
                  className="sender-name"
                  onClick={() => setDetailsOpen((open) => !open)}
                  type="button"
                >
                  <strong>{message.senderName}</strong>
                  <OutlineIcons.chevronDown ariaHidden size={12} />
                </button>
                <span className="sender-from-line" data-open={detailsOpen}>
                  <span
                    aria-hidden={!detailsOpen}
                    className="sender-details__label"
                  >
                    From:
                  </span>
                  {message.senderEmail}
                </span>
              </div>
              <time>{formatReaderDate(message.sentAt)}</time>
            </div>
            <div
              aria-hidden={!detailsOpen}
              className="sender-details t-resize"
              ref={detailsRef}
            >
              <div
                className={cn(
                  "sender-details__inner t-stagger",
                  detailsOpen && "is-shown",
                )}
                ref={detailsInnerRef}
              >
                {detailLines.map((line) => (
                  <span className="t-stagger-line" key={line.label}>
                    <span className="sender-details__label">{line.label}</span>
                    {line.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="email-body">
            <iframe
              className="email-body__frame"
              key={message.id}
              sandbox=""
              srcDoc={message.bodyHtml}
              title={message.subject}
            />
          </div>
        </>
      ) : (
        <div className="reader-empty">Select a message to read</div>
      )}
    </section>
  )
}
