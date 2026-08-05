from __future__ import annotations

import json
import re
from typing import Any

import google.generativeai as genai
from fastapi import HTTPException

from app.config import settings

QUOTA_HINT = (
    "Gemini 무료 할당량(분당 요청 한도)을 초과했습니다. "
    "약 40초 후 다시 시도해 주세요."
)


def is_quota_error(message: object) -> bool:
    text = str(message).lower()
    return any(
        token in text
        for token in (
            "429",
            "quota",
            "rate limit",
            "resource_exhausted",
            "exceeded your current quota",
            "할당량",
        )
    )


def require_gemini() -> None:
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY가 없습니다. Render Environment 또는 backend/.env 에 키를 설정하세요.",
        )


def get_model(system_instruction: str | None = None):
    require_gemini()
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"
    if system_instruction:
        return genai.GenerativeModel(
            model_name,
            system_instruction=system_instruction,
        )
    return genai.GenerativeModel(model_name)


def generate_text(prompt: str, system_instruction: str | None = None) -> str:
    model = get_model(system_instruction)
    try:
        response = model.generate_content(prompt)
        text = getattr(response, "text", None) or ""
        if not text and getattr(response, "candidates", None):
            parts = response.candidates[0].content.parts
            text = "".join(getattr(p, "text", "") for p in parts)
        return text.strip()
    except Exception as exc:  # noqa: BLE001
        if is_quota_error(exc):
            raise HTTPException(status_code=429, detail=QUOTA_HINT) from exc
        raise HTTPException(
            status_code=502,
            detail=f"Gemini 호출 실패: {str(exc)[:240]}",
        ) from exc


def strip_json_fence(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def parse_json_response(text: str) -> Any:
    cleaned = strip_json_fence(text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}|\[[\s\S]*\]", cleaned)
        if not match:
            raise HTTPException(
                status_code=502,
                detail="Gemini JSON 파싱 실패",
            )
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Gemini JSON 파싱 실패: {exc}",
            ) from exc
