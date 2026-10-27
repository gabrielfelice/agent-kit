# agent-kit

Conjunto de guardrails para trabalhar com agentes de LLM em projetos: **rules**, **skills** e **MCPs** reutilizáveis, levados para qualquer repositório por uma CLI interativa. Os agentes suportados são **Claude Code**, **Codex**, **Cursor**, **GitHub Copilot (VS Code)**, **Gemini CLI** e **OpenCode**. Claude Code e Codex vêm marcados por padrão.

```bash
cd meu-projeto
npx github:gabrielfelice/agent-kit           # direto do GitHub
npx @gabrielfelice/agent-kit                 # depois de publicado no npm
```

O comando abre um menu para escolher os agentes e os itens:

```
┌  agent-kit
◆  Para quais agentes?          ◼ Claude Code  ◼ Codex  ◻ Cursor  ◻ GitHub Copilot (VS Code)  ◻ Gemini CLI  ◻ OpenCode
◆  O que você quer trazer para este repositório?
│  ◻ Rules     ◻ coding-standards  ◻ javascript-typescript  ◻ tests
│  ◻ Skills    ◻ comentario-issue-commit  ◻ estrutura-de-pastas  ◻ git-rebase …
│  ◻ MCPs      ◻ chrome-devtools  ◻ playwright  ◻ spec-workflow
```

## Catálogo

| Tipo | Item | Para quê |
|---|---|---|
| Rule | `coding-standards` | Comentários, tamanho de arquivos e funções, aninhamento, parâmetros, constantes e segredos |
| Rule | `javascript-typescript` | `const`, comparação estrita, sem `any`, imports ES, tipos imutáveis, linter |
| Rule | `tests` | Cobertura obrigatória (mínimo de 80%), pirâmide de testes, ambiente, E2E |
| Skill | `comentario-issue-commit` | Faz o commit e comenta na issue da branch explicando o que mudou |
| Skill | `estrutura-de-pastas` | Cria a rule `folder-structure.md` adaptada ao projeto atual |
| Skill | `git-rebase` | Resolve conflitos de merge e rebase de forma conservadora |
| Skill | `node` | Práticas para código Node.js |
| Skill | `react` | Práticas para componentes, hooks e acesso a dados em React |
| Skill | `testes` | Como escrever e revisar testes (instala junto a rule `tests`) |
| MCP | `chrome-devtools` | O agente testa no Chrome instalado na máquina, com janela visível, enquanto você acompanha |
| MCP | `playwright` | O agente testa num Chromium do Playwright, com janela visível e sessão isolada |
| MCP | `spec-workflow` | Fluxo de specs (requirements, design e tasks) com painel |

## O que vai para o repositório

| | Fonte única | Claude Code | Codex | Cursor | Copilot (VS Code) | Gemini CLI | OpenCode |
|---|---|---|---|---|---|---|---|
| Rules | `.agents/rules/<nome>.md` | symlink em `.claude/rules/` | trecho no `AGENTS.md` | cópia convertida em `.cursor/rules/<nome>.mdc` | cópia convertida em `.github/instructions/<nome>.instructions.md` | trecho no `GEMINI.md` | trecho no `AGENTS.md` |
| Skills | `.agents/skills/<nome>/` | symlink em `.claude/skills/` | nativo | nativo | nativo | nativo | nativo |
| MCPs | — | `.mcp.json` | bloco gerenciado no `.codex/config.toml` | `.cursor/mcp.json` | `.vscode/mcp.json` | `.gemini/settings.json` | `opencode.json` |
| README | `.agents/README.md` | symlink em `.claude/README.md` | lido de `.agents/README.md` | idem | idem | idem | idem |

"Nativo" quer dizer que o agente já procura skills em `.agents/skills/`.


- **Sem duplicação:** cada rule e skill existe uma vez só, em `.agents/`. A exceção são as rules do Cursor e do Copilot: esses agentes exigem um frontmatter próprio (`alwaysApply`/`globs` e `applyTo`), então o kit gera uma cópia convertida, refeita a cada `update`. O `paths` da rule vira `globs`/`applyTo`. Sem `paths`, a rule vale sempre. Os symlinks são relativos e funcionam pra quem clonar o repo. No Windows sem suporte a symlink, use `--copy`: a opção fica registrada no manifesto e vale também para `update` e `remove`.
- **README para o time:** o `.agents/README.md` explica, para quem abre o repositório, o que cada rule, skill e MCP instalado faz, onde cada coisa fica em cada agente e como adicionar, atualizar ou remover itens. Ele lista só o que está instalado e é refeito a cada `add`, `update` e `remove`. Os agentes não carregam esse arquivo, então ele não gasta contexto.
- **Manifesto:** o `.agent-kit.json` registra o que o kit criou. Com isso, `update` e `remove` mexem só nesses arquivos.
- **Sem sobrescrever o que é do projeto:** um arquivo ou MCP com o mesmo nome que já existia é preservado e aparece no relatório como `↷`. Use `--force` para substituir.
- **O `AGENTS.md`, o `CLAUDE.md` e o `GEMINI.md` não são alterados.** No final, a CLI mostra um trecho para você colar neles. O trecho importa principalmente para Codex, OpenCode e Gemini CLI, que só leem rules a partir desses arquivos. Para ver o trecho de novo, rode `agent-kit snippet`.

## Comandos

```bash
agent-kit                     # = add, interativo
agent-kit add --skills node,react --rules tests --mcps chrome-devtools --agents claude,codex
agent-kit list                # catálogo, com ✔ no que já está instalado
agent-kit update              # reinstala os itens do manifesto com a versão atual do kit
agent-kit remove              # interativo, ou com --rules/--skills/--mcps
agent-kit snippet             # trecho sugerido para o AGENTS.md / CLAUDE.md
```

Opções: `--dir <repo>`, `--copy`, `--force`, `-y`. Veja `agent-kit --help`.

## Testar no navegador com você assistindo

Há dois MCPs de navegador. Escolha um ou os dois no menu: eles não conflitam, mas cada um acrescenta as próprias ferramentas ao contexto do agente.

| | `chrome-devtools` | `playwright` |
|---|---|---|
| Navegador | Chrome estável instalado na máquina | Chromium baixado pelo Playwright |
| Perfil | Persistente (`~/.cache/chrome-devtools-mcp/chrome-profile`): logins continuam valendo | Isolado (`--isolated`): começa limpo a cada sessão |
| Melhor para | Depurar: console, rede, performance, Lighthouse, CSS | Jornadas de E2E: clicar, preencher e conferir fluxos |
| Janela | Visível por padrão (`--headless` para esconder) | Visível por padrão (`--headless` para esconder) |

**No WSL**, os dois navegadores rodam no Linux e aparecem no Windows pelo WSLg. Para o `chrome-devtools`, instale o Chrome no WSL:

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb
```

Se a janela não aparecer (só o ícone na barra de tarefas, ou o aviso `[WARN:COPY MODE]`), o problema está no WSLg, não no MCP. Rode `wsl --update` no PowerShell e atualize o driver de vídeo. Outra opção é controlar o Chrome do Windows: abra-o com `--remote-debugging-port=9222 --user-data-dir=<pasta>`, acrescente `"--browserUrl", "http://127.0.0.1:9222"` aos `args` do `chrome-devtools` e ative `networkingMode=mirrored` no `.wslconfig`.

No Codex, o `.codex/config.toml` do projeto só é carregado em projetos marcados como confiáveis.

## Observações por agente

- **Gemini CLI:** lê o `GEMINI.md` por padrão. Para usar o `AGENTS.md`, defina `"context": { "fileName": ["AGENTS.md", "GEMINI.md"] }` no `.gemini/settings.json`.
- **OpenCode:** o kit escreve no `opencode.json`. Se o projeto usa `opencode.jsonc`, o kit não o lê e cria um `opencode.json` à parte.
- **Contexto duplicado:** o VS Code também lê `.claude/rules` e `.claude/skills`, e o Cursor lê `.claude/skills`. Com Claude Code e Copilot/Cursor marcados juntos, a mesma rule ou skill pode ser carregada duas vezes. Pelo mesmo motivo, o VS Code pode mostrar os MCPs em dobro se carregar o `.mcp.json` do Claude. Marque só os agentes que o time usa.
- **Variáveis de ambiente nos MCPs:** o catálogo usa `${VARIAVEL}`. O kit converte para `${env:VARIAVEL}` no Cursor e no VS Code e para `{env:VARIAVEL}` no OpenCode.

## Adicionar itens ao catálogo

- **Rule:** `catalog/rules/<nome>.md`, com `description` no frontmatter (aparece no menu). Para restringir a regra a certos arquivos, use `paths`: vale no Claude Code e vira `globs` no Cursor e `applyTo` no Copilot.
- **Skill:** `catalog/skills/<nome>/SKILL.md`, no padrão Agent Skills (`name` e `description`).
- **MCP:** `catalog/mcps/<nome>.json` com `description`, `command`, `args` e, se precisar, `env`. Segredos sempre como `${VARIAVEL}`.
- **Texto do README:** `catalog/docs/<tipo>/<nome>.md`, explicando o item para pessoas (o `description` é escrito para o agente). Sem esse arquivo, o README usa o `description`.
- **Dependências entre itens:** `catalog/requires.json`, por exemplo `{ "skills/testes": ["rules/tests"] }`.

O menu lê o catálogo direto das pastas: não é preciso mexer no código.

## Desenvolvimento

```bash
npm install
npm run lint          # ESLint com os limites das rules do kit (100 linhas/arquivo, 30/função, 3 parâmetros…)
npm test              # node:test com cobertura mínima de 80%
npm run test:rapido   # sem cobertura
```
