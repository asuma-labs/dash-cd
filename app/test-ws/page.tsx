"use client";

import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function TestWSPage() {
  const { isConnected, lastMessage, sendMessage, connect, disconnect } = useWebSocket();
  const [inputMessage, setInputMessage] = useState('{"type": "ping"}');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (lastMessage) {
      setLogs((prev) => [...prev, `Inbound: ${JSON.stringify(lastMessage)}`]);
    }
  }, [lastMessage]);

  const handleSend = () => {
    try {
      const parsed = JSON.parse(inputMessage);
      sendMessage(parsed);
      setLogs((prev) => [...prev, `Outbound: ${inputMessage}`]);
    } catch (e) {
      alert("Format harus JSON valid!");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">WebSocket Tester (Next.js)</h1>
      
      <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
        <div className="space-x-2">
          <button onClick={connect} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Connect</button>
          <button onClick={disconnect} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Disconnect</button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Send Custom Payload (JSON)</label>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="w-full p-2 border rounded-md font-mono text-sm bg-white text-black"
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={!isConnected}
          className="px-4 py-2 bg-black text-white rounded-md disabled:bg-gray-400"
        >
          Send Message
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Live Console Logs</label>
          <button onClick={() => setLogs([])} className="text-xs text-gray-500 hover:underline">Clear</button>
        </div>
        <div className="h-64 overflow-y-auto bg-zinc-900 text-green-400 p-3 rounded-md font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <span className="text-gray-500">Belum ada aktivitas lalu lintas data...</span>
          ) : (
            logs.map((log, idx) => <div key={idx}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
