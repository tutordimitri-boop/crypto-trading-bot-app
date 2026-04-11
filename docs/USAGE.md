# Guia de Uso - Crypto Trading Bot Manager

## Visão Geral

O **Crypto Trading Bot Manager** é uma interface web elegante e sofisticada para gerenciar e monitorizar robôs de trading automatizados na Bybit, com suporte a BTC e ETH.

## Funcionalidades Principais

### 1. Dashboard Principal

O dashboard oferece uma visão completa do status do seu robô de trading:

- **Status do Robô**: Indicador visual mostrando se o robô está Ativo ou Inativo
- **Modo de Operação**: Exibe o modo atual (Normal, Estratégico ou Insano)
- **Métricas Principais**:
  - Saldo da Conta: Saldo atual em USD
  - P&L Total: Lucro/Prejuízo acumulado
  - Total de Trades: Número de operações realizadas
  - Risco por Trade: Percentagem de risco configurada

### 2. Visão Geral (Overview)

Acesse a página de Overview para um resumo completo de desempenho:

- **Curva de Equity**: Gráfico interativo mostrando a evolução do saldo ao longo do tempo
- **Estatísticas de Trading**:
  - Taxa de Vitória: Percentagem de trades vencedores
  - Profit Factor: Razão entre ganho médio e perda média
  - Ganho/Perda Média: Média de ganhos e perdas por trade
- **Configuração do Robô**: Resumo das configurações atuais

### 3. Seleção de Modos de Operação

O robô suporta 3 modos distintos:

#### Normal
- **Foco**: Futuros
- **Timeframe**: 1H
- **Estratégia**: Análise técnica com SMC e estrutura de mercado

#### Estratégico
- **Foco**: Spot
- **Timeframe**: 15 minutos
- **Estratégia**: Operações mais frequentes com menor risco

#### Insano
- **Foco**: Futuros
- **Timeframe**: 5 minutos
- **Estratégia**: Operações de alta frequência com risco elevado

**Para alternar modo:**
1. Clique no seletor de modo no dashboard
2. Escolha o novo modo desejado
3. Confirme a alteração
4. O robô aplicará a nova configuração automaticamente

### 4. Posições Abertas

Visualize todas as posições abertas em tempo real:

- **Par**: Ativo sendo tradado (BTC/USDT, ETH/USDT, etc.)
- **Direção**: Long ou Short
- **Tamanho**: Volume da posição
- **Preço de Entrada**: Preço de abertura da posição
- **P&L Não Realizado**: Ganho/Prejuízo atual
- **Stop Loss**: Nível de proteção configurado

**Ações disponíveis:**
- Fechar posição manualmente
- Ajustar nível de stop loss
- Visualizar detalhes da operação

### 5. Histórico de Trades

Analise todas as operações realizadas com filtros avançados:

**Filtros disponíveis:**
- **Data**: Intervalo de datas
- **Par**: BTC/USDT, ETH/USDT, etc.
- **Modo de Operação**: Normal, Estratégico, Insano
- **Direção**: Long ou Short

**Informações exibidas:**
- Par e direção da operação
- Resultado (Lucro/Prejuízo)
- Score de entrada (qualidade do sinal)
- Data e hora de execução

### 6. Indicadores Técnicos

Monitore indicadores técnicos avançados em tempo real:

#### Score SMC
- Escala: -100 a +100
- **Valores positivos**: Sinal de compra
- **Valores negativos**: Sinal de venda
- Visualização gráfica com cores indicativas

#### Sinais de Estrutura
- **BOS (Break of Structure)**: Rompimento de estrutura identificado
- **CHoCH (Change of Character)**: Mudança de caráter do mercado detectada

#### Gaps de Valor Justo (FVG)
- Identificação de Fair Value Gaps
- Níveis de suporte/resistência potenciais

#### Order Blocks
- Blocos de ordem identificados
- Áreas de interesse para entrada

### 7. Configuração de Risco

Personalize os parâmetros de risco do robô:

#### Percentagem de Risco por Trade
- Define o percentual máximo do saldo arriscado por operação
- Intervalo: 0.1% a 10%
- Recomendação: 1-2% para operações conservadoras

#### Alavancagem Máxima
- Define o multiplicador máximo permitido
- Intervalo: 1x a 100x
- **Aviso**: Aumentar alavancagem aumenta risco significativamente

#### Chaves de API Bybit
- Adicione suas credenciais da Bybit
- As chaves são armazenadas de forma segura e criptografada
- **Segurança**: Nunca compartilhe suas chaves de API

### 8. Feed de Logs e Alertas

Monitore a execução do robô em tempo real:

**Níveis de Log:**
- **Info**: Informações gerais de operação
- **Aviso**: Alertas importantes
- **Erro**: Erros críticos

**Filtros:**
- Visualize todos os logs ou filtre por nível de severidade
- Auto-scroll para os logs mais recentes
- Atualização automática a cada 5 segundos

## Fluxo de Trabalho Típico

1. **Inicialização**
   - Acesse o dashboard
   - Verifique o status do robô (Ativo/Inativo)
   - Confirme o modo de operação

2. **Configuração**
   - Vá para Configuração
   - Ajuste risco por trade (recomendado: 1%)
   - Configure alavancagem máxima (recomendado: 10x)
   - Adicione chaves de API da Bybit

3. **Monitorização**
   - Acompanhe a Curva de Equity
   - Monitore posições abertas
   - Verifique logs de execução

4. **Análise**
   - Revise histórico de trades
   - Analise estatísticas de performance
   - Ajuste estratégia se necessário

## Dicas de Uso

### Performance Otimizada
- Atualize o navegador periodicamente para sincronizar dados
- Mantenha o feed de logs filtrado para melhor performance
- Feche abas não utilizadas

### Segurança
- Nunca compartilhe suas chaves de API
- Use conexão HTTPS sempre
- Faça logout ao sair da plataforma

### Melhores Práticas
- Comece com o modo Normal para familiarização
- Use risco baixo (0.5-1%) até ganhar experiência
- Revise logs regularmente para entender comportamento
- Mantenha alavancagem conservadora (máximo 10x)

## Troubleshooting

### Dados não atualizam
- Recarregue a página (F5)
- Verifique conexão com internet
- Verifique chaves de API

### Robô não executa trades
- Verifique se está Ativo
- Confirme chaves de API válidas
- Revise logs para mensagens de erro

### Posições não aparecem
- Aguarde alguns segundos para sincronização
- Recarregue a página
- Verifique logs para erros de conexão

## Suporte

Para questões ou problemas:
1. Revise os logs do sistema
2. Verifique a documentação
3. Entre em contato com suporte

---

**Versão**: 1.0.0  
**Última Atualização**: Abril de 2026
