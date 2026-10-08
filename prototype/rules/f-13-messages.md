---
kind: rules
feature: f-13-messages
status: draft
decisions: [D-006, D-011, D-012, D-018, D-025, D-036]
covers: [states, long-text, data-shape, interaction, breakpoints]
---

# F-13 reception messages rules

Fictional client, created for an internal DECODE exercise.

Prototype: `prototype/features/f-13-messages/index.html`, version 1.0.0.
`?side=reception` is the reception web view (desktop), `?side=owner` the owner app.
Every state opens with `?state=<id>`. `?long=1` loads long content and `?text=200`
doubles the text size. The mock "now" is Tuesday 20 October 2026, 10:00.

## Purpose

Forty calls a day at Trešnjevka are reception telling an owner something: "your
results are in", "bring the vaccination booklet" (Marta, Sanja, IA workshop). Reception
sends one-way messages from templates plus free text, and the owner gets a push and
reads them in the app (D-011). The owner cannot reply (D-012). Messages sit on Home in
"Od vaše klinike" (D-018). Reception sends from a third list, Messages, and sees what
it sent (D-025).

## Flows

- **New message.** Messages, "Nova poruka", search an owner, pick the pet, a template,
  edit, an optional link, "Pošalji".
- **From a request.** "Pošalji poruku vlasniku" in an F-10 detail opens the new
  message with owner and pet chosen.
- **Owner.** A push opens the message (D-018). Home shows the last three with an
  unread dot, then "Prikaži sve". A link opens the consultation (F-03) or the
  appointment.
- **Owner without the app.** The message goes by email if there is one (D-036).

## States

| Side | State | `?state=` |
| --- | --- | --- |
| Reception | Sent messages with every status | `sent` |
| Reception | Nothing sent yet | `sent-empty` |
| Reception | New message, search | `compose` |
| Reception | Search results / no results | `compose-results`, `compose-no-results` |
| Reception | Filled, app channel, link to a consultation | `compose-filled` |
| Reception | Started from a request | `compose-from-request` |
| Reception | Owner without the app: email | `compose-email` |
| Reception | Owner with neither app nor email: call | `compose-no-contact` |
| Reception | Sending / failed | `compose-sending`, `compose-error` |
| Owner | Home section, three of four, unread dot | `home` |
| Owner | All messages | `all` |
| Owner | A message with a link / without | `message`, `message-plain` |
| Owner | Push | `push` |
| Owner | No messages: the section is not shown | `home-none` |
| Owner | The email an owner without the app receives | `email` |

## Long-text behaviour

| Element | Rule | Tested with |
| --- | --- | --- |
| Message text in the sent list and on Home | one line, ellipsis | a 330-character message |
| Opened message | in full, line breaks kept | same, at 360 px and 200% text |
| Push body | 90 characters, then an ellipsis | same |
| Message field | at most **500 characters, unconfirmed**, with a live count | |

## Data shape

`message`, held by our backend

| Field | Type | Required | Nullable | Notes | Source |
| --- | --- | --- | --- | --- | --- |
| `owner_id`, `pet_id` | string | yes | no | by search or from a request | D-036 |
| `text` | string | yes | no | from a template, editable, **500 characters, unconfirmed** | D-011, Q-022 |
| `template_id` | enum | no | yes | `results`, `booklet` from the inputs; **`call`, `phone-confirmed` ours, unconfirmed** | D-011, Q-022 |
| `link` | {kind, target} | no | yes | `consultation` (F-03) or `appointment` | D-018 |
| `channel` | enum | yes | no | `app` (push) when the owner activated F-01, else `email` if on file. Neither blocks sending | D-011, D-036 |
| `sent_by`, `sent_at` | string, datetime | yes | no | | D-025 |
| `read_at` | datetime | no | yes | app only. **After 24 hours unread, unconfirmed:** "Nije pročitano. Razmislite o pozivu" | D-036, Q-022 |

## Interaction rules

- The search takes an owner's name, a pet's name or a phone number, from two
  characters. "Nema vlasnika za '…'." when nothing matches.
- A template fills the text, which reception can edit. Changing the pet refills it.
  "Nalazi su stigli" links to the latest consultation, "Ponesite knjižicu cijepljenja"
  to the next appointment. Reception can change or remove the link.
- Before sending, the channel shows: app with push; "Šalje se e-mailom" with no read
  status; or "Vlasnik nema aplikaciju ni e-mail. Nazovite …" with "Pošalji" disabled.
- "Pošalji" is disabled without text. A sent message cannot be edited or deleted.
- The owner sees clinic, date, the full text, the link, and "Na ovu poruku ne možete
  odgovoriti. Za pitanja nazovite kliniku." with the phone. There is no reply field.
- Opening a message marks it read for reception.

## Breakpoints

Reception as F-10: 900, 1024, 1280 and 1440 px. Owner as F-05: 360, 390 and 768 px.
Email in its 600 px column. 200% text on both sides. Nothing scrolls sideways.

## Decisions

Made in the prototype design session for F-13 on 8 October 2026 and logged as D-036.
To confirm with Marta at the next review.

| Decision | Alternatives considered | Why |
| --- | --- | --- |
| Search in Messages, and from a request in F-10 | search only; context only | Sanja can message the owner she is looking at, and anyone else |
| "Pročitano" with a time, a call hint after 24 hours | delivered only; no status | reception knows when to call after all |
| Email for an owner without the app | reception sees and calls; SMS | the message still reaches older owners. Extends D-011 |
| Templates, edit before sending, links, the no-contact rule, the lists, the states | | proposed in the spec, confirmed by the designer |

Also changed: F-10's Poruke tab opens this view, and its details offer "Pošalji poruku
vlasniku". F-07's Home shows the "Od vaše klinike" section.

Components: none added.

## Open

| # | Question | Owner | Blocks |
| --- | --- | --- | --- |
| Q-022 | Email as an extension of D-011, the two extra templates, 500 characters, 24 hours, and read receipts in the privacy notice | Marta | F-13 |
| Q-020 | An unsubscribe link in emails | Marta | F-07, F-13 |
