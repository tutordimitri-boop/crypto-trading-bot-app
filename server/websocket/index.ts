import { Server as HTTPServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { bybit } from '../bybit/client';

interface WebSocketClient {
  ws: WebSocket;
  userId: number;
  subscriptions: Set<string>;
}

const clients = new Map<WebSocket, WebSocketClient>();
let priceUpdateInterval: NodeJS.Timeout | null = null;

export function setupWebSocket(server: HTTPServer) {
  const wss = new WebSocketServer({ server, path: '/api/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[WebSocket] Novo cliente conectado');

    // Inicializar cliente
    const client: WebSocketClient = {
      ws,
      userId: 0,
      subscriptions: new Set(),
    };

    clients.set(ws, client);

    // Enviar mensagem de boas-vindas
    ws.send(
      JSON.stringify({
        type: 'connection',
        data: { message: 'Conectado ao servidor WebSocket' },
        timestamp: Date.now(),
      })
    );

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        handleWebSocketMessage(ws, client, data);
      } catch (error) {
        console.error('[WebSocket] Erro ao parsear mensagem:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            data: { message: 'Erro ao processar mensagem' },
            timestamp: Date.now(),
          })
        );
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket] Cliente desconectado');
      clients.delete(ws);

      // Parar atualizações de preço se não houver mais clientes
      if (clients.size === 0 && priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
        priceUpdateInterval = null;
      }
    });

    ws.on('error', (error: Error) => {
      console.error('[WebSocket] Erro:', error);
    });
  });

  return wss;
}

function handleWebSocketMessage(ws: WebSocket, client: WebSocketClient, data: any) {
  const { type, payload } = data;

  switch (type) {
    case 'subscribe':
      handleSubscribe(ws, client, payload);
      break;
    case 'unsubscribe':
      handleUnsubscribe(ws, client, payload);
      break;
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;
    default:
      console.warn('[WebSocket] Tipo de mensagem desconhecido:', type);
  }
}

function handleSubscribe(ws: WebSocket, client: WebSocketClient, payload: any) {
  const { channel, symbol } = payload;

  if (!channel) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Canal não especificado' },
        timestamp: Date.now(),
      })
    );
    return;
  }

  const subscription = `${channel}:${symbol || ''}`;
  client.subscriptions.add(subscription);

  ws.send(
    JSON.stringify({
      type: 'subscribed',
      data: { channel, symbol, subscription },
      timestamp: Date.now(),
    })
  );

  // Iniciar atualizações de preço se necessário
  if (channel === 'prices' && !priceUpdateInterval) {
    startPriceUpdates();
  }
}

function handleUnsubscribe(ws: WebSocket, client: WebSocketClient, payload: any) {
  const { channel, symbol } = payload;
  const subscription = `${channel}:${symbol || ''}`;

  client.subscriptions.delete(subscription);

  ws.send(
    JSON.stringify({
      type: 'unsubscribed',
      data: { channel, symbol },
      timestamp: Date.now(),
    })
  );
}

function startPriceUpdates() {
  priceUpdateInterval = setInterval(async () => {
    try {
      // Obter preços de alguns pares populares
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];

      for (const symbol of symbols) {
        try {
          const tickers = await bybit.getTickers({
            category: 'linear',
            symbol,
          });

          if (tickers.result && tickers.result.list && tickers.result.list.length > 0) {
            const ticker = tickers.result.list[0];
            const priceData = {
              symbol,
              price: parseFloat(ticker.lastPrice),
              bid: parseFloat(ticker.bid1Price),
              ask: parseFloat(ticker.ask1Price),
              change24h: parseFloat(ticker.price24hPcnt),
              volume24h: parseFloat(ticker.turnover24h),
              timestamp: Date.now(),
            };

            // Enviar para todos os clientes inscritos
            broadcastMessage({
              type: 'price',
              data: priceData,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          console.error(`[WebSocket] Erro ao obter preço de ${symbol}:`, error);
        }
      }
    } catch (error) {
      console.error('[WebSocket] Erro ao atualizar preços:', error);
    }
  }, 5000); // Atualizar a cada 5 segundos
}

function broadcastMessage(message: any) {
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      // Verificar se o cliente está inscrito neste tipo de mensagem
      const isSubscribed = Array.from(client.subscriptions).some((sub) =>
        sub.startsWith(message.type)
      );

      if (isSubscribed || message.type === 'system') {
        client.ws.send(JSON.stringify(message));
      }
    }
  });
}

export function broadcastPriceUpdate(priceData: any) {
  broadcastMessage({
    type: 'price',
    data: priceData,
    timestamp: Date.now(),
  });
}

export function broadcastPositionUpdate(userId: number, positionData: any) {
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(
        JSON.stringify({
          type: 'position',
          data: positionData,
          timestamp: Date.now(),
        })
      );
    }
  });
}

export function broadcastTradeUpdate(userId: number, tradeData: any) {
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(
        JSON.stringify({
          type: 'trade',
          data: tradeData,
          timestamp: Date.now(),
        })
      );
    }
  });
}
