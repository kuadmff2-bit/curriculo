# MeuCurrículo

Criador de currículos responsivo, simples e sem dependências externas nesta primeira versão.

## O que já funciona
- Editor por etapas
- Prévia em tempo real
- Autosave no navegador via localStorage
- Modelos Moderno, Clássico e ATS
- Personalização de fonte, cor e espaçamento
- Experiências, formação, idiomas, competências, cursos e projetos
- Revisão com pontuação orientativa
- Comparação simples com descrição de vaga
- Exportação em PDF pelo diálogo de impressão do navegador
- Modo claro/escuro
- PWA básica / cache offline
- Layout responsivo

## Executar
Você pode abrir `index.html` diretamente, mas para PWA/service worker use um servidor local:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Segurança
- Não existem credenciais reais no projeto.
- Arquivos locais de ambiente e variantes estão protegidos no `.gitignore`.
- Apenas `.env.example` pode ser versionado.
- Esta versão guarda currículos somente no navegador do próprio usuário.
- URLs inseridas no currículo são sanitizadas e apenas `http/https` são aceitos.
- Conteúdo digitado é escapado antes de ser inserido no HTML da prévia.
- Chaves, certificados e arquivos de ambiente não devem ser enviados ao repositório.

## Limites desta primeira versão
Não há autenticação, banco remoto ou IA externa. Esses recursos exigem backend e segredos mantidos exclusivamente no servidor ou no gerenciador de secrets do provedor.

## Próxima evolução recomendada
- Backend com autenticação
- Banco PostgreSQL/Supabase
- Armazenamento seguro de múltiplos currículos por conta
- Recuperação de senha
- Geração de PDF no servidor
- Assistente de escrita com IA sem expor chave no frontend
- Painel administrativo
- Logs/auditoria
- Exclusão/exportação de conta e dados
