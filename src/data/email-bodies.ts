const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function page(inner: string, css = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; background: #fff; }
  body {
    padding: 28px 36px 72px;
    color: #1d1d1f;
    font-family: ${FONT};
    font-size: 15px;
    line-height: 1.55;
  }
  a { color: #0b57d0; text-decoration: none; }
  p { margin: 0 0 14px; }
  h1 { margin: 0 0 12px; font-size: 22px; line-height: 1.25; font-weight: 600; letter-spacing: -0.02em; }
  h2 { margin: 18px 0 8px; font-size: 16px; line-height: 1.3; font-weight: 600; }
  ul, ol { margin: 0 0 14px; padding-left: 20px; }
  li { margin: 0 0 6px; }
  pre {
    margin: 0 0 16px;
    padding: 12px 14px;
    overflow: auto;
    border-radius: 8px;
    background: #f4f4f6;
    color: #1d1d1f;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    line-height: 1.5;
  }
  .prose { max-width: 640px; }
  table.rows { width: 100%; border-collapse: collapse; }
  table.rows td { padding: 7px 0; font-size: 14px; vertical-align: top; }
  table.rows td.k { color: #6e6e73; width: 148px; }
  .btn {
    display: inline-block;
    margin: 6px 0 14px;
    padding: 10px 16px;
    border-radius: 8px;
    color: #fff !important;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
  }
  ${css}
</style>
</head>
<body>
${inner}
</body>
</html>`
}

const canvas = `
  html, body { background: #f2f2f4; padding: 0; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 28px 16px 56px; }
  .card { background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; }
  .brand { padding: 16px 24px; font-size: 13px; font-weight: 700; }
  .pad { padding: 22px 24px 6px; }
  .lead { margin: 0 0 8px; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; }
  .meta { margin: 0 0 16px; color: #6e6e73; font-size: 13px; }
  table.items, table.rows { width: 100%; border-collapse: collapse; }
  table.items td { padding: 9px 0; border-top: 1px solid #efeff1; font-size: 14px; vertical-align: top; }
  table.items tr:first-child td { border-top: 0; }
  td.amt { text-align: right; white-space: nowrap; padding-left: 16px; }
  tr.total td { border-top: 1px solid #d8d8dc; font-weight: 600; padding-top: 12px; }
  table.rows td { padding: 7px 0; font-size: 14px; vertical-align: top; }
  table.rows td.k { color: #6e6e73; width: 148px; }
  .foot { padding: 4px 24px 22px; color: #8e8e93; font-size: 12px; line-height: 1.45; }
  .foot a { color: #6e6e73; text-decoration: underline; }
`

function card(opts: {
  brand: string
  color: string
  brandColor?: string
  tracking?: string
  inner: string
  footer?: string
}): string {
  const footer = opts.footer
    ? `<div class="foot">${opts.footer}</div>`
    : ""
  return page(
    `<div class="wrap"><div class="card">
      <div class="brand" style="background:${opts.color};color:${opts.brandColor ?? "#fff"};letter-spacing:${opts.tracking ?? "0.08em"}">${esc(opts.brand)}</div>
      <div class="pad">${opts.inner}</div>
      ${footer}
    </div></div>`,
    canvas,
  )
}

function items(
  rows: { name: string; detail?: string; amount: string }[],
  total?: { label: string; amount: string },
): string {
  const body = rows
    .map(
      (row) => `<tr>
        <td>${esc(row.name)}${row.detail ? `<div style="color:#6e6e73;font-size:12px;margin-top:2px">${esc(row.detail)}</div>` : ""}</td>
        <td class="amt">${esc(row.amount)}</td>
      </tr>`,
    )
    .join("")
  const totalRow = total
    ? `<tr class="total"><td>${esc(total.label)}</td><td class="amt">${esc(total.amount)}</td></tr>`
    : ""
  return `<table class="items">${body}${totalRow}</table>`
}

function facts(pairs: [string, string][]): string {
  return `<table class="rows">${pairs
    .map(
      ([label, value]) =>
        `<tr><td class="k">${esc(label)}</td><td>${esc(value)}</td></tr>`,
    )
    .join("")}</table>`
}

function button(label: string, color: string): string {
  return `<a class="btn" href="#" style="background:${color}">${esc(label)}</a>`
}

function meta(lines: string[]): string {
  return `<p class="meta">${lines.map(esc).join("<br>")}</p>`
}

function plain(html: string): string {
  return page(`<div class="prose">${html}</div>`)
}

function note(lines: string[], signoff?: string): string {
  const body = lines.map((line) => `<p>${esc(line)}</p>`).join("")
  const end = signoff ? `<p>${esc(signoff)}</p>` : ""
  return plain(`${body}${end}`)
}

function quoteBlock(lines: string[]): string {
  return `<blockquote style="margin:4px 0 16px;padding:0 0 2px 12px;border-left:3px solid #d2d2d7;color:#6e6e73">${lines
    .map((line) => `<p>${esc(line)}</p>`)
    .join("")}</blockquote>`
}

function newsletter(opts: {
  masthead: string
  color: string
  kicker: string
  title: string
  html: string
  cta?: string
  footer: string
}): string {
  const cta = opts.cta ? button(opts.cta, opts.color) : ""
  return page(
    `<div class="prose">
      <div style="margin-bottom:18px;color:${opts.color};font-size:12px;font-weight:700;letter-spacing:0.14em">${esc(opts.masthead)}</div>
      <div style="margin-bottom:8px;color:#6e6e73;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase">${esc(opts.kicker)}</div>
      <h1>${esc(opts.title)}</h1>
      ${opts.html}
      ${cta}
      <p style="margin-top:28px;color:#8e8e93;font-size:12px;line-height:1.45">${opts.footer}</p>
    </div>`,
  )
}

function statusMail(opts: {
  product: string
  badge: string
  badgeBg: string
  badgeFg?: string
  title: string
  html: string
  footer: string
}): string {
  return page(
    `<div class="prose">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <strong style="font-size:14px">${esc(opts.product)}</strong>
        <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${opts.badgeBg};color:${opts.badgeFg ?? "#fff"};font-size:12px;font-weight:600">${esc(opts.badge)}</span>
      </div>
      <h1>${esc(opts.title)}</h1>
      ${opts.html}
      <p style="margin-top:22px;color:#8e8e93;font-size:12px">${esc(opts.footer)}</p>
    </div>`,
  )
}

function dl(pairs: [string, string][]): string {
  return `<table style="width:100%;border-collapse:collapse;margin:0 0 16px">${pairs
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6e6e73;font-size:13px;white-space:nowrap;vertical-align:top">${esc(label)}</td><td style="padding:6px 0;font-size:14px">${esc(value)}</td></tr>`,
    )
    .join("")}</table>`
}

export const emailBodies: Record<string, string> = {
  "costco-receipt": card({
    brand: "COSTCO WHOLESALE",
    color: "#e31837",
    inner: `
      <p class="lead">HARSHIT, here's your receipt.</p>
      ${meta(["Order #114-8829103", "Richmond warehouse · Sep 28, 2026 · 1:42 PM"])}
      ${items(
        [
          { name: "Kirkland Signature olive oil", detail: "2 × 2 L", amount: "$34.98" },
          { name: "Rotisserie chicken", amount: "$4.99" },
          { name: "Paper towels, 12 rolls", amount: "$22.49" },
          { name: "Organic blueberries", detail: "2 lb", amount: "$8.99" },
        ],
        { label: "Total", amount: "$71.45" },
      )}
      <p class="meta">Visa ••4471 · Membership ending 1044</p>
    `,
    footer: `Questions about this trip? <a href="#">View the receipt</a>`,
  }),

  "instacart-receipt": card({
    brand: "INSTACART",
    color: "#0aad0a",
    tracking: "0.12em",
    inner: `
      <p class="lead">Your order from Sprouts is on the way.</p>
      ${meta(["14 items · Arriving 2:10–2:30 PM", "Shopper: Dana P."])}
      ${items(
        [
          { name: "Oat milk", detail: "Qty 2", amount: "$8.58" },
          { name: "Sourdough loaf", amount: "$5.49" },
          { name: "Haas avocados", detail: "Bag of 4", amount: "$6.99" },
          { name: "Greek yogurt", detail: "Qty 3", amount: "$11.97" },
          { name: "10 more items", detail: "Produce, dairy, pantry", amount: "$46.12" },
        ],
        { label: "Total", amount: "$79.15" },
      )}
      ${button("Track order", "#0aad0a")}
    `,
    footer: "Tip can be changed for two hours after delivery.",
  }),

  "eagle-package": card({
    brand: "OTHER",
    color: "#1c1c1e",
    tracking: "0.2em",
    inner: `
      <p>Hi Harshit,</p>
      <p>Good news! Your package from Other is at the front desk, locker 14. The code is 4821. We'll hold it through Thursday.</p>
      ${facts([
        ["Status", "Ready for pickup"],
        ["Location", "Lobby, 1488 Harrison"],
        ["Hold until", "Thursday, Oct 1"],
      ])}
      <p>The eagle has landed.</p>
      <p>— Other</p>
    `,
    footer: `Not expecting this? <a href="#">Tell us</a>`,
  }),

  "priya-dinner": note(
    [
      "Are we still on for Friday? I can book the usual place — Tartine Manufactory at 7, table for two, if you can do the Mission.",
      "Maya said she might come by for a drink after. I'll hold the reservation until tomorrow morning.",
    ],
    "Priya",
  ),

  "united-trip": card({
    brand: "UNITED",
    color: "#002244",
    inner: `
      <p class="lead">Your upcoming trip to Denver</p>
      ${meta(["Confirmation H4K2R8", "Fri, Oct 3 · 1 passenger"])}
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin:4px 0 18px">
        <div>
          <div style="font-size:28px;font-weight:700;letter-spacing:-0.03em">SFO</div>
          <div style="color:#6e6e73;font-size:13px">8:25 AM</div>
        </div>
        <div style="padding-bottom:8px;color:#6e6e73;font-size:13px;text-align:center">UA 1182<br>2h 28m</div>
        <div style="text-align:right">
          <div style="font-size:28px;font-weight:700;letter-spacing:-0.03em">DEN</div>
          <div style="color:#6e6e73;font-size:13px">11:53 AM</div>
        </div>
      </div>
      ${facts([
        ["Passenger", "Harshit Beni"],
        ["Seat", "14A · Economy"],
        ["Terminal", "SFO Terminal 3"],
      ])}
      ${button("View boarding pass", "#002244")}
    `,
    footer: "Check in opens 24 hours before departure.",
  }),

  "lease-renewal": plain(`
    <p>Thanks for sending the signed copy. We'll confirm the renewal for unit 4B once the owner countersigns, usually two business days.</p>
    <p>Your new term starts November 1. Rent stays $3,450, due on the first, with the same portal login.</p>
    ${quoteBlock([
      "On Sep 26, Harshit Beni wrote:",
      "Attached is the signed renewal. Please confirm you received it.",
    ])}
    <p>Riverside Apartments<br>Leasing office</p>
  `),

  "chase-statement": card({
    brand: "CHASE",
    color: "#0d5cab",
    tracking: "0.16em",
    inner: `
      <p class="lead">Your September statement is ready</p>
      ${meta(["Account ending 4471 · Sapphire", "Statement period Sep 1–Sep 25"])}
      ${facts([
        ["New balance", "$1,284.16"],
        ["Minimum payment", "$35.00"],
        ["Payment due", "Oct 20, 2026"],
        ["Autopay", "Full balance · Oct 18"],
      ])}
      ${button("View statement", "#0d5cab")}
    `,
    footer: "This notice doesn't change your autopay.",
  }),

  "pragmatic-engineer": newsletter({
    masthead: "THE PRAGMATIC ENGINEER",
    color: "#111111",
    kicker: "This week",
    title: "Why backends fail at scale",
    html: `
      <p>This week: queues, retries, and the thundering herd.</p>
      <p>A queue hides a slow dependency until the consumers all wake up at once. The retry then turns one blip into a second outage, because every caller comes back in the same second.</p>
      <p>The fix is boring on purpose. Cap the retry, add jitter, and shed load at the edge before the queue depth becomes the incident.</p>
      <p>Three notes from teams that learned it the hard way are below, including a checkout path that melted on a Monday deploy.</p>
    `,
    cta: "Read the issue",
    footer: `You get this because you subscribed. <a href="#">Unsubscribe</a>`,
  }),

  "product-hunt": newsletter({
    masthead: "PRODUCT HUNT",
    color: "#ff6154",
    kicker: "Today",
    title: "Today's top products",
    html: `
      <p><strong>A mailbox that triages itself</strong>, plus 9 more launches.</p>
      <p>It sorts the pile into what needs a reply and what can wait, then leaves the rest in a quieter tray. Early comments are mostly about the keyboard shortcuts.</p>
      <p>Also up today:</p>
      <ul>
        <li>A diff viewer for prose</li>
        <li>Local-first notes that sync over Tailscale</li>
        <li>A calmer CI dashboard</li>
      </ul>
      <p>Six more are in the full digest, including a font tool and a tiny status page.</p>
    `,
    cta: "See today's hunt",
    footer: `Sent to harshitbenis@gmail.com. <a href="#">Manage email</a>`,
  }),

  "spotify-mix": page(
    `
    <div style="max-width:520px;margin:0 auto">
      <div style="color:#1ed760;font-size:22px;font-weight:700;letter-spacing:-0.04em">Spotify</div>
      <p style="margin:18px 0 6px;font-size:28px;font-weight:700;letter-spacing:-0.03em;line-height:1.15">Your midyear mix is here</p>
      <p style="color:#b3b3b3">We made a playlist from your most-played tracks since March. 42 songs, about two and a half hours.</p>
      <a class="btn" href="#" style="background:#1ed760;color:#121212 !important">Play Midyear Mix</a>
      <div style="margin-top:8px;border-top:1px solid #2a2a2a">
        ${[
          ["Nights", "Frank Ocean"],
          ["Bags", "Clairo"],
          ["Myth", "Beach House"],
          ["Redbone", "Childish Gambino"],
          ["Motion Sickness", "Phoebe Bridgers"],
        ]
          .map(
            ([title, artist], index) =>
              `<div style="display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #2a2a2a"><span>${index + 1}&nbsp;&nbsp;${esc(title)}</span><span style="color:#b3b3b3">${esc(artist)}</span></div>`,
          )
          .join("")}
      </div>
      <p style="margin-top:22px;color:#727272;font-size:12px">You're receiving this as a Spotify listener.</p>
    </div>
    `,
    `
      html, body { background:#121212; color:#fff; }
      a { color:#1ed760; }
    `,
  ),

  "apple-receipt": card({
    brand: "Apple",
    color: "#f5f5f7",
    brandColor: "#1d1d1f",
    tracking: "-0.01em",
    inner: `
      <p class="lead">Your receipt from Apple</p>
      ${meta(["Order W842190553", "Apple Online Store · Sep 27, 2026"])}
      ${items(
        [
          { name: "Magic Trackpad", detail: "White Multi-Touch", amount: "$137.06" },
          { name: "Tax", amount: "$11.94" },
        ],
        { label: "Total", amount: "$149.00" },
      )}
      <p class="meta">Billed to Visa ••4471 · Ships to Harrison St</p>
      ${button("View order", "#1d1d1f")}
    `,
    footer: "You can return this until Oct 27.",
  }),

  "opentable-friday": card({
    brand: "OPENTABLE",
    color: "#da3743",
    inner: `
      <p class="lead">Reservation confirmed</p>
      <p>Tartine Manufactory, table for 2. See you Friday.</p>
      ${facts([
        ["When", "Friday, Oct 2 · 7:00 PM"],
        ["Where", "595 Alabama St, San Francisco"],
        ["Name", "Harshit Beni"],
        ["Confirmation", "OT-44192"],
      ])}
      ${button("Modify reservation", "#da3743")}
    `,
    footer: "Please cancel at least two hours ahead.",
  }),

  "jcrew-sale": card({
    brand: "J.CREW",
    color: "#1f3a34",
    tracking: "0.18em",
    inner: `
      <p style="margin:0;font-size:13px;letter-spacing:0.08em;color:#6e6e73">TODAY ONLY</p>
      <p style="margin:8px 0 4px;font-size:42px;font-weight:700;letter-spacing:-0.04em;line-height:1">Extra 40% off</p>
      <p>Sale styles, in store and online. Use code EXTRA40 at checkout. It stacks with the red-tag price and stops at midnight PT.</p>
      <div style="margin:0 0 16px;padding:12px 14px;border:1px dashed #1f3a34;border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:16px;letter-spacing:0.08em">EXTRA40</div>
      ${button("Shop the sale", "#1f3a34")}
    `,
    footer: "Offer excludes new arrivals and third-party brands.",
  }),

  "airbnb-jtree": card({
    brand: "Airbnb",
    color: "#ff5a5f",
    tracking: "0",
    inner: `
      <div style="height:92px;margin:0 0 16px;border-radius:8px;background:linear-gradient(160deg,#f3d2a4,#d4784a 55%,#7c4a32)"></div>
      <p class="lead">Your stay in Joshua Tree</p>
      <p>Booking confirmed for Nov 14–16. Check-in after 3 PM. The lockbox code arrives the morning of arrival.</p>
      ${facts([
        ["Home", "The ridge cabin"],
        ["Guests", "2"],
        ["Check-in", "Sat, Nov 14 · after 3:00 PM"],
        ["Checkout", "Mon, Nov 16 · 11:00 AM"],
        ["Total", "$612.00"],
      ])}
      ${button("View trip", "#ff5a5f")}
    `,
    footer: "Free cancellation until Nov 7.",
  }),

  "maya-photos": plain(`
    <p>Finally uploaded them all — the sunset ones are in the shared album, the rest are still dumping off the camera.</p>
    <p>The ridge at 6:40 is the one I want printed. You can tell the wind from the Joshua Tree in the corner.</p>
    <p><a href="#">Open the album</a></p>
    <p>Maya</p>
  `),

  "linkedin-invites": card({
    brand: "LinkedIn",
    color: "#0a66c2",
    tracking: "0",
    inner: `
      <p class="lead">You have 3 new invitations</p>
      <p>People you may know are waiting to connect.</p>
      ${[
        ["Elena Cho", "Product designer · Acme"],
        ["Rohan Mehta", "Engineer · Northwind"],
        ["Priya Anand", "Editor · Independent"],
      ]
        .map(
          ([name, role]) =>
            `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;padding:10px 0;border-top:1px solid #efeff1"><div><strong>${esc(name)}</strong><div style="color:#6e6e73;font-size:13px">${esc(role)}</div></div><a href="#" style="font-size:13px;font-weight:600">View</a></div>`,
        )
        .join("")}
      <div style="height:12px"></div>
      ${button("See invitations", "#0a66c2")}
    `,
    footer: "You can turn these reminders off in settings.",
  }),

  "prize-claim": page(
    `
    <div style="max-width:460px;margin:24px auto;padding:28px 24px;border:4px solid #f5c518;background:#fff8db;text-align:center">
      <div style="color:#8a6a00;font-size:12px;font-weight:700;letter-spacing:0.14em">PRIZE CENTER</div>
      <h1 style="margin-top:10px">You've won a $500 gift card</h1>
      <p>Congratulations! Claim your reward within 24 hours or it will be released to the next name on the list.</p>
      <a class="btn" href="#" style="background:#e10600">Claim reward</a>
      <p style="color:#8a6a00;font-size:12px">Reference PZ-22918. This message was not requested.</p>
    </div>
    `,
    `html, body { background:#fff4cc; }`,
  ),

  "github-pr42": statusMail({
    product: "GitHub",
    badge: "Review requested",
    badgeBg: "#ddf4ff",
    badgeFg: "#0969da",
    title: "[mail-app] PR #42: Fix list virtualization",
    html: `
      <p><strong>leoacme</strong> requested your review on this pull request.</p>
      ${dl([
        ["Repo", "acme/mail-app"],
        ["Author", "leoacme"],
        ["Files", "4 changed, +86 −22"],
      ])}
      <pre>MessageList.tsx
- overscan: 2
+ overscan: 8

The list was dropping rows when the reader opened.</pre>
      ${button("Review pull request", "#1f2328")}
    `,
    footer: "You're receiving this because you're subscribed to acme/mail-app.",
  }),

  "jira-218": statusMail({
    product: "Jira",
    badge: "In Review",
    badgeBg: "#e9f2ff",
    badgeFg: "#0c66e4",
    title: "MAIL-218 moved to In Review",
    html: `
      <p>Sarah Kim moved this issue from In Progress to In Review.</p>
      ${dl([
        ["Issue", "MAIL-218"],
        ["Summary", "Compact density for the message list"],
        ["Assignee", "Harshit"],
        ["Comment", "Ready for a pass on the row height."],
      ])}
      ${button("Open issue", "#0c66e4")}
    `,
    footer: "Sent by Jira for the Mail project.",
  }),

  "sarah-q4": note(
    [
      "Could you read section 3 before Thursday's review? That's the part about splitting triage from the reader, and I don't want to walk in with a number I made up.",
      "The doc is in Notion. I left comments on the open questions, mostly around what stays in Primary.",
      "Thanks,",
      "Sarah",
    ],
  ),

  "figma-mention": card({
    brand: "Figma",
    color: "#1e1e1e",
    tracking: "0",
    inner: `
      <p class="lead">Leo mentioned you</p>
      <p>In <strong>Mail app refresh</strong>, on the density frame:</p>
      <blockquote style="margin:0 0 16px;padding:12px 14px;border-radius:8px;background:#f4f4f6;color:#1d1d1f">“@harshit can we ship the compact density toggle with the reader, or is that a follow-up?”</blockquote>
      ${button("Open in Figma", "#1e1e1e")}
    `,
    footer: "Reply in the file. This thread is on the reader frame.",
  }),

  "vercel-deploy": statusMail({
    product: "Vercel",
    badge: "Failed",
    badgeBg: "#ffebe9",
    badgeFg: "#d1242f",
    title: "Deployment failed: mail-web",
    html: `
      <p>Build failed on commit <code>9f31ac2</code>.</p>
      <pre>Error: ENOMEM
The build process ran out of memory.

mail-web · Production
Branch main · 1m 12s</pre>
      ${dl([
        ["Project", "mail-web"],
        ["Commit", "9f31ac2"],
        ["Target", "Production"],
      ])}
      ${button("View logs", "#000000")}
    `,
    footer: "The previous production deployment is still serving traffic.",
  }),

  "it-password": note(
    [
      "Your password expires in 6 days. Rotate it via Okta before Oct 1 so your laptop login and the VPN stay in step.",
      "If you're mid-review on Thursday, do it Wednesday. Locked accounts take the help desk about an hour.",
      "Acme IT",
    ],
  ),

  "linear-changelog": newsletter({
    masthead: "LINEAR",
    color: "#5e6ad2",
    kicker: "September",
    title: "Linear changelog — September",
    html: `
      <p>New: triage responsibilities, initiative updates, and a quieter inbox for subscribed issues.</p>
      <p><strong>Triage responsibilities.</strong> A team can name who owns incoming bugs for the week. The queue shows that person, not the whole channel.</p>
      <p><strong>Initiative updates.</strong> A project can post a short status without opening every issue under it. Subscribers get one note, not twenty.</p>
    `,
    cta: "Read the changelog",
    footer: `Sent to harshit@acme.com. <a href="#">Unsubscribe</a>`,
  }),

  "npm-weekly": newsletter({
    masthead: "NPM WEEKLY",
    color: "#cb3837",
    kicker: "Issue 204",
    title: "npm weekly #204",
    html: `
      <p>This week in the registry: provenance GA, new docs, and a shorter install log.</p>
      <p>Provenance is on by default for public packages published with a trusted publisher. The docs finally show the badge next to the install command, which is the part people were missing.</p>
      <p>Also: a note on peer dependency warnings, and three packages that crossed a million weekly downloads.</p>
    `,
    cta: "Read the issue",
    footer: `You're on the weekly list. <a href="#">Unsubscribe</a>`,
  }),

  "so-digest": newsletter({
    masthead: "STACK OVERFLOW",
    color: "#f48024",
    kicker: "This week",
    title: "Top questions this week",
    html: `
      <p><strong>React 19: when does use() suspend?</strong> and 14 more.</p>
      <p>The accepted answer draws the line at a promise that isn't cached. Call it during render with a stable promise and it suspends once. Call it with a new promise each time and the tree never settles.</p>
      <ol>
        <li>React 19: when does use() suspend?</li>
        <li>Why does my CSS grid column collapse to zero?</li>
        <li>SQLite WAL mode and two writers</li>
      </ol>
      <p>Eleven more are in the full digest, mostly TypeScript and Postgres.</p>
    `,
    cta: "Open the digest",
    footer: `Based on tags you follow. <a href="#">Update tags</a>`,
  }),

  "aws-invoice": card({
    brand: "AMAZON WEB SERVICES",
    color: "#232f3e",
    inner: `
      <p class="lead">Your AWS invoice is available</p>
      ${meta(["Invoice #INV-2049-118", "September 2026 · Acme Inc."])}
      ${items(
        [
          { name: "Amazon S3", detail: "us-west-2", amount: "$41.20" },
          { name: "AWS Lambda", amount: "$18.04" },
          { name: "Amazon CloudFront", amount: "$253.20" },
        ],
        { label: "Total", amount: "$312.44" },
      )}
      ${button("Download invoice", "#232f3e")}
    `,
    footer: "Payment will be charged to the card on file.",
  }),

  "gcp-next": newsletter({
    masthead: "GOOGLE CLOUD",
    color: "#1a73e8",
    kicker: "Next '26",
    title: "Google Cloud Next '26: registration open",
    html: `
      <p>Join us April 14–16 in Las Vegas. Early-bird pricing ends March 1.</p>
      <p>The agenda is still thin, but the keynotes are posted and the workshop signup opens next week. Last year the hallway track was the useful part. If Acme is sending two people, tell me and I'll hold a second badge.</p>
      ${facts([
        ["Dates", "April 14–16, 2026"],
        ["City", "Las Vegas"],
        ["Early bird", "Through March 1"],
      ])}
    `,
    cta: "Register",
    footer: `Sent to harshit@acme.com. <a href="#">Unsubscribe</a>`,
  }),

  "greenhouse-app": card({
    brand: "GREENHOUSE",
    color: "#24a47f",
    tracking: "0.12em",
    inner: `
      <p class="lead">New application</p>
      <p>A new candidate applied to the Product Designer role.</p>
      <div style="margin:0 0 16px;padding:14px 16px;border:1px solid #e4e4e7;border-radius:10px">
        <strong>Amina Diallo</strong>
        <div style="color:#6e6e73;font-size:13px;margin-top:2px">Product Designer · 6 years · Oakland, CA</div>
        <div style="margin-top:8px;font-size:14px">Portfolio covers a mail client and a scheduling tool. Available in four weeks.</div>
      </div>
      ${button("Review application", "#1f8f6b")}
    `,
    footer: "This role is open on the Acme board.",
  }),

  "zoom-recording": card({
    brand: "ZOOM",
    color: "#0b5cff",
    tracking: "0.14em",
    inner: `
      <div style="margin:0 0 16px;padding:26px 16px;border-radius:10px;background:#0b5cff;color:#fff;text-align:center">
        <div style="font-size:12px;letter-spacing:0.12em">RECORDING READY</div>
        <div style="margin-top:6px;font-size:22px;font-weight:700">Design sync</div>
        <div style="margin-top:4px;opacity:0.9">48 minutes · Sep 10</div>
      </div>
      <p>The recording of "Design sync" is now available. The transcript is attached to the same page.</p>
      ${button("Watch recording", "#0b5cff")}
    `,
    footer: "Recordings in this account are deleted after 30 days.",
  }),

  "crypto-webinar": page(
    `
    <div class="prose">
      <p style="color:#888;font-size:12px;letter-spacing:0.08em">WEBINAR TEAM</p>
      <h1>Calendar invite: Crypto webinar</h1>
      <p>You are invited: Scaling your portfolio in 2026. Thursday, 11:00 AM PT. Cameras optional, a pitch deck is not.</p>
      <p>We picked your address off a conference list. There is no calendar hold unless you accept.</p>
      <a class="btn" href="#" style="background:#111">Add to calendar</a>
    </div>
    `,
  ),

  "seo-boost": page(
    `
    <div style="max-width:480px;margin:0 auto;padding:8px 8px 0;text-align:center">
      <div style="display:inline-block;padding:4px 8px;background:#19a34a;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.08em">SEO BOOST</div>
      <h1 style="margin-top:14px">Your website is losing traffic</h1>
      <p>We noticed your rankings dropped. Act now to recover the clicks we say you lost last week. No audit is attached. The button goes to a booking form.</p>
      <a class="btn" href="#" style="background:#19a34a">Book a free audit</a>
      <p style="color:#888;font-size:12px">This is an unsolicited sales email.</p>
    </div>
    `,
    `html, body { background:#f3fff6; }`,
  ),

  "doordash-thai": card({
    brand: "DOORDASH",
    color: "#eb1700",
    inner: `
      <p class="lead">Order from Kin Khao</p>
      ${meta(["Delivered 11:14 AM · Dasher: Minh", "Harrison St"])}
      ${items(
        [
          { name: "Pad see ew", detail: "Tofu", amount: "$18.00" },
          { name: "Green curry", detail: "Mild", amount: "$19.50" },
          { name: "Brown rice", amount: "$3.00" },
          { name: "Delivery fee", amount: "$3.99" },
          { name: "Tax", amount: "$2.37" },
          { name: "Tip", amount: "$6.00" },
        ],
        { label: "Total", amount: "$52.86" },
      )}
      ${button("View receipt", "#eb1700")}
    `,
    footer: "Rate the order while you still remember the curry.",
  }),

  "amazon-delivered": card({
    brand: "amazon",
    color: "#131921",
    tracking: "0",
    inner: `
      <div style="height:108px;margin:0 0 16px;border-radius:8px;background:linear-gradient(#e4dccd,#cfc3b0);display:flex;align-items:flex-end;padding:12px;color:#3a3428;font-size:13px">Front door · 8:51 AM</div>
      <p class="lead">Delivered: Kindle Paperwhite</p>
      <p>Your package was left at the front door at 8:51 AM. The photo is the door, not the package, which is how these usually go.</p>
      ${facts([
        ["Order", "113-4482910"],
        ["Item", "Kindle Paperwhite, 16 GB"],
        ["Shipped to", "Harrison St"],
      ])}
      ${button("Track package", "#ff9900")}
    `,
    footer: "Something wrong? You have until Oct 28 to start a return.",
  }),

  "rohan-hike": note(
    [
      "If the fog lifts I want to do the Lands End trail on Saturday, the long way from the parking lot to the labyrinth and back.",
      "I'll be at the trailhead at 9. If it's socked in we'll bail to coffee and call it a plan anyway.",
      "Rohan",
    ],
  ),

  "kaiser-labs": card({
    brand: "KAISER PERMANENTE",
    color: "#0072ce",
    tracking: "0.06em",
    inner: `
      <p class="lead">Your lab results are ready</p>
      <p>Results from your Sep 24 blood draw are in the portal. This note doesn't include the values. Sign in to read them.</p>
      ${facts([
        ["Test", "Routine blood panel"],
        ["Collected", "Sep 24, 2026"],
        ["Ordered by", "Dr. Nair"],
      ])}
      ${button("View in the portal", "#0072ce")}
    `,
    footer: "If something needs a follow-up, the office will call.",
  }),

  "pge-bill": card({
    brand: "PG&E",
    color: "#0072ce",
    tracking: "0.04em",
    inner: `
      <p class="lead">Your September energy bill</p>
      ${meta(["Account ending 2208 · Harrison St"])}
      <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:-0.03em">$86.40</p>
      <p class="meta">Amount due. AutoPay will draft on Oct 12.</p>
      <div style="height:8px;margin:0 0 8px;border-radius:99px;background:#e6e6ea">
        <div style="width:62%;height:8px;border-radius:99px;background:#00a3e0"></div>
      </div>
      <p class="meta">Usage is 62% of the same month last year.</p>
      ${facts([
        ["Electric", "$71.10"],
        ["Gas", "$15.30"],
        ["Due", "Oct 12, 2026"],
      ])}
    `,
    footer: "You're on AutoPay. No action needed unless the card changed.",
  }),

  "venmo-maya": card({
    brand: "Venmo",
    color: "#008cff",
    tracking: "0",
    inner: `
      <p class="lead">Maya Beni requests $42.00</p>
      <p>For dinner at Tartine — you can pay in the app. She added a note: “your half, I got the wine.”</p>
      <div style="margin:0 0 16px;padding:16px;border-radius:12px;background:#f4f8ff;text-align:center">
        <div style="color:#6e6e73;font-size:13px">Request</div>
        <div style="font-size:32px;font-weight:700;letter-spacing:-0.03em">$42.00</div>
      </div>
      ${button("Pay Maya", "#008cff")}
    `,
    footer: "Requests expire after 30 days.",
  }),

  "anil-birthday": plain(`
    <p>Sunday at 6 works. I'll pick up the cake on the way, the pistachio one from the place on Valencia, unless Maya already called them.</p>
    <p>Tell Mom not to cook the whole menu. We'll bring the salad and the wine.</p>
    ${quoteBlock([
      "On Sep 24, Maya Beni wrote:",
      "Can we do Mom's birthday at the house on Sunday? She asked for no gifts, which we will ignore in a small way.",
    ])}
    <p>Anil</p>
  `),

  "lenny-review": newsletter({
    masthead: "LENNY'S NEWSLETTER",
    color: "#111111",
    kicker: "Product",
    title: "How to run a product review",
    html: `
      <p>A one-page agenda that keeps the room honest.</p>
      <p>Open with the decision you need, not the tour of the work. Then three questions: what changed since last time, what you're unsure about, and what you will do if the room says no.</p>
      <p>The teams that finish on time write the agenda the day before and send it with the doc. Everyone else narrates slides until the clock runs out.</p>
    `,
    cta: "Read the essay",
    footer: `Sent to harshitbenis@gmail.com. <a href="#">Unsubscribe</a>`,
  }),

  "morning-brew": newsletter({
    masthead: "MORNING BREW",
    color: "#1c7c54",
    kicker: "Monday",
    title: "Markets open higher, again",
    html: `
      <p>The Fed held, coffee prices didn't, and a 3-minute brief is all most of this deserves.</p>
      <p>Rates stayed put. Futures were up before the open. A drought note moved coffee, which you will feel if you buy beans by the bag and not by the cup.</p>
      <p>One company story, one markets paragraph, and a link you can skip. That's the deal.</p>
    `,
    cta: "Read today's brief",
    footer: `You're on the daily. <a href="#">Unsubscribe</a>`,
  }),

  "alltrails-weekend": newsletter({
    masthead: "ALLTRAILS",
    color: "#2d6a4f",
    kicker: "Near San Francisco",
    title: "Trails near San Francisco",
    html: `
      <p>Lands End, Dipsea, and a quiet loop in Tennessee Valley.</p>
      <ul>
        <li><strong>Lands End</strong> — 3.4 miles, fog likely before 10.</li>
        <li><strong>Dipsea</strong> — the short version, stairs included.</li>
        <li><strong>Tennessee Valley</strong> — flat enough for a conversation.</li>
      </ul>
      <p>Saturday looks clearer than Sunday. If you only go once, go early.</p>
    `,
    cta: "Open the trails",
    footer: `Based on hikes near you. <a href="#">Unsubscribe</a>`,
  }),

  "rei-member": card({
    brand: "REI",
    color: "#1a4331",
    tracking: "0.14em",
    inner: `
      <p style="margin:0;font-size:13px;color:#6e6e73">MEMBER SALE</p>
      <p class="lead">20% off one full-price item</p>
      <p>In store and online through Sunday. The coupon is already in your account. It applies once, and it doesn't stack with the outlet price.</p>
      ${button("Shop the sale", "#1a4331")}
    `,
    footer: "Member number ending 4481. Expires Sunday at close.",
  }),

  "seatgeek-warriors": card({
    brand: "SEATGEEK",
    color: "#ff5b49",
    tracking: "0.08em",
    inner: `
      <p class="meta" style="margin-bottom:4px">CHASE CENTER · OCT 22</p>
      <p class="lead">Warriors vs Lakers, from $86</p>
      <p>Opening night is Oct 22. Lower bowl still has pairs, upper level is easier, and the price moves if you wait until the week of.</p>
      ${facts([
        ["When", "Wed, Oct 22 · 7:00 PM"],
        ["Where", "Chase Center"],
        ["From", "$86 including fees"],
      ])}
      ${button("See tickets", "#16161a")}
    `,
    footer: "Prices include fees. Seats are not held.",
  }),

  "netflix-receipt": card({
    brand: "NETFLIX",
    color: "#e50914",
    tracking: "0.14em",
    inner: `
      <p class="lead">Your Netflix receipt</p>
      ${meta(["Sep 22, 2026 · Premium plan"])}
      ${items(
        [{ name: "Premium plan", detail: "Monthly renewal", amount: "$24.99" }],
        { label: "Total", amount: "$24.99" },
      )}
      <p class="meta">Billed to Visa ••4471. Next charge Oct 22.</p>
    `,
    footer: "You can change the plan before the next renewal.",
  }),

  "axs-tickets": card({
    brand: "AXS",
    color: "#111111",
    tracking: "0.2em",
    inner: `
      <p class="lead">Japanese Breakfast</p>
      <p>The Masonic, Oct 18, two tickets. Doors at 7:00 PM. The show is at 8.</p>
      ${facts([
        ["Venue", "The Masonic, San Francisco"],
        ["Date", "Sat, Oct 18, 2026"],
        ["Tickets", "2 · Section 204"],
        ["Order", "AXS-229184"],
      ])}
      ${button("View tickets", "#111111")}
    `,
    footer: "Tickets are in the AXS app. Screenshots may be turned away.",
  }),

  "turbotax-accepted": card({
    brand: "TURBOTAX",
    color: "#037c3a",
    inner: `
      <p class="lead">Your tax return was accepted</p>
      <p>The IRS accepted your 2025 federal return. The refund is $1,240 and should land in the account on file within 21 days.</p>
      ${facts([
        ["Return", "2025 federal"],
        ["Status", "Accepted"],
        ["Refund", "$1,240.00"],
        ["Filed", "Apr 2, 2026"],
      ])}
      ${button("View return", "#037c3a")}
    `,
    footer: "Keep a copy with your records. California was filed separately.",
  }),

  "nextdoor-posts": card({
    brand: "NEXTDOOR",
    color: "#8ed500",
    brandColor: "#143601",
    tracking: "0.08em",
    inner: `
      <p class="lead">3 new posts near you</p>
      <ul>
        <li>A lost cat on 18th, gray, answers to Fig.</li>
        <li>A free couch, must move it yourself.</li>
        <li>A block party on Saturday, bring a chair.</li>
      </ul>
      ${button("See the posts", "#143601")}
    `,
    footer: "You're in the Mission neighborhood.",
  }),

  "eth-airdrop": page(
    `
    <div style="max-width:440px;margin:20px auto;padding:24px;border:1px solid #3a2a00;background:#1a1408;color:#f6e7c1;text-align:center">
      <div style="font-size:12px;letter-spacing:0.16em;color:#e0b15a">WALLET REWARDS</div>
      <h1 style="color:#fff">Claim 2.4 ETH before it expires</h1>
      <p>Your wallet was selected. Connect to claim within 12 hours. There is no wallet on file here, and this address was not opted in.</p>
      <a class="btn" href="#" style="background:#e0b15a;color:#1a1408 !important">Claim now</a>
      <p style="color:#a89060;font-size:12px">Unsolicited. The timer is not real.</p>
    </div>
    `,
    `html, body { background:#120e07; } h1 { color:#fff; }`,
  ),

  "slack-mention": card({
    brand: "Slack",
    color: "#4a154b",
    tracking: "0",
    inner: `
      <p class="meta">#mail-app · Acme</p>
      <p class="lead">Leo mentioned you</p>
      <blockquote style="margin:0 0 16px;padding:12px 14px;border-radius:8px;background:#f4f4f6">“@harshit can you look at the density toggle before the review? I don't want to debate the number in the room.”</blockquote>
      <p class="meta">Leo Acme · 1:02 PM</p>
      ${button("Open in Slack", "#4a154b")}
    `,
    footer: "You get mentions in #mail-app.",
  }),

  "datadog-errors": statusMail({
    product: "Datadog",
    badge: "Triggered",
    badgeBg: "#ffe8d9",
    badgeFg: "#c2410c",
    title: "Triggered: mail-web error rate",
    html: `
      <p>Error rate on <code>/api/messages</code> crossed 2% for 5 minutes.</p>
      ${dl([
        ["Monitor", "mail-web error rate"],
        ["Value", "2.4%"],
        ["Threshold", "2% for 5 minutes"],
        ["Service", "mail-web · production"],
      ])}
      <pre>5xx responses
14:22  1.1%
14:27  2.4%  triggered
Most status: 503 from the message query</pre>
      ${button("Open monitor", "#632ca6")}
    `,
    footer: "This monitor notifies the mail-web on-call.",
  }),

  "elena-critique": note(
    [
      "Three things to fix before Thursday: row density, the sender line, and focus mode.",
      "Density is the one people will feel. The sender line truncates the address when the date is long, and focus mode still shows the back button for a beat.",
      "I left marks on the frame. If section 3 of Sarah's doc disagrees with this, let's pick one before the review.",
      "Elena",
    ],
  ),

  "gcal-review": card({
    brand: "Google Calendar",
    color: "#1a73e8",
    tracking: "0",
    inner: `
      <p class="lead">Design review</p>
      <p>Sarah Kim invited you. Acme HQ, 4th floor, room Cedar.</p>
      ${facts([
        ["When", "Thu, Oct 1 · 2:00–2:45 PM"],
        ["Where", "Room Cedar, 4th floor"],
        ["Who", "Sarah Kim, Elena Cho, Leo, you"],
      ])}
      <p>
        <a class="btn" href="#" style="background:#1a73e8">Yes</a>
        <a class="btn" href="#" style="background:#fff;color:#1a73e8 !important;border:1px solid #1a73e8">No</a>
      </p>
    `,
    footer: "The invite is on your work calendar.",
  }),

  "sentry-typeerror": statusMail({
    product: "Sentry",
    badge: "New issue",
    badgeBg: "#fff1f0",
    badgeFg: "#e11d48",
    title: "TypeError in MessageRow",
    html: `
      <p>TypeError in MessageRow, 12 events since yesterday. The stack starts in the row and crosses ReaderPane when a message unmounts mid-scroll.</p>
      <pre>TypeError: Cannot read properties of null (reading 'subject')
  at MessageRow (MessageRow.tsx:88)
  at ReaderPane (ReaderPane.tsx:214)</pre>
      ${dl([
        ["Project", "mail-web"],
        ["Events", "12"],
        ["Users", "3"],
        ["First seen", "Sep 27, 2:11 PM"],
      ])}
      ${button("View issue", "#362d59")}
    `,
    footer: "You're on the mail-web issue alerts.",
  }),

  "notion-q4": card({
    brand: "Notion",
    color: "#111111",
    tracking: "0",
    inner: `
      <p class="meta">Q4 roadmap · comment</p>
      <p class="lead">Elena commented</p>
      <blockquote style="margin:0 0 16px;padding:12px 14px;border-left:3px solid #111;background:#fafafa">“Can we split the reader work from the triage model? They're sharing a milestone and they don't need to.”</blockquote>
      <p class="meta">Elena Cho · Yesterday at 5:41 PM</p>
      ${button("Open in Notion", "#111111")}
    `,
    footer: "You follow this page.",
  }),

  "stripe-invoice": card({
    brand: "Stripe",
    color: "#635bff",
    tracking: "0",
    inner: `
      <p class="lead">Your Stripe invoice is ready</p>
      ${meta(["Acme Inc. · September 2026", "Invoice in_1Q0mail204"])}
      ${items(
        [
          { name: "Billing usage", detail: "Invoicing", amount: "$420.00" },
          { name: "Payment processing", detail: "Card volume", amount: "$664.20" },
        ],
        { label: "Total", amount: "$1,084.20" },
      )}
      ${button("View invoice", "#635bff")}
    `,
    footer: "The card on file will be charged automatically.",
  }),

  "tldr-tech": newsletter({
    masthead: "TLDR",
    color: "#111111",
    kicker: "Tech",
    title: "React 19, and a quieter inbox",
    html: `
      <p>Today: compiler notes, a SQLite release, and 4 links worth the click.</p>
      <ul>
        <li><strong>React compiler</strong> — a note on what it still won't memoize.</li>
        <li><strong>SQLite 3.47</strong> — a small release, a useful query planner fix.</li>
        <li><strong>Mail clients</strong> — someone measured how long HTML email takes to open. Too long.</li>
      </ul>
      <p>The fourth link is a postmortem. Read it if you run a queue.</p>
    `,
    cta: "Read today's TLDR",
    footer: `Sent to harshit@acme.com. <a href="#">Unsubscribe</a>`,
  }),

  "figma-changelog": newsletter({
    masthead: "FIGMA",
    color: "#111111",
    kicker: "Changelog",
    title: "What's new in Figma",
    html: `
      <p>Variables in Dev Mode, and a smaller inspect panel.</p>
      <p>Dev Mode can show a variable's name next to the raw value, which is the thing engineering kept asking for in the mail refresh. The inspect panel also stops repeating the same color six times.</p>
      <p>Nothing here changes the file Elena marked up. It does make the handoff less of a scavenger hunt.</p>
    `,
    cta: "See the changelog",
    footer: `You're on the Figma product list. <a href="#">Unsubscribe</a>`,
  }),

  "sentry-weekly": newsletter({
    masthead: "SENTRY",
    color: "#362d59",
    kicker: "Weekly",
    title: "Your weekly issue summary",
    html: `
      <p>mail-web: 14 new issues, 9 resolved, crash-free 99.2%.</p>
      ${facts([
        ["New", "14"],
        ["Resolved", "9"],
        ["Crash-free sessions", "99.2%"],
        ["Noisiest", "TypeError in MessageRow"],
      ])}
      <p>The MessageRow error is most of the new volume. The rest are one-off network failures.</p>
    `,
    cta: "Open the weekly",
    footer: `Weekly summary for mail-web. <a href="#">Unsubscribe</a>`,
  }),

  "bytes-dev": newsletter({
    masthead: "BYTES",
    color: "#d94f30",
    kicker: "JavaScript",
    title: "The use() suspense question",
    html: `
      <p>When use() suspends, plus a short note on activity.</p>
      <p>use() suspends when the promise you hand it is pending. It does not suspend if you already unwrapped that promise, and it will loop if you create a new promise during render.</p>
      <p>The activity note is shorter: a tab that stays mounted still costs you. Hide it if the reader isn't on screen.</p>
    `,
    cta: "Read Bytes",
    footer: `Sent to harshit@acme.com. <a href="#">Unsubscribe</a>`,
  }),

  "people-welcome": plain(`
    <p>Hi Harshit,</p>
    <p>Badge, laptop, and the Thursday design review. Here's the first week, so you don't have to ask in Slack.</p>
    <ul>
      <li>Monday — laptop and badge at the 4th floor desk.</li>
      <li>Tuesday — benefits with People, 30 minutes.</li>
      <li>Thursday — design review in Cedar. You're invited, not presenting.</li>
    </ul>
    <p>The lunch spot everyone actually uses is the one downstairs, not the one in the onboarding doc.</p>
    <p>Acme People</p>
  `),

  "vercel-ready": statusMail({
    product: "Vercel",
    badge: "Ready",
    badgeBg: "#e6f6ec",
    badgeFg: "#1a7f37",
    title: "Deployment ready: mail-web",
    html: `
      <p>Production deployment for commit <code>4c1e90a</code> is ready.</p>
      ${dl([
        ["Project", "mail-web"],
        ["Commit", "4c1e90a"],
        ["Target", "Production"],
        ["Duration", "54s"],
      ])}
      ${button("Visit deployment", "#000000")}
    `,
    footer: "This deployment is currently serving production.",
  }),

  "recruiter-stealth": note(
    [
      "A founder asked me to reach out. 20 minutes this week?",
      "The company is stealth, series B, and the role is staff engineer on a product they won't describe in email. I'm sure you've heard this shape before.",
      "If the timing is wrong, say so and I won't follow up.",
      "Jordan Hale",
      "Brightpath Talent",
    ],
  ),

  "wire-invoice": page(
    `
    <div style="max-width:520px;margin:0 auto">
      <div style="padding:10px 12px;background:#9f1239;color:#fff;font-weight:700;letter-spacing:0.06em">URGENT — ACTION REQUIRED</div>
      <div style="padding:20px 4px 0">
        <h1>Invoice #88421 is past due</h1>
        <p>Wire $18,400 to avoid a service hold. The sender address is not Acme's, and Accounts Payable does not send wires from this domain.</p>
        ${dl([
          ["Invoice", "#88421"],
          ["Amount", "$18,400.00"],
          ["Reply-by", "Today, 5:00 PM"],
        ])}
        <a class="btn" href="#" style="background:#9f1239">Review invoice</a>
        <p style="color:#888;font-size:12px">This message is unsolicited.</p>
      </div>
    </div>
    `,
    `html, body { background:#fff5f5; }`,
  ),
}
