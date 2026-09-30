import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from "react"

import {
  emailMatchesQuery,
  emailsForSearch,
  formatListTime,
  type AccountId,
  type Email,
  type ExtrasCategory,
  type Folder,
  type FolderDef,
  type Tag,
} from "../../data/mail"
import { Checkbox } from "../ui/checkbox"
import { IconTooltipButton } from "../ui/icon-tooltip-button"
import { mailShortcuts } from "../../lib/keyboard-shortcuts"
import { cn } from "../../lib/utils"
import {
  extrasCategoryFilledIcons,
  extrasCategoryIcons,
  FilledIcons,
  folderIcon,
  OutlineIcons,
} from "./icons"
import { SenderAvatar } from "./SenderAvatar"

interface ExtrasChip {
  id: ExtrasCategory | null
  label: string
}

interface MessageListProps {
  meta: FolderDef
  accountId: AccountId
  accountEmails: Email[]
  emails: Email[]
  relativeTime: boolean
  selectedId: string | null
  onSelect: (id: string, additive: boolean) => void
  bulkIds: string[]
  onBulkIdsChange: Dispatch<SetStateAction<string[]>>
  onBulkMove: (folder: Folder) => void
  onBulkToggleTag: (tag: Tag) => void
  onBulkAskAI: () => void
  chips?: ExtrasChip[]
  activeChip?: ExtrasCategory | null
  onSelectChip?: (id: ExtrasCategory | null) => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onCompose: () => void
  onMarkAllRead: () => void
  onMarkRead: (id: string) => void
  unreadFilterActive: boolean
  onToggleUnreadFilter: () => void
  onClearUnreadFilter: () => void
  hasUnread: boolean
  askAIOpen: boolean
  onToggleAskAI: () => void
  aiRunId: number
  aiStatus: "idle" | "working" | "done"
}

interface TagButtonDef {
  tag: Tag
  label: string
  shortcut: readonly string[]
  Icon: (typeof OutlineIcons)["star"]
  ActiveIcon: (typeof FilledIcons)["star"]
}

function UnreadDot({
  read,
  onMarkRead,
}: {
  read: boolean
  onMarkRead: () => void
}) {
  const [phase, setPhase] = useState<"hidden" | "visible" | "exiting">(() =>
    read ? "hidden" : "visible",
  )

  useEffect(() => {
    if (!read) {
      setPhase("visible")
      return
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("hidden")
      return
    }

    setPhase((current) => (current === "visible" ? "exiting" : current))
  }, [read])

  if (phase === "hidden") return null

  const exiting = phase === "exiting"

  return (
    <span
      className={cn(
        "message-row__unread-slot",
        exiting && "message-row__unread-slot--exit",
      )}
      onTransitionEnd={(event) => {
        if (!exiting) return
        if (event.target !== event.currentTarget) return
        if (event.propertyName !== "width") return
        setPhase("hidden")
      }}
    >
      <button
        aria-label="Mark as read"
        className={cn(
          "message-row__unread-dot",
          exiting && "message-row__unread-dot--exit",
        )}
        disabled={exiting}
        onClick={(event) => {
          event.stopPropagation()
          if (!read) onMarkRead()
        }}
        type="button"
      />
    </span>
  )
}

const BULK_TAG_BUTTONS: TagButtonDef[] = [
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

export function MessageList({
  meta,
  accountId,
  accountEmails,
  emails,
  relativeTime,
  selectedId,
  onSelect,
  bulkIds,
  onBulkIdsChange,
  onBulkMove,
  onBulkToggleTag,
  onBulkAskAI,
  chips,
  activeChip,
  onSelectChip,
  sidebarOpen,
  onToggleSidebar,
  onCompose,
  onMarkAllRead,
  onMarkRead,
  unreadFilterActive,
  onToggleUnreadFilter,
  onClearUnreadFilter,
  hasUnread,
  askAIOpen,
  onToggleAskAI,
  aiRunId,
  aiStatus,
}: MessageListProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchEverywhere, setSearchEverywhere] = useState(false)
  const [cascadeAnchorId, setCascadeAnchorId] = useState<string | null>(null)
  const [dismissedHoverId, setDismissedHoverId] = useState<string | null>(null)
  const [selectionTransitionActive, setSelectionTransitionActive] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const anchorIdRef = useRef<string | null>(null)
  const bulkSet = new Set(bulkIds)
  const bulkOpen = bulkIds.length > 0
  const selectionClosing = !bulkOpen && selectionTransitionActive
  const HeaderIcon = folderIcon(meta.icon, true)
  const FilterIcon = unreadFilterActive ? FilledIcons.filter : OutlineIcons.filter
  const listed = searchOpen
    ? emailsForSearch(accountEmails, searchEverywhere).filter((email) =>
        emailMatchesQuery(email, searchQuery),
    )
    : emails
  const cascadeAnchorIndex = listed.findIndex((email) => email.id === cascadeAnchorId)
  const allListedSelected = listed.length > 0 && listed.every((email) => bulkSet.has(email.id))

  useEffect(() => {
    setSearchOpen(false)
    setSearchQuery("")
    setSearchEverywhere(false)
    anchorIdRef.current = null
    setDismissedHoverId(null)
    onBulkIdsChange([])
  }, [accountId, meta.id, onBulkIdsChange])

  useEffect(() => {
    if (bulkOpen) {
      setSelectionTransitionActive(true)
      return
    }
    if (!selectionTransitionActive) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSelectionTransitionActive(false)
      return
    }

    const duration =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--selection-close-dur"),
      ) || 180
    const timeout = window.setTimeout(() => setSelectionTransitionActive(false), duration)
    return () => window.clearTimeout(timeout)
  }, [bulkOpen, selectionTransitionActive])

  const listedIds = listed.map((email) => email.id).join("\0")

  useEffect(() => {
    const visible = new Set(listedIds ? listedIds.split("\0") : [])
    onBulkIdsChange((current) => {
      const next = current.filter((id) => visible.has(id))
      return next.length === current.length ? current : next
    })
  }, [listedIds, onBulkIdsChange])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  function openSearch() {
    setSearchOpen(true)
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery("")
    setSearchEverywhere(false)
  }

  function toggleAllListed() {
    setCascadeAnchorId(listed[0]?.id ?? null)
    onBulkIdsChange(allListedSelected ? [] : listed.map((email) => email.id))
  }

  function rangeFromAnchor(id: string) {
    const ids = listed.map((email) => email.id)
    const index = ids.indexOf(id)
    if (index < 0) return [id]
    const anchor = anchorIdRef.current ?? selectedId
    const anchorIndex = anchor ? ids.indexOf(anchor) : -1
    if (anchorIndex < 0) return [id]
    const start = Math.min(anchorIndex, index)
    const end = Math.max(anchorIndex, index)
    return ids.slice(start, end + 1)
  }

  function toggleOne(id: string) {
    anchorIdRef.current = id
    setCascadeAnchorId(id)
    setDismissedHoverId(bulkIds.length === 1 && bulkSet.has(id) ? id : null)
    onBulkIdsChange((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  function selectFromPointer(
    id: string,
    event: { shiftKey: boolean; metaKey: boolean },
    fallback: "open" | "toggle",
  ) {
    if (event.shiftKey) {
      setCascadeAnchorId(id)
      onBulkIdsChange(rangeFromAnchor(id))
      return
    }
    if (event.metaKey || fallback === "toggle") {
      toggleOne(id)
      return
    }
    anchorIdRef.current = id
    setCascadeAnchorId(id)
    onBulkIdsChange([])
    onSelect(id, false)
  }

  const bulkEmails = listed.filter((email) => bulkSet.has(email.id))

  return (
    <section
      aria-label={searchOpen ? "Search results" : `${meta.label} messages`}
      className="message-list t-page t-resize"
      data-bulk={bulkOpen ? "true" : undefined}
      data-page-id="1"
    >
      <header className="message-list__toolbar" data-search={searchOpen}>
        <div className="message-list__toolbar-leading" inert={searchOpen}>
        {chips && chips.length > 0 ? (
          <>
            {!sidebarOpen && (
              <IconTooltipButton
                className="list-filter"
                label="Show sidebar"
                onClick={onToggleSidebar}
                size="icon"
              >
                <OutlineIcons.sidebarToggle ariaHidden size={15} />
              </IconTooltipButton>
            )}
            <div aria-label="Filter extras" className="message-list__chips" role="group">
              {chips.map((chip) => {
                const selected = chip.id === activeChip
                const OutlineChipIcon =
                  chip.id === null ? folderIcon("extras") : extrasCategoryIcons[chip.id]
                const FilledChipIcon =
                  chip.id === null ? FilledIcons.extras : extrasCategoryFilledIcons[chip.id]
                return (
                  <button
                    aria-pressed={selected}
                    className={selected ? "chip selected" : "chip"}
                    key={chip.id ?? "all"}
                    onClick={() => onSelectChip?.(chip.id)}
                    type="button"
                  >
                    {selected ? (
                      <FilledChipIcon
                        ariaHidden
                        className="chip__icon--filled"
                        size={13}
                      />
                    ) : (
                      <OutlineChipIcon ariaHidden size={13} />
                    )}
                    <span className="chip__label">{chip.label}</span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <span
              className="t-icon-swap toolbar-swap toolbar-swap--left"
              data-state={bulkOpen || sidebarOpen ? "a" : "b"}
            >
              <span aria-hidden={!bulkOpen && !sidebarOpen} className="t-icon" data-icon="a">
                {bulkOpen ? (
                  <Checkbox
                    aria-label={allListedSelected ? "Deselect all messages" : "Select all messages"}
                    checked={allListedSelected}
                    className="message-list__select-all-checkbox"
                    onCheckedChange={toggleAllListed}
                  />
                ) : (
                  <HeaderIcon
                    ariaHidden
                    className="message-list__toolbar-icon"
                    size={15}
                  />
                )}
              </span>
              <IconTooltipButton
                aria-hidden={bulkOpen || sidebarOpen}
                className="list-filter t-icon"
                data-icon="b"
                label="Show sidebar"
                onClick={onToggleSidebar}
                size="icon"
              >
                <OutlineIcons.sidebarToggle ariaHidden size={15} />
              </IconTooltipButton>
            </span>
            <h1>
              {bulkOpen ? (
                <button
                  aria-pressed={allListedSelected}
                  className="message-list__select-all"
                  onClick={toggleAllListed}
                  type="button"
                >
                  {allListedSelected ? "Deselect all" : "Select all"}
                </button>
              ) : meta.label}
            </h1>
          </>
        )}
        </div>
        <div className="message-list__search" role="search">
          <IconTooltipButton
            className="list-filter message-list__search-icon"
            label="Search"
            onClick={openSearch}
            size="icon"
          >
            <OutlineIcons.search ariaHidden size={15} />
          </IconTooltipButton>
          <input
            aria-hidden={!searchOpen}
            aria-label="Search mail"
            className="message-list__search-input"
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeSearch()
            }}
            placeholder="Search"
            ref={searchInputRef}
            tabIndex={searchOpen ? 0 : -1}
            type="text"
            value={searchQuery}
          />
          <IconTooltipButton
            aria-hidden={!searchOpen}
            className="list-filter message-list__search-cancel"
            label="Cancel search"
            onClick={closeSearch}
            size="compact"
            tabIndex={-1}
          >
            <OutlineIcons.cross ariaHidden size={12} />
          </IconTooltipButton>
        </div>
        <div className="message-list__toolbar-trailing" inert={searchOpen}>
        <IconTooltipButton
          className="list-filter"
          disabled={!hasUnread}
          label="Mark all as read"
          onClick={onMarkAllRead}
          size="icon"
        >
          <OutlineIcons.markAllRead ariaHidden size={15} />
        </IconTooltipButton>
        <IconTooltipButton
          aria-pressed={unreadFilterActive}
          className={cn("list-filter", unreadFilterActive && "list-filter--active")}
          disabled={!hasUnread && !unreadFilterActive}
          label="Filter messages"
          onClick={onToggleUnreadFilter}
          size="icon"
        >
          <FilterIcon ariaHidden size={15} />
        </IconTooltipButton>
        <IconTooltipButton
          aria-pressed={askAIOpen}
          className={cn("list-filter list-ask-ai", askAIOpen && "list-filter--active")}
          label="Ask AI"
          onClick={onToggleAskAI}
          shortcut={mailShortcuts.askAI}
          size="icon"
        >
          <FilledIcons.sparkle ariaHidden className="sparkle-icon" size={16} />
        </IconTooltipButton>
        <span
          className="t-icon-swap toolbar-swap toolbar-swap--right"
          data-state={sidebarOpen ? "a" : "b"}
        >
          <span aria-hidden className="t-icon" data-icon="a" />
          <IconTooltipButton
            aria-hidden={sidebarOpen}
            className="list-filter t-icon"
            data-icon="b"
            label="Compose mail"
            onClick={onCompose}
            size="icon"
          >
            <OutlineIcons.compose ariaHidden size={15} />
          </IconTooltipButton>
        </span>
        </div>
      </header>

      <div
        className="message-rows t-selection-cascade"
        data-bulk={bulkOpen ? "true" : undefined}
        data-closing={selectionClosing ? "true" : undefined}
      >
        {listed.length === 0 ? (
          <p className="message-list__empty">
            {searchOpen && searchQuery.trim()
              ? "No results"
              : unreadFilterActive
                ? "No unread messages"
                : "No messages"}
          </p>
        ) : (
          listed.map((email, index) => {
            const selected = email.id === selectedId
            const checked = bulkSet.has(email.id)
            const cascadeDistance =
              cascadeAnchorIndex < 0 ? 0 : Math.abs(index - cascadeAnchorIndex)
            return (
              <div
                aria-current={selected || undefined}
                className={cn(
                  "message-row",
                  selected && "selected",
                  checked && "is-checked",
                )}
                key={email.id}
                data-hover-dismissed={dismissedHoverId === email.id ? "true" : undefined}
                style={
                  {
                    "--selection-cascade-delay": `${cascadeDistance * 26}ms`,
                  } as CSSProperties
                }
                onClick={(event) => selectFromPointer(email.id, event, "open")}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return
                  event.preventDefault()
                  selectFromPointer(email.id, event, "open")
                }}
                onMouseDown={(event) => {
                  if (event.shiftKey || event.metaKey) event.preventDefault()
                }}
                onMouseLeave={() => {
                  if (dismissedHoverId === email.id) setDismissedHoverId(null)
                }}
                role="button"
                tabIndex={0}
              >
                <div
                  className="message-row__check"
                  onClick={(event) => {
                    event.stopPropagation()
                    selectFromPointer(email.id, event, "toggle")
                  }}
                  onMouseDown={(event) => {
                    if (event.shiftKey || event.metaKey) event.preventDefault()
                  }}
                >
                  <Checkbox
                    aria-label={checked ? "Deselect message" : "Select message"}
                    checked={checked}
                    className="message-row__checkbox"
                    onCheckedChange={() => {}}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      selectFromPointer(email.id, event, "toggle")
                    }}
                    tabIndex={-1}
                  />
                  <span className="message-row__mark message-row__avatar">
                    <span className="message-row__avatar-slot">
                      <SenderAvatar
                        email={email.senderEmail}
                        name={email.senderName}
                      />
                    </span>
                  </span>
                </div>
                <div className="message-row__body">
                  <span className="message-row__line">
                    <strong>{email.subject}</strong>
                    <span className="message-row__meta">
                      <time>{formatListTime(email.sentAt, relativeTime)}</time>
                      <UnreadDot
                        onMarkRead={() => onMarkRead(email.id)}
                        read={email.read === true}
                      />
                    </span>
                  </span>
                  <span className="message-row__preview">{email.preview}</span>
                </div>
              </div>
            )
          })
        )}
        {searchOpen && !searchEverywhere ? (
          <div className="message-list__show-all-row">
            <button
              className="message-list__show-all"
              onClick={() => setSearchEverywhere(true)}
              type="button"
            >
              Search everywhere
            </button>
          </div>
        ) : null}
        {!searchOpen && unreadFilterActive ? (
          <div className="message-list__show-all-row">
            <button
              className="message-list__show-all"
              onClick={onClearUnreadFilter}
              type="button"
            >
              Show all emails
            </button>
          </div>
        ) : null}
      </div>
      <div
        aria-hidden={!bulkOpen}
        aria-label="Bulk actions"
        className="message-list__bulk t-panel-slide"
        data-open={bulkOpen ? "true" : "false"}
        inert={!bulkOpen}
        role="toolbar"
      >
        <div className="message-list__bulk-group">
          {BULK_TAG_BUTTONS.map(({ tag, label, shortcut, Icon, ActiveIcon }) => {
            const active =
              bulkEmails.length > 0 &&
              bulkEmails.every((email) => email.tags.includes(tag))
            const Glyph = active ? ActiveIcon : Icon
            return (
              <IconTooltipButton
                aria-pressed={active}
                className={cn("mail-action", active && `active--${tag}`)}
                key={tag}
                label={label}
                onClick={() => onBulkToggleTag(tag)}
                shortcut={shortcut}
                size="icon"
              >
                <Glyph ariaHidden size={15} />
              </IconTooltipButton>
            )
          })}
        </div>
        <span aria-hidden className="toolbar-divider" />
        <div className="message-list__bulk-group">
          <div className="action-cluster">
            <IconTooltipButton
              className="mail-action"
              label="Archive"
              onClick={() => onBulkMove("archive")}
              shortcut={mailShortcuts.archive}
              size="icon"
            >
              <OutlineIcons.archive ariaHidden size={15} />
            </IconTooltipButton>
            <IconTooltipButton
              className="mail-action"
              label="Delete"
              onClick={() => onBulkMove("trash")}
              shortcut={mailShortcuts.delete}
              size="icon"
            >
              <OutlineIcons.trash ariaHidden size={15} />
            </IconTooltipButton>
          </div>
          <span aria-hidden className="toolbar-divider" />
          <div className="action-cluster single">
            <IconTooltipButton
              aria-pressed={askAIOpen}
              className={cn(
                "mail-action reader-ask-ai",
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
              onClick={onBulkAskAI}
              shortcut={mailShortcuts.askAI}
              size="icon"
            >
              <FilledIcons.sparkle
                ariaHidden
                className="sparkle-icon"
                key={aiRunId}
                size={16}
              />
            </IconTooltipButton>
          </div>
        </div>
      </div>
    </section>
  )
}
