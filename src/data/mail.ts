import { emailBodies } from "./email-bodies"

export type AccountId = "personal" | "work"
export type AccountIcon = "personal" | "work"
export type Mailbox = "inbox" | "extras"
export type ExtrasCategory = "newsletters" | "receipts" | "promotions"
export type Tag = "starred" | "waiting" | "later"
export type Folder = "archive" | "trash" | "spam"
export type ViewId = Mailbox | Tag | Folder
export type FolderIcon =
  | "inbox"
  | "extras"
  | "archive"
  | "star"
  | "waiting"
  | "later"
  | "trash"
  | "spam"

export interface Account {
  id: AccountId
  label: string
  icon: AccountIcon
}

export interface FolderDef {
  id: ViewId
  label: string
  icon: FolderIcon
  showCount?: boolean
}

export interface FolderSection {
  id: string
  label: string
  folders: FolderDef[]
}

export interface Email {
  id: string
  accountId: AccountId
  mailbox: Mailbox
  tags: Tag[]
  folder: Folder | null
  laterUntil?: string | null
  extrasCategory?: ExtrasCategory
  subject: string
  senderName: string
  senderEmail: string
  recipient: string
  cc?: string[]
  bcc?: string[]
  replyTo?: string
  sentAt: string
  preview: string
  bodyHtml: string
  read?: boolean
}

export const accounts: Account[] = [
  { id: "personal", label: "Personal", icon: "personal" },
  { id: "work", label: "Work", icon: "work" },
]

export const moreInboxFolders: FolderDef[] = [
  { id: "archive", label: "Archive", icon: "archive" },
  { id: "trash", label: "Trash", icon: "trash" },
  { id: "spam", label: "Spam", icon: "spam" },
]

export const moreInboxViewIds = new Set<ViewId>(
  moreInboxFolders.map((folder) => folder.id),
)

export const folderSections: FolderSection[] = [
  {
    id: "inboxes",
    label: "Inboxes",
    folders: [
      { id: "inbox", label: "Primary", icon: "inbox" },
      { id: "extras", label: "Extras", icon: "extras" },
    ],
  },
  {
    id: "tags",
    label: "Tags",
    folders: [
      { id: "starred", label: "Starred", icon: "star", showCount: true },
      { id: "waiting", label: "Waiting", icon: "waiting", showCount: true },
      { id: "later", label: "Later", icon: "later", showCount: true },
    ],
  },
]

const folderIndex = new Map(
  [
    ...folderSections.flatMap((section) => section.folders),
    ...moreInboxFolders,
  ].map((folder) => [folder.id, folder] as const),
)

export function viewMeta(view: ViewId): FolderDef {
  const meta = folderIndex.get(view)
  if (!meta) throw new Error(`Unknown view: ${view}`)
  return meta
}

export const extrasCategoryMeta: { id: ExtrasCategory; label: string }[] = [
  { id: "newsletters", label: "Newsletter" },
  { id: "receipts", label: "Receipt" },
  { id: "promotions", label: "Promotions" },
]

/** Categories present in an account's Extras, in display order. */
export function extrasCategoriesFor(
  emails: Email[],
  accountId: AccountId,
): { id: ExtrasCategory; label: string }[] {
  const present = new Set(
    emails
      .filter(
        (email) =>
          email.accountId === accountId &&
          email.folder === null &&
          email.mailbox === "extras" &&
          email.extrasCategory,
      )
      .map((email) => email.extrasCategory as ExtrasCategory),
  )
  return extrasCategoryMeta.filter((meta) => present.has(meta.id))
}

/** Fixed point in time so dates render deterministically. */
const REFERENCE_NOW = new Date(2026, 8, 28, 14, 30)

const at = (day: number, hour: number, minute: number) =>
  new Date(2026, 8, day, hour, minute).toISOString()

const PERSONAL = "harshitbenis@gmail.com"
const WORK = "harshit@acme.com"

const emailDrafts: Omit<Email, "bodyHtml">[] = [
  // Personal inbox
  {
    id: "costco-receipt",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: null,
    subject: "Your Costco order receipt",
    senderName: "Costco Wholesale",
    senderEmail: "no-reply@costco.com",
    recipient: PERSONAL,
    sentAt: at(28, 14, 8),
    preview: "Receipt for your order HARSHIT, here's your receipt…",
  },
  {
    id: "instacart-receipt",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: null,
    subject: "Your Instacart order receipt",
    senderName: "Instacart",
    senderEmail: "no-reply@instacart.com",
    recipient: PERSONAL,
    sentAt: at(28, 13, 15),
    preview: "Your order from Sprouts is on the way. 14 items…",
  },
  {
    id: "eagle-package",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: null,
    subject: "The eagle has landed-- your package is ready",
    senderName: "Other",
    senderEmail: "support@other.com",
    recipient: PERSONAL,
    sentAt: at(28, 12, 47),
    preview: "Hi Harshit, Good news! Your package from Oth…",
  },
  {
    id: "priya-dinner",
    accountId: "personal",
    mailbox: "inbox",
    tags: ["later"],
    folder: null,
    laterUntil: at(29, 9, 0),
    subject: "Dinner on Friday?",
    senderName: "Priya Anand",
    senderEmail: "priya.anand@gmail.com",
    recipient: PERSONAL,
    cc: ["maya.beni@gmail.com"],
    sentAt: at(28, 10, 2),
    preview: "Are we still on for Friday? I can book the usual place…",
  },
  {
    id: "united-trip",
    accountId: "personal",
    mailbox: "inbox",
    tags: ["later", "starred"],
    folder: null,
    laterUntil: at(35, 9, 0),
    read: true,
    subject: "Your upcoming trip to Denver",
    senderName: "United Airlines",
    senderEmail: "unitedairlines@united.com",
    recipient: PERSONAL,
    sentAt: at(27, 19, 41),
    preview: "Your flight UA 1182 departs SFO at 8:25 AM on Oct 3…",
  },
  {
    id: "lease-renewal",
    accountId: "personal",
    mailbox: "inbox",
    tags: ["waiting"],
    folder: null,
    read: true,
    subject: "Re: Lease renewal",
    senderName: "Riverside Apartments",
    senderEmail: "leasing@riversideapts.com",
    recipient: PERSONAL,
    bcc: ["harshitbenis@gmail.com"],
    sentAt: at(27, 16, 20),
    preview: "Thanks for sending the signed copy. We'll confirm…",
  },
  {
    id: "chase-statement",
    accountId: "personal",
    mailbox: "inbox",
    tags: ["later"],
    folder: null,
    laterUntil: at(30, 9, 0),
    read: true,
    subject: "Your September statement is ready",
    senderName: "Chase",
    senderEmail: "no-reply@alertsp.chase.com",
    recipient: PERSONAL,
    sentAt: at(25, 9, 0),
    preview: "Your statement for account ending 4471 is available…",
  },
  // Personal extras
  {
    id: "pragmatic-engineer",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    subject: "Why backends fail at scale",
    senderName: "The Pragmatic Engineer",
    senderEmail: "newsletter@pragmaticengineer.com",
    recipient: PERSONAL,
    replyTo: "gergely@pragmaticengineer.com",
    sentAt: at(28, 9, 15),
    preview: "This week: queues, retries, and the thundering herd…",
  },
  {
    id: "product-hunt",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    read: true,
    subject: "Today's top products",
    senderName: "Product Hunt",
    senderEmail: "digest@producthunt.com",
    recipient: PERSONAL,
    sentAt: at(27, 8, 5),
    preview: "A mailbox that triages itself, plus 9 more launches…",
  },
  {
    id: "spotify-mix",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "promotions",
    tags: ["starred"],
    folder: null,
    read: true,
    subject: "Your midyear mix is here",
    senderName: "Spotify",
    senderEmail: "no-reply@spotify.com",
    recipient: PERSONAL,
    sentAt: at(24, 12, 30),
    preview: "We made a playlist from your most-played tracks…",
  },
  {
    id: "apple-receipt",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "receipts",
    tags: [],
    folder: null,
    subject: "Your receipt from Apple",
    senderName: "Apple",
    senderEmail: "no_reply@email.apple.com",
    recipient: PERSONAL,
    sentAt: at(27, 20, 14),
    preview: "Your purchase at the Apple Online Store. Total $149.00…",
  },
  {
    id: "opentable-friday",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    subject: "Reservation confirmed: Friday 7 PM",
    senderName: "OpenTable",
    senderEmail: "confirmations@opentable.com",
    recipient: PERSONAL,
    sentAt: at(28, 8, 2),
    preview: "Tartine Manufactory, table for 2. See you Friday…",
  },
  {
    id: "jcrew-sale",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "promotions",
    tags: [],
    folder: null,
    read: true,
    subject: "Extra 40% off sale styles",
    senderName: "J.Crew",
    senderEmail: "email@jcrew.com",
    recipient: PERSONAL,
    sentAt: at(26, 13, 40),
    preview: "Today only. Use code EXTRA40 at checkout…",
  },
  // Personal archive
  {
    id: "airbnb-jtree",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: "archive",
    subject: "Your stay in Joshua Tree",
    senderName: "Airbnb",
    senderEmail: "automated@airbnb.com",
    recipient: PERSONAL,
    sentAt: at(12, 18, 22),
    preview: "Booking confirmed for Nov 14–16. Check-in after 3 PM…",
  },
  {
    id: "maya-photos",
    accountId: "personal",
    mailbox: "inbox",
    tags: ["starred"],
    folder: "archive",
    subject: "Photos from the trip",
    senderName: "Maya Beni",
    senderEmail: "maya.beni@gmail.com",
    recipient: PERSONAL,
    sentAt: at(8, 21, 9),
    preview: "Finally uploaded them all — the sunset ones are…",
  },
  // Personal trash
  {
    id: "linkedin-invites",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: "trash",
    subject: "You have 3 new invitations",
    senderName: "LinkedIn",
    senderEmail: "messages-noreply@linkedin.com",
    recipient: PERSONAL,
    sentAt: at(20, 7, 45),
    preview: "People you may know are waiting to connect…",
  },
  // Personal spam
  {
    id: "prize-claim",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: "spam",
    subject: "You've won a $500 gift card",
    senderName: "Prize Center",
    senderEmail: "winner@prize-claim.xyz",
    recipient: PERSONAL,
    sentAt: at(22, 3, 12),
    preview: "Congratulations! Claim your reward within 24 hours…",
  },
  // Work inbox
  {
    id: "github-pr42",
    accountId: "work",
    mailbox: "inbox",
    tags: ["starred"],
    folder: null,
    subject: "[mail-app] PR #42: Fix list virtualization",
    senderName: "GitHub",
    senderEmail: "notifications@github.com",
    recipient: WORK,
    sentAt: at(28, 13, 40),
    preview: "leoacme requested your review on this pull request…",
  },
  {
    id: "jira-218",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: null,
    subject: "MAIL-218 moved to In Review",
    senderName: "Jira",
    senderEmail: "jira@acme.atlassian.net",
    recipient: WORK,
    sentAt: at(28, 11, 5),
    preview: "Sarah Kim moved this issue from In Progress…",
  },
  {
    id: "sarah-q4",
    accountId: "work",
    mailbox: "inbox",
    tags: ["waiting", "starred"],
    folder: null,
    subject: "Q4 planning doc — feedback?",
    senderName: "Sarah Kim",
    senderEmail: "sarah.kim@acme.com",
    recipient: WORK,
    cc: ["eng-leads@acme.com"],
    sentAt: at(28, 9, 48),
    preview: "Could you read section 3 before Thursday's review…",
  },
  {
    id: "figma-mention",
    accountId: "work",
    mailbox: "inbox",
    tags: ["later"],
    folder: null,
    laterUntil: at(32, 9, 0),
    read: true,
    subject: "Leo mentioned you in Mail app refresh",
    senderName: "Figma",
    senderEmail: "team@figma.com",
    recipient: WORK,
    sentAt: at(27, 17, 56),
    preview: "\"@harshit can we ship the compact density toggle…\"",
  },
  {
    id: "vercel-deploy",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: null,
    read: true,
    subject: "Deployment failed: mail-web",
    senderName: "Vercel",
    senderEmail: "notifications@vercel.com",
    recipient: WORK,
    sentAt: at(27, 15, 11),
    preview: "Build failed on commit 9f31ac2. Error: ENOMEM…",
  },
  {
    id: "it-password",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: null,
    read: true,
    subject: "Password rotation reminder",
    senderName: "Acme IT",
    senderEmail: "it-help@acme.com",
    recipient: WORK,
    sentAt: at(25, 10, 30),
    preview: "Your password expires in 6 days. Rotate it via Okta…",
  },
  // Work extras
  {
    id: "linear-changelog",
    accountId: "work",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    subject: "Linear changelog — September",
    senderName: "Linear",
    senderEmail: "changelog@linear.app",
    recipient: WORK,
    replyTo: "support@linear.app",
    sentAt: at(26, 8, 0),
    preview: "New: triage responsibilities, initiative updates…",
  },
  {
    id: "npm-weekly",
    accountId: "work",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    read: true,
    subject: "npm weekly #204",
    senderName: "npm",
    senderEmail: "weekly@npmjs.com",
    recipient: WORK,
    sentAt: at(24, 14, 20),
    preview: "This week in the registry: provenance GA, new docs…",
  },
  {
    id: "so-digest",
    accountId: "work",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    read: true,
    subject: "Top questions this week",
    senderName: "Stack Overflow",
    senderEmail: "do-not-reply@stackoverflow.email",
    recipient: WORK,
    sentAt: at(23, 9, 10),
    preview: "React 19: when does use() suspend? and 14 more…",
  },
  {
    id: "aws-invoice",
    accountId: "work",
    mailbox: "extras",
    extrasCategory: "receipts",
    tags: [],
    folder: null,
    subject: "Your AWS invoice is available",
    senderName: "Amazon Web Services",
    senderEmail: "no-reply-aws@amazon.com",
    recipient: WORK,
    sentAt: at(25, 7, 30),
    preview: "Invoice #INV-2049-118 for September: $312.44…",
  },
  {
    id: "gcp-next",
    accountId: "work",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    subject: "Google Cloud Next '26: registration open",
    senderName: "Google Cloud",
    senderEmail: "noreply-cloud@google.com",
    recipient: WORK,
    sentAt: at(24, 16, 5),
    preview: "Join us April 14–16 in Las Vegas. Early-bird ends…",
  },
  // Work archive
  {
    id: "greenhouse-app",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: "archive",
    subject: "New application: Product Designer",
    senderName: "Greenhouse",
    senderEmail: "no-reply@greenhouse.io",
    recipient: WORK,
    sentAt: at(15, 13, 2),
    preview: "A new candidate applied to the Product Designer role…",
  },
  {
    id: "zoom-recording",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: "archive",
    subject: "Meeting recording is ready",
    senderName: "Zoom",
    senderEmail: "no-reply@zoom.us",
    recipient: WORK,
    sentAt: at(10, 16, 44),
    preview: "The recording of \"Design sync\" is now available…",
  },
  // Work trash
  {
    id: "crypto-webinar",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: "trash",
    subject: "Calendar invite: Crypto webinar",
    senderName: "Webinar Team",
    senderEmail: "events@crypto-webinar.info",
    recipient: WORK,
    sentAt: at(18, 11, 33),
    preview: "You are invited: Scaling your portfolio in 2026…",
  },
  // Work spam
  {
    id: "seo-boost",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: "spam",
    subject: "Your website is losing traffic",
    senderName: "SEO Boost",
    senderEmail: "rank@seo-boost.biz",
    recipient: WORK,
    sentAt: at(21, 5, 27),
    preview: "We noticed your rankings dropped. Act now to…",
  },
  // Personal inbox
  {
    id: "doordash-thai",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: null,
    subject: "Your DoorDash order receipt",
    senderName: "DoorDash",
    senderEmail: "no-reply@doordash.com",
    recipient: PERSONAL,
    sentAt: at(28, 11, 22),
    preview: "Order from Kin Khao. Pad see ew, green curry, and…",
  },
  {
    id: "amazon-delivered",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: null,
    subject: "Delivered: Kindle Paperwhite",
    senderName: "Amazon.com",
    senderEmail: "shipment-tracking@amazon.com",
    recipient: PERSONAL,
    sentAt: at(28, 9, 4),
    preview: "Your package was left at the front door at 8:51 AM…",
  },
  {
    id: "rohan-hike",
    accountId: "personal",
    mailbox: "inbox",
    tags: ["later"],
    folder: null,
    laterUntil: at(30, 9, 0),
    subject: "Saturday at Lands End?",
    senderName: "Rohan Mehta",
    senderEmail: "rohan.mehta@gmail.com",
    recipient: PERSONAL,
    sentAt: at(28, 8, 16),
    preview: "If the fog lifts I want to do the Lands End trail…",
  },
  {
    id: "kaiser-labs",
    accountId: "personal",
    mailbox: "inbox",
    tags: ["starred"],
    folder: null,
    subject: "Your lab results are ready",
    senderName: "Kaiser Permanente",
    senderEmail: "donotreply@kp.org",
    recipient: PERSONAL,
    sentAt: at(27, 15, 18),
    preview: "Results from your Sep 24 blood draw are in the portal…",
  },
  {
    id: "pge-bill",
    accountId: "personal",
    mailbox: "inbox",
    tags: ["later"],
    folder: null,
    laterUntil: at(31, 9, 0),
    read: true,
    subject: "Your September energy bill",
    senderName: "PG&E",
    senderEmail: "no-reply@pge.com",
    recipient: PERSONAL,
    sentAt: at(26, 8, 12),
    preview: "Amount due $86.40. AutoPay will draft on Oct 12…",
  },
  {
    id: "venmo-maya",
    accountId: "personal",
    mailbox: "inbox",
    tags: ["waiting"],
    folder: null,
    subject: "Maya Beni requests $42.00",
    senderName: "Venmo",
    senderEmail: "venmo@venmo.com",
    recipient: PERSONAL,
    sentAt: at(27, 19, 5),
    preview: "For dinner at Tartine — you can pay in the app…",
  },
  {
    id: "anil-birthday",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: null,
    read: true,
    subject: "Re: Mom's birthday dinner",
    senderName: "Anil Beni",
    senderEmail: "anil.beni@gmail.com",
    recipient: PERSONAL,
    cc: ["maya.beni@gmail.com"],
    sentAt: at(24, 20, 11),
    preview: "Sunday at 6 works. I'll pick up the cake on the way…",
  },
  // Personal extras
  {
    id: "lenny-review",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    subject: "How to run a product review",
    senderName: "Lenny's Newsletter",
    senderEmail: "lenny@lennysnewsletter.com",
    recipient: PERSONAL,
    replyTo: "lenny@lennyrachitsky.com",
    sentAt: at(28, 7, 5),
    preview: "A one-page agenda that keeps the room honest…",
  },
  {
    id: "morning-brew",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    read: true,
    subject: "Markets open higher, again",
    senderName: "Morning Brew",
    senderEmail: "crew@morningbrew.com",
    recipient: PERSONAL,
    sentAt: at(28, 5, 30),
    preview: "The Fed held, coffee prices didn't, and a 3-minute brief…",
  },
  {
    id: "alltrails-weekend",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    subject: "Trails near San Francisco",
    senderName: "AllTrails",
    senderEmail: "hello@alltrails.com",
    recipient: PERSONAL,
    sentAt: at(26, 9, 40),
    preview: "Lands End, Dipsea, and a quiet loop in Tennessee Valley…",
  },
  {
    id: "rei-member",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "promotions",
    tags: [],
    folder: null,
    subject: "Member sale: 20% off one full-price item",
    senderName: "REI",
    senderEmail: "email@rei.com",
    recipient: PERSONAL,
    sentAt: at(25, 11, 15),
    preview: "In store and online through Sunday. Coupon is in your account…",
  },
  {
    id: "seatgeek-warriors",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "promotions",
    tags: ["starred"],
    folder: null,
    read: true,
    subject: "Warriors vs Lakers, from $86",
    senderName: "SeatGeek",
    senderEmail: "noreply@seatgeek.com",
    recipient: PERSONAL,
    sentAt: at(23, 18, 2),
    preview: "Opening night is Oct 22. Lower bowl still has pairs…",
  },
  {
    id: "netflix-receipt",
    accountId: "personal",
    mailbox: "extras",
    extrasCategory: "receipts",
    tags: [],
    folder: null,
    subject: "Your Netflix receipt",
    senderName: "Netflix",
    senderEmail: "info@members.netflix.com",
    recipient: PERSONAL,
    sentAt: at(22, 6, 0),
    preview: "Premium plan renewed. $24.99 billed to Visa ••4471…",
  },
  // Personal archive
  {
    id: "axs-tickets",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: "archive",
    subject: "Your tickets: Japanese Breakfast",
    senderName: "AXS",
    senderEmail: "tickets@axs.com",
    recipient: PERSONAL,
    sentAt: at(6, 14, 28),
    preview: "The Masonic, Oct 18, two tickets. Doors at 7:00 PM…",
  },
  {
    id: "turbotax-accepted",
    accountId: "personal",
    mailbox: "inbox",
    tags: ["starred"],
    folder: "archive",
    subject: "Your tax return was accepted",
    senderName: "TurboTax",
    senderEmail: "noreply@intuit.com",
    recipient: PERSONAL,
    sentAt: at(4, 9, 16),
    preview: "The IRS accepted your 2025 federal return. Refund $1,240…",
  },
  // Personal trash
  {
    id: "nextdoor-posts",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: "trash",
    subject: "3 new posts near you",
    senderName: "Nextdoor",
    senderEmail: "noreply@nextdoor.com",
    recipient: PERSONAL,
    sentAt: at(19, 16, 40),
    preview: "A lost cat on 18th, a free couch, and a block party…",
  },
  // Personal spam
  {
    id: "eth-airdrop",
    accountId: "personal",
    mailbox: "inbox",
    tags: [],
    folder: "spam",
    subject: "Claim 2.4 ETH before it expires",
    senderName: "Wallet Rewards",
    senderEmail: "claim@wallet-rewards.top",
    recipient: PERSONAL,
    sentAt: at(21, 2, 48),
    preview: "Your wallet was selected. Connect to claim within 12 hours…",
  },
  // Work inbox
  {
    id: "slack-mention",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: null,
    subject: "Leo mentioned you in #mail-app",
    senderName: "Slack",
    senderEmail: "notification@slack.com",
    recipient: WORK,
    sentAt: at(28, 13, 2),
    preview: "\"@harshit can you look at the density toggle before…\"",
  },
  {
    id: "datadog-errors",
    accountId: "work",
    mailbox: "inbox",
    tags: ["starred"],
    folder: null,
    subject: "Triggered: mail-web error rate",
    senderName: "Datadog",
    senderEmail: "no-reply@datadoghq.com",
    recipient: WORK,
    sentAt: at(28, 10, 55),
    preview: "Error rate on /api/messages crossed 2% for 5 minutes…",
  },
  {
    id: "elena-critique",
    accountId: "work",
    mailbox: "inbox",
    tags: ["waiting"],
    folder: null,
    subject: "Notes from the reader critique",
    senderName: "Elena Cho",
    senderEmail: "elena.cho@acme.com",
    recipient: WORK,
    cc: ["design@acme.com"],
    sentAt: at(28, 9, 12),
    preview: "Three things to fix before Thursday: row density, the…",
  },
  {
    id: "gcal-review",
    accountId: "work",
    mailbox: "inbox",
    tags: ["later"],
    folder: null,
    laterUntil: at(32, 9, 0),
    read: true,
    subject: "Invitation: Design review @ Thu Oct 1, 2pm",
    senderName: "Google Calendar",
    senderEmail: "calendar-notification@google.com",
    recipient: WORK,
    sentAt: at(27, 16, 4),
    preview: "Sarah Kim invited you. Acme HQ, 4th floor, room Cedar…",
  },
  {
    id: "sentry-typeerror",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: null,
    read: true,
    subject: "New issue: TypeError in ReaderPane",
    senderName: "Sentry",
    senderEmail: "noreply@md.getsentry.com",
    recipient: WORK,
    sentAt: at(27, 14, 22),
    preview: "TypeError in MessageRow, 12 events since yesterday…",
  },
  {
    id: "notion-q4",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: null,
    read: true,
    subject: "Elena commented on Q4 roadmap",
    senderName: "Notion",
    senderEmail: "notify@notion.so",
    recipient: WORK,
    sentAt: at(26, 17, 41),
    preview: "\"Can we split the reader work from the triage model?\"…",
  },
  // Work extras
  {
    id: "stripe-invoice",
    accountId: "work",
    mailbox: "extras",
    extrasCategory: "receipts",
    tags: [],
    folder: null,
    subject: "Your Stripe invoice is ready",
    senderName: "Stripe",
    senderEmail: "invoice+statements@stripe.com",
    recipient: WORK,
    sentAt: at(25, 8, 45),
    preview: "Invoice for Acme Inc. September usage: $1,084.20…",
  },
  {
    id: "tldr-tech",
    accountId: "work",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    subject: "TLDR: React 19, and a quieter inbox",
    senderName: "TLDR",
    senderEmail: "dan@tldrnewsletter.com",
    recipient: WORK,
    sentAt: at(28, 6, 15),
    preview: "Today: compiler notes, a SQLite release, and 4 links…",
  },
  {
    id: "figma-changelog",
    accountId: "work",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    read: true,
    subject: "What's new in Figma",
    senderName: "Figma",
    senderEmail: "team@figma.com",
    recipient: WORK,
    sentAt: at(24, 10, 0),
    preview: "Variables in Dev Mode, and a smaller inspect panel…",
  },
  {
    id: "sentry-weekly",
    accountId: "work",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    read: true,
    subject: "Your weekly issue summary",
    senderName: "Sentry",
    senderEmail: "noreply@md.getsentry.com",
    recipient: WORK,
    sentAt: at(22, 9, 0),
    preview: "mail-web: 14 new issues, 9 resolved, crash-free 99.2%…",
  },
  {
    id: "bytes-dev",
    accountId: "work",
    mailbox: "extras",
    extrasCategory: "newsletters",
    tags: [],
    folder: null,
    subject: "Bytes: the use() suspense question",
    senderName: "Bytes",
    senderEmail: "bytes@ui.dev",
    recipient: WORK,
    sentAt: at(23, 7, 45),
    preview: "When use() suspends, plus a short note on activity…",
  },
  // Work archive
  {
    id: "people-welcome",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: "archive",
    subject: "Welcome to Acme — your first week",
    senderName: "Acme People",
    senderEmail: "people@acme.com",
    recipient: WORK,
    sentAt: at(2, 9, 0),
    preview: "Badge, laptop, and the Thursday design review. Here's…",
  },
  {
    id: "vercel-ready",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: "archive",
    subject: "Deployment ready: mail-web",
    senderName: "Vercel",
    senderEmail: "notifications@vercel.com",
    recipient: WORK,
    sentAt: at(9, 11, 36),
    preview: "Production deployment for commit 4c1e90a is ready…",
  },
  // Work trash
  {
    id: "recruiter-stealth",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: "trash",
    subject: "Staff engineer, stealth, series B",
    senderName: "Jordan Hale",
    senderEmail: "jordan@brightpath-talent.com",
    recipient: WORK,
    sentAt: at(16, 10, 18),
    preview: "A founder asked me to reach out. 20 minutes this week?…",
  },
  // Work spam
  {
    id: "wire-invoice",
    accountId: "work",
    mailbox: "inbox",
    tags: [],
    folder: "spam",
    subject: "URGENT: unpaid invoice, wire today",
    senderName: "Accounts Payable",
    senderEmail: "billing@acme-invoicing.co",
    recipient: WORK,
    sentAt: at(20, 4, 6),
    preview: "Invoice #88421 is past due. Wire $18,400 to avoid…",
  },
]

function attachBodies(drafts: Omit<Email, "bodyHtml">[]): Email[] {
  return drafts.map((email) => {
    const bodyHtml = emailBodies[email.id]
    if (!bodyHtml) {
      throw new Error(`Missing HTML body for ${email.id}`)
    }
    return { ...email, bodyHtml }
  })
}

export const initialEmails: Email[] = attachBodies(emailDrafts)

/** Primary and Extras, or every folder when `everywhere` (includes Archive, Trash, Spam). */
export function emailsForSearch(emails: Email[], everywhere: boolean): Email[] {
  return emails
    .filter((email) => {
      if (everywhere) return true
      return (
        email.folder === null &&
        (email.mailbox === "inbox" || email.mailbox === "extras")
      )
    })
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))
}

export function emailMatchesQuery(email: Email, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return [email.subject, email.senderName, email.senderEmail, email.preview].some(
    (field) => field.toLowerCase().includes(needle),
  )
}

export function emailsForView(
  emails: Email[],
  accountId: AccountId,
  view: ViewId,
): Email[] {
  const matches = (email: Email) => {
    if (email.accountId !== accountId) return false
    if (view === "inbox" || view === "extras") {
      return email.folder === null && email.mailbox === view
    }
    if (view === "archive" || view === "trash" || view === "spam") {
      return email.folder === view
    }
    return email.folder === null && email.tags.includes(view)
  }
  return emails
    .filter(matches)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))
}

export function accountInboxCount(
  emails: Email[],
  accountId: AccountId,
): number {
  return emailsForView(emails, accountId, "inbox").length
}

export function viewCount(
  emails: Email[],
  accountId: AccountId,
  view: ViewId,
): number {
  return emailsForView(emails, accountId, view).length
}

/** Counts for sidebar badges (tags with `showCount`), keyed by view id. */
export function folderBadgeCounts(
  emails: Email[],
  accountId: AccountId,
): Partial<Record<ViewId, number>> {
  const counts: Partial<Record<ViewId, number>> = {}
  for (const section of folderSections) {
    for (const folder of section.folders) {
      if (folder.showCount) {
        counts[folder.id] = viewCount(emails, accountId, folder.id)
      }
    }
  }
  return counts
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatTime(date: Date) {
  const hours = date.getHours() % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes} ${date.getHours() >= 12 ? "PM" : "AM"}`
}

function formatAbsoluteListTime(date: Date): string {
  return sameDay(date, REFERENCE_NOW)
    ? formatTime(date)
    : `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

function calendarDaysBetween(older: Date, newer: Date): number {
  const olderDay = Date.UTC(older.getFullYear(), older.getMonth(), older.getDate())
  const newerDay = Date.UTC(newer.getFullYear(), newer.getMonth(), newer.getDate())
  return Math.round((newerDay - olderDay) / DAY_MS)
}

export function formatListTime(sentAt: string, relativeTime = false): string {
  const date = new Date(sentAt)
  if (!relativeTime) return formatAbsoluteListTime(date)
  if (Number.isNaN(date.getTime())) return "—"
  if (date > REFERENCE_NOW) return formatAbsoluteListTime(date)

  if (sameDay(date, REFERENCE_NOW)) {
    const elapsed = REFERENCE_NOW.getTime() - date.getTime()
    if (elapsed < 60_000) return "Just now"
    if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m`
    return `${Math.floor(elapsed / 3_600_000)}h`
  }

  const daysAgo = calendarDaysBetween(date, REFERENCE_NOW)
  return `${daysAgo}d`
}

export function formatReaderDate(sentAt: string): string {
  const date = new Date(sentAt)
  return sameDay(date, REFERENCE_NOW)
    ? `Today at ${formatTime(date)}`
    : `${MONTHS[date.getMonth()]} ${date.getDate()} at ${formatTime(date)}`
}

/** Random snooze target 1–7 days out, until a real date picker exists. */
export function randomLaterUntil(): string {
  const days = 1 + Math.floor(Math.random() * 7)
  return new Date(2026, 8, 28 + days, 9, 0).toISOString()
}

const DAY_MS = 86_400_000

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function formatLaterUntil(laterUntil: string): string {
  const days = Math.max(
    1,
    Math.round((startOfDay(new Date(laterUntil)) - startOfDay(REFERENCE_NOW)) / DAY_MS),
  )
  return days === 1 ? "1 day" : `${days} days`
}
