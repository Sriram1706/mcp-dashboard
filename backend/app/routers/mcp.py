import subprocess
import json
from datetime import datetime
from fastapi import APIRouter

router = APIRouter()

AUDIT_LOG = "/app/audit.log"

MCP_SERVERS = [
    {"name": "ai-security-scanner", "description": "Wraps live FastAPI security scanner"},
    {"name": "cve-lookup",          "description": "CVE lookup via NVD + OSV APIs"},
    {"name": "github-integration",  "description": "GitHub issues, PRs, workflows"},
    {"name": "aws-scanner",         "description": "AWS IAM, S3, SGs, CloudTrail audit"},
    {"name": "security-orchestrator", "description": "Autonomous pipeline coordinator"},
    {"name": "notifier",            "description": "SNS email notifications"},
]

TOOLS_BY_SERVER = {
    "ai-security-scanner":    ["scan_content", "scan_url", "process_prompt", "get_security_incidents", "get_threat_stats", "health_check"],
    "cve-lookup":             ["lookup_cve", "search_cves_by_keyword", "check_package_vulnerabilities", "get_severity_summary"],
    "github-integration":     ["create_security_issue", "get_open_issues", "get_open_prs", "add_pr_comment", "get_recent_commits", "get_workflow_runs"],
    "aws-scanner":            ["audit_iam_users", "audit_s3_buckets", "audit_security_groups", "audit_cloudtrail", "get_ecs_services", "full_security_audit"],
    "security-orchestrator":  ["full_security_pipeline", "scan_and_report", "get_audit_trail", "pipeline_health_check"],
    "notifier":               ["create_sns_topic", "subscribe_email", "send_security_alert", "send_pipeline_summary", "list_topics"],
}


def check_server_health(server_name: str) -> str:
    try:
        result = subprocess.run(
            ["claude", "mcp", "list"],
            capture_output=True, text=True, timeout=10
        )
        if server_name in result.stdout and "Connected" in result.stdout:
            return "connected"
        return "disconnected"
    except Exception:
        return "unknown"


@router.get("/servers")
def get_servers():
    servers = []
    for s in MCP_SERVERS:
        servers.append({
            "name": s["name"],
            "description": s["description"],
            "status": "connected",
            "tools": TOOLS_BY_SERVER.get(s["name"], []),
            "tool_count": len(TOOLS_BY_SERVER.get(s["name"], [])),
        })
    return servers


@router.get("/tools")
def get_all_tools():
    tools = []
    for server, tool_list in TOOLS_BY_SERVER.items():
        for tool in tool_list:
            tools.append({"server": server, "tool": tool})
    return tools


@router.get("/audit")
def get_audit_trail(limit: int = 50):
    try:
        with open(AUDIT_LOG) as f:
            lines = f.readlines()
        entries = []
        for line in lines[-limit:]:
            if " | " in line:
                parts = line.strip().split(" | ", 1)
                if len(parts) == 2:
                    try:
                        entries.append(json.loads(parts[1]))
                    except Exception:
                        entries.append({"raw": parts[1]})
        return list(reversed(entries))
    except FileNotFoundError:
        return []


@router.get("/stats")
def get_stats():
    total_tools = sum(len(v) for v in TOOLS_BY_SERVER.values())
    audit_entries = 0
    blocked = 0
    try:
        with open(AUDIT_LOG) as f:
            for line in f:
                if " | " in line:
                    audit_entries += 1
                    try:
                        data = json.loads(line.split(" | ", 1)[1])
                        if data.get("blocked"):
                            blocked += 1
                    except Exception:
                        pass
    except FileNotFoundError:
        pass
    return {
        "total_servers": len(MCP_SERVERS),
        "total_tools": total_tools,
        "total_calls": audit_entries,
        "blocked_calls": blocked,
        "last_updated": datetime.utcnow().isoformat(),
    }
