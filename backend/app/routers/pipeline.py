import os
import glob
import json
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

PIPELINE_LOG_DIR = "/tmp"


@router.get("/runs")
def get_pipeline_runs():
    """Get history of autonomous pipeline runs."""
    runs = []
    log_files = glob.glob(f"{PIPELINE_LOG_DIR}/pipeline_*.log")
    for log_file in sorted(log_files, reverse=True)[:20]:
        repo_name = os.path.basename(log_file).replace("pipeline_", "").replace(".log", "").replace("_", "/", 1)
        try:
            with open(log_file) as f:
                lines = f.readlines()
            status = "success"
            steps = []
            for line in lines:
                if "Pipeline complete" in line:
                    status = "success"
                if "failed" in line.lower() or "error" in line.lower():
                    status = "failed"
                if line.strip():
                    steps.append(line.strip())
            runs.append({
                "repo": repo_name,
                "status": status,
                "steps": steps[-10:],
                "log_file": log_file,
                "timestamp": datetime.fromtimestamp(os.path.getmtime(log_file)).isoformat()
            })
        except Exception:
            pass
    return runs


@router.get("/status")
def get_pipeline_status():
    """Get current autonomous pipeline configuration status."""
    webhook_url = "http://54.157.214.213/api/security/webhook/github"
    return {
        "webhook_url": webhook_url,
        "webhook_active": True,
        "trigger": "GitHub push to main branch",
        "steps": [
            {"step": 1, "name": "Clone repository",         "status": "active"},
            {"step": 2, "name": "Detect app type",          "status": "active"},
            {"step": 3, "name": "Inject CI/CD pipeline",    "status": "active"},
            {"step": 4, "name": "Push security config",     "status": "active"},
            {"step": 5, "name": "Send to AppSec dashboard", "status": "active"},
            {"step": 6, "name": "SNS notification",         "status": "active"},
        ],
        "security_gates": [
            "SAST — Semgrep",
            "SAST — CodeQL",
            "SCA — Snyk",
            "SCA — Trivy",
            "Secrets — Gitleaks",
            "IaC — Checkov",
            "DAST — OWASP ZAP",
            "Dependabot",
        ],
        "terraform_module": "terraform/modules/app-deploy",
        "last_updated": datetime.utcnow().isoformat(),
    }
