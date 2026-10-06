# Lumen Veterinary product discovery (team exercise)

This repository is the source of truth for the Lumen Veterinary product discovery.
Lumen is a fictional client. This repo exists for a DECODE team exercise.
Everything the team or an agent needs is here, or linked from here.

## Read this first, every session

0. Sync with the shared version before you read anything: pull `main`, and if you
   are on a working copy, bring `main` into it. Nothing watches the remote for
   you. An index read from a stale copy is wrong, and nothing will say so.
1. `discovery.yml`: the generated index. Every deliverable with its status,
   owner, last change, and whether anything upstream has moved since. Never edit
   it by hand. Regenerate it with `python scripts/build_index.py` before every pull
   request; the validate check fails when the committed index is stale.
2. `log/decisions.md`: what has been settled and why. Numbered, append-only.
3. `log/open-questions.md`: what is still open, and who owns it.

Then read the `depends_on` deliverables of whatever you are about to touch. If
`discovery.yml` flags it stale, resolve that before writing anything new.

## The project

Lumen Veterinary runs 14 veterinary clinics in Croatia and Slovenia. Pet owners
book by phone or through a widget from VetDesk, the practice software, which the
clinics dislike. Greenfield. The discovery produces a development-ready prototype of
a pet owner app (appointments, reminders, the pet's record, repeat prescriptions)
and a light staff web view, in eight weeks from 21 September 2026. The central
technical risk is whether the VetDesk API allows writing appointments.

Deliverables in scope are the ones present under `deliverables/`: 01, 03, 05, 06,
07 and the prototype. Market research, user research, visual identity, UI design,
timeline and handover are out of this exercise's scope and their folders are absent.

## Deliverable to skill

| Deliverable | Skill |
| --- | --- |
| 01 Project Alignment | `decode-product-discovery:pd-project-alignment` |
| 03 User Personas | `pd-user-personas`, then `pd-user-personas-design` for Figma |
| 05 Information Architecture | `pd-ia-design` for the board, `pd-information-architecture` for the write-up |
| 06 Feature Prioritization | `pd-feature-prioritization` |
| 07 Technical Solution Proposal | `pd-technical-solution-proposal` |
| 10 Development-ready Prototype | `pd-prototype-design` |
| 11 Timeline and Budget | `ai-native-estimation`, then `project-timeline-gantt` |
| Any branded Word output | `pd-deliverable-doc` |

02 Market Research and 04 User Research have no skill yet. Write them by hand
against the playbook chapter.

## House rules

- **Markdown and CSV are the source.** Word documents and the prioritization
  workbook are generated at release. Never edit a generated file, CI overwrites it.
- **Every file carries front-matter.** See `docs/frontmatter.md`. A file without
  it is invisible to the index, the staleness check and the pull request checks.
- **`status: confirmed` is set only in a reviewed pull request**, and needs
  `confirmed_with_client`. Not by editing the line.
- **Answer a staleness flag one of two ways.** If the deliverable needed changes,
  make them and bump `updated`. If it is still correct, add a `reviewed` line with
  a date and a reason and leave `updated` alone. Bumping `updated` to make a flag
  go away flags everything downstream for a change that did not happen.
- **A change under `prototype/features/` ships with its `prototype/rules/` page.**
  CI fails the pull request otherwise.
- **Hands-on prototypes live in `handson/`, stay rough, and are never promoted.**
  What they settle goes into `log/decisions.md` and is rebuilt properly in
  `prototype/`.
- **A superseded decision is a flag.** When a new decision replaces an old one, every
  deliverable citing the old one is listed on the pull request. Re-read it against the
  new decision and cite that instead. Bump `updated` only if the content changed.
- **Cite decisions.** Every claim in a deliverable traces to a `D-nnn` entry, and
  every rules page cites the decision that set the rule.
- **Recordings and files over 10 MB stay in Drive.** Commit the link and the
  transcript, not the file.
- **Loose material goes in `client/` or `research/`, never in a folder named
  after a person.** Each folder carries a `README.md` with front-matter saying
  what it is and what it feeds.

## Voice

DECODE house voice. Sentence case everywhere, including headings. Active voice,
short sentences, one idea per sentence, US English. Write "you" and "we".

Never: em dashes, title case headings, streamline, leverage, utilize, seamless,
foster, synergy, "it's not X, it's Y". Spell out an abbreviation on first use.
Every claim names its evidence. No sales language in a client deliverable.

## Before you open a pull request

- Sync with `main` again, so the checks and the blast radius run against what the
  team has merged since you started.
- `python scripts/validate.py` passes.
- `python scripts/build_index.py`, and the regenerated `discovery.yml` is committed
  with the change. The resulting staleness is either clear or answered with an
  update or a `reviewed` line.
- The other two of the triad are on the review. PM owns value and viability,
  designer usability, architect feasibility.
