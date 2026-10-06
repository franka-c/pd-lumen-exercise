---
kind: rules
feature: 
status: draft
decisions: []
covers: []
---

# <Feature> rules

A feature is complete when `covers` lists all five and each section below is
filled. The validator enforces this before `status: confirmed`.

## States

Empty, loading, partial, error, and every business state the feature can be in.

## Long-text behaviour

What happens to every field at its longest realistic value.

## Data shape

Fields, types, enum values, what is required, where each comes from.

## Interaction rules

What each control does, what is disabled when, what confirms, what is undoable.

## Breakpoints

What changes at each one, and what is dropped rather than shrunk.

## Deferred

Anything prioritization put in Phase 1, Phase 2 or Discard that a reader of this
screen would otherwise expect. Recorded here, not built.
