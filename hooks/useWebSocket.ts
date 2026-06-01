"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getToken } from "@/lib/auth";

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null); 
  const isIntentionalDisconnect = useRef(false);

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) return;

    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    isIntentionalDisconnect.current = false;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "wss://bot.asuma.my.id/ws";
    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "subscribe", channel: "bot_status" }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      wsRef.current = null;

      if (!isIntentionalDisconnect.current) {
        console.log("Attempting to reconnect in 5 seconds...");
        if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 5000);
      }
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    isIntentionalDisconnect.current = true;
    
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not open. Message not sent:", message);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, []);

  return { isConnected, lastMessage, sendMessage, disconnect, connect };
}
