from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import mcp, security, pipeline

app = FastAPI(title="MCP Dashboard", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mcp.router, prefix="/api/mcp", tags=["MCP"])
app.include_router(security.router, prefix="/api/security", tags=["Security"])
app.include_router(pipeline.router, prefix="/api/pipeline", tags=["Pipeline"])


@app.get("/health")
def health():
    return {"status": "healthy", "service": "mcp-dashboard"}
