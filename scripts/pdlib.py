"""Shared helpers: front-matter parsing and git dates."""
from __future__ import annotations

import datetime as _dt
import pathlib
import re
import subprocess
from typing import Any

import yaml

ROOTS = ("deliverables", "prototype", "log", "client", "research")
DELIVERABLE_DIR = "deliverables"


def repo_root(start: pathlib.Path | None = None) -> pathlib.Path:
    here = (start or pathlib.Path.cwd()).resolve()
    for candidate in (here, *here.parents):
        if (candidate / ".git").exists():
            return candidate
    return here


def front_matter(path: pathlib.Path) -> dict[str, Any] | None:
    """Return the YAML front-matter of a markdown file, or None if it has none."""
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None
    if not text.startswith("---"):
        return None
    parts = text.split("---", 2)
    if len(parts) < 3:
        return None
    try:
        data = yaml.safe_load(parts[1])
    except yaml.YAMLError:
        return None
    return data if isinstance(data, dict) else None


def last_commit(path: pathlib.Path, root: pathlib.Path) -> str | None:
    """ISO date of the last commit touching this path. None when untracked."""
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cI", "--", str(path.relative_to(root))],
            cwd=root, capture_output=True, text=True, check=True,
        ).stdout.strip()
    except (subprocess.CalledProcessError, ValueError, FileNotFoundError):
        return None
    return out or None


def as_date(value: Any) -> _dt.date | None:
    if isinstance(value, _dt.datetime):
        return value.date()
    if isinstance(value, _dt.date):
        return value
    if isinstance(value, str) and value:
        try:
            return _dt.datetime.fromisoformat(value.replace("Z", "+00:00")).date()
        except ValueError:
            return None
    return None


def parse_review(value: Any):
    """Split a `reviewed` entry into (date, reason).

    Format: "2026-09-30 no structural change, only labels renamed".
    """
    if isinstance(value, (_dt.date, _dt.datetime)):
        return as_date(value), ""
    if isinstance(value, str):
        head, _, reason = value.strip().partition(" ")
        return as_date(head), reason.strip()
    return None, ""


SKIP_NAMES = {"TEMPLATE.md"}


def changed_at(fm: dict, path: pathlib.Path, root: pathlib.Path):
    """When this file's content last changed: the date it declares in `updated`.

    Git history is deliberately not used. A commit that only records a review,
    ticks a Figma date or fixes front-matter would otherwise re-flag everything
    downstream for a change that never happened. A forgotten `updated` is caught
    at pull request time instead: see check_updated_moved in validate.py.
    Falls back to the last commit only when `updated` is missing.
    """
    return as_date(fm.get("updated")) or as_date(last_commit(path, root))


def reconciled_at(fm: dict, path: pathlib.Path, root: pathlib.Path):
    """When this file was last brought in line with its inputs. Same signal."""
    return changed_at(fm, path, root)



def walk(root: pathlib.Path):
    """Yield (path, front-matter) for every markdown file under the tracked roots.

    Files named TEMPLATE.md are skipped. They carry example front-matter on
    purpose and are not content.
    """
    for rel in ROOTS:
        base = root / rel
        if not base.exists():
            continue
        for path in sorted(base.rglob("*.md")):
            if path.name in SKIP_NAMES:
                continue
            fm = front_matter(path)
            if fm:
                yield path, fm


def decisions_log(root: pathlib.Path) -> dict[str, dict]:
    """Parse log/decisions.md into {id: {"supersedes": [ids]}}.

    Decisions are append-only. A later entry that names an earlier one in its
    `Supersedes.` line replaces it. The map returned by superseded_by() is what
    the validator and the index use to find deliverables still citing the old one.
    """
    path = root / "log" / "decisions.md"
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")
    out: dict[str, dict] = {}
    blocks = re.split(r"^(?=#+\s*D-\d{3}\b)", text, flags=re.M)
    for block in blocks:
        m = re.match(r"#+\s*(D-\d{3})", block)
        if not m:
            continue
        did = m.group(1)
        sup = re.search(r"\*{0,2}Supersedes\.?\*{0,2}\s*(.+)", block)
        olds = re.findall(r"D-\d{3}", sup.group(1)) if sup else []
        out[did] = {"supersedes": [o for o in olds if o != did]}
    return out


def superseded_by(root: pathlib.Path) -> dict[str, str]:
    """{old decision id: the latest decision that replaced it}."""
    log = decisions_log(root)
    latest: dict[str, str] = {}
    for did in sorted(log):
        for old in log[did]["supersedes"]:
            latest[old] = did
    # follow chains: D-014 -> D-021 -> D-030
    for old in list(latest):
        seen = {old}
        cur = latest[old]
        while cur in latest and cur not in seen:
            seen.add(cur)
            cur = latest[cur]
        latest[old] = cur
    return latest
