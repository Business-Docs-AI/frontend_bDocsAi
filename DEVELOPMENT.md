# Guia de desenvolvimento do BusinessDocsAi Frontend

Este guia padroniza a configuração e o fluxo de desenvolvimento do frontend
para toda a equipe.

## 1. Pré-requisitos

### Docker (recomendado)

- Docker Desktop com Docker Compose habilitado.
- Git.

### Node.js

- Node.js 20 ou superior.
- npm 10 ou superior.
- Git.

O Docker é recomendado quando for necessário reproduzir um ambiente próximo do
container de produção.

## 2. Obtendo o projeto

```bash
git clone <repository-url>
cd businessDocsAi-frontend
```

Se o projeto já estiver disponível localmente:

```bash
git pull
```

## 3. Variáveis de ambiente

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `VITE_APP_NAME` | Não | `BusinessDocsAi` | Nome exibido na aplicação. |
| `VITE_API_BASE_URL` | Não | `http://localhost:3333/api` | URL base da API. |
| `VITE_API_TIMEOUT` | Não | `15000` | Timeout HTTP em milissegundos. |
| `FRONTEND_PORT` | Não | `8080` | Porta do host usada pelo Docker Compose. |

As variáveis `VITE_*` são lidas durante o build. Reconstrua a imagem Docker
sempre que alterá-las.

## 4. Executando com Docker

```bash
docker compose up --build
```

Acesse <http://localhost:8080>.

Para executar em segundo plano:

```bash
docker compose up --build -d
```

Para parar:

```bash
docker compose down
```

Para acompanhar os logs:

```bash
docker compose logs -f frontend
```

Para alterar porta ou backend:

```bash
FRONTEND_PORT=8081 VITE_API_BASE_URL=http://localhost:3333/api docker compose up --build
```

No PowerShell:

```powershell
$env:FRONTEND_PORT = "8081"
$env:VITE_API_BASE_URL = "http://localhost:3333/api"
docker compose up --build
```

O endpoint de saúde está disponível em <http://localhost:8080/health>.

## 5. Executando com Node.js

```bash
npm ci
npm run dev
```

Acesse a URL exibida pelo Vite, normalmente <http://localhost:5173>. O servidor
possui hot reload; use `Ctrl+C` para encerrá-lo.

## 6. Validação

Execute antes de abrir um Pull Request:

```bash
npm run lint
npm run build
```

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Verifica tipos e gera o build de produção. |
| `npm run preview` | Serve o build de produção localmente. |
| `npm run lint` | Executa o ESLint sem permitir warnings. |
| `npm run format` | Formata os arquivos com Prettier. |

## 7. Convenções do projeto

- Arquivos, pastas, funções, variáveis, tipos e constantes devem usar inglês.
- Comentários e documentação podem usar português.
- Use PascalCase para componentes React, como `UsersPage.tsx`.
- Mantenha componentes reutilizáveis em `src/components`.
- Mantenha telas de rota em `src/pages`.
- Registre caminhos em `src/routes/paths.ts`, sem strings espalhadas.
- Use o Axios compartilhado em `src/services/api/httpClient.ts`.
- Não versione arquivos `.env` ou segredos.

## 8. Criando uma nova página

1. Crie uma pasta e um componente com nomes em inglês em `src/pages`.
2. Adicione o caminho em `src/routes/paths.ts`.
3. Registre a rota em `src/routes/index.tsx`.
4. Adicione a página ao menu em `src/constants/navigation.ts`, se necessário.
5. Adicione ou atualize os tipos em `src/types`.
6. Execute `npm run lint` e `npm run build`.

## 9. Conexão com o backend

O frontend lê `VITE_API_BASE_URL` durante o build. O backend deve estar
executando e acessível por essa URL.

Se o backend estiver em outro projeto Docker Compose, use uma URL acessível pelo
navegador, como `http://localhost:3333/api`, e não apenas o nome interno do
serviço Docker. Verifique também o prefixo `/api` e as regras de CORS.

## 10. Troubleshooting

### Docker não está executando

Inicie o Docker Desktop e confirme:

```bash
docker info
docker compose version
```

### Dependências inconsistentes

```bash
rm -rf node_modules
npm ci
```

No PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm ci
```

### Alterações nas variáveis não aparecem

Reinicie o Vite ou reconstrua a imagem:

```bash
docker compose down
docker compose up --build
```

### Navegação direta retorna 404 no Docker

O `nginx.conf` possui o fallback do React Router. Reconstrua a imagem para
garantir que a configuração atual esteja sendo usada.

## 11. Checklist do Pull Request

- [ ] Nomes de código seguem o padrão em inglês.
- [ ] `npm run lint` passa.
- [ ] `npm run build` passa.
- [ ] Nenhum segredo ou arquivo `.env` foi versionado.
- [ ] A documentação foi atualizada quando necessário.
- [ ] A alteração foi testada no fluxo Docker ou local relevante.
