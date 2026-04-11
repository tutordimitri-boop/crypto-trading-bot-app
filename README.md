# Crypto Trading Bot Manager

Uma interface web elegante e sofisticada para gerenciar e monitorizar robôs de trading automatizados na Bybit, com suporte a BTC e ETH.

## 🎯 Funcionalidades Principais

### Dashboard Inteligente
- **Status em Tempo Real**: Indicador visual do status do robô (Ativo/Inativo)
- **Modo de Operação**: Seletor de 3 modos distintos (Normal, Estratégico, Insano)
- **Métricas Principais**: Saldo, P&L, Total de Trades, Risco por Trade
- **Curva de Equity**: Gráfico interativo da evolução do saldo

### Gerenciamento de Trades
- **Posições Abertas**: Tabela em tempo real com todas as posições ativas
- **Histórico Completo**: Histórico de trades com filtros avançados (data, par, modo)
- **Análise Detalhada**: Score de entrada, P&L realizado, direção (Long/Short)

### Indicadores Técnicos Avançados
- **Score SMC**: Escala de -100 a +100 com visualização gráfica
- **Sinais de Estrutura**: BOS (Break of Structure) e CHoCH (Change of Character)
- **Fair Value Gaps (FVG)**: Identificação de gaps de valor justo
- **Order Blocks**: Blocos de ordem identificados

### Configuração e Segurança
- **Gestão de Risco**: Percentagem de risco por trade e alavancagem máxima
- **Chaves de API**: Armazenamento seguro e criptografado de credenciais Bybit
- **Feed de Logs**: Monitorização em tempo real com filtros por severidade (info, aviso, erro)

## 🏗️ Arquitetura

### Stack Tecnológico

**Frontend:**
- React 19 com TypeScript
- Tailwind CSS 4 para styling premium
- Recharts para visualizações de dados
- shadcn/ui para componentes base
- Wouter para roteamento

**Backend:**
- Express.js para servidor HTTP
- tRPC para RPC type-safe
- Drizzle ORM para banco de dados
- MySQL/TiDB para persistência

**Infraestrutura:**
- Vite para build e desenvolvimento
- Vitest para testes unitários
- Manus OAuth para autenticação

### Estrutura de Pastas

```
crypto-trading-bot-app/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas principais
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e hooks
│   │   ├── contexts/      # Contextos React
│   │   └── App.tsx        # Roteamento principal
│   └── public/            # Assets estáticos
├── server/                # Backend Express
│   ├── routers.ts         # Procedures tRPC
│   ├── db.ts              # Query helpers
│   └── _core/             # Infraestrutura
├── drizzle/               # Schema e migrações
├── docs/                  # Documentação
└── package.json
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 22.13.0+
- pnpm 10.4.1+
- Banco de dados MySQL/TiDB
- Chaves de API da Bybit

### Instalação

```bash
# Clonar repositório
git clone <repository-url>
cd crypto-trading-bot-app

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar e aplicar migrações
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Iniciar desenvolvimento
pnpm dev
```

### Build para Produção

```bash
# Build
pnpm build

# Iniciar servidor de produção
pnpm start
```

## 📊 Modos de Operação

### Normal
- **Foco**: Futuros
- **Timeframe**: 1H
- **Estratégia**: Análise técnica com SMC e estrutura de mercado
- **Ideal para**: Operações de médio prazo com risco moderado

### Estratégico
- **Foco**: Spot
- **Timeframe**: 15 minutos
- **Estratégia**: Operações mais frequentes com menor risco
- **Ideal para**: Traders que preferem operações mais rápidas

### Insano
- **Foco**: Futuros
- **Timeframe**: 5 minutos
- **Estratégia**: Operações de alta frequência com risco elevado
- **Ideal para**: Traders experientes com alta tolerância ao risco

## 🔐 Segurança

- Autenticação via Manus OAuth
- Chaves de API criptografadas
- Conexões HTTPS obrigatórias
- Rate limiting implementado
- Validação de entrada em todos os endpoints

## 📈 Performance

- Lazy loading de componentes
- Code splitting automático
- Caching de queries tRPC
- Polling otimizado (5s para logs)
- Gráficos otimizados com Recharts

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Testes com coverage
pnpm test -- --coverage

# Watch mode
pnpm test -- --watch
```

**Cobertura de Testes:**
- 17 testes unitários de procedures tRPC
- Testes de autenticação
- Testes de validação de entrada

## 📚 Documentação

- [Guia de Uso](docs/USAGE.md) - Como usar a aplicação
- [Deployment](docs/DEPLOYMENT.md) - Como fazer deploy
- [Componentes](docs/COMPONENTS.md) - Documentação de componentes

## 🛠️ Desenvolvimento

### Adicionar Nova Página

1. Criar arquivo em `client/src/pages/NovaPage.tsx`
2. Importar em `client/src/App.tsx`
3. Adicionar rota em `Router()`

### Adicionar Nova Procedure tRPC

1. Definir em `server/routers.ts`
2. Usar em componentes com `trpc.feature.useQuery/useMutation()`
3. Adicionar testes em `server/robot.test.ts`

### Adicionar Novo Componente

1. Criar em `client/src/components/NomeComponente.tsx`
2. Usar shadcn/ui como base quando possível
3. Documentar em `docs/COMPONENTS.md`

## 📊 Banco de Dados

### Tabelas Principais

- **users**: Usuários autenticados
- **robot_configs**: Configurações do robô
- **open_positions**: Posições abertas
- **trade_history**: Histórico de trades
- **logs**: Logs de execução
- **technical_indicators**: Indicadores técnicos

### Migrações

```bash
# Gerar migração após alterar schema
pnpm drizzle-kit generate

# Aplicar migrações
pnpm drizzle-kit migrate

# Visualizar migrações
pnpm drizzle-kit studio
```

## 🔄 Fluxo de Trabalho

1. **Desenvolvimento**: `pnpm dev` - Inicia servidor de desenvolvimento
2. **Testes**: `pnpm test` - Executa testes
3. **Build**: `pnpm build` - Constrói para produção
4. **Deploy**: Clique em "Publish" no Manus

## 🐛 Troubleshooting

### Aplicação não inicia
```bash
pnpm install
pnpm build
```

### Erro de banco de dados
```bash
# Verificar conexão
mysql -u user -p -h host database -e "SELECT 1"

# Recriar migrações
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### Testes falhando
```bash
# Limpar cache
rm -rf node_modules/.vite

# Reinstalar
pnpm install
pnpm test
```

## 📝 Convenções de Código

- **Componentes**: PascalCase (ex: `StatCard.tsx`)
- **Páginas**: PascalCase (ex: `Dashboard.tsx`)
- **Utilitários**: camelCase (ex: `formatCurrency.ts`)
- **Tipos**: PascalCase com sufixo `Props` (ex: `StatCardProps`)
- **Variáveis**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

## 🤝 Contribuindo

1. Criar branch feature: `git checkout -b feature/nova-feature`
2. Commit mudanças: `git commit -m "Add nova-feature"`
3. Push para branch: `git push origin feature/nova-feature`
4. Abrir Pull Request

## 📄 Licença

MIT

## 📞 Suporte

Para questões ou problemas:
1. Revise a documentação
2. Verifique os logs
3. Entre em contato com suporte

---

**Versão**: 1.0.0  
**Última Atualização**: Abril de 2026  
**Mantido por**: Crypto Trading Bot Team
