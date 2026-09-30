# Relative Time Tuning Design

## Goal

Add a saved Relative time switch to the prototype tuning dock. When enabled,
message-list timestamps use relative labels. The reading pane keeps its current
date format. Also remove the selected-count control and its adjacent divider
from the bulk actions bar.

## Behavior

- The switch is off by default, so the current message-list date format stays
  unchanged until the user turns it on.
- When enabled, messages sent today show compact elapsed time (`Xm` under one
  hour, `Xh` at one hour or more). Round down to whole minutes or hours. Show
  `Just now` for less than one elapsed minute. Messages from the previous
  calendar day show `1d`. Older messages show the calendar-day difference,
  such as `2d`, using local calendar dates rather than elapsed 24-hour periods.
- Messages later than the reference time use the existing absolute time/date
  label so the relative format never says they were sent `ago`. Invalid dates
  show `—` while relative time is enabled.
- Relative labels use the same fixed reference date as the existing prototype
  date formatter so the sample data stays deterministic. For example, a
  message sent at 1:29 PM shows `1h` at 2:30 PM, one sent at 1:30 PM shows
  `1h`, and one sent at 1:31 PM shows `59m`.
- The switch affects only timestamps in message rows. Reader dates do not
  change.
- Save the switch value in local storage, following the existing prototype
  tuning preferences. If local storage is unavailable or has no saved value,
  use the off state.
- Remove the bulk action bar's selected-count button and its immediately
  following divider. Keep the remaining bulk actions and their current
  ordering and behavior.

## Components and Data Flow

- `App` owns the relative-time value, loads its initial value, saves changes,
  and passes the value and change handler to the tuning dock and message list.
- `PrototypeTuningDocks` adds a switch labeled `Relative time`, using the same
  appearance and interaction pattern as the existing `Minimal` switch.
- The existing list timestamp formatter accepts the relative-time setting or
  delegates to a focused relative formatter. `MessageList` supplies the
  setting when it renders each row timestamp.
- `ReaderPane` and its date formatter remain unchanged.
- `MessageList` removes only the selected-count control and its adjacent
  divider from the bulk actions bar.

## Error Handling

Local storage reads and writes must tolerate browser storage being unavailable,
matching the existing tuning preference helpers. The interface continues with
the default off state when a read fails.

## Validation

- Confirm the switch appears beside the existing tuning controls and can be
  turned on and off.
- Confirm on-state relative labels appear in message rows and the setting
  remains after a page reload.
- Confirm turning the switch off restores the current time/date labels.
- Confirm reader dates do not change.
- Confirm the selected-count button and its adjacent divider are absent while
  the remaining bulk actions still work.
- Run the project build.
