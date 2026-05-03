export default function ServerCard({ server }) {
  const isConnected = server.status === "connected";
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800 text-sm">{server.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {isConnected ? "● Connected" : "○ Disconnected"}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{server.description}</p>
      <div className="flex flex-wrap gap-1">
        {server.tools.slice(0, 4).map(tool => (
          <span key={tool} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {tool}
          </span>
        ))}
        {server.tools.length > 4 && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
            +{server.tools.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
}
