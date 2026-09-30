import { useEffect, useId, useMemo, useRef, useState } from "react"

import type { Email } from "../../data/mail"
import { Button } from "../ui/button"
import { IconTooltipButton } from "../ui/icon-tooltip-button"
import { SenderAvatar } from "./SenderAvatar"
import { OutlineIcons } from "./icons"

interface ChatSession {
  id: string
  title: string
}

const PREVIOUS_CHATS: ChatSession[] = [
  { id: "chat-1", title: "Summarize this thread" },
  { id: "chat-2", title: "Draft a polite reply" },
  { id: "chat-3", title: "What are the action items?" },
  { id: "chat-4", title: "Your Instacart order receipt" },
  { id: "chat-5", title: "Meeting follow-up bullets" },
  { id: "chat-6", title: "Translate to Spanish" },
]

interface AIChatPanelProps {
  accountEmails: Email[]
  attachedEmails: Email[]
  isOpen: boolean
  onAddEmail: (id: string) => void
  onClearEmails: () => void
  onClose: () => void
  onSend: () => void
}

function matchesEmailSearch(email: Email, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  return (
    email.subject.toLowerCase().includes(normalized) ||
    email.senderName.toLowerCase().includes(normalized) ||
    email.senderEmail.toLowerCase().includes(normalized)
  )
}

function AttachedEmailSummary({ emails }: { emails: Email[] }) {
  if (emails.length === 0) {
    return <span className="ai-attachment__empty">No emails attached</span>
  }

  if (emails.length === 1) {
    const email = emails[0]
    return (
      <>
        <SenderAvatar
          className="ai-attachment__avatar"
          email={email.senderEmail}
          name={email.senderName}
          size={16}
        />
        <span className="ai-attachment__title" title={email.subject}>
          {email.subject}
        </span>
      </>
    )
  }

  return (
    <>
      <span aria-hidden className="ai-attachment-stack">
        {emails.slice(0, 3).map((email) => (
          <SenderAvatar
            className="ai-attachment-stack__avatar"
            email={email.senderEmail}
            key={email.id}
            name={email.senderName}
            size={16}
          />
        ))}
      </span>
      <span className="ai-attachment__title">{emails.length} emails</span>
    </>
  )
}

export function AIChatPanel({
  accountEmails,
  attachedEmails,
  isOpen,
  onAddEmail,
  onClearEmails,
  onClose,
  onSend,
}: AIChatPanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [chatMenuOpen, setChatMenuOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [emailSearch, setEmailSearch] = useState("")
  const [prompt, setPrompt] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const chatTriggerRef = useRef<HTMLButtonElement>(null)
  const pickerSearchRef = useRef<HTMLInputElement>(null)
  const pickerId = useId()
  const chatMenuId = useId()
  const attachedIds = new Set(attachedEmails.map((email) => email.id))
  const availableEmails = accountEmails.filter(
    (email) => !attachedIds.has(email.id),
  )
  const filteredEmails = useMemo(
    () => availableEmails.filter((email) => matchesEmailSearch(email, emailSearch)),
    [availableEmails, emailSearch],
  )
  const activeChatTitle =
    PREVIOUS_CHATS.find((chat) => chat.id === activeChatId)?.title ?? "New Chat"

  useEffect(() => {
    if (!isOpen) {
      setPickerOpen(false)
      setChatMenuOpen(false)
      setEmailSearch("")
    }
  }, [isOpen])

  useEffect(() => {
    if (!pickerOpen) {
      setEmailSearch("")
      return
    }

    const frame = requestAnimationFrame(() => {
      pickerSearchRef.current?.focus()
    })

    return () => cancelAnimationFrame(frame)
  }, [pickerOpen])

  useEffect(() => {
    if (!pickerOpen && !chatMenuOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPickerOpen(false)
        setChatMenuOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      if (chatMenuOpen) {
        setChatMenuOpen(false)
        chatTriggerRef.current?.focus()
        return
      }
      if (pickerOpen) {
        setPickerOpen(false)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [chatMenuOpen, pickerOpen])

  function selectChat(chatId: string | null) {
    setActiveChatId(chatId)
    setChatMenuOpen(false)
    chatTriggerRef.current?.focus()
  }

  return (
    <div className="ai-panel__inner" ref={rootRef}>
      <header className="ai-panel__header">
        <div className="ai-panel__header-center">
          <button
            aria-controls={chatMenuOpen ? chatMenuId : undefined}
            aria-expanded={chatMenuOpen}
            aria-haspopup="menu"
            className="ai-panel__chat-trigger"
            onClick={() => {
              setPickerOpen(false)
              setChatMenuOpen((open) => !open)
            }}
            ref={chatTriggerRef}
            type="button"
          >
            <span>{activeChatTitle}</span>
            <OutlineIcons.chevronDown ariaHidden size={14} />
          </button>
          <div className="ai-panel__chat-menu-anchor">
            <div
              aria-hidden={!chatMenuOpen}
              className={
                chatMenuOpen
                  ? "ai-panel__chat-menu t-dropdown is-open"
                  : "ai-panel__chat-menu t-dropdown"
              }
              data-origin="top-center"
              id={chatMenuId}
              inert={!chatMenuOpen}
              role="menu"
            >
              <div className="ai-panel__chat-list">
                <button
                  aria-current={activeChatId === null ? "true" : undefined}
                  className="ai-panel__chat-item"
                  onClick={() => selectChat(null)}
                  role="menuitem"
                  type="button"
                >
                  New Chat
                </button>
                {PREVIOUS_CHATS.map((chat) => (
                  <button
                    aria-current={activeChatId === chat.id ? "true" : undefined}
                    className="ai-panel__chat-item"
                    key={chat.id}
                    onClick={() => selectChat(chat.id)}
                    role="menuitem"
                    type="button"
                  >
                    {chat.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Button
          aria-label="Close chat"
          className="ai-panel__header-close"
          onClick={onClose}
          size="icon"
          type="button"
          variant="ghost"
        >
          <OutlineIcons.cross ariaHidden size={16} />
        </Button>
      </header>

      <div className="ai-composer-wrap">
        <div
          aria-label="Add an email"
          aria-hidden={!pickerOpen}
          className={
            pickerOpen
              ? "ai-email-picker t-dropdown is-open"
              : "ai-email-picker t-dropdown"
          }
          data-origin="bottom-center"
          id={pickerId}
          inert={!pickerOpen}
          role="dialog"
        >
          <div className="ai-email-picker__search">
            <input
              aria-label="Search mail"
              className="ai-email-picker__search-input"
              onChange={(event) => setEmailSearch(event.target.value)}
              placeholder="Search mail"
              ref={pickerSearchRef}
              type="search"
              value={emailSearch}
            />
          </div>
          <div className="ai-email-picker__list">
            {availableEmails.length === 0 ? (
              <p className="ai-email-picker__empty">All emails attached</p>
            ) : filteredEmails.length === 0 ? (
              <p className="ai-email-picker__empty">No matching mail</p>
            ) : (
              filteredEmails.map((email) => (
                <button
                  className="ai-email-picker__item"
                  key={email.id}
                  onClick={() => {
                    onAddEmail(email.id)
                    setPickerOpen(false)
                  }}
                  type="button"
                >
                  <SenderAvatar
                    className="ai-email-picker__avatar"
                    email={email.senderEmail}
                    name={email.senderName}
                    size={16}
                  />
                  <span title={email.subject}>{email.subject}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="ai-composer">
          <div className="ai-attachment">
            <div className="ai-attachment__summary">
              <AttachedEmailSummary emails={attachedEmails} />
              {attachedEmails.length > 0 ? (
                <IconTooltipButton
                  className="ai-composer__icon-button ai-attachment__clear"
                  label="Remove mail"
                  onClick={onClearEmails}
                  type="button"
                >
                  <OutlineIcons.cross ariaHidden size={14} />
                </IconTooltipButton>
              ) : null}
            </div>
            <IconTooltipButton
              aria-controls={pickerOpen ? pickerId : undefined}
              aria-expanded={pickerOpen}
              aria-haspopup="dialog"
              className="ai-composer__icon-button ai-attachment__add"
              label="Add mail"
              onClick={() => {
                setChatMenuOpen(false)
                setPickerOpen((open) => !open)
              }}
              type="button"
            >
              <OutlineIcons.plus ariaHidden size={16} />
            </IconTooltipButton>
          </div>

          <div className="ai-composer__body">
            <textarea
              aria-label="Message to AI"
              className="ai-composer__input"
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="What can I help you with?"
              rows={3}
              value={prompt}
            />

            <div className="ai-composer__actions">
              <button
                aria-label="Upload attachment"
                className="ai-composer__icon-button ai-composer__upload"
                type="button"
              >
                <OutlineIcons.paperclip ariaHidden size={17} />
              </button>
              <button
                aria-label="Send message"
                className="ai-composer__send"
                onClick={onSend}
                type="button"
              >
                <OutlineIcons.arrowUp ariaHidden size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
