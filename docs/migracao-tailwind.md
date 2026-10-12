# Migracao MUI -> Tailwind CSS + shadcn/ui

Documento de acompanhamento da migracao do frontend. Atualize a tabela de
status a cada tela concluida.

---

## 1. Regras da migracao

1. **Uma tela por vez.** Cada tela e migrada e revisada isoladamente. Nada de
   PR "big bang".
2. **Nenhuma logica de negocio muda.** Hooks, services, contextos, chamadas de
   API e fluxos permanecem exatamente como estao. A migracao e so da camada de
   apresentacao.
3. **Nomes de codigo, rotas e contratos de API NAO mudam.** Nomes de arquivos,
   componentes, props, variaveis, paths (`src/routes/paths.ts`) e payloads de
   request/response ficam como estao hoje.
4. **Todo texto visivel ao usuario vira pt-BR.** Labels, titulos, botoes,
   placeholders, mensagens de erro, tooltips, `aria-label`, titulo da aba
   (`useDocumentTitle`) e textos de estado vazio.
5. **A identidade visual atual e preservada.** Cores, raios e tipografia saem
   dos tokens definidos em `src/styles/global.css`, que espelham
   `src/theme/theme.ts`. Nada de hex solto dentro de componente.
6. **Convivencia MUI + Tailwind.** Durante a transicao as duas bibliotecas
   coexistem. Uma tela migrada nao pode importar nada de `@mui/*`; uma tela
   ainda nao migrada nao pode ser tocada visualmente.
7. **Toda tela migrada tem um elemento raiz com a classe `tw`** (ver secao 3).
8. **`tsc -b` e `npm run build` verdes antes de cada commit.**

---

## 2. Tokens de design

Os tokens vivem em `src/styles/global.css` e sao a traducao 1:1 de
`src/theme/theme.ts`. Enquanto MUI e Tailwind convivem, **qualquer mudanca de
cor, raio ou tipografia precisa ser feita nos dois arquivos.**

### Cores

| Token CSS / classe Tailwind | Valor | Origem no `theme.ts` |
| --- | --- | --- |
| `--background` / `bg-background` | `#F7F7F5` | `palette.background.default` |
| `--foreground` / `text-foreground` | `#221F1C` | `palette.text.primary` |
| `--card`, `--popover` | `#FFFFFF` | `palette.background.paper` |
| `--primary` / `bg-primary` | `#F0554A` | `palette.primary.main` |
| `--primary-foreground` | `#FFFFFF` | `palette.primary.contrastText` |
| `--secondary` | `#EFEEEA` | superficie neutra do shadcn (ver nota) |
| `--muted` | `#EFEEEA` | superficie neutra |
| `--muted-foreground` | `#6E6B64` | `palette.text.secondary` |
| `--accent` | `#FDECEA` | `palette.primary.light` |
| `--accent-foreground` | `#D8392E` | `palette.primary.dark` |
| `--destructive` | `#C23A34` | `palette.error.main` |
| `--border`, `--input` | `#E7E5DF` | `palette.divider` |
| `--ring` | `#F0554A` | `palette.primary.main` |
| `--brand` / `text-brand` | `#F0554A` | `palette.primary.main` |
| `--brand-dark` | `#D8392E` | `palette.primary.dark` |
| `--brand-light` | `#FDECEA` | `palette.primary.light` |
| `--brand-violet` | `#5B4FCF` | `palette.secondary.main` |
| `--success` | `#1F8A4C` | `palette.success.main` |
| `--warning` | `#B4740E` | `palette.warning.main` |
| `--info` | `#1E63C9` | `palette.info.main` |

> **Nota sobre `secondary`.** No shadcn/ui, `secondary` e uma *superficie
> neutra* (fundo de botao discreto), nao a cor de destaque da marca. Por isso o
> roxo de `palette.secondary.main` foi exposto como `--brand-violet` /
> `bg-brand-violet`, e `--secondary` recebeu um cinza-quente derivado da
> paleta. Ao migrar um `color="secondary"` do MUI, use `brand-violet`.

### Tipografia

`--font-sans` repete a pilha de `typography.fontFamily`:
`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.

| Classe Tailwind | Tamanho / peso | Origem |
| --- | --- | --- |
| `text-h1` | 22px / 700 | `typography.h1` |
| `text-h2` | 18px / 700 | `typography.h2` |
| `text-body` | 14px | `typography.body1` |
| `text-body-sm` | 13px | `typography.body2` |

### Raios de borda

`shape.borderRadius: 8` -> `--radius: 0.5rem`. A escala do shadcn deriva dai:
`rounded-sm` (0.3rem), `rounded-md` (0.4rem), `rounded-lg` (0.5rem),
`rounded-xl` (0.7rem), `rounded-2xl` (0.9rem).

### Overrides de componentes do `theme.ts`

Nao existe equivalente automatico no Tailwind; precisam ser reproduzidos na mao
em cada componente migrado:

- **`MuiButton`** - `textTransform: none`, `fontWeight: 600`, `borderRadius: 8`,
  `disableElevation`. O `Button` do shadcn ja nao faz uppercase nem sombra;
  ajustar para `font-semibold rounded-lg`.
- **`MuiAppBar`** - fundo `#FFFFFF`, texto `#221F1C`, sem sombra, borda inferior
  `1px solid #E7E5DF`. Ao migrar o Header:
  `bg-card text-foreground border-b border-border shadow-none`.
- **`MuiPaper`** - `backgroundImage: none`. Sem equivalente necessario; so
  existia para anular o overlay de elevacao do MUI. Nada a fazer.

### Modo escuro

O app e **light-only** (`palette.mode: 'light'`). A variante `dark` do Tailwind
continua registrada, mas nao ha bloco `.dark` com valores de marca. Se dark mode
entrar no escopo, e preciso definir a paleta escura antes de usar `dark:`.

---

## 3. Convivencia com o MUI (preflight x CssBaseline)

O preflight do Tailwind e o `CssBaseline` do MUI fazem resets concorrentes
(margens de heading, fonte de `button`/`input`, `border-width: 0`,
`display: block` em imagens). Aplicar os dois ao mesmo tempo mudaria a
aparencia das telas ainda nao migradas.

**Solucao adotada:** o preflight global **nao e importado**. Em
`src/styles/global.css`, no lugar de `@import 'tailwindcss';` existe:

```css
@layer theme, base, components, utilities;

@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);
```

ou seja, `theme` + `utilities`, **sem** `preflight.css`. No fim do arquivo ha um
preflight **escopado em `.tw`**, equivalente ao original, que so vale dentro de
subarvores migradas.

Consequencias praticas:

- Telas MUI continuam 100% sob o `CssBaseline`. Nenhuma mudanca visual.
- **Toda tela/componente migrado precisa de um elemento raiz com a classe
  `tw`**, senao os componentes shadcn ficam sem reset (headings com margem,
  botoes com a fonte do sistema operacional, etc.).
- Dentro de `.tw`, nao misture componentes MUI: os estilos do Emotion ficam
  fora de `@layer` e vencem as camadas do Tailwind, gerando resultado
  imprevisivel.

O `shadcn init` tambem adicionou um bloco `@layer base` global
(`body { bg-background text-foreground }`, `html { font-sans }`,
`* { border-border }`) e a fonte Geist. Ambos foram removidos pelo mesmo motivo:
mudariam a aparencia de todas as telas ainda em MUI.

### Ao final da migracao (etapa "Remocao do MUI")

1. Trocar os dois `@import` por `@import 'tailwindcss';`.
2. Apagar o bloco de preflight escopado (`@layer base { .tw ... }`).
3. Remover as classes `tw` dos elementos raiz.
4. Remover `<ThemeProvider>` e `<CssBaseline>` de `src/App.tsx`.
5. Apagar `src/theme/theme.ts`.
6. `npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled`.

### O que foi instalado nesta preparacao

- `tailwindcss` + `@tailwindcss/vite` (v4), plugado em `vite.config.ts`.
- `shadcn` (estilo `base-nova`, base `neutral`), `components.json`,
  `src/lib/utils.ts` (`cn`) e os componentes em `src/components/ui/`
  (`button`, `input`, `label`, `alert`, `dropdown-menu`).
- Dependencias trazidas pelo shadcn: `@base-ui/react`,
  `class-variance-authority`, `cn`, `lucide-react`, `tw-animate-css`.
- A fonte `@fontsource-variable/geist`, que o `shadcn init` adiciona por
  padrao, foi **removida** para preservar a tipografia atual do produto.

---

## 4. Status das telas

| # | Tela | Arquivos principais | Tailwind | pt-BR | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Login | `src/pages/Login/LoginPage.tsx` | [x] | [x] | **Concluida** |
| 2 | Layout (Header / MainLayout) | `src/components/layout/Header/Header.tsx`, `src/components/layout/MainLayout.tsx`, `src/constants/navigation.ts` | [x] | [x] | **Concluida** |
| 3 | Documentacao | `src/pages/Documentation/DocumentationPage.tsx`, `src/components/common/PageHeader.tsx` | [x] | [x] | **Concluida** |
| 4 | Chat (inclui DocumentPanel) | `src/pages/Chat/ChatPage.tsx` + `components/ChatPanel.tsx`, `ConversationsPanel.tsx`, `DocumentPanel.tsx`, `MessageBubble.tsx`, `src/hooks/useMediaQuery.ts` | [x] | [x] | **Concluida** |
| 5 | Categorias | `src/pages/Categories/CategoriesPage.tsx` | [x] | [x] | **Concluida** |
| 6 | Usuarios | `src/pages/Users/UsersPage.tsx` | [x] | [x] | **Concluida** |
| 7 | ~~Integracoes~~ | — | — | — | **REMOVIDA (nao implementada)** |
| 8 | Remocao do MUI | `src/App.tsx`, `src/theme/theme.ts`, `package.json` | [ ] | - | Pendente |

Componentes comuns e telas auxiliares:

| Arquivo | Status |
| --- | --- |
| `src/components/common/Logo.tsx` | Nunca usou MUI (SVG puro) |
| `src/components/common/PageHeader.tsx` | Migrado com a Documentacao |
| `src/pages/NotFound/NotFoundPage.tsx` | **Migrado + pt-BR** |
| `src/routes/ProtectedRoute.tsx` | **Migrado** (`CircularProgress` -> `Loader2`) |

**Legenda:** Pendente -> Em andamento -> Concluida.

### Notas de migracao

- **Login.** O `TextField` do MUI usa label flutuante (dentro do campo); o
  padrao do shadcn e `Label` acima do `Input`. Para nao deixar os campos
  visualmente vazios, foram adicionados placeholders em pt-BR e os atributos
  `autoComplete` (`email` / `current-password`). Campos e botao usam `h-10`
  para manter a densidade do `size="small"` do MUI. O `Logo` nao foi alterado
  (SVG puro, sem dependencia de MUI).
- **Layout.** A raiz do `MainLayout` **nao** recebe a classe `tw`: o preflight
  escopado valeria para todo o `<Outlet />`, incluindo as telas ainda em MUI, e
  mudaria a aparencia delas. As utilitarias do Tailwind funcionam sem `tw` (so
  o reset e escopado), e o `Header` aplica a classe em si mesmo. Cada tela
  migrada daqui pra frente aplica o `tw` na propria raiz.
- **Documentacao.** O conteudo HTML do documento (`dangerouslySetInnerHTML`) e
  renderizado no portal do `Dialog`, que fica **fora** do escopo `.tw`. Isso e
  proposital: sem o preflight, o HTML injetado mantem os defaults do navegador
  (margens de titulo, marcadores de lista) e continua parecendo um documento.
  Em compensacao, elementos nativos dentro de conteudo portalado precisam de
  margem explicita - por isso o `DialogTitle` leva `m-0`. Vale para o popup do
  `Select` e para o `DropdownMenu` do Header tambem, que ja usam classes
  explicitas e nao dependem do reset.
- **Chat.** Equivalencias que nao sao 1:1 e valem conferir ao mexer na tela:
  - `useMediaQuery` do MUI -> `src/hooks/useMediaQuery.ts` (novo, mesmo
    contrato). Os breakpoints `max-width:1024px` / `max-width:768px` seguem
    iguais.
  - `Drawer` -> `Sheet` (`side="left"`), `Tabs` -> `Tabs` do shadcn,
    `CircularProgress` -> `Loader2` com `animate-spin`.
  - `Snackbar` -> um bloco `fixed` no canto inferior, com o `autoHideDuration`
    (12s no aviso de timeout, 6s no erro) reproduzido por `setTimeout`. O
    `chat.clearError` **nao** e memoizado no `useChat`, entao vai por `ref`: se
    entrasse nas dependencias do efeito, o timer reiniciaria a cada render e
    nunca dispararia.
  - `TextField multiline maxRows={5}` -> `Textarea` com auto-crescimento
    calculado a partir do `line-height` e dos paddings computados.
  - O indicador "Pensando" usa a utilitaria `animate-thinking-dot`, cujo
    keyframe foi adicionado em `global.css` (bloco `@theme` sem `inline`, para
    o Tailwind emitir os `@keyframes`). Adicao puramente nova - nao afeta
    nenhuma tela existente.
  - `TooltipProvider` envolve so a `ChatPage`, para nao precisar tocar o
    `App.tsx`. O contexto atravessa portais, entao os tooltips do `Sheet`
    tambem funcionam.
  - O `SheetContent` recebe a classe `tw` porque e portalado: sem ela, o
    conteudo ficaria fora do escopo do preflight.
- **Categorias.** Era a tela com mais texto em ingles - titulo, subtitulo,
  cabecalhos da tabela, botoes, todos os modais, as mensagens de validacao e
  as de sucesso/erro foram para pt-BR. As mensagens de `console.error`
  continuam em ingles de proposito: sao log, nao interface.
  - `Table` do shadcn tem celulas bem mais apertadas que o MUI (`p-2` contra
    16px), por isso cada celula recebe `px-4 py-3`. A coluna de descricao leva
    `whitespace-normal` para desfazer o `whitespace-nowrap` padrao e voltar a
    quebrar linha como no MUI.
  - Os campos dos modais de criar e editar eram JSX duplicado; viraram um
    componente local `CategoryFormFields` no mesmo arquivo. Mesmo
    comportamento: label, estado de erro e o `helperText` alternando entre a
    mensagem de validacao e o contador de caracteres.
  - `Snackbar` -> bloco `fixed` no canto inferior direito, com o
    `autoHideDuration` de 4s via `setTimeout`. O guard de `clickaway` do MUI
    deixou de existir: a nova implementacao nao fecha por clique fora, entao
    nao ha o que guardar.
- **Integracoes: REMOVIDA, nao implementada.** A tela era um placeholder puro
  (`PageHeader` + um `TODO` para os cards de integracao), sem estado, sem
  servico e sem nenhuma dependencia alem da rota e do item de menu. Em vez de
  migrar codigo morto, ela foi removida:
  - apagado `src/pages/Integrations/`;
  - removida a rota e o import em `routes/index.tsx`;
  - removida a entrada `integrations` em `routes/paths.ts`;
  - removido o item do menu e o icone `Puzzle` em `constants/navigation.ts`.

  `/integrations` agora cai no catch-all `{ path: '*' }` das rotas protegidas,
  ou seja, a `NotFoundPage` dentro do layout - o comportamento padrao do app
  para rota inexistente.

  **Para recuperar:** o ultimo commit em que a tela existia e **`fad41d0`**.
  `git show fad41d0:src/pages/Integrations/IntegrationsPage.tsx` devolve o
  arquivo original; para restaurar tudo, basta reverter o commit de remocao.
  Ao trazer a tela de volta, lembre de recriar a entrada em `paths.ts`, a rota
  e o item de menu.
- **Usuarios.** A tela e um esboco: so `PageHeader` + botao "Novo usuario", com
  um `TODO` para a tabela de usuarios. A migracao trocou MUI por Tailwind e
  traduziu os textos, **sem implementar a tabela** - isso e feature nova, nao
  migracao. O botao segue sem `onClick`, como estava. O `usersService` existe
  em `services/api/` mas ainda nao e usado por esta tela.
- **`common/PageHeader.tsx`** (compartilhado) foi migrado junto, porque a
  Documentacao o usa. Ele ainda e renderizado por Categorias, Usuarios e
  Integracoes, que estao fora de um escopo `.tw`; por isso declara `m-0`,
  `mb-0` e `leading-[1.167]` (o line-height do `Typography variant="h1"` do
  MUI) explicitamente, para renderizar igual com ou sem o reset. O
  `leading-[1.167]` define `--tw-leading`, que o token `text-h1` consome, logo
  o override vale independente da ordem das regras. Quando as tres telas
  estiverem migradas, esse `leading` pode voltar ao valor do token.
- **`constants/navigation.ts`** (compartilhado) teve os labels traduzidos e os
  icones do `@mui/icons-material` trocados por `lucide-react` (`LucideIcon`).
  O campo `icon` continua sem uso no `Header`, mas segue tipado para as telas
  que vierem a usar.

---

## 5. Pendencias visuais

Ajustes de aparencia conhecidos, a resolver **durante** a migracao da tela
correspondente - nao antes, para nao mexer em codigo MUI que ja vai ser
substituido.

| Tela | Pendencia | Observacao |
| --- | --- | --- |
| ~~Documentacao~~ | ~~**Cards grandes demais.**~~ **RESOLVIDA** (migracao da tela) | A altura do card caiu de ~292px para ~170px: a faixa do icone passou de `150px` para `h-24` (96px, icone `size-11`), a `minHeight: 142` do `CardContent` foi removida (a altura agora vem do conteudo) e o padding foi de `p: 1.75` (14px) para `p-3` (12px). O espaco sob o titulo de cada categoria caiu de `mb: 3.5` (28px) para `mb-4` (16px). Os breakpoints do grid foram **mantidos** (`1 / sm:2 / md:3 / lg:4`) para nao alterar a responsividade. |

Nenhuma pendencia visual aberta no momento.
