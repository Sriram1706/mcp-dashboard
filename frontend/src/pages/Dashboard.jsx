import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import ServerCard from "../components/ServerCard";
import {
  getMcpServers, getMcpStats, getMcpAudit,
  getSecuritySummary, getSecurityEvents,
  getPipelineStatus, getPipelineRuns,
} from "../lib/api";

export default function Dashboard() {
  const [servers, setServers] = useState([]);
  const [stats, setStats] = useState({});
  const [audit, setAudit] = useState([]);
  const [security, setSecurity] = useState({});
  const [secEvents, setSecEvents] = useState([]);
  const [pipeline, setPipeline] = useState({});
  const [runs, setRuns] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      try {
        const [s, st, a, sec, se, p, r] = await Promise.all([
          getMcpServers(), getMcpStats(), getMcpAudit(),
          getSecuritySummary(), getSecurityEvents(),
          getPipelineStatus(), getPipelineRuns(),
        ]);
        setServers(s.data);
        setStats(st.data);
        setAudit(a.data);
        setSecurity(sec.data);
        setSecEvents(se.data);
        setPipeline(p.data);
        setRuns(r.data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const riskColor = { low: "green", medium: "yellow", high: "red" };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">MCP Security Dashboard</h1>
          <p className="text-gray-400 text-xs mt-0.5">Autonomous AI Security Platform</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
          security.overall_risk === "low" ? "bg-green-600" :
          security.overall_risk === "medium" ? "bg-yellow-500" : "bg-red-600"
        }`}>
          Risk: {(security.overall_risk || "unknown").toUpperCase()}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white px-6">
        {["overview", "servers", "security", "audit", "pipeline"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 mr-2 ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="MCP Servers" value={stats.total_servers || 0} subtitle="All connected" color="green" />
              <StatCard title="Total Tools" value={stats.total_tools || 0} subtitle="Available to Claude" color="blue" />
              <StatCard title="Total Calls" value={stats.total_calls || 0} subtitle="Audit logged" color="purple" />
              <StatCard title="Blocked Calls" value={stats.blocked_calls || 0} subtitle="Security middleware" color={stats.blocked_calls > 0 ? "red" : "green"} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Injection Attempts" value={security.injection_attempts || 0} color={security.injection_attempts > 0 ? "red" : "green"} />
              <StatCard title="Rate Limit Violations" value={security.rate_limit_violations || 0} color={security.rate_limit_violations > 0 ? "yellow" : "green"} />
              <StatCard title="Pipeline Runs" value={runs.length} subtitle="Autonomous deployments" color="blue" />
            </div>

            {/* Security Protections */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Active MCP Security Protections</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(security.protections || []).map(p => (
                  <div key={p} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span> {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SERVERS TAB */}
        {activeTab === "servers" && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">MCP Servers ({servers.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servers.map(s => <ServerCard key={s.name} server={s} />)}
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Overall Risk" value={(security.overall_risk || "N/A").toUpperCase()} color={riskColor[security.overall_risk] || "blue"} />
              <StatCard title="Blocked" value={security.blocked_calls || 0} color="red" />
              <StatCard title="Injections" value={security.injection_attempts || 0} color="red" />
              <StatCard title="Rate Limits" value={security.rate_limit_violations || 0} color="yellow" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Security Events</h2>
              {secEvents.length === 0 ? (
                <p className="text-gray-400 text-sm">No security events recorded</p>
              ) : (
                <div className="space-y-2">
                  {secEvents.map((e, i) => (
                    <div key={i} className="flex items-center justify-between bg-red-50 rounded p-3 text-sm">
                      <span className="font-medium text-red-700">{e.server} → {e.tool}</span>
                      <span className="text-red-500 text-xs">{e.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">Audit Trail ({audit.length} entries)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600">Timestamp</th>
                    <th className="px-4 py-2 text-left text-gray-600">Server</th>
                    <th className="px-4 py-2 text-left text-gray-600">Tool</th>
                    <th className="px-4 py-2 text-left text-gray-600">Args Hash</th>
                    <th className="px-4 py-2 text-left text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No audit entries yet</td></tr>
                  ) : audit.map((e, i) => (
                    <tr key={i} className={`border-t ${e.blocked ? "bg-red-50" : "hover:bg-gray-50"}`}>
                      <td className="px-4 py-2 text-gray-500 text-xs">{e.timestamp}</td>
                      <td className="px-4 py-2 font-medium text-gray-800">{e.server}</td>
                      <td className="px-4 py-2 text-blue-600">{e.tool}</td>
                      <td className="px-4 py-2 text-gray-400 font-mono text-xs">{e.args_hash}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${e.blocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {e.blocked ? "blocked" : "allowed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PIPELINE TAB */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Autonomous Pipeline Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Webhook URL</p>
                  <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">{pipeline.webhook_url}</p>
                </div>
                <div>
                  <p className="text-gray-500">Trigger</p>
                  <p className="font-medium mt-1">{pipeline.trigger}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-sm mb-2">Pipeline Steps</p>
                <div className="space-y-1">
                  {(pipeline.steps || []).map(s => (
                    <div key={s.step} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-500">{s.step}.</span>
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-sm mb-2">Security Gates (8/8)</p>
                <div className="grid grid-cols-2 gap-1">
                  {(pipeline.security_gates || []).map(g => (
                    <div key={g} className="flex items-center gap-2 text-sm">
                      <span className="text-blue-500">🛡</span> {g}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Pipeline Run History</h2>
              {runs.length === 0 ? (
                <p className="text-gray-400 text-sm">No pipeline runs yet. Push a new repo to trigger one.</p>
              ) : (
                <div className="space-y-2">
                  {runs.map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded p-3 text-sm">
                      <span className="font-medium">{r.repo}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs">{r.timestamp}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
