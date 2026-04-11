# Guia de Deployment - Crypto Trading Bot Manager

## Visão Geral

O Crypto Trading Bot Manager é uma aplicação web full-stack construída com React, Express, tRPC e Tailwind CSS. Este guia descreve como fazer deploy da aplicação em diferentes ambientes.

## Pré-requisitos

Antes de fazer deploy, certifique-se de ter:

- Node.js 22.13.0 ou superior
- pnpm 10.4.1 ou superior
- Banco de dados MySQL/TiDB configurado
- Chaves de API da Bybit (para operação)

## Variáveis de Ambiente

Configure as seguintes variáveis de ambiente antes do deployment:

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@host:port/database

# Autenticação
JWT_SECRET=sua-chave-secreta-aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Aplicação
VITE_APP_ID=seu-app-id
VITE_APP_TITLE=Crypto Trading Bot Manager
VITE_APP_LOGO=https://seu-cdn.com/logo.png

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-api
VITE_FRONTEND_FORGE_API_KEY=sua-chave-frontend
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Proprietário
OWNER_NAME=seu-nome
OWNER_OPEN_ID=seu-open-id
```

## Build Local

Para construir a aplicação localmente:

```bash
# Instalar dependências
pnpm install

# Gerar migrações de banco de dados
pnpm drizzle-kit generate

# Aplicar migrações
pnpm drizzle-kit migrate

# Build de produção
pnpm build

# Iniciar servidor
pnpm start
```

## Deployment em Manus

O Manus fornece hosting integrado com suporte a domínios customizados:

### Passos para Deploy

1. **Criar Checkpoint**
   - Certifique-se de que todas as mudanças estão commitadas
   - Crie um checkpoint com descrição clara
   - Verifique se o checkpoint foi salvo com sucesso

2. **Publicar**
   - Clique no botão "Publish" na interface do Manus
   - Aguarde o build e deployment automático
   - Verifique o URL gerado

3. **Configurar Domínio**
   - Acesse as configurações de domínio no Manus
   - Configure seu domínio customizado (opcional)
   - Atualize DNS se necessário

### Monitorização Pós-Deploy

Após o deployment, monitore:

- Status do servidor (verde = operacional)
- Logs de erro
- Performance da aplicação
- Conectividade do banco de dados

## Deployment em Plataformas Externas

### Railway

```bash
# 1. Conectar repositório GitHub
# 2. Configurar variáveis de ambiente no Railway
# 3. Configurar build command
pnpm build

# 4. Configurar start command
pnpm start
```

### Render

```bash
# 1. Conectar repositório GitHub
# 2. Criar Web Service
# 3. Configurar variáveis de ambiente
# 4. Build command: pnpm build
# 5. Start command: pnpm start
```

### Vercel (Frontend apenas)

```bash
# 1. Conectar repositório GitHub
# 2. Configurar build: pnpm build
# 3. Output directory: dist
# 4. Deploy automático em cada push
```

## Otimização de Performance

### Build Optimization

```bash
# Analisar tamanho do bundle
pnpm build --analyze

# Remover dependências não utilizadas
pnpm prune --production
```

### Database Optimization

- Criar índices em colunas frequentemente consultadas
- Configurar connection pooling
- Implementar caching de queries frequentes

### Frontend Optimization

- Lazy loading de componentes
- Code splitting automático com Vite
- Compressão de assets
- Cache de assets estáticos

## Monitorização e Logs

### Acessar Logs

```bash
# Logs de servidor
tail -f .manus-logs/devserver.log

# Logs de browser
tail -f .manus-logs/browserConsole.log

# Logs de requisições
tail -f .manus-logs/networkRequests.log
```

### Métricas Importantes

- Taxa de erro HTTP
- Tempo de resposta médio
- Uso de memória do servidor
- Conexões ativas de banco de dados

## Backup e Recuperação

### Backup de Banco de Dados

```bash
# Backup MySQL
mysqldump -u user -p database > backup.sql

# Restaurar backup
mysql -u user -p database < backup.sql
```

### Recuperação de Falhas

1. Verifique logs de erro
2. Verifique conectividade de banco de dados
3. Reinicie o servidor
4. Restaure de backup se necessário

## Segurança

### Checklist de Segurança

- [ ] Variáveis de ambiente configuradas corretamente
- [ ] HTTPS habilitado
- [ ] Chaves de API não expostas em código
- [ ] Banco de dados com backup regular
- [ ] Logs monitorados para atividades suspeitas
- [ ] Atualizações de dependências aplicadas

### Proteção de Dados

- Todas as chaves de API são criptografadas
- Senhas armazenadas com hash seguro
- Conexões de banco de dados com SSL
- Rate limiting implementado

## Troubleshooting

### Aplicação não inicia

```bash
# Verificar erros
pnpm build

# Verificar banco de dados
mysql -u user -p -h host database -e "SELECT 1"

# Verificar variáveis de ambiente
echo $DATABASE_URL
```

### Erro de conexão com banco de dados

- Verificar credentials
- Verificar firewall
- Verificar status do servidor MySQL
- Verificar pool de conexões

### Performance lenta

- Analisar logs de requisição
- Verificar índices de banco de dados
- Revisar queries N+1
- Aumentar recursos do servidor

## Rollback

Para reverter para uma versão anterior:

1. Identifique o checkpoint anterior
2. Use o botão "Rollback" na interface
3. Verifique se a aplicação retornou ao estado anterior

## Atualização de Dependências

```bash
# Atualizar dependências
pnpm update

# Atualizar dependências específicas
pnpm update @trpc/server @trpc/react-query

# Verificar vulnerabilidades
pnpm audit
```

## Suporte

Para questões de deployment:

1. Verifique os logs da aplicação
2. Consulte a documentação do Manus
3. Revise as variáveis de ambiente
4. Entre em contato com suporte

---

**Versão**: 1.0.0  
**Última Atualização**: Abril de 2026
