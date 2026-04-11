# Setup Prático - Integração Bybit

Este guia passo-a-passo mostra como configurar sua integração com Bybit no dashboard.

## 1. Gerar Chaves de API na Bybit

### Passo 1: Acessar API Management

1. Faça login em sua conta Bybit (https://www.bybit.com)
2. Clique no seu avatar no canto superior direito
3. Selecione **Account** → **API Management**

### Passo 2: Criar Nova Chave (Testnet - Recomendado Começar Aqui)

Para **testes sem risco**:

1. Clique em **Create New Key**
2. Selecione **Testnet** como tipo
3. Configure permissões:
   - ✅ Read (ler dados)
   - ✅ Spot Trading (operar em spot)
   - ✅ Futures Trading (operar em futuros)
   - ✅ Wallet (ver saldo)
4. Clique em **Create**
5. Copie:
   - **API Key** (exemplo: `XXXXXXXXXXXXXXXX`)
   - **Secret Key** (exemplo: `XXXXXXXXXXXXXXXX`)

### Passo 3: Criar Chave para Produção (Depois)

Quando estiver pronto para operar com dinheiro real:

1. Repita o processo acima
2. Selecione **Mainnet** em vez de **Testnet**
3. Guarde as chaves em local seguro

## 2. Configurar Variáveis de Ambiente

### Arquivo `.env` (Desenvolvimento - Testnet)

Crie um arquivo `.env` na raiz do projeto:

```env
# Bybit - Testnet (Desenvolvimento)
BYBIT_TESTNET_API_KEY=sua-chave-testnet-aqui
BYBIT_TESTNET_API_SECRET=seu-secret-testnet-aqui
BYBIT_ENVIRONMENT=testnet
BYBIT_TESTNET_ENABLED=true

# Bybit - Mainnet (Produção - Deixe vazio por enquanto)
BYBIT_API_KEY=
BYBIT_API_SECRET=
BYBIT_MAINNET_ENABLED=false
```

### Variáveis no Manus (Produção)

Quando publicar no Manus:

1. Vá para **Settings → Secrets**
2. Adicione as mesmas variáveis
3. Use valores de mainnet quando estiver pronto

## 3. Testar a Conexão

### Via Dashboard

1. Abra seu dashboard em desenvolvimento
2. Vá para a página de **Configuração**
3. Clique em **Testar Conexão Bybit**
4. Você deve ver: ✅ "Conexão com Bybit estabelecida"

### Via Terminal

```bash
cd /home/ubuntu/crypto-trading-bot-app

# Verificar se as variáveis estão carregadas
echo $BYBIT_TESTNET_API_KEY

# Executar teste
pnpm test -- bybit.test.ts
```

## 4. Usar o Dashboard

### Executar um Trade

1. Vá para **Dashboard → Executar Trade**
2. Preencha:
   - **Par**: BTCUSDT (ou outro)
   - **Direção**: Long ou Short
   - **Tipo**: Market ou Limit
   - **Quantidade**: 0.01 (pequeno para teste)
3. Clique em **Executar**
4. Verifique em **Posições Abertas** se apareceu

### Monitorar Posições

1. Vá para **Dashboard → Posições Abertas**
2. Veja todas as suas posições ativas
3. Clique em **Fechar Posição** para encerrar

### Ver Histórico

1. Vá para **Dashboard → Histórico**
2. Filtre por data, par ou modo
3. Veja resultado de cada trade (lucro/prejuízo)

## 5. Segurança

### ✅ Fazer

```env
# Use variáveis de ambiente
BYBIT_TESTNET_API_KEY=sua-chave-segura

# Nunca commit .env
# Adicione ao .gitignore:
.env
.env.local
```

### ❌ Não Fazer

```env
# Nunca hardcode chaves
BYBIT_API_KEY=sua-chave-aqui  # ❌

# Nunca compartilhe chaves
# Nunca coloque em repositório público
# Nunca exponha em logs
```

## 6. Troubleshooting

### Erro: "Invalid API Key"

**Solução:**
1. Verifique se copiou a chave corretamente
2. Certifique-se de estar usando testnet ou mainnet correto
3. Regenere a chave se necessário

### Erro: "Insufficient Balance"

**Solução:**
1. Verifique saldo em sua conta Bybit
2. Se usando testnet, adicione fundos de teste (gratuito)
3. Aumente o saldo se necessário

### Erro: "Order Rejected"

**Solução:**
1. Verifique quantidade mínima (geralmente 0.001 BTC)
2. Verifique preço (não pode ser muito alto/baixo)
3. Verifique permissões de API

### Posições não aparecem

**Solução:**
1. Verifique se tem posições abertas
2. Clique em **Atualizar** para sincronizar
3. Verifique se está usando conta correta

## 7. Próximos Passos

### Semana 1: Aprender
- [ ] Executar 5 trades pequenos em testnet
- [ ] Entender como funciona cada modo (Normal, Estratégico, Insano)
- [ ] Testar fechamento de posições

### Semana 2: Validar
- [ ] Testar stop loss e take profit
- [ ] Verificar histórico de trades
- [ ] Analisar performance

### Semana 3: Migrar para Mainnet
- [ ] Gerar chaves mainnet
- [ ] Atualizar variáveis de ambiente
- [ ] Começar com valores pequenos
- [ ] Monitorar constantemente

### Semana 4: Escalar
- [ ] Aumentar tamanho dos trades
- [ ] Otimizar configurações de risco
- [ ] Analisar resultados

## 8. Recursos Úteis

- **Documentação Bybit**: https://bybit-exchange.github.io/docs/
- **API Reference**: https://bybit-exchange.github.io/docs/v5/intro
- **Testnet**: https://testnet.bybit.com
- **Community**: https://www.bybit.com/community

## 9. Suporte

Se encontrar problemas:

1. Verifique os logs em **Dashboard → Logs**
2. Leia a documentação em `docs/BYBIT_INTEGRATION.md`
3. Verifique as credenciais em **Settings → Secrets**

---

**Versão**: 1.0.0  
**Última Atualização**: Abril de 2026  
**Status**: Pronto para uso
