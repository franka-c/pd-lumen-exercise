---
kind: rules
feature: f-01-sign-in
status: draft
decisions: [D-010, D-015, D-016, D-022, D-030]
covers: [states, long-text, data-shape, interaction, breakpoints]
---

# F-01 sign-in rules

Fictional client, created for an internal DECODE exercise.

Prototype: `prototype/features/f-01-sign-in/index.html`, version 0.4.0. Every state
opens with `?state=<id>`. `?long=1` loads long content and `?text=200` doubles the
text size. The prototype accepts any password that meets the rule. The panel forces
a wrong password or a network failure.

## Purpose

An owner gets into the app through an invitation their clinic sends by email or SMS
from the VetDesk owner record (06, F-01), and later signs in with a password (D-030).
The Account area holds the owner's details and sign-out (IA).

## Flows

- **Activation.** The invitation link opens the app, greets the owner by the name in
  VetDesk and asks for a password. Then Home. Opened on a computer, the link shows
  "Otvorite ovu poveznicu na telefonu" and a QR code. Expired or used, it offers a new
  one.
- **Sign-in.** Email or phone number, and password. Then Home.
- **Forgotten password.** Email: a link. Phone: a six-digit SMS code, then a new
  password. Then sign-in.
- **No invitation.** The owner enters an email or phone number. The reply is always
  the same, so the app never reveals who is a client (D-030).
- **Sign-out.** Account, "Odjava", confirm, then the welcome screen.

## States

| State | `?state=` |
| --- | --- |
| Welcome: "Prijava", "Nemam pozivnicu" | `welcome` |
| Activation, empty / password too short / ready / sending / network failure | `activate`, `activate-weak`, `activate-ready`, `activate-sending`, `activate-error` |
| Invitation expired or used | `invite-expired` |
| Invitation opened on a computer | `desktop-link` |
| Sign-in empty / filled / wrong format / wrong credentials / locked / sending / network failure | `signin`, `signin-filled`, `signin-format`, `signin-error`, `signin-locked`, `signin-sending`, `signin-network` |
| Forgotten password: entry / email sent / SMS code / wrong code / new password | `forgot`, `forgot-email-sent`, `forgot-sms-code`, `forgot-code-wrong`, `forgot-new-password` |
| Request an invitation / sent | `request-invite`, `request-invite-sent` |
| Account / sign-out confirmation | `account`, `account-signout` |

## Long-text behaviour

| Element | Rule | Tested with |
| --- | --- | --- |
| Owner name, email on Account and activation | wrap anywhere, never truncate | "Ana-Marija Kovačević-Horvat Šimunović", a 60-character address, at 360 px and 200% text |
| Bottom navigation labels | four tabs share the width and wrap | "Moji ljubimci" at 360 px and 200% text |
| Error and confirmation messages | wrap in full | |

## Data shape

| Field | Type | Required | Nullable | Notes | Source |
| --- | --- | --- | --- | --- | --- |
| `owner_id` | string | yes | no | the VetDesk owner record. One account per person, across clinics | 06, D-030 |
| `name` | string | yes | no | from VetDesk, read only | 06 |
| `email` | string | one of email or phone | yes | from VetDesk, read only. A sign-in identifier | A-2, D-030 |
| `phone` | string | one of email or phone | yes | E.164, from VetDesk, read only. A sign-in identifier | A-2, D-030 |
| `password` | secret | yes | no | **at least 8 characters, unconfirmed** (Q-016). Set on activation | D-030 |

Invitation: from the VetDesk owner record, by email or SMS, one use, **valid 7 days,
unconfirmed**. Password link: **valid 1 hour, unconfirmed**. SMS code: six digits.
Wrong sign-in: **5 attempts, then 15 minutes, unconfirmed** (Q-016).

## Interaction rules

- The identifier field takes an email or a phone number. Anything else shows
  "Upišite e-mail ili broj telefona." on submit. Typing clears the error.
- The password rule is shown while typing, not after an error. "Prikaži" toggles
  visibility.
- Each submit button is disabled until its fields are filled and valid. While sending
  it reads "Šaljem…". A network failure keeps the input and the button reads
  "Pokušaj ponovno".
- A wrong sign-in says "E-mail, broj ili lozinka nisu točni." and never which one.
  After the attempt limit the button stays disabled, even while typing.
- Forgotten password and invitation request replies never confirm that an account
  exists (D-030).
- Account shows name, email and phone read only, with "Za promjenu podataka javite se
  svojoj klinici." "Obavijesti" shows "Uskoro". "Odjava" asks "Odjaviti se?".
- No language setting (D-016, D-022), no reminder settings (D-015).
- The bottom bar has the four areas (D-010). F-01 builds only Račun.

## Breakpoints

As F-05: checked at 360, 390 and 768 px (centred 560 px column) and at 200% text at
360 px. Nothing scrolls sideways.

## Decisions

Made in the prototype design session for F-01 on 8 October 2026 and logged as D-030.
To confirm with Marta at the next review.

| Decision | Alternatives considered | Why |
| --- | --- | --- |
| A password set on activation | a code in a message every time; code then biometrics | familiar to owners; it brings password recovery with it |
| Sign in with email or phone number | add an email on activation; invite only owners with an email | no owner with only a phone number is left out (A-2) |
| Request an invitation in the app, same reply for everyone | only an instruction to call; reception sends it from F-10 | no call needed, and nobody can test whether someone is a client |
| Screens, password rule shown while typing, 7-day invitation, attempt limit, one account per person, Account, states | | proposed in the spec, confirmed by the designer. The numbers are unconfirmed |
| 1-hour password link, the expired-invitation explanation, "Pošalji kod ponovno" | | added in the build, approved by the designer |

Components: none added. The kit's Input, Button, Alert, Card, Tabs and Drawer cover
F-01.

## Open

| # | Question | Owner | Blocks |
| --- | --- | --- | --- |
| Q-016 | The password rule, invitation and link validity, the attempt limit, and whether every owner has an email or phone number at the clinic (A-2) | Marta, Iva | F-01 |
| | Notification preferences: F-11 is Future in 06, but the confirmed IA has them in Account | Ana (PM) | F-01, F-11 |

## Deferred

- Notification preferences are F-11. Account shows "Uskoro".
- Changing name, email or phone in the app. The owner asks the clinic.
- Staff sign-in for the reception web view is Q-015.
