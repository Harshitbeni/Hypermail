# Relative Time Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a saved Relative time switch for message-list timestamps and remove the selected-count control from the bulk actions bar.

**Architecture:** `App` owns and persists the switch value. The tuning dock edits it, and `MessageList` passes it to the existing list-time formatter. Relative formatting uses the existing fixed reference date; reader dates remain unchanged. The bulk bar loses only the selected-count button and the divider immediately after it.

**Tech Stack:** React, TypeScript, Vite, local storage, existing CSS switch styles.

---

## Chunk 1: Relative Time Switch and Bulk Bar Cleanup

### Files

- Modify `src/App.tsx`: own the switch state, load and save it, and pass it to the dock and message list.
- Modify `src/components/dev/PrototypeTuningDocks.tsx`: add the Relative time switch beside Minimal.
- Modify `src/components/mail/MessageList.tsx`: pass the switch value to row timestamp formatting and remove the selected-count button and its adjacent divider.
- Modify `src/data/mail.ts`: add deterministic relative formatting to `formatListTime`, retaining its current output when the setting is off.
- Create `src/lib/relative-time.ts`: read and save the switch value with safe local-storage handling.
- Modify `src/styles.css` only if the existing switch styling does not fit the added dock control.

### Implementation Steps

- [ ] Add `readRelativeTime` and `persistRelativeTime` in `src/lib/relative-time.ts`. Use a unique local-storage key, default to `false`, and ignore storage errors like the existing tuning preference helpers.
- [ ] Add a boolean state in `App.tsx`, initialize it with `readRelativeTime`, and persist changes in an effect. Pass its value and setter to `PrototypeTuningDocks`; pass its value to `MessageList`.
- [ ] Add a Relative time switch to `PrototypeTuningDocks` using the existing `ListMinimalSwitch` interaction and appearance pattern. Give the control an accessible switch role and label.
- [x] Extend `formatListTime` with an optional relative-time setting. Preserve the current display when off. When on, use the fixed reference date: under one elapsed minute show `Just now`; same-day timestamps below one hour show floored whole minutes as `Xm` (for example, `59m`); same-day timestamps at or above one hour show floored whole hours as `Xh` (for example, exactly one hour shows `1h`). The previous local calendar day shows `1d`; older dates show their local calendar-day difference, such as `2d`. Do not use elapsed 24-hour periods for older dates. Use the current absolute label for future dates and `—` for invalid timestamps.
- [ ] Pass the setting to each message-row timestamp. Do not change `formatReaderDate` or the reader pane.
- [ ] Remove the selected-count button and the divider immediately after it from the bulk actions bar. Keep the other actions, separators, and order intact.
- [ ] Run `npm run build` and resolve any TypeScript or build errors.
- [ ] Manually confirm both switch states, persistence after reload, unchanged reader dates, and the absence of the selected-count control and its divider.

## Completion Check

- Relative time is off by default and survives reload after the user changes it.
- Relative list labels match the updated design, including `Just now`, `1d`, whole elapsed hours/minutes, and older calendar-day counts such as `2d`.
- The original list labels return when the switch is off. Reader dates remain unchanged.
- The bulk bar no longer contains the selected-count button or its adjacent divider.
- `npm run build` succeeds.
