import path from "node:path";
import { CATALOG_DIR, KIND, KIND_LABEL, KINDS } from "./constants.js";
import { readText } from "./fs-utils.js";
import { canonicalPath } from "./placement.js";

const DOCS_DIR = path.join(CATALOG_DIR, "docs");

const HEADER = [
  "# Rules, skills e MCPs do agent-kit",
  "",
  "> Gerado pelo [agent-kit](https://github.com/gabrielfelice/agent-kit). Não edite: este arquivo é refeito a cada `add`, `update` e `remove`.",
  "",
  "## Onde cada coisa fica",
  "",
  "- `.agents/rules/` e `.agents/skills/` guardam a fonte de cada rule e skill. As cópias convertidas para Cursor e Copilot são geradas a partir delas. Alterações feitas à mão nesses arquivos são desfeitas pelo `update`.",
  "- `.agent-kit.json` registra o que o kit criou. `update` e `remove` mexem só nesses arquivos.",
];

const AGENT_LAYOUT = Object.freeze({
  claude: "- **Claude Code:** symlinks em `.claude/rules/` (carregadas automaticamente) e `.claude/skills/`, MCPs no `.mcp.json`. O `.claude/README.md` aponta para este arquivo.",
  codex: "- **Codex:** lê as skills direto de `.agents/skills/`, as rules pelo trecho no `AGENTS.md` (veja `snippet` abaixo) e os MCPs do bloco gerenciado no `.codex/config.toml`. O `.codex/README.md` aponta para este arquivo.",
  cursor: "- **Cursor:** lê as skills direto de `.agents/skills/`, as rules de cópias convertidas em `.cursor/rules/*.mdc` e os MCPs do `.cursor/mcp.json`. O `.cursor/README.md` aponta para este arquivo.",
  copilot: "- **GitHub Copilot (VS Code):** lê as skills direto de `.agents/skills/`, as rules de cópias convertidas em `.github/instructions/*.instructions.md` e os MCPs do `.vscode/mcp.json`.",
  gemini: "- **Gemini CLI:** lê as skills direto de `.agents/skills/`, as rules pelo trecho no `GEMINI.md` e os MCPs do `.gemini/settings.json`. O `.gemini/README.md` aponta para este arquivo.",
  opencode: "- **OpenCode:** lê as skills direto de `.agents/skills/`, as rules pelo trecho no `AGENTS.md` e os MCPs do `opencode.json`.",
});

const COMMANDS = [
  "## Comandos",
  "",
  "Rode com `npx github:gabrielfelice/agent-kit <comando>` (ou `npx @gabrielfelice/agent-kit`, depois de publicado):",
  "",
  "- `add`: escolhe e instala mais itens.",
  "- `list`: mostra o catálogo e o que já está instalado.",
  "- `update`: traz a versão atual do kit para os itens instalados.",
  "- `remove`: remove itens instalados pelo kit.",
  "- `snippet`: mostra o trecho sugerido para o `AGENTS.md`, o `CLAUDE.md` ou o `GEMINI.md`.",
];

const codeList = (keys) => keys.map((key) => `\`${key}\``).join(", ");

const docFor = async (item) =>
  (await readText(path.join(DOCS_DIR, item.kind, `${item.id}.md`))).trim() || item.description;

const whereEntry = (item) =>
  item.kind === KIND.MCPS
    ? `**Comando:** \`${[item.server.command, ...(item.server.args ?? [])].join(" ")}\``
    : `**Arquivo:** \`${canonicalPath(item)}\``;

const relationEntries = (item, { requires, installed }) => {
  const needs = requires[item.key] ?? [];
  const neededBy = installed.filter((key) => (requires[key] ?? []).includes(item.key));
  return [
    ...(needs.length > 0 ? [`**Instala junto:** ${codeList(needs)}`] : []),
    ...(neededBy.length > 0 ? [`**Exigido por:** ${codeList(neededBy)}`] : []),
  ];
};

const itemSection = async (item, relations) => [
  `### \`${item.id}\``,
  "",
  await docFor(item),
  "",
  [whereEntry(item), ...relationEntries(item, relations)].join(" · "),
  "",
];

const kindSection = async (items, relations) => {
  if (items.length === 0) {
    return [];
  }
  const sections = await Promise.all(items.map((item) => itemSection(item, relations)));
  return [`## ${KIND_LABEL[items[0].kind]}`, "", ...sections.flat()];
};

export const renderReadme = async ({ catalog, manifest }) => {
  const installed = catalog.items.filter((item) => manifest.items.includes(item.key));
  const relations = { requires: catalog.requires, installed: manifest.items };
  const kinds = await Promise.all(KINDS.map((kind) => kindSection(installed.filter((item) => item.kind === kind), relations)));
  const layout = manifest.agents.map((id) => AGENT_LAYOUT[id]).filter(Boolean);
  return [...HEADER, ...layout, "", ...COMMANDS, "", ...kinds.flat()].join("\n");
};
