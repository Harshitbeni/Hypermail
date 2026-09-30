/* eslint-disable react-refresh/only-export-components */
import {
  IconArchive1,
  IconArrowLeft,
  IconArrowShareLeft,
  IconArrowShareRight,
  IconArrowUp,
  IconCalendar2,
  IconChevronBottom,
  IconChevronDownMedium,
  IconChevronDownSmall,
  IconChevronTop,
  IconChevronTopMedium,
  IconCircleBanSign,
  IconCrossLarge,
  IconDotGrid1x3HorizontalTight,
  IconEmail2Block,
  IconDoubleCheckmark1,
  IconFilter2,
  IconHourglass2,
  IconInboxEmpty,
  IconMagnifyingGlass,
  IconMegaphone,
  IconMicrophone,
  IconNewspaper,
  IconPaperclip2,
  IconPencil,
  IconPlusMedium,
  IconReceiptTax,
  IconScript,
  IconSettingsGear2,
  IconSidebarSimpleLeftWide,
  IconStar,
  IconTarget,
  IconTrashCan,
  IconTrashCanSimple,
} from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import {
  IconArchive1 as IconArchive1Filled,
  IconCalendar2 as IconCalendar2Filled,
  IconCircleBanSign as IconCircleBanSignFilled,
  IconFilter2 as IconFilter2Filled,
  IconHourglass2 as IconHourglass2Filled,
  IconInboxEmpty as IconInboxEmptyFilled,
  IconMegaphone as IconMegaphoneFilled,
  IconNewspaper as IconNewspaperFilled,
  IconReceiptTax as IconReceiptTaxFilled,
  IconScript as IconScriptFilled,
  IconSend as IconSendFilled,
  IconSparkle as IconSparkleFilled,
  IconStar as IconStarFilled,
  IconSuitcase as IconSuitcaseFilled,
  IconTrashCan as IconTrashCanFilled,
  IconUser as IconUserFilled,
} from "@central-icons-react/round-filled-radius-2-stroke-1.5"

import type { AccountIcon, ExtrasCategory, FolderIcon } from "../../data/mail"

export type CentralIcon = typeof IconArchive1

export const extrasCategoryIcons = {
  newsletters: IconScript,
  receipts: IconReceiptTax,
  promotions: IconMegaphone,
} satisfies Record<ExtrasCategory, CentralIcon>

export const extrasCategoryFilledIcons = {
  newsletters: IconScriptFilled,
  receipts: IconReceiptTaxFilled,
  promotions: IconMegaphoneFilled,
} satisfies Record<ExtrasCategory, CentralIcon>

export const OutlineIcons = {
  archive: IconArchive1,
  arrowUp: IconArrowUp,
  back: IconArrowLeft,
  reply: IconArrowShareLeft,
  forward: IconArrowShareRight,
  later: IconCalendar2,
  chevronBottom: IconChevronBottom,
  chevronDown: IconChevronDownMedium,
  chevronDownSmall: IconChevronDownSmall,
  chevronTop: IconChevronTop,
  chevronUp: IconChevronTopMedium,
  spam: IconEmail2Block,
  filter: IconFilter2,
  focus: IconTarget,
  waiting: IconHourglass2,
  inbox: IconInboxEmpty,
  markAllRead: IconDoubleCheckmark1,
  search: IconMagnifyingGlass,
  more: IconDotGrid1x3HorizontalTight,
  compose: IconPencil,
  cross: IconCrossLarge,
  microphone: IconMicrophone,
  paperclip: IconPaperclip2,
  plus: IconPlusMedium,
  settings: IconSettingsGear2,
  sidebarToggle: IconSidebarSimpleLeftWide,
  star: IconStar,
  trash: IconTrashCanSimple,
} satisfies Record<string, CentralIcon>

const FolderOutlineIcons = {
  inbox: IconInboxEmpty,
  extras: IconNewspaper,
  archive: IconArchive1,
  star: IconStar,
  waiting: IconHourglass2,
  later: IconCalendar2,
  trash: IconTrashCan,
  spam: IconCircleBanSign,
} satisfies Record<FolderIcon, CentralIcon>

const FolderFilledIcons = {
  inbox: IconInboxEmptyFilled,
  extras: IconNewspaperFilled,
  archive: IconArchive1Filled,
  star: IconStarFilled,
  waiting: IconHourglass2Filled,
  later: IconCalendar2Filled,
  trash: IconTrashCanFilled,
  spam: IconCircleBanSignFilled,
} satisfies Record<FolderIcon, CentralIcon>

export const FilledIcons = {
  extras: IconNewspaperFilled,
  filter: IconFilter2Filled,
  inbox: IconInboxEmptyFilled,
  later: IconCalendar2Filled,
  personal: IconUserFilled,
  send: IconSendFilled,
  sparkle: IconSparkleFilled,
  star: IconStarFilled,
  waiting: IconHourglass2Filled,
  work: IconSuitcaseFilled,
} satisfies Record<string, CentralIcon>

export function accountIcon(icon: AccountIcon) {
  return FilledIcons[icon]
}

export function folderIcon(icon: FolderIcon, selected = false) {
  if (selected) return FolderFilledIcons[icon]
  return FolderOutlineIcons[icon]
}
