import { AGENT_IDS } from "./agents.js";
import { loadCatalog } from "./catalog.js";
import { KIND_LABEL, KINDS } from "./constants.js";
import { install, remove, update } from "./install.js";
import { readManifest } from "./manifest.js";
import { renderInstall, renderRemove } from "./report.js";
import { buildSnippet } from "./snippet.js";

const SNIPPET_TITLE = "Trecho sugerido para o AGENTS.md / CLAUDE.md:";
const NOTHING_INSTALLED = "Nada instalado pelo agent-kit neste repositório.";

const print = (lines) => console.log(lines.join("\n"));

const defaultAgents = (options, manifest) => {
  if (options.agentIds.length > 0) {
    return options.agentIds;
  }
  return manifest.agents.length > 0 ? manifest.agents : [...AGENT_IDS];
};

const requireTerminal = (hint) => {
  if (!process.stdin.isTTY) {
    throw new Error(`Sem terminal interativo: ${hint}`);
  }
};

const printResult = (result) => {
  print([...renderInstall(result), "", SNIPPET_TITLE, "", buildSnippet(result)]);
};

const selectionFor = async (options, { catalog, manifest }) => {
  const initialAgents = defaultAgents(options, manifest);
  if (options.keys.length > 0) {
    return { agentIds: initialAgents, keys: options.keys };
  }
  requireTerminal("informe --rules, --skills ou --mcps.");
  const { askSelection } = await import("./prompts.js");
  return askSelection({ catalog, manifest, initialAgents, yes: options.yes });
};

const runAdd = async (options) => {
  const [catalog, manifest] = await Promise.all([loadCatalog(), readManifest(options.repo)]);
  const selection = await selectionFor(options, { catalog, manifest });
  printResult(await install({ repo: options.repo, ...selection, force: options.force, copy: options.copy }));
};

const runUpdate = async (options) => {
  const manifest = await readManifest(options.repo);
  if (manifest.items.length === 0) {
    return print([NOTHING_INSTALLED]);
  }
  printResult(await update({ repo: options.repo, force: options.force }));
};

const keysToRemove = async (options, manifest) => {
  if (options.keys.length > 0) {
    return options.keys;
  }
  requireTerminal("informe --rules, --skills ou --mcps.");
  const { askRemoval } = await import("./prompts.js");
  return askRemoval(manifest);
};

const runRemove = async (options) => {
  const manifest = await readManifest(options.repo);
  if (manifest.items.length === 0) {
    return print([NOTHING_INSTALLED]);
  }
  print(renderRemove(await remove({ repo: options.repo, keys: await keysToRemove(options, manifest) })));
};

const listLines = (catalog, installed) =>
  KINDS.flatMap((kind) => [
    `${KIND_LABEL[kind]}:`,
    ...catalog.items
      .filter((item) => item.kind === kind)
      .map((item) => `  ${installed.includes(item.key) ? "✔" : " "} ${item.id}`),
    "",
  ]);

const runList = async (options) => {
  const [catalog, manifest] = await Promise.all([loadCatalog(), readManifest(options.repo)]);
  print(listLines(catalog, manifest.items));
};

const runSnippet = async (options) => {
  const [catalog, manifest] = await Promise.all([loadCatalog(), readManifest(options.repo)]);
  print([manifest.items.length === 0 ? NOTHING_INSTALLED : buildSnippet({ catalog, manifest })]);
};

export const COMMANDS = Object.freeze({
  add: runAdd,
  update: runUpdate,
  remove: runRemove,
  list: runList,
  snippet: runSnippet,
});
