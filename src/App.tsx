import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react"

import { useMailKeyboardShortcuts } from "./hooks/use-mail-keyboard-shortcuts"
import {
  applyFontSmoothing,
  persistFontSmoothing,
  readFontSmoothing,
  toggleFontSmoothing,
  type FontSmoothing,
} from "./lib/font-smoothing"
import {
  persistListMinimal,
  readListMinimal,
} from "./lib/list-minimal"
import { persistRelativeTime, readRelativeTime } from "./lib/relative-time"
import {
  persistListRowPaddingY,
  readListRowPaddingY,
} from "./lib/list-row-padding"
import {
  persistListRowStyle,
  readListRowStyle,
  type ListRowStyle,
} from "./lib/list-row-style"
import { cn } from "./lib/utils"

import { PrototypeTuningDocks } from "./components/dev/PrototypeTuningDocks"
import { AIChatPanel } from "./components/mail/AIChatPanel"
import { MessageList } from "./components/mail/MessageList"
import { ReaderPane } from "./components/mail/ReaderPane"
import { Sidebar } from "./components/mail/Sidebar"
import {
  accountInboxCount,
  accounts,
  emailsForView,
  extrasCategoryMeta,
  folderSections,
  initialEmails,
  folderBadgeCounts,
  randomLaterUntil,
  viewMeta,
  type AccountId,
  type Email,
  type ExtrasCategory,
  type Folder,
  type Tag,
  type ViewId,
} from "./data/mail"

export default function App() {
  const [accountId, setAccountId] = useState<AccountId>("personal")
  const [view, setView] = useState<ViewId>("inbox")
  const [emails, setEmails] = useState<Email[]>(initialEmails)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [bulkIds, setBulkIds] = useState<string[]>([])
  const [extrasFilter, setExtrasFilter] = useState<ExtrasCategory | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [askAIOpen, setAskAIOpen] = useState(false)
  const [aiStatus, setAIStatus] = useState<"idle" | "working" | "done">("idle")
  const [aiRunId, setAIRunId] = useState(0)
  const [attachedEmailIds, setAttachedEmailIds] = useState<string[]>([])
  const [mobileView, setMobileView] = useState<"list" | "reader">("list")
  const [focusMode, setFocusMode] = useState(false)
  const [fontSmoothing, setFontSmoothing] = useState<FontSmoothing>(readFontSmoothing)
  const [listRowStyle, setListRowStyle] = useState<ListRowStyle>(readListRowStyle)
  const [listMinimal, setListMinimal] = useState(readListMinimal)
  const [relativeTime, setRelativeTime] = useState(readRelativeTime)
  const [listRowPaddingY, setListRowPaddingY] = useState(readListRowPaddingY)
  const [prototypeTuningVisible, setPrototypeTuningVisible] = useState(false)
  /** True when the reader column would be squeezed below READER_MIN_WIDTH —
   *  list and reader show one at a time, same as the ≤860px narrow layout. */
  const [readerNarrow, setReaderNarrow] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const readerNarrowRef = useRef(false)
  const aiWorkTimerRef = useRef<number | null>(null)
  /** Unread IDs captured when the filter is enabled; list stays fixed until cleared. */
  const [unreadFilterSnapshot, setUnreadFilterSnapshot] = useState<Set<string> | null>(
    null,
  )
  /** Message IDs frozen in the list after toolbar actions until the view changes. */
  const [listSnapshotOrder, setListSnapshotOrder] = useState<string[] | null>(null)

  const allInView = emailsForView(emails, accountId, view)
  const visible =
    view === "extras" && extrasFilter
      ? allInView.filter((email) => email.extrasCategory === extrasFilter)
      : allInView
  const unreadFilterActive = unreadFilterSnapshot !== null
  let displayed = unreadFilterSnapshot
    ? visible.filter((email) => unreadFilterSnapshot.has(email.id))
    : visible
  if (listSnapshotOrder) {
    const emailById = new Map(emails.map((email) => [email.id, email]))
    displayed = listSnapshotOrder
      .map((id) => emailById.get(id))
      .filter((email): email is Email => email !== undefined)
  }
  const selectedEmail =
    (selectedId ? emails.find((email) => email.id === selectedId) : undefined) ??
    displayed[0] ??
    null
  const attachedEmails = attachedEmailIds
    .map((id) => emails.find((email) => email.id === id))
    .filter((email): email is Email => email !== undefined)
  const accountEmails = emails.filter((email) => email.accountId === accountId)

  const extrasChips =
    view === "extras"
      ? [
          { id: null, label: "All" },
          ...extrasCategoryMeta,
        ]
      : undefined

  const accountCounts = {
    personal: accountInboxCount(emails, "personal"),
    work: accountInboxCount(emails, "work"),
  }
  const folderCounts = folderBadgeCounts(emails, accountId)

  function selectAccount(id: AccountId) {
    if (askAIOpen) {
      const nextOpenEmail = emailsForView(emails, id, view)[0]
      setAttachedEmailIds(nextOpenEmail ? [nextOpenEmail.id] : [])
    }
    setAccountId(id)
    setSelectedId(null)
    setBulkIds([])
    setExtrasFilter(null)
    setUnreadFilterSnapshot(null)
    setListSnapshotOrder(null)
    setMobileView("list")
  }

  function selectView(nextView: ViewId) {
    setView(nextView)
    setSelectedId(null)
    setBulkIds([])
    setExtrasFilter(null)
    setUnreadFilterSnapshot(null)
    setListSnapshotOrder(null)
    setMobileView("list")
  }

  function clearUnreadFilter() {
    setUnreadFilterSnapshot(null)
  }

  function toggleUnreadFilter() {
    setListSnapshotOrder(null)
    if (unreadFilterSnapshot) {
      clearUnreadFilter()
      return
    }
    setUnreadFilterSnapshot(
      new Set(visible.filter((email) => !email.read).map((email) => email.id)),
    )
  }

  function emailInLiveList(
    email: Email,
    source: Email[],
    unreadIds: Set<string> | null,
  ): boolean {
    let list = emailsForView(source, accountId, view)
    if (view === "extras" && extrasFilter) {
      list = list.filter((item) => item.extrasCategory === extrasFilter)
    }
    if (unreadIds) {
      list = list.filter((item) => unreadIds.has(item.id))
    }
    return list.some((item) => item.id === email.id)
  }

  function updateSelected(
    update: (email: Email) => Email,
    { freezeList = true }: { freezeList?: boolean } = {},
  ) {
    if (!selectedEmail) return
    // Pin the open email: it may be shown implicitly as the first row without
    // a real selection, and an edit (e.g. unstarring in Starred) must not let
    // the reader fall through to whatever the list shows next.
    setSelectedId(selectedEmail.id)
    const next = emails.map((email) =>
      email.id === selectedEmail.id ? update(email) : email,
    )
    const updated = next.find((email) => email.id === selectedEmail.id)
    if (
      freezeList &&
      updated &&
      !emailInLiveList(updated, next, unreadFilterSnapshot) &&
      !listSnapshotOrder
    ) {
      setListSnapshotOrder(displayed.map((email) => email.id))
    }
    setEmails(next)
  }

  // Tag edits update list membership live: e.g. unstarring in the Starred
  // view drops the row from the list, but the email stays open in the reader
  // (selectedEmail is looked up by id, not via the list).
  const toggleTag = (tag: Tag) =>
    updateSelected((email) => {
      const has = email.tags.includes(tag)
      const tags = has
        ? email.tags.filter((t) => t !== tag)
        : [...email.tags, tag]
      if (tag !== "later") return { ...email, tags }
      return { ...email, tags, laterUntil: has ? null : randomLaterUntil() }
    }, { freezeList: false })

  function moveMessagesToFolder(ids: string[], folder: Folder) {
    if (ids.length === 0) return
    const idSet = new Set(ids)
    const next = emails.map((email) =>
      idSet.has(email.id) ? { ...email, folder } : email,
    )
    setEmails(next)
    setListSnapshotOrder(null)

    if (selectedEmail && idSet.has(selectedEmail.id)) {
      const movedEmail = next.find((email) => email.id === selectedEmail.id)
      if (movedEmail && !emailInLiveList(movedEmail, next, unreadFilterSnapshot)) {
        const remaining = displayed.filter((email) => {
          const updated = next.find((item) => item.id === email.id)
          return updated && emailInLiveList(updated, next, unreadFilterSnapshot)
        })
        const index = displayed.findIndex((email) => email.id === selectedEmail.id)
        const nextEmail = remaining.find((email) =>
          displayed.findIndex((item) => item.id === email.id) > index,
        ) ?? remaining[remaining.length - 1]
        setSelectedId(nextEmail?.id ?? null)
      }
    }
  }

  const moveToFolder = (folder: Folder) => {
    if (selectedEmail) moveMessagesToFolder([selectedEmail.id], folder)
  }

  function updateBulk(update: (email: Email) => Email) {
    if (bulkIds.length === 0) return
    const idSet = new Set(bulkIds)
    setEmails((prev) =>
      prev.map((email) => (idSet.has(email.id) ? update(email) : email)),
    )
  }

  function bulkMove(folder: Folder) {
    moveMessagesToFolder(bulkIds, folder)
    setBulkIds([])
  }

  function bulkToggleTag(tag: Tag) {
    const idSet = new Set(bulkIds)
    const selected = emails.filter((email) => idSet.has(email.id))
    if (selected.length === 0) return
    const allHave = selected.every((email) => email.tags.includes(tag))
    updateBulk((email) => {
      if (allHave) {
        const tags = email.tags.filter((item) => item !== tag)
        if (tag !== "later") return { ...email, tags }
        return { ...email, tags, laterUntil: null }
      }
      if (email.tags.includes(tag)) return email
      const tags = [...email.tags, tag]
      if (tag !== "later") return { ...email, tags }
      return { ...email, tags, laterUntil: randomLaterUntil() }
    })
  }

  function askAboutSelection() {
    if (bulkIds.length === 0) return
    setAttachedEmailIds(bulkIds)
    if (aiStatus === "done") setAIStatus("idle")
    setAskAIOpen(true)
  }

  const bulkActive = bulkIds.length > 0

  function markAllRead() {
    const ids = new Set(allInView.map((email) => email.id))
    setEmails((prev) =>
      prev.map((email) =>
        ids.has(email.id) && !email.read ? { ...email, read: true } : email,
      ),
    )
  }

  function markMessageRead(id: string) {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === id && !email.read ? { ...email, read: true } : email,
      ),
    )
  }

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => !open)
  }, [])

  const toggleAskAI = useCallback(() => {
    if (aiStatus === "done") {
      setAIStatus("idle")
      if (!askAIOpen) {
        setAttachedEmailIds(selectedEmail ? [selectedEmail.id] : [])
      }
      setAskAIOpen(true)
      return
    }

    if (!askAIOpen) {
      setAttachedEmailIds(selectedEmail ? [selectedEmail.id] : [])
    }
    setAskAIOpen((open) => !open)
  }, [aiStatus, askAIOpen, selectedEmail])

  function startAIWork() {
    if (aiWorkTimerRef.current !== null) {
      window.clearTimeout(aiWorkTimerRef.current)
    }

    setAIRunId((runId) => runId + 1)
    setAIStatus("working")
    aiWorkTimerRef.current = window.setTimeout(() => {
      setAIStatus("done")
      aiWorkTimerRef.current = null
    }, 10_000)
  }

  function selectEmail(id: string, additive: boolean) {
    setSelectedId(id)
    setMobileView("reader")
    if (!askAIOpen) return

    setAttachedEmailIds((current) => {
      if (!additive) return [id]
      return current.includes(id) ? current : [...current, id]
    })
  }

  const composeMail = useCallback(() => {
    // Compose flow not implemented in prototype yet.
  }, [])

  const replyMail = useCallback(() => {
    // Reply flow not implemented in prototype yet.
  }, [])

  const forwardMail = useCallback(() => {
    // Forward flow not implemented in prototype yet.
  }, [])

  const navigateMessage = useCallback(
    (direction: "previous" | "next") => {
      if (displayed.length === 0) return
      const index = selectedEmail
        ? displayed.findIndex((email) => email.id === selectedEmail.id)
        : -1
      const nextIndex =
        direction === "next"
          ? Math.min(index + 1, displayed.length - 1)
          : Math.max(index - 1, 0)
      setSelectedId(displayed[nextIndex].id)
    },
    [displayed, selectedEmail],
  )

  const messageNavIndex = selectedEmail
    ? displayed.findIndex((email) => email.id === selectedEmail.id)
    : -1
  const canNavigatePrevious =
    displayed.length > 0 && messageNavIndex > 0
  const canNavigateNext =
    displayed.length > 0 && messageNavIndex < displayed.length - 1
  const aiPanelVisible = askAIOpen && !focusMode

  useMailKeyboardShortcuts({
    onToggleSidebar: toggleSidebar,
    onToggleFocus: () => {
      if (!focusMode) setMobileView("reader")
      setFocusMode(!focusMode)
    },
    onCompose: composeMail,
    onArchive: () => {
      if (bulkActive) bulkMove("archive")
      else if (selectedEmail) moveToFolder("archive")
    },
    onDelete: () => {
      if (bulkActive) bulkMove("trash")
      else if (selectedEmail) moveToFolder("trash")
    },
    onToggleStar: () => {
      if (bulkActive) bulkToggleTag("starred")
      else if (selectedEmail) toggleTag("starred")
    },
    onToggleWaiting: () => {
      if (bulkActive) bulkToggleTag("waiting")
      else if (selectedEmail) toggleTag("waiting")
    },
    onToggleLater: () => {
      if (bulkActive) bulkToggleTag("later")
      else if (selectedEmail) toggleTag("later")
    },
    onReply: replyMail,
    onForward: forwardMail,
    onToggleAskAI: () => {
      if (bulkActive) askAboutSelection()
      else toggleAskAI()
    },
    onTogglePrototypeTuning: () => {
      setPrototypeTuningVisible((visible) => !visible)
    },
    onSwitchAccount: (slot) => {
      const account = accounts[slot - 1]
      if (account) selectAccount(account.id)
    },
  })

  useEffect(() => {
    return () => {
      if (aiWorkTimerRef.current !== null) {
        window.clearTimeout(aiWorkTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    applyFontSmoothing(fontSmoothing)
    persistFontSmoothing(fontSmoothing)
  }, [fontSmoothing])

  useEffect(() => {
    persistListRowStyle(listRowStyle)
  }, [listRowStyle])

  useEffect(() => {
    persistListMinimal(listMinimal)
  }, [listMinimal])

  useEffect(() => {
    persistRelativeTime(relativeTime)
  }, [relativeTime])

  useEffect(() => {
    persistListRowPaddingY(listRowPaddingY)
  }, [listRowPaddingY])

  const onToggleFontSmoothing = useCallback(() => {
    setFontSmoothing((mode) => toggleFontSmoothing(mode))
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, [contenteditable]")) return
      if (displayed.length === 0) return
      event.preventDefault()
      navigateMessage(event.key === "ArrowDown" ? "next" : "previous")
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [displayed.length, navigateMessage])

  useEffect(() => {
    document
      .querySelector(".message-row.selected")
      ?.scrollIntoView({ block: "nearest" })
  }, [selectedEmail])

  // Measure the content area (stable across the single-pane toggle, unlike the
  // reader itself) and derive the reader's two-column width: content minus the
  // fixed list width. Hysteresis (+24px to exit) avoids flicker at the edge.
  // Entering narrow mode on a wide viewport also keeps the reader up front in
  // the same update, so the column tween doesn't start toward the list and reverse.
  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const observer = new ResizeObserver((entries) => {
      const contentWidth = entries[0]?.contentRect.width ?? 0
      const prev = readerNarrowRef.current
      const listWidth = focusMode ? 0 : 338
      const threshold = listWidth + (prev ? 504 : 480)
      const next = contentWidth < threshold
      if (next === prev) return
      readerNarrowRef.current = next
      if (next && window.matchMedia("(min-width: 861px)").matches) {
        setMobileView("reader")
      }
      setReaderNarrow(next)
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [focusMode])

  useEffect(() => {
    const openId = selectedEmail?.id
    if (!openId || selectedEmail.read) return

    const timeout = window.setTimeout(() => {
      setEmails((prev) =>
        prev.map((email) =>
          email.id === openId ? { ...email, read: true } : email,
        ),
      )
    }, 5000)

    return () => window.clearTimeout(timeout)
  }, [selectedEmail?.id, selectedEmail?.read])

  return (
    <main className="app-canvas">
      <section
        className={cn(
          "mail-app",
          !sidebarOpen && "mail-app--sidebar-collapsed",
          focusMode && "mail-app--focus",
          readerNarrow && "mail-app--reader-narrow",
        )}
        aria-label="Mail prototype"
        data-list-minimal={listMinimal ? "true" : undefined}
        data-list-row-style={listRowStyle}
        style={
          {
            "--message-row-padding-y": `${listRowPaddingY}px`,
          } as CSSProperties
        }
      >
        <Sidebar
          accountCounts={accountCounts}
          accounts={accounts}
          folderCounts={folderCounts}
          onCompose={composeMail}
          onEnterFocus={() => {
            setFocusMode(true)
            setMobileView("reader")
          }}
          onSelectAccount={selectAccount}
          onSelectView={selectView}
          fontSmoothingAntialiased={fontSmoothing === "antialiased"}
          onToggleFontSmoothing={onToggleFontSmoothing}
          onToggleSidebar={toggleSidebar}
          sections={folderSections}
          selectedAccount={accountId}
          selectedView={view}
        />
        <div className="mail-workspace">
          <div
            className="mail-content t-page-slide"
            data-page={mobileView === "list" ? "1" : "2"}
            ref={contentRef}
          >
            <MessageList
              activeChip={extrasFilter}
              aiRunId={aiRunId}
              aiStatus={aiStatus}
              askAIOpen={askAIOpen}
              bulkIds={bulkIds}
              chips={extrasChips}
              accountEmails={accountEmails}
              accountId={accountId}
              emails={displayed}
              hasUnread={allInView.some((email) => !email.read)}
              meta={viewMeta(view)}
              relativeTime={relativeTime}
              onBulkAskAI={askAboutSelection}
              onBulkIdsChange={setBulkIds}
              onBulkMove={bulkMove}
              onBulkToggleTag={bulkToggleTag}
              onClearUnreadFilter={clearUnreadFilter}
              onCompose={composeMail}
              onMarkAllRead={markAllRead}
              onMarkRead={markMessageRead}
              onSelect={selectEmail}
              onSelectChip={(chip) => {
                setListSnapshotOrder(null)
                setExtrasFilter(chip)
              }}
              onToggleAskAI={toggleAskAI}
              onToggleSidebar={toggleSidebar}
              onToggleUnreadFilter={toggleUnreadFilter}
              selectedId={selectedEmail?.id ?? null}
              sidebarOpen={sidebarOpen}
              unreadFilterActive={unreadFilterActive}
            />
            <ReaderPane
              aiRunId={aiRunId}
              aiStatus={aiStatus}
              askAIOpen={askAIOpen}
              canNavigateNext={canNavigateNext}
              canNavigatePrevious={canNavigatePrevious}
              message={selectedEmail}
              onBack={() => setMobileView("list")}
              onExitFocus={() => setFocusMode(false)}
              onMove={moveToFolder}
              onNavigateNext={() => navigateMessage("next")}
              onNavigatePrevious={() => navigateMessage("previous")}
              onToggleAskAI={toggleAskAI}
              onToggleTag={toggleTag}
            />
          </div>
        </div>
        <aside
          aria-hidden={!aiPanelVisible}
          aria-label="Ask AI"
          className="ai-panel t-resize"
          data-open={aiPanelVisible}
          inert={!aiPanelVisible}
        >
          <AIChatPanel
            accountEmails={accountEmails}
            attachedEmails={attachedEmails}
            isOpen={aiPanelVisible}
            onClose={() => setAskAIOpen(false)}
            onAddEmail={(id) => {
              setAttachedEmailIds((current) =>
                current.includes(id) ? current : [...current, id],
              )
            }}
            onClearEmails={() => setAttachedEmailIds([])}
            onSend={startAIWork}
          />
        </aside>
      </section>
      {prototypeTuningVisible ? (
        <PrototypeTuningDocks
          listMinimal={listMinimal}
          listRowPaddingY={listRowPaddingY}
          relativeTime={relativeTime}
          onChange={setListRowStyle}
          onListMinimalChange={setListMinimal}
          onListRowPaddingYChange={setListRowPaddingY}
          onRelativeTimeChange={setRelativeTime}
          value={listRowStyle}
        />
      ) : null}
    </main>
  )
}
