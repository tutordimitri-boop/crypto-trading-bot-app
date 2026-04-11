# Crypto Trading Bot Manager - TODO

## Fase 1: Estrutura Base e Design System
- [x] Definir paleta de cores elegante e sofisticada (tema escuro premium)
- [x] Configurar tipografia e espaçamento (design tokens)
- [x] Criar componentes base reutilizáveis (Card, Badge, Stat, etc.)
- [x] Implementar layout responsivo mobile-first

## Fase 2: Dashboard Principal
- [x] Status do robô (Ativo/Inativo) com indicador visual
- [x] Modo de operação atual com seletor
- [x] Métricas principais: P&L, Saldo, Número de Trades
- [x] Indicador visual de desempenho (gráfico de equity curve)

## Fase 3: Seleção de Modos de Operação
- [x] Implementar seletor de modo (Normal, Estratégico, Insano)
- [x] Exibir detalhes do modo: foco, timeframe, estratégia
- [x] Alternância entre modos com confirmação
- [x] Persistência de modo selecionado

## Fase 4: Painél de Trades Abertos
- [x] Tabela com colunas: Par, Direção, Tamanho, Preço Entrada, P&L, Stop Loss
- [x] Formatação de valores (moeda, percentual)
- [x] Indicadores visuais de ganho/perda
- [x] Ações por trade (fechar, ajustar stop loss)

## Fase 5: Histórico de Trades
- [x] Tabela com histórico de trades realizados
- [x] Filtros: data, par (BTC/ETH), modo de operação
- [x] Colunas: Par, Direção, Resultado, Score, Data
- [x] Paginação e ordenação

## Fase 6: Painél de Configuração de Risco
- [x] Input para percentagem de risco por trade
- [x] Input para alavancagem máxima
- [x] Gestão de chaves de API da Bybit (adicionar, editar, remover)
- [x] Validação e confirmação de alterações

## Fase 7: Feed de Logs e Alertas
- [x] Display em tempo real de logs
- [x] Filtros por nível: info, aviso, erro
- [x] Codificação visual por severidade (cores, ícones)
- [x] Auto-scroll e limite de logs exibidos
- [x] Timestamp em cada log

## Fase 8: Painél de Indicadores Técnicos
- [x] Score SMC (-100 a +100) com visualização gráfica
- [x] Sinais de BOS/CHoCH com status
- [x] Identificação de FVG (Fair Value Gaps)
- [x] Identificação de Order Blocks
- [x] Atualização em tempo real

## Fase 9: Backend - Modelos de Dados
- [x] Schema de usuários (já existe)
- [x] Schema de configurações do robô
- [x] Schema de trades abertos
- [x] Schema de histórico de trades
- [x] Schema de logs e alertas
- [x] Schema de indicadores técnicos

## Fase 10: Backend - Procedures tRPC
- [x] Procedures para obter status do robô
- [x] Procedures para alternar modo de operação
- [x] Procedures para listar trades abertos
- [x] Procedures para listar histórico de trades
- [x] Procedures para atualizar configurações de risco
- [x] Procedures para gerenciar chaves de API
- [x] Procedures para obter logs e alertas
- [x] Procedures para obter indicadores técnicos

## Fase 11: Integração Frontend-Backend
- [x] Conectar dashboard a procedures tRPC
- [x] Implementar polling/WebSocket para dados em tempo real
- [x] Tratamento de erros e loading states
- [x] Otimização de queries

## Fase 12: Testes e Validação
- [x] Testes unitários de componentes
- [x] Testes de procedures tRPC
- [x] Validação de responsividade
- [x] Testes de performance

## Fase 13: Refinamento e Polimento
- [x] Animações e transições suaves
- [x] Feedback visual de interações
- [x] Otimização de performance
- [x] Documentação de componentes

## Fase 14: Entrega
- [x] Checkpoint final
- [x] Documentação de uso
- [x] Instruções de deployment


## Fase 15: Integração com Bybit
- [x] Gerar chaves de API Bybit (testnet)
- [x] Instalar biblioteca bybit-api
- [x] Criar cliente Bybit em server/bybit/client.ts
- [x] Implementar procedures tRPC para trading (executeTrade, getOpenPositions, closePosition, etc)
- [x] Criar componentes frontend (ExecuteTrade, BybitPositions)
- [x] Testes unitários (9 testes passando)
- [x] Página de Trading integrada com componentes
- [x] Documentação de operação (BYBIT_SETUP.md)
- [ ] Migração para mainnet (quando tiver chaves reais)

## Notas Importantes
- Dashboard próprio (não Lovable)
- Integração direta com Bybit API
- Começar em testnet antes de mainnet
- Chaves de API em variáveis de ambiente
- Suportar 3 modos: Normal (1H Futuros), Estratégico (15min Spot), Insano (5min Futuros)
