# MCP Security Dashboard

Real-time visibility into MCP (Model Context Protocol) server health, security events, audit trail, and autonomous pipeline status.

## Architecture

```
┌─────────────────────────────────────────────────┐
│              MCP Security Dashboard              │
├──────────────────┬──────────────────────────────┤
│  React Frontend  │       FastAPI Backend         │
│  (Tailwind CSS)  │  /api/mcp/servers             │
│  5 tabs:         │  /api/mcp/audit               │
│  - Overview      │  /api/security/summary        │
│  - Servers       │  /api/pipeline/runs           │
│  - Security      │                               │
│  - Audit         │  Reads: audit.log (MCP layer) │
│  - Pipeline      │                               │
└──────────────────┴──────────────────────────────┘
```

## MCP Servers Monitored

| Server | Description |
|--------|-------------|
| mcp-scanner | AI prompt/content security scanner |
| cve-lookup | NVD + OSV vulnerability database |
| github-integration | GitHub API (issues, PRs, commits) |
| aws-scanner | AWS IAM/S3/SG/CloudTrail auditor |
| mcp-orchestrator | Autonomous multi-server pipeline |
| mcp-notifier | SNS alert dispatcher |

## Security Features

- Prompt injection detection (15+ patterns)
- Per-server rate limiting (20 calls/60s)
- Server identity validation
- Full audit trail with args hash
- Risk scoring: low / medium / high

## Quick Start

```bash
docker compose up --build
# Frontend: http://localhost:3001
# Backend:  http://localhost:8000
```

## Autonomous Pipeline

Every push to GitHub triggers:
1. App type detection (Python / Node / Docker)
2. CI/CD injection (GitHub Actions with 8 security gates)
3. Findings sent to AppSec dashboard
4. SNS alert to team email
# Autonomous pipeline test - Sun May  3 23:16:56 IST 2026
