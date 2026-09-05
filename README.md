# BusinessDocsAi — Frontend

Frontend do BusinessDocsAi, construído com **React + TypeScript** e organizado
por camadas (rotas, componentes, páginas e serviços).

## Stack

| Camada | Escolha |
| --- | --- |
| Build | Vite |
| Linguagem | TypeScript |
| Roteamento | React Router v6 |
| Componentes | MUI (Material UI) v6 |
| Comunicação HTTP | Axios (instância central + interceptors) |
| Lint / formatação | ESLint + Prettier |

## Execução local

```bash
npm install
cp .env.example .env
# Edite VITE_API_BASE_URL apontando para o backend
npm run dev
```

No Windows PowerShell, use `Copy-Item .env.example .env`.

## Execução com Docker

Para o guia completo de configuração da equipe, desenvolvimento e troubleshooting,
consulte [DEVELOPMENT.md](./DEVELOPMENT.md).

```bash
docker compose up --build
```

A aplicação ficará disponível em <http://localhost:8080>. O container usa Nginx
e possui fallback para as rotas do React Router.

Para alterar a porta ou a URL do backend:

```bash
FRONTEND_PORT=8081 VITE_API_BASE_URL=http://localhost:3333/api docker compose up --build
```

As variáveis `VITE_*` são incorporadas durante o build. Sempre reconstrua a
imagem após alterá-las.

Comandos úteis:

```bash
docker compose up --build
docker compose down
docker compose logs -f frontend
npm run build
npm run preview
npm run lint
npm run format
```

## Estrutura de pastas

```text
src/
├── assets/
├── components/
│   ├── common/
│   └── layout/
├── config/
├── constants/
├── hooks/
├── pages/
├── routes/
├── services/
│   └── api/
├── theme/
├── types/
└── styles/
```

## Convenções

- Nomes de arquivos, pastas, funções, variáveis, constantes, tipos e textos da
  interface devem permanecer em inglês.
- Comentários e documentação podem permanecer em português.
- Use PascalCase para componentes React, como `UsersPage.tsx`.
- Use os caminhos centralizados em `src/routes/paths.ts`.
- Use o cliente Axios compartilhado em `src/services/api/httpClient.ts`.
- Não versione arquivos `.env` ou segredos.
