"""In-memory store when Supabase is not configured."""

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

_assignments: list[dict[str, Any]] = []
_projects: list[dict[str, Any]] = []


def save_assignments(project_input: str, assignments: list[dict[str, str]]) -> dict:
    record = {
        "id": str(uuid4()),
        "project_input": project_input,
        "assignments": assignments,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _assignments.append(record)
    return deepcopy(record)


def list_assignments() -> list[dict]:
    return deepcopy(_assignments)


def save_project(raw_input: str, goal: str, tasks: list[dict]) -> dict:
    record = {
        "id": str(uuid4()),
        "raw_input": raw_input,
        "goal": goal,
        "tasks": tasks,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _projects.append(record)
    return deepcopy(record)
