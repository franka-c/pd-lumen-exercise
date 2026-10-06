# Before the test drive

This page is the checklist we run before the team test drive of the Lumen
exercise. The pull request that adds it is also the rehearsal: it walks the whole
loop once (get up to date, working copy, send for review, review, merge) on a file
that changes nothing in the discovery.

It lives in `docs/`, which the index, the validate check and the blast radius do
not read. Merging it leaves the starting state exactly as the guide expects:
five confirmed deliverables, the technical proposal in review, the prototype not
started, three open questions, nothing flagged.

## What is already set up

As of 6 October 2026:

- The repo is `franka-c/pd-lumen-exercise`, public, with "Lumen exercise, state
  after week 3" as the first commit on `main`.
- GitHub Actions is enabled. There is one workflow, `validate.yml`.
- `main` is protected: a pull request is required, with one approval and the
  `validate` check, and administrators cannot bypass it.
- The `validate` check name is confirmed. It ran on a test pull request (#1),
  which was closed without merging.

## The rehearsal

The author says these sentences to their own Claude:

1. "Get me up to date."
2. "Start a working copy for the test drive checklist."
3. "Add this file as docs/before-the-test-drive.md."
4. "Send it for review."

What should happen:

- The `validate` check passes.
- The bot comments "No deliverable front-matter changed in this pull request."
- `#pd-lumen-exercise` in Slack shows the pull request, the bot comment and the
  check result.
- The merge button stays locked until someone other than the author approves.
- Someone other than the author merges, and the branch is deleted.

Then anyone asks their Claude "Where does this discovery stand?". The answer
must still match the starting state above. If it does not, stop and find out why
before the test drive.

## Checklist for the day before

Each player:

- [ ] Has accepted the invitation to `franka-c/pd-lumen-exercise` with write
      access.
- [ ] Has the Claude desktop app with the `decode-product-discovery` plugin,
      signed in to GitHub.
- [ ] Has Python with PyYAML. Claude regenerates `discovery.yml` before every
      pull request and cannot without it. Check with
      `python3 -c "import yaml"`, install with `pip install pyyaml`.
- [ ] Has run the round 1 sentences once and got the expected answer.
- [ ] Has signed in to the GitHub app in Slack with `/github signin`.

The facilitator:

- [ ] `#pd-lumen-exercise` is subscribed to the repo, with `comments`, `reviews`
      and `workflows` on.
- [ ] `main` has only two commits: the first commit and this page. Nothing else
      has landed.
- [ ] The guide and the answer key are printed. The answer key stays with the
      facilitator.
- [ ] The three role cards are printed, one per player.
- [ ] `inputs/` stays with the facilitator until rounds 2 and 4.
- [ ] Who merges is decided and named: the product manager merges, the architect
      merges the product manager's work.
- [ ] The "How the team works" tab is ready to show on screen.

## Known gaps in the guide

- The guide says to create a private repo in the DECODE organization. Branch
  protection on a private repo needs a paid GitHub plan, so this repo is public
  under a personal account. Players join it as collaborators, not through the
  organization.
- Everything in the repo is invented, so a public repo is safe. Do not add real
  client material to it.
