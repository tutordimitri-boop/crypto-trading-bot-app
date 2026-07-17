import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: 'price' | 'position' | 'trade' | 'alert' | 'error';
  data: any;
  timestamp: number;
}

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}${url}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setData(message);
        } catch (err) {
          console.error('Erro ao parsear mensagem WebSocket:', err);
        }
      };

      ws.current.onerror = (event) => {
        setError('Erro na conexão WebSocket');
        console.error('WebSocket error:', event);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        // Tentar reconectar em 5 segundos
        setTimeout(() => {
          connect();
        }, 5000);
      };
    } catch (err) {
      setError('Erro ao conectar ao WebSocket');
      console.error('WebSocket connection error:', err);
    }
  }, [url]);

  const send = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    data,
    error,
    send,
    disconnect,
  };
}
