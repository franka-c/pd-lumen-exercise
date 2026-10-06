#!/usr/bin/env python3
"""Print the downstream impact of the files a pull request touched.

Usage: blast_radius.py <base-ref>

Writes markdown on stdout for a pull request comment. The point is not that
the tool knows whether the downstream is really broken. It is that changing
something quietly stops being possible.
"""
from __future__ import annotations

import pathlib
import subprocess
import sys

import yaml

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from pdlib import repo_root, superseded_by, walk  # noqa: E402


def changed_paths(root: pathlib.Path, base: str) -> set[str]:
    out = subprocess.run(
        ["git", "diff", "--name-only", f"{base}...HEAD"],
        cwd=root, capture_output=True, text=True, check=True,
    ).stdout
    return {line.strip() for line in out.splitlines() if line.strip()}


def main() -> int:
    base = sys.argv[1] if len(sys.argv) > 1 else "origin/main"
    root = repo_root()
    changed = changed_paths(root, base)

    by_path, by_id = {}, {}
    for path, fm in walk(root):
        rel = str(path.relative_to(root))
        if fm.get("deliverable"):
            entry = {"id": fm["deliverable"], "path": rel, "status": fm.get("status", "draft"),
                     "owner": fm.get("owner"), "feeds": fm.get("feeds", [])}
            by_path[rel] = entry
            by_id[entry["id"]] = entry

    touched = [by_path[p] for p in sorted(changed) if p in by_path]
    proto_touched = any(p.startswith("prototype/") for p in changed)

    log_touched = "log/decisions.md" in changed
    citing = []
    if log_touched:
        replaced = superseded_by(root)
        for path, fm in walk(root):
            if not fm.get("deliverable"):
                continue
            hits = [(d, replaced[d]) for d in (fm.get("decisions") or []) if d in replaced]
            if hits:
                citing.append((fm["deliverable"], fm.get("owner"), str(path.relative_to(root)), hits))

    if not touched and not proto_touched and not citing:
        print("No deliverable front-matter changed in this pull request.")
        return 0

    if citing:
        print("## Decisions superseded in this pull request\n")
        print("These deliverables cite a decision that no longer holds. Each owner re-reads "
              "against the new decision, then cites it, bumping `updated` if the content changed.\n")
        for did, owner, rel, hits in citing:
            for old, new in hits:
                print(f"- `{did}` (owner {owner}) cites {old}, superseded by {new}, `{rel}`")
        print()
    if not touched and not proto_touched:
        return 0

    print("## Downstream of this change\n")
    for entry in touched:
        print(f"**{entry['id']}** changed. It feeds:\n")
        if not entry["feeds"]:
            print("- nothing recorded. If that is wrong, fix `feeds` in its front-matter.\n")
            continue
        for fid in entry["feeds"]:
            if fid == "prototype":
                print("- `prototype`: check the rules pages of every feature built from this")
                continue
            d = by_id.get(fid)
            if d:
                print(f"- `{fid}`: status **{d['status']}**, owner {d['owner']}, `{d['path']}`")
            else:
                print(f"- `{fid}`: not in this repo yet")
        print()

    print("Confirm each one is unaffected, or open a follow-up issue. "
          "One line of reasoning per item is enough, and it goes in this thread.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
