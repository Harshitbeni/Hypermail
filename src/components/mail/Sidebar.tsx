import { useEffect, useState } from "react"

import {
  moreInboxFolders,
  moreInboxViewIds,
  type Account,
  type AccountId,
  type FolderDef,
  type FolderSection,
  type ViewId,
} from "../../data/mail"
import { mailShortcuts } from "../../lib/keyboard-shortcuts"
import { cn } from "../../lib/utils"
import { IconTooltipButton } from "../ui/icon-tooltip-button"
import { CountBadge } from "./CountBadge"
import { accountIcon, folderIcon, OutlineIcons } from "./icons"

interface SidebarProps {
  accounts: Account[]
  sections: FolderSection[]
  accountCounts: Record<AccountId, number>
  folderCounts: Partial<Record<ViewId, number>>
  selectedAccount: AccountId
  selectedView: ViewId
  onSelectAccount: (id: AccountId) => void
  onSelectView: (view: ViewId) => void
  onToggleSidebar: () => void
  onCompose: () => void
  onEnterFocus: () => void
  onToggleFontSmoothing: () => void
  fontSmoothingAntialiased: boolean
}

const accountKeyShortcuts: Record<AccountId, string> = {
  personal: "Control+1",
  work: "Control+2",
}

interface AccountCardProps {
  account: Account
  count: number
  selected: boolean
  onSelect: () => void
}

function AccountCard({ account, count, selected, onSelect }: AccountCardProps) {
  const Icon = accountIcon(account.icon)

  return (
    <button
      aria-keyshortcuts={accountKeyShortcuts[account.id]}
      aria-pressed={selected}
      className={selected ? "account-card selected" : "account-card"}
      onClick={onSelect}
      type="button"
    >
      <span className="account-card__top">
        <Icon
          ariaHidden
          className={account.icon === "work" ? "account-icon work" : "account-icon"}
          size={15}
        />
        <CountBadge count={count} />
      </span>
      <span className="account-card__label">{account.label}</span>
    </button>
  )
}

interface FolderRowButtonProps {
  folder: FolderDef
  selected: boolean
  count?: number
  onSelect: () => void
}

interface FolderSectionHeaderProps {
  label: string
  collapsed: boolean
  onToggle: () => void
}

function FolderSectionHeader({ label, collapsed, onToggle }: FolderSectionHeaderProps) {
  return (
    <button
      aria-expanded={!collapsed}
      className={cn(
        "folder-section__header",
        collapsed && "folder-section__header--collapsed",
      )}
      onClick={onToggle}
      type="button"
    >
      <span className="folder-section__title">{label}</span>
      <OutlineIcons.chevronDown
        ariaHidden
        className="folder-section__chevron"
        size={14}
      />
    </button>
  )
}

function FolderRowButton({ folder, selected, count, onSelect }: FolderRowButtonProps) {
  const Icon = folderIcon(folder.icon, selected)

  return (
    <button
      aria-current={selected || undefined}
      className={selected ? "folder-row selected" : "folder-row"}
      onClick={onSelect}
      type="button"
    >
      <Icon ariaHidden size={15} />
      <span className="folder-row__label">{folder.label}</span>
      {folder.showCount && (count ?? 0) > 0 ? (
        <CountBadge count={count ?? 0} />
      ) : null}
    </button>
  )
}

export function Sidebar({
  accounts,
  sections,
  accountCounts,
  folderCounts,
  selectedAccount,
  selectedView,
  onSelectAccount,
  onSelectView,
  onToggleSidebar,
  onCompose,
  onEnterFocus,
  onToggleFontSmoothing,
  fontSmoothingAntialiased,
}: SidebarProps) {
  const [moreInboxesOpen, setMoreInboxesOpen] = useState(() =>
    moreInboxViewIds.has(selectedView),
  )
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(
    {},
  )

  function toggleSection(sectionId: string) {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  useEffect(() => {
    if (moreInboxViewIds.has(selectedView)) {
      setMoreInboxesOpen(true)
    }
  }, [selectedView])

  return (
    <aside className="sidebar t-resize">
      <div className="sidebar__inner">
      <header className="sidebar-toolbar">
        <IconTooltipButton
          className="sidebar-control"
          label="Toggle sidebar"
          onClick={onToggleSidebar}
          shortcut={mailShortcuts.toggleSidebar}
          size="icon"
        >
          <OutlineIcons.sidebarToggle ariaHidden size={15} />
        </IconTooltipButton>
        <div className="sidebar-toolbar__actions">
          <IconTooltipButton
            className="sidebar-control"
            label="Focus mode"
            onClick={onEnterFocus}
            shortcut={mailShortcuts.focusMode}
            size="icon"
          >
            <OutlineIcons.focus ariaHidden size={15} />
          </IconTooltipButton>
          <IconTooltipButton
            className="sidebar-control"
            label="Compose mail"
            onClick={onCompose}
            shortcut={mailShortcuts.compose}
            size="icon"
          >
            <OutlineIcons.compose ariaHidden size={15} />
          </IconTooltipButton>
        </div>
      </header>

      <div className="account-grid">
        {accounts.map((account) => (
          <AccountCard
            account={account}
            count={accountCounts[account.id]}
            key={account.id}
            onSelect={() => onSelectAccount(account.id)}
            selected={account.id === selectedAccount}
          />
        ))}
      </div>

      {sections.map((section) => {
        const collapsed = collapsedSections[section.id] ?? false
        return (
        <section className="folder-section" key={section.id}>
          <FolderSectionHeader
            collapsed={collapsed}
            label={section.label}
            onToggle={() => toggleSection(section.id)}
          />
          {!collapsed ? (
          <div className="folder-list">
            {section.id === "inboxes" ? (
              <>
                {section.folders.map((folder) => (
                  <FolderRowButton
                    count={folderCounts[folder.id]}
                    folder={folder}
                    key={folder.id}
                    onSelect={() => onSelectView(folder.id)}
                    selected={folder.id === selectedView}
                  />
                ))}
                {moreInboxesOpen ? (
                  <>
                    {moreInboxFolders.map((folder) => (
                      <FolderRowButton
                        count={folderCounts[folder.id]}
                        folder={folder}
                        key={folder.id}
                        onSelect={() => onSelectView(folder.id)}
                        selected={folder.id === selectedView}
                      />
                    ))}
                    <button
                      className="folder-row folder-row--toggle"
                      onClick={() => setMoreInboxesOpen(false)}
                      type="button"
                    >
                      <OutlineIcons.chevronUp ariaHidden size={15} />
                      <span className="folder-row__label">Hide</span>
                    </button>
                  </>
                ) : (
                  <button
                    className="folder-row folder-row--toggle"
                    onClick={() => setMoreInboxesOpen(true)}
                    type="button"
                  >
                    <OutlineIcons.chevronDown ariaHidden size={15} />
                    <span className="folder-row__label">Show more</span>
                  </button>
                )}
              </>
            ) : (
              section.folders.map((folder) => (
                <FolderRowButton
                  count={folderCounts[folder.id]}
                  folder={folder}
                  key={folder.id}
                  onSelect={() => onSelectView(folder.id)}
                  selected={folder.id === selectedView}
                />
              ))
            )}
          </div>
          ) : null}
        </section>
        )
      })}

      <button
        aria-pressed={fontSmoothingAntialiased}
        className="sidebar-settings"
        onClick={onToggleFontSmoothing}
        type="button"
      >
        <OutlineIcons.settings ariaHidden size={15} />
        <span>Settings</span>
      </button>
      </div>
    </aside>
  )
}
