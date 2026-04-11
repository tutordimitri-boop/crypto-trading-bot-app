# Integração com Bybit - Guia Completo

## Visão Geral

Este documento descreve como integrar seu dashboard com a API da Bybit para executar trades reais, monitorar posições e gerenciar ordens.

## Decisão Arquitetural

**Confirmado:** Usar seu próprio dashboard (React + Express) com integração direta com Bybit API.

**Vantagens:**
- ✅ Controle total
- ✅ Sem dependência de terceiros (Lovable, 3Commas, etc)
- ✅ Mais barato (R$ 50-100/mês vs R$ 200-300/mês)
- ✅ Totalmente customizável
- ✅ Pronto para terceirização

---

## Pré-requisitos

### 1. Conta Bybit
- Criar conta em https://www.bybit.com
- Verificar identidade
- Adicionar método de pagamento

### 2. Gerar Chaves de API

#### Passo 1: Acessar API Management
1. Faça login na Bybit
2. Vá para **Account** (canto superior direito)
3. Selecione **API Management**

#### Passo 2: Criar Nova Chave
1. Clique em **Create New Key**
2. Escolha **API Key Type**: Selecione **Main Account** ou **Sub Account**
3. Configure permissões:
   - ✅ **Read** (ler dados)
   - ✅ **Spot Trading** (operar em spot)
   - ✅ **Futures Trading** (operar em futuros)
   - ✅ **Wallet** (ver saldo)

#### Passo 3: Copiar Credenciais
- Copie **API Key**
- Copie **Secret Key** (guarde em local seguro)
- Anote **Master Account UID**

### 3. Testnet (Recomendado Começar Aqui)

Antes de usar com dinheiro real, teste em testnet:

1. Acesse https://testnet.bybit.com
2. Crie conta de teste
3. Gere chaves de teste
4. Use `testnet: true` no código

---

## Instalação de Dependências

```bash
# Instalar biblioteca Bybit
npm install bybit-api

# Ou usar CCXT (suporta múltiplas exchanges)
npm install ccxt

# Instalar validação
npm install zod
```

---

## Configuração de Variáveis de Ambiente

Crie arquivo `.env` com:

```env
# Bybit - Testnet (Desenvolvimento)
BYBIT_TESTNET_API_KEY=sua-chave-testnet
BYBIT_TESTNET_API_SECRET=seu-secret-testnet
BYBIT_TESTNET_ENABLED=true

# Bybit - Mainnet (Produção)
BYBIT_API_KEY=sua-chave-mainnet
BYBIT_API_SECRET=seu-secret-mainnet
BYBIT_MAINNET_ENABLED=false

# Configuração
BYBIT_ENVIRONMENT=testnet  # ou 'mainnet'
```

---

## Implementação Backend

### 1. Criar Cliente Bybit

Crie arquivo `server/bybit/client.ts`:

```typescript
import { BybitClient } from 'bybit-api';

const isTestnet = process.env.BYBIT_ENVIRONMENT === 'testnet';

const bybitConfig = isTestnet ? {
  apiKey: process.env.BYBIT_TESTNET_API_KEY,
  apiSecret: process.env.BYBIT_TESTNET_API_SECRET,
  testnet: true,
} : {
  apiKey: process.env.BYBIT_API_KEY,
  apiSecret: process.env.BYBIT_API_SECRET,
  testnet: false,
};

export const bybit = new BybitClient(bybitConfig);

// Verificar conexão
export async function verifyConnection() {
  try {
    const wallet = await bybit.getWalletBalance({
      accountType: 'UNIFIED',
    });
    return { success: true, balance: wallet };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 2. Procedures tRPC para Trading

Crie arquivo `server/routers/bybit.ts`:

```typescript
import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { bybit } from '../bybit/client';
import { TRPCError } from '@trpc/server';

export const bybitRouter = router({
  // Obter saldo da conta
  getBalance: protectedProcedure
    .query(async () => {
      try {
        const wallet = await bybit.getWalletBalance({
          accountType: 'UNIFIED',
        });
        
        return {
          totalBalance: wallet.totalWalletBalance,
          totalMarginBalance: wallet.totalMarginBalance,
          coins: wallet.list,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao obter saldo',
        });
      }
    }),

  // Obter posições abertas
  getOpenPositions: protectedProcedure
    .input(z.object({
      category: z.enum(['linear', 'inverse', 'spot']).default('linear'),
    }))
    .query(async ({ input }) => {
      try {
        const positions = await bybit.getPositionInfo({
          category: input.category,
        });
        
        return positions.list.map(pos => ({
          symbol: pos.symbol,
          side: pos.side,
          size: pos.size,
          entryPrice: pos.avgPrice,
          markPrice: pos.markPrice,
          unrealizedPnL: pos.unrealizedPnl,
          unrealizedPnLPercent: pos.unrealizedPnlPcnt,
          leverage: pos.leverage,
          stopLoss: pos.stopLoss,
          takeProfit: pos.takeProfit,
        }));
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao obter posições',
        });
      }
    }),

  // Executar trade
  executeTrade: protectedProcedure
    .input(z.object({
      symbol: z.string(), // "BTCUSDT"
      side: z.enum(['Buy', 'Sell']),
      orderType: z.enum(['Market', 'Limit']).default('Market'),
      qty: z.number().positive(),
      price: z.number().positive().optional(),
      stopLoss: z.number().optional(),
      takeProfit: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const orderParams: any = {
          category: 'linear',
          symbol: input.symbol,
          side: input.side,
          orderType: input.orderType,
          qty: input.qty.toString(),
          timeInForce: 'GTC',
        };

        if (input.orderType === 'Limit' && input.price) {
          orderParams.price = input.price.toString();
        }

        if (input.stopLoss) {
          orderParams.stopLoss = input.stopLoss.toString();
        }

        if (input.takeProfit) {
          orderParams.takeProfit = input.takeProfit.toString();
        }

        const order = await bybit.submitOrder(orderParams);

        return {
          success: true,
          orderId: order.orderId,
          symbol: order.symbol,
          side: order.side,
          qty: order.qty,
          price: order.price,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao executar trade: ${error.message}`,
        });
      }
    }),

  // Fechar posição
  closePosition: protectedProcedure
    .input(z.object({
      symbol: z.string(),
      side: z.enum(['Buy', 'Sell']),
    }))
    .mutation(async ({ input }) => {
      try {
        const closeSide = input.side === 'Buy' ? 'Sell' : 'Buy';

        const order = await bybit.submitOrder({
          category: 'linear',
          symbol: input.symbol,
          side: closeSide,
          orderType: 'Market',
          qty: '0', // Fecha posição inteira
          reduceOnly: true,
        });

        return {
          success: true,
          orderId: order.orderId,
          message: `Posição ${input.symbol} fechada`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao fechar posição: ${error.message}`,
        });
      }
    }),

  // Atualizar stop loss
  updateStopLoss: protectedProcedure
    .input(z.object({
      symbol: z.string(),
      stopLoss: z.number(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await bybit.setTradingStop({
          category: 'linear',
          symbol: input.symbol,
          stopLoss: input.stopLoss.toString(),
        });

        return {
          success: true,
          message: 'Stop loss atualizado',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao atualizar stop loss: ${error.message}`,
        });
      }
    }),

  // Obter histórico de trades
  getTradeHistory: protectedProcedure
    .input(z.object({
      category: z.enum(['linear', 'inverse', 'spot']).default('linear'),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      try {
        const trades = await bybit.getExecutionList({
          category: input.category,
          limit: input.limit,
        });

        return trades.list.map(trade => ({
          symbol: trade.symbol,
          side: trade.side,
          price: trade.execPrice,
          qty: trade.execQty,
          fee: trade.execFee,
          time: trade.execTime,
          type: trade.execType,
        }));
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao obter histórico',
        });
      }
    }),

  // Obter informações de mercado
  getMarketInfo: protectedProcedure
    .input(z.object({
      symbol: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const tickers = await bybit.getTickers({
          category: 'linear',
          symbol: input.symbol,
        });

        const ticker = tickers.list[0];

        return {
          symbol: ticker.symbol,
          lastPrice: ticker.lastPrice,
          highPrice24h: ticker.highPrice24h,
          lowPrice24h: ticker.lowPrice24h,
          volume24h: ticker.volume24h,
          turnover24h: ticker.turnover24h,
          change24h: ticker.price24hPcnt,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao obter informações de mercado',
        });
      }
    }),
});
```

### 3. Registrar Router

Em `server/routers.ts`:

```typescript
import { bybitRouter } from './routers/bybit';

export const appRouter = router({
  // ... outros routers
  bybit: bybitRouter,
});
```

---

## Implementação Frontend

### 1. Componente para Executar Trade

Crie `client/src/components/ExecuteTrade.tsx`:

```tsx
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function ExecuteTrade() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [side, setSide] = useState('Buy');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');

  const executeTradeMutation = trpc.bybit.executeTrade.useMutation();

  const handleExecute = async () => {
    try {
      await executeTradeMutation.mutateAsync({
        symbol,
        side: side as 'Buy' | 'Sell',
        qty: parseFloat(qty),
        price: price ? parseFloat(price) : undefined,
        orderType: price ? 'Limit' : 'Market',
      });

      toast.success('Trade executado com sucesso!');
      setQty('1');
      setPrice('');
    } catch (error) {
      toast.error('Erro ao executar trade');
    }
  };

  return (
    <div className="card-premium space-y-4">
      <h3 className="text-lg font-bold text-foreground">Executar Trade</h3>

      <div className="space-y-3">
        <div>
          <label className="stat-label mb-2 block">Par</label>
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="BTCUSDT"
            className="input-premium"
          />
        </div>

        <div>
          <label className="stat-label mb-2 block">Direção</label>
          <Select value={side} onValueChange={setSide}>
            <SelectTrigger className="input-premium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Buy">Long</SelectItem>
              <SelectItem value="Sell">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="stat-label mb-2 block">Quantidade</label>
          <Input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="1"
            className="input-premium"
          />
        </div>

        <div>
          <label className="stat-label mb-2 block">Preço (Limit)</label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Deixe vazio para Market"
            className="input-premium"
          />
        </div>

        <Button
          onClick={handleExecute}
          disabled={executeTradeMutation.isPending}
          className="btn-premium btn-premium-primary w-full"
        >
          {executeTradeMutation.isPending ? 'Executando...' : 'Executar Trade'}
        </Button>
      </div>
    </div>
  );
}
```

### 2. Componente para Exibir Posições

Crie `client/src/components/BybitPositions.tsx`:

```tsx
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { DirectionBadge } from '@/components/DirectionBadge';

export function BybitPositions() {
  const { data: positions, isLoading } = trpc.bybit.getOpenPositions.useQuery({
    category: 'linear',
  });

  if (isLoading) {
    return <div className="card-premium animate-pulse h-48" />;
  }

  return (
    <div className="card-premium">
      <h3 className="text-lg font-bold text-foreground mb-4">Posições Abertas (Bybit)</h3>

      {positions && positions.length > 0 ? (
        <div className="space-y-3">
          {positions.map((pos) => (
            <Card key={pos.symbol} className="p-4 bg-card/50 border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{pos.symbol}</span>
                  <DirectionBadge direction={pos.side === 'Buy' ? 'Long' : 'Short'} />
                </div>
                <span className={`font-bold ${parseFloat(pos.unrealizedPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${parseFloat(pos.unrealizedPnL).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Tamanho: {pos.size}</div>
                <div>Entrada: ${parseFloat(pos.entryPrice).toFixed(2)}</div>
                <div>Marca: ${parseFloat(pos.markPrice).toFixed(2)}</div>
                <div>Alavancagem: {pos.leverage}x</div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">Nenhuma posição aberta</p>
      )}
    </div>
  );
}
```

---

## Roadmap de Implementação

### Fase 1: Setup (1 semana)
- [ ] Gerar chaves Bybit (testnet)
- [ ] Instalar dependências
- [ ] Criar cliente Bybit
- [ ] Testar conexão

### Fase 2: Backend (1-2 semanas)
- [ ] Implementar procedures tRPC
- [ ] Testes unitários
- [ ] Validação de entrada
- [ ] Tratamento de erros

### Fase 3: Frontend (1 semana)
- [ ] Criar componentes de trade
- [ ] Integrar com tRPC
- [ ] Adicionar confirmações
- [ ] Feedback visual

### Fase 4: Testes (1 semana)
- [ ] Testar em testnet
- [ ] Validar segurança
- [ ] Testes de carga
- [ ] Documentação

### Fase 5: Deploy (1 semana)
- [ ] Migrar para mainnet
- [ ] Configurar chaves reais
- [ ] Monitoramento
- [ ] Suporte

---

## Segurança

### ✅ Fazer

```typescript
// Use variáveis de ambiente
const apiKey = process.env.BYBIT_API_KEY;

// Valide entrada
const input = z.object({
  qty: z.number().positive(),
}).parse(userInput);

// Use HTTPS
const bybit = new BybitClient({ ... });

// Registre operações
console.log(`Trade executado: ${symbol} ${side} ${qty}`);
```

### ❌ Não Fazer

```typescript
// Nunca hardcode chaves
const apiKey = 'sua-chave-aqui'; // ❌

// Nunca confie em entrada do usuário
const qty = userInput.qty; // ❌

// Nunca exponha chaves em logs
console.log(apiKey); // ❌

// Nunca use HTTP
http://api.bybit.com // ❌
```

---

## Troubleshooting

### Erro: "Invalid API Key"
- Verifique se a chave está correta
- Verifique se está usando testnet ou mainnet correto
- Regenere a chave se necessário

### Erro: "Insufficient Balance"
- Verifique saldo na conta
- Verifique se está usando testnet (adicione fundos de teste)

### Erro: "Order Rejected"
- Verifique quantidade mínima
- Verifique preço (muito alto/baixo)
- Verifique permissões de API

### Posições não aparecem
- Verifique se tem posições abertas
- Verifique categoria (linear/inverse/spot)
- Verifique se está usando conta correta

---

## Próximos Passos

1. **Gerar chaves Bybit** (testnet)
2. **Implementar procedures tRPC**
3. **Criar componentes frontend**
4. **Testar em testnet**
5. **Migrar para mainnet**

---

**Versão**: 1.0.0  
**Última Atualização**: Abril de 2026
