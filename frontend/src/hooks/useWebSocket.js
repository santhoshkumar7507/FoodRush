import { useState, useEffect, useRef } from 'react';
import { WS_BASE_URL } from '../config';

export default function useWebSocket(role, userId) {
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    let reconnectTimeout = null;
    
    const connect = () => {
      ws.current = new WebSocket(`${WS_BASE_URL}/ws/${role}/${userId}`);
      
      ws.current.onopen = () => {
        console.log(`WebSocket connected as ${role}`);
      };
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, data]);
      };
      
      ws.current.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting...');
        reconnectTimeout = setTimeout(connect, 3000);
      };
      
      ws.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.current.close();
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws.current) ws.current.close();
    };
  }, [role, userId]);

  const sendMessage = (msg) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    }
  };

  return { messages, sendMessage };
}
