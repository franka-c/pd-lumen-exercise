# Lumen Veterinary product discovery

Source of truth for this discovery. Created from `pd-project-template`.

Lumen Veterinary is a fictional client. This repository is the playing field for a
DECODE team exercise. Every file, name and date in it is invented.

New here? Read `CLAUDE.md`, then `discovery.yml`, then `log/decisions.md`.

## Layout

```
discovery.yml              generated index, regenerate before each pull request, never edit by hand
log/                       the Discovery Log: calls, decisions, open questions
deliverables/              one folder per in-scope deliverable, markdown source
prototype/                 the development-ready prototype and its rules pages
handson/                   rough throwaway prototypes for workshops
client/                    what the client gave us, raw
research/                  what we gathered, not yet worked into a deliverable
scripts/                   vendored from pd-core
```

## Setup

```bash
pip install pyyaml
python scripts/build_index.py
python scripts/validate.py
```

## Branches and tags

One branch per deliverable version, `05-ia/v2`. Tag client confirmations,
`confirmed/05-ia/2026-09-25`. Do not model discovery phases as long-lived
branches; deliverables move at different speeds.
