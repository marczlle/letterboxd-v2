## Letter Boxd

Aplicação web (Next.js) inspirada em plataformas de cinema: catálogo de filmes, página de detalhes, reviews da comunidade, bilheteria/seleção de assentos e um chat (`/api/chat`) para conversar sobre filmes.

## Stack

- **Next.js (App Router)**

- **React + TypeScript**

- **Tailwind CSS**

- **Testes**: Jest + Testing Library

- **CI**: GitHub Actions

## Requisitos

- **Node.js 20+**

- **npm** (recomendado por causa do `package-lock.json`)

## Como rodar localmente


1) Instale dependências:


```bash

npm ci

```


2) Rode em modo dev:


```bash

npm run dev

```

Acesse `http://localhost:3000`.

## Variáveis de ambiente

### Chat (OpenRouter)

A rota `POST /api/chat` usa OpenRouter via SDK do OpenAI.

- **`OPENROUTER_API_KEY`**: chave do OpenRouter.

Sem essa variável, o build passa normalmente, mas a rota `/api/chat` retorna erro 500 em runtime.

Exemplo (`.env.local`):

```bash

OPENROUTER_API_KEY=seu_token_aqui

```

## Scripts úteis

- **`npm run dev`**: inicia o servidor de desenvolvimento

- **`npm run build`**: build de produção (Next.js)

- **`npm run start`**: roda o build em produção

- **`npm run lint`**: ESLint

- **`npm run typecheck`**: TypeScript (`tsc --noEmit`)

- **`npm run test`**: Jest

- **`npm run test:ci`**: Jest em modo CI (`--ci --runInBand`)


## Testes


Os testes ficam em `src/__tests__/`.


Para rodar:


```bash

npm run test

```


## CI (GitHub Actions)


O workflow está em `.github/workflows/ci.yml`.


Ele executa:


- `npm ci`

- `npm run lint`

- `npm run typecheck`

- `npm run test:ci`

- `npm run build`


### Quando roda


- Em **Pull Requests**

- Em **push na branch `main`** (pode ser ajustado para outras branches no YAML)

- Manualmente via **Actions → CI → Run workflow** (quando disponível no repositório)


## Estrutura (visão rápida)


- **`src/app/`**: páginas/rotas (App Router)

- **`src/app/components/`**: componentes React

- **`src/app/api/chat/route.ts`**: endpoint do chat

- **`src/app/hooks/*/service.ts`**: chamadas para APIs externas (movie-service, user-service, review-service)


## Troubleshooting


- **CI falha com “Missing script: typecheck/test:ci”**

  - Garanta que o `package.json` tem os scripts `typecheck` e `test:ci`, e suba também o `package-lock.json`.


- **`next build` falha por variável de ambiente**

  - O projeto foi ajustado para não exigir `OPENROUTER_API_KEY` no build, mas a rota `/api/chat` precisa dela em runtime.

Devs: Marcelle de Paula (@marczlle) e Pedro Vieira (@Pedro-hashm)
