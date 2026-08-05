from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


Verdict = Literal["green", "amber", "red"]


class ReasonAxes(BaseModel):
    accuracy_critical: bool = False
    reversible: bool = True
    judgment_required: bool = False
    summary: str = ""


class TaskOut(BaseModel):
    id: str
    name: str
    verdict: Verdict
    reason: ReasonAxes | dict[str, Any]
    cause_type: str | None = None
    recommended_ai: str
    guide: str = ""
    order_index: int


class DecomposeRequest(BaseModel):
    project_input: str = Field(..., min_length=1)
    approved_ai: list[str] = Field(default_factory=list)


class GuideRequest(BaseModel):
    project_input: str = ""
    tasks: list[dict[str, Any]] = Field(default_factory=list)
    approved_ai: list[str] = Field(default_factory=list)


class AssignmentItem(BaseModel):
    task_id: str
    member_id: Literal["A", "B", "C"]


class AssignRequest(BaseModel):
    project_input: str = ""
    assignments: list[AssignmentItem]


class ExecuteRequest(BaseModel):
    task_id: str
    task_name: str = ""
    project_input: str = ""
    verdict: Verdict | None = None
