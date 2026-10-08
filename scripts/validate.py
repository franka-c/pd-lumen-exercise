#!/usr/bin/env python3
"""Fail a pull request on a broken front-matter contract.

Errors block the merge. Warnings do not, but they are the early signs of a
repo drifting out of trust: a declared date that disagrees with git, a write-up
that has not been reconciled with its Figma board, material left raw for weeks.
"""
from __future__ import annotations

import datetime
import pathlib
import re
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from pdlib import as_date, front_matter, parse_review, repo_root, superseded_by, walk  # noqa: E402

STATUS = {"draft", "in-review", "confirmed", "superseded"}
MATERIAL_STATUS = {"raw", "worked-in"}
OWNERS = {"pm", "designer", "architect"}
COVERS = {"states", "long-text", "data-shape", "interaction", "breakpoints"}
RAW_AGE_LIMIT = 14

errors: list[str] = []
warnings: list[str] = []


def known_decisions(root: pathlib.Path) -> set[str]:
    path = root / "log" / "decisions.md"
    if not path.exists():
        return set()
    return set(re.findall(r"^#+\s*(D-\d{3})", path.read_text(encoding="utf-8"), re.M))


def body_of(text: str) -> str:
    parts = text.split("---", 2)
    return parts[2].strip() if text.startswith("---") and len(parts) == 3 else text.strip()


def today_dates(root: pathlib.Path) -> set:
    """Dates that count as today: the runner's clock and the date of the last commit.

    CI runs in UTC. The last commit carries the author's own timezone, so a change
    made just after midnight in Zagreb still counts as that day.
    """
    days = {datetime.date.today()}
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%cI"], cwd=root,
                             capture_output=True, text=True, check=True).stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        out = ""
    if as_date(out):
        days.add(as_date(out))
    return days


def date_moved(old_fm: dict, new_fm: dict, today: set) -> bool:
    """True when `updated` moved, or already says today.

    `updated` has day precision. A deliverable updated earlier the same day cannot
    move again, and that date already covers a second change made the same day.
    """
    new = as_date(new_fm.get("updated"))
    return new != as_date(old_fm.get("updated")) or new in today


def check_updated_moved(root: pathlib.Path, base: str) -> None:
    """A deliverable whose content changed must also move its `updated` date.

    `updated` is the only signal the staleness check reads, so a forgotten bump
    would hide a change from everything downstream. Edits that touch only
    front-matter (a review, a Figma date, a status) are allowed to leave it alone.
    A date that already says today passes, see date_moved.
    """
    try:
        names = subprocess.run(["git", "diff", "--name-only", f"{base}...HEAD"], cwd=root,
                               capture_output=True, text=True, check=True).stdout.split()
    except (subprocess.CalledProcessError, FileNotFoundError):
        warnings.append(f"could not diff against {base}, skipped the updated-date check")
        return
    today = today_dates(root)
    manifest = "prototype/README.md"
    if any(n.startswith("prototype/") and n != manifest for n in names) and (root / manifest).exists():
        new_fm = front_matter(root / manifest)
        old_run = subprocess.run(["git", "show", f"{base}:{manifest}"], cwd=root, capture_output=True, text=True)
        old_fm = front_matter_from_text(old_run.stdout) if old_run.returncode == 0 else None
        if new_fm and old_fm and not date_moved(old_fm, new_fm, today):
            errors.append(f"{manifest}: something under prototype/ changed but `updated` did not move. "
                          f"The prototype is a deliverable, and its date is what flags everything built after it.")
    for rel in names:
        path = root / rel
        if not rel.endswith(".md") or not path.exists():
            continue
        new_fm = front_matter(path)
        if not new_fm or not new_fm.get("deliverable"):
            continue
        old = subprocess.run(["git", "show", f"{base}:{rel}"], cwd=root, capture_output=True, text=True)
        if old.returncode != 0:
            continue  # new file
        if body_of(old.stdout) == body_of(path.read_text(encoding="utf-8")):
            continue  # front-matter only
        old_fm = front_matter_from_text(old.stdout)
        if old_fm and not date_moved(old_fm, new_fm, today):
            errors.append(f"{rel}: the content changed but `updated` did not move. "
                          f"If nothing changed in substance, revert the edit; otherwise bump `updated`.")


def front_matter_from_text(text: str):
    import yaml
    if not text.startswith("---"):
        return None
    parts = text.split("---", 2)
    try:
        data = yaml.safe_load(parts[1]) if len(parts) == 3 else None
    except yaml.YAMLError:
        return None
    return data if isinstance(data, dict) else None


def main() -> int:
    root = repo_root()
    base = sys.argv[sys.argv.index("--base") + 1] if "--base" in sys.argv else None
    decisions = known_decisions(root)
    replaced = superseded_by(root)
    ids: dict[str, str] = {}
    entries = []

    for path, fm in walk(root):
        rel = str(path.relative_to(root))
        entries.append((rel, path, fm))
        if fm.get("deliverable"):
            if fm["deliverable"] in ids:
                errors.append(f"{rel}: deliverable id {fm['deliverable']} already used by {ids[fm['deliverable']]}")
            ids[fm["deliverable"]] = rel

    for rel, path, fm in entries:
        kind = fm.get("kind")

        if fm.get("deliverable"):
            for field in ("status", "owner", "updated"):
                if not fm.get(field):
                    errors.append(f"{rel}: missing required field '{field}'")
            if fm.get("status") not in STATUS and fm.get("status"):
                errors.append(f"{rel}: status '{fm['status']}' is not one of {sorted(STATUS)}")
            if fm.get("owner") not in OWNERS and fm.get("owner"):
                errors.append(f"{rel}: owner '{fm['owner']}' is not one of {sorted(OWNERS)}")
            if fm.get("status") == "confirmed" and not fm.get("confirmed_with_client"):
                errors.append(f"{rel}: status is confirmed but confirmed_with_client is not set")
            for dep in fm.get("depends_on", []):
                if dep not in ids and dep != "prototype":
                    errors.append(f"{rel}: depends_on '{dep}' does not exist in this repo")
            reviewed = fm.get("reviewed") or {}
            if not isinstance(reviewed, dict):
                errors.append(f"{rel}: reviewed must map a deliverable id to 'date reason'")
            else:
                for dep, val in reviewed.items():
                    if dep not in (fm.get("depends_on") or []):
                        errors.append(f"{rel}: reviewed '{dep}' is not in depends_on")
                    when, why = parse_review(val)
                    if not when:
                        errors.append(f"{rel}: reviewed '{dep}' needs a leading date, e.g. '2026-09-30 reason'")
                    elif not why:
                        errors.append(f"{rel}: reviewed '{dep}' needs a reason after the date")
            for dec in fm.get("decisions", []):
                if decisions and dec not in decisions:
                    errors.append(f"{rel}: cites {dec}, which is not in log/decisions.md")
                elif dec in replaced:
                    warnings.append(f"{rel}: cites {dec}, superseded by {replaced[dec]}. "
                                    f"Re-read it against {replaced[dec]}, then cite {replaced[dec]} "
                                    f"(and bump updated if the content changed)")
            declared = as_date(fm.get("updated"))
            if fm.get("figma"):
                checked = as_date(fm.get("figma_checked"))
                if not checked:
                    warnings.append(f"{rel}: links a Figma board but has no figma_checked date")
                elif declared and checked < declared:
                    warnings.append(f"{rel}: the write-up moved on {declared}, Figma last reconciled {checked}")

        elif kind == "material":
            if fm.get("status") not in MATERIAL_STATUS:
                errors.append(f"{rel}: material status must be one of {sorted(MATERIAL_STATUS)}")
            if not fm.get("topic"):
                errors.append(f"{rel}: material needs a topic")
            added = as_date(fm.get("added"))
            if fm.get("status") == "raw" and added:
                age = (datetime.date.today() - added).days
                if age > RAW_AGE_LIMIT:
                    warnings.append(f"{rel}: raw for {age} days, either work it in or drop it")
            for dep in fm.get("feeds", []):
                if dep not in ids and dep != "prototype":
                    warnings.append(f"{rel}: feeds '{dep}', which does not exist in this repo")

        elif kind == "rules":
            if not fm.get("feature"):
                errors.append(f"{rel}: rules page needs a feature")
            for dec in fm.get("decisions", []) or []:
                if dec in replaced:
                    warnings.append(f"{rel}: cites {dec}, superseded by {replaced[dec]}")
            missing = COVERS - set(fm.get("covers", []))
            if fm.get("status") == "confirmed" and missing:
                errors.append(f"{rel}: confirmed but does not cover {sorted(missing)}")

    # depends_on and feeds describe the same edge from both ends. Say so when they disagree.
    by_id = {fm["deliverable"]: fm for _, _, fm in entries if fm.get("deliverable")}
    for did, fm in by_id.items():
        for dep in fm.get("depends_on") or []:
            up = by_id.get(dep)
            if up is not None and did not in (up.get("feeds") or []):
                warnings.append(f"{did} depends on {dep}, but {dep} does not list it in feeds")
        for down in fm.get("feeds") or []:
            dn = by_id.get(down)
            if dn is not None and did not in (dn.get("depends_on") or []):
                warnings.append(f"{did} feeds {down}, but {down} does not list it in depends_on")

    # Every prototype feature has a rules page, and the reverse. A feature may start
    # without one, so a missing page warns rather than blocks: the designer builds
    # first and writes the rules as the feature settles.
    features = {p.name for p in (root / "prototype" / "features").glob("*") if p.is_dir()}
    ruled = {p.stem for p in (root / "prototype" / "rules").glob("*.md") if p.name != "TEMPLATE.md"}
    for name in sorted(features - ruled):
        warnings.append(f"prototype/features/{name}: no rules page yet at prototype/rules/{name}.md. "
                        f"Write it before the feature goes to the client")
    for name in sorted(ruled - features):
        warnings.append(f"prototype/rules/{name}.md: no feature at prototype/features/{name}")

    if base:
        check_updated_moved(root, base)

    for line in warnings:
        print(f"warning: {line}")
    for line in errors:
        print(f"error: {line}")
    print(f"\n{len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
