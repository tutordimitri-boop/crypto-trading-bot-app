# Documentação de Componentes

## Componentes Reutilizáveis

### StatCard

Componente para exibir estatísticas com ícone, label e valor.

```tsx
import { StatCard } from '@/components/StatCard';
import { TrendingUp } from 'lucide-react';

<StatCard
  label="Saldo da Conta"
  value="$10,000.00"
  change={250}
  icon={<TrendingUp className="w-5 h-5" />}
/>
```

**Props:**
- `label` (string): Rótulo da métrica
- `value` (string | number): Valor a exibir
- `change` (number, opcional): Mudança em valor absoluto
- `icon` (ReactNode): Ícone a exibir

---

### RobotStatusBadge

Componente para exibir status do robô (Ativo/Inativo).

```tsx
import { RobotStatusBadge } from '@/components/RobotStatusBadge';

<RobotStatusBadge isActive={true} />
```

**Props:**
- `isActive` (boolean): Status do robô

---

### DirectionBadge

Componente para exibir direção de posição (Long/Short).

```tsx
import { DirectionBadge } from '@/components/DirectionBadge';

<DirectionBadge direction="Long" />
```

**Props:**
- `direction` ('Long' | 'Short'): Direção da posição

---

### LogLevelBadge

Componente para exibir nível de log com cor e ícone.

```tsx
import { LogLevelBadge } from '@/components/LogLevelBadge';

<LogLevelBadge level="aviso" />
```

**Props:**
- `level` ('info' | 'aviso' | 'erro'): Nível do log

---

### ModeSelector

Componente para seleção de modo de operação com modal informativo.

```tsx
import { ModeSelector } from '@/components/ModeSelector';

<ModeSelector
  currentMode="Normal"
  onModeChange={(mode) => console.log(mode)}
/>
```

**Props:**
- `currentMode` ('Normal' | 'Estratégico' | 'Insano'): Modo atual
- `onModeChange` (callback): Função chamada ao mudar modo

---

### EquityCurve

Componente de gráfico de evolução de saldo usando Recharts.

```tsx
import { EquityCurve } from '@/components/EquityCurve';

<EquityCurve
  data={[
    { timestamp: Date.now(), balance: 10000 },
    { timestamp: Date.now() + 86400000, balance: 10500 }
  ]}
  isLoading={false}
/>
```

**Props:**
- `data` (array, opcional): Dados do gráfico
- `isLoading` (boolean, opcional): Estado de carregamento

**Estrutura de dados:**
```tsx
{
  timestamp: number; // Timestamp em ms
  balance: number;   // Saldo em USD
}
```

---

### LogsFeed

Componente de feed de logs com filtro por severidade e polling automático.

```tsx
import { LogsFeed } from '@/components/LogsFeed';

<LogsFeed
  maxHeight="max-h-96"
  autoScroll={true}
  limit={100}
/>
```

**Props:**
- `maxHeight` (string, opcional): Classe de altura máxima
- `autoScroll` (boolean, opcional): Auto-scroll para novos logs
- `limit` (number, opcional): Limite de logs a exibir

**Funcionalidades:**
- Filtro por nível (info, aviso, erro)
- Polling automático a cada 5 segundos
- Auto-scroll para logs mais recentes
- Contador de logs por nível

---

## Páginas

### Dashboard

Página principal com status do robô, métricas e tabs de posições/histórico/logs.

**Localização:** `client/src/pages/Dashboard.tsx`

**Funcionalidades:**
- Header com status e botão de ativação
- Grid de 4 métricas principais
- Seletor de modo de operação
- Tabs para diferentes visualizações
- Gráfico de equity curve

---

### Overview

Página de visão geral com resumo completo de performance.

**Localização:** `client/src/pages/Overview.tsx`

**Funcionalidades:**
- Curva de equity interativa
- Estatísticas de trading (taxa de vitória, profit factor)
- Resumo de configuração do robô
- Feed de logs recentes

---

### OpenTrades

Página com tabela de posições abertas.

**Localização:** `client/src/pages/OpenTrades.tsx`

**Colunas:**
- Par (BTC/USDT, ETH/USDT, etc.)
- Direção (Long/Short)
- Tamanho da posição
- Preço de entrada
- P&L não realizado
- Stop Loss
- Ações (editar, fechar)

---

### TradeHistory

Página com histórico de trades e filtros avançados.

**Localização:** `client/src/pages/TradeHistory.tsx`

**Filtros:**
- Par (BTC/USDT, ETH/USDT)
- Modo de operação (Normal, Estratégico, Insano)
- Direção (Long, Short)

**Colunas:**
- Par
- Direção
- Resultado (Lucro/Prejuízo)
- Score de entrada
- Data e hora

---

### Configuration

Página de configuração de risco e chaves de API.

**Localização:** `client/src/pages/Configuration.tsx`

**Seções:**
- Gestão de risco (percentagem, alavancagem)
- Chaves de API da Bybit
- Configurações adicionais

---

### TechnicalIndicators

Página de indicadores técnicos.

**Localização:** `client/src/pages/TechnicalIndicators.tsx`

**Indicadores:**
- Score SMC (-100 a +100)
- Sinais de BOS/CHoCH
- Fair Value Gaps (FVG)
- Order Blocks

---

## Design System

### Cores

O design system utiliza uma paleta premium com tema escuro:

- **Background**: `#0f172a` (Slate 950)
- **Foreground**: `#f1f5f9` (Slate 100)
- **Card**: `#1e293b` (Slate 800)
- **Border**: `#334155` (Slate 700)
- **Accent**: `#06b6d4` (Cyan 500)
- **Success**: `#4ade80` (Green 400)
- **Danger**: `#f87171` (Red 400)
- **Warning**: `#facc15` (Yellow 400)

### Tipografia

- **Títulos**: Playfair Display (serif)
- **Corpo**: Inter (sans-serif)
- **Código**: Fira Code (monospace)

### Espaçamento

Utiliza escala de Tailwind CSS padrão com ênfase em espaçamento generoso:

- Padding: 4px, 8px, 12px, 16px, 24px, 32px
- Margin: Mesmo padrão
- Gap: 8px, 12px, 16px, 24px

### Componentes UI

Utiliza shadcn/ui para componentes base:

- Button
- Card
- Input
- Label
- Select
- Slider
- Tabs
- Dialog
- Toast (Sonner)

---

## Hooks Customizados

### useAuth

Hook para acessar estado de autenticação.

```tsx
import { useAuth } from '@/_core/hooks/useAuth';

const { user, loading, error, isAuthenticated, logout } = useAuth();
```

**Retorna:**
- `user`: Objeto do usuário autenticado
- `loading`: Estado de carregamento
- `error`: Mensagem de erro se houver
- `isAuthenticated`: Boolean indicando autenticação
- `logout`: Função para fazer logout

---

## Padrões de Desenvolvimento

### Estrutura de Componente

```tsx
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const { data, isLoading } = trpc.feature.useQuery();

  if (isLoading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  return (
    <div className="card-premium">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {/* Conteúdo */}
    </div>
  );
}
```

### Chamadas tRPC

```tsx
// Query
const { data, isLoading, error } = trpc.feature.useQuery(params);

// Mutation com otimistic update
const mutation = trpc.feature.useMutation({
  onMutate: (newData) => {
    // Atualizar cache otimisticamente
  },
  onError: (error, newData, context) => {
    // Rollback em caso de erro
  },
  onSuccess: () => {
    // Invalidar queries relacionadas
    trpc.useUtils().feature.invalidate();
  },
});

mutation.mutate(data);
```

---

## Testes

### Teste de Componente

```tsx
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/StatCard';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(
      <StatCard label="Test" value="$100" />
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });
});
```

### Teste de Procedure tRPC

```tsx
import { describe, it, expect } from 'vitest';
import { appRouter } from '@/server/routers';

describe('robot.getConfig', () => {
  it('returns default config', async () => {
    const caller = appRouter.createCaller(ctx);
    const config = await caller.robot.getConfig();
    expect(config.operationMode).toBe('Normal');
  });
});
```

---

**Versão**: 1.0.0  
**Última Atualização**: Abril de 2026
