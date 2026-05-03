import json
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

AUDIT_LOG = "/app/audit.log"

INJECTION_PATTERNS = [
    "ignore previous instructions",
    "disregard all prior",
    "you are now",
    "forget your instructions",
    "system prompt",
    "jailbreak",
    "act as",
    "pretend you are",
    "override instructions",
]


@router.get("/events")
def get_security_events(limit: int = 50):
    """Get all blocked/security events from audit log."""
    events = []
    try:
        with open(AUDIT_LOG) as f:
            for line in f:
                if " | " in line:
                    try:
                        data = json.loads(line.split(" | ", 1)[1])
                        if data.get("blocked"):
                            events.append({
                                **data,
                                "type": "blocked_call",
                                "severity": "high"
                            })
                    except Exception:
                        pass
    except FileNotFoundError:
        pass
    return list(reversed(events))[-limit:]


@router.get("/injection-attempts")
def get_injection_attempts():
    """Get all detected prompt injection attempts."""
    attempts = []
    try:
        with open(AUDIT_LOG) as f:
            for line in f:
                if "prompt injection" in line.lower():
                    if " | " in line:
                        try:
                            data = json.loads(line.split(" | ", 1)[1])
                            attempts.append({**data, "attack_type": "prompt_injection"})
                        except Exception:
                            pass
    except FileNotFoundError:
        pass
    return attempts


@router.get("/rate-limits")
def get_rate_limit_events():
    """Get all rate limit violation events."""
    events = []
    try:
        with open(AUDIT_LOG) as f:
            for line in f:
                if "rate limit" in line.lower():
                    if " | " in line:
                        try:
                            data = json.loads(line.split(" | ", 1)[1])
                            events.append({**data, "violation_type": "rate_limit"})
                        except Exception:
                            pass
    except FileNotFoundError:
        pass
    return events


@router.get("/summary")
def get_security_summary():
    """Overall MCP security posture summary."""
    total = blocked = injections = rate_limits = 0
    try:
        with open(AUDIT_LOG) as f:
            for line in f:
                if " | " in line:
                    total += 1
                    try:
                        data = json.loads(line.split(" | ", 1)[1])
                        if data.get("blocked"):
                            blocked += 1
                        if "injection" in str(data).lower():
                            injections += 1
                        if "rate limit" in str(data).lower():
                            rate_limits += 1
                    except Exception:
                        pass
    except FileNotFoundError:
        pass

    risk = "low"
    if blocked > 10 or injections > 0:
        risk = "high"
    elif blocked > 0:
        risk = "medium"

    return {
        "total_calls": total,
        "blocked_calls": blocked,
        "injection_attempts": injections,
        "rate_limit_violations": rate_limits,
        "overall_risk": risk,
        "last_updated": datetime.utcnow().isoformat(),
        "middleware_active": True,
        "protections": [
            "Prompt injection detection",
            "Server identity validation",
            "Rate limiting (20 calls/min)",
            "Input sanitization",
            "Audit logging",
        ]
    }
