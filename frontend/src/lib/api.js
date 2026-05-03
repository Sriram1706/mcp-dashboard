import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
});

export const getMcpServers = () => api.get("/mcp/servers");
export const getMcpStats = () => api.get("/mcp/stats");
export const getMcpAudit = (limit = 50) => api.get(`/mcp/audit?limit=${limit}`);
export const getMcpTools = () => api.get("/mcp/tools");
export const getSecuritySummary = () => api.get("/security/summary");
export const getSecurityEvents = () => api.get("/security/events");
export const getInjectionAttempts = () => api.get("/security/injection-attempts");
export const getPipelineStatus = () => api.get("/pipeline/status");
export const getPipelineRuns = () => api.get("/pipeline/runs");
