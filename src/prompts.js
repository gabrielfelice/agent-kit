import * as clack from "@clack/prompts";
import { AGENT_IDS, AGENTS } from "./agents.js";
import { expandRequires } from "./catalog.js";
import { KIND_LABEL, KINDS } from "./constants.js";
import { without } from "./collections.js";

const MAX_HINT = 70;
const INSTALLED_HINT = "instalado";

const abort = () => {
  clack.cancel("Operação cancelada.");
  process.exit(0);
};

const guard = (value) => {
  if (clack.isCancel(value)) {
    abort();
  }
  return value;
};

const hintFor = (item, installed) => {
  const text = installed.includes(item.key) ? `${INSTALLED_HINT} · ${item.description}` : item.description;
  return text.length > MAX_HINT ? `${text.slice(0, MAX_HINT - 1)}…` : text;
};

const groupOptions = (catalog, installed) =>
  Object.fromEntries(
    KINDS.map((kind) => [
      KIND_LABEL[kind],
      catalog.items
        .filter((item) => item.kind === kind)
        .map((item) => ({ value: item.key, label: item.id, hint: hintFor(item, installed) })),
    ]),
  );

const askAgents = async (initialValues) =>
  guard(await clack.multiselect({
    message: "Para quais agentes?",
    options: AGENT_IDS.map((id) => ({ value: id, label: AGENTS[id].label })),
    initialValues,
    required: true,
  }));

const askItems = async (catalog, installed) =>
  guard(await clack.groupMultiselect({
    message: "O que você quer trazer para este repositório?",
    options: groupOptions(catalog, installed),
    required: true,
  }));

const confirmPlan = async ({ keys, catalog, yes }) => {
  const extras = without(expandRequires(keys, catalog.requires), keys);
  if (extras.length > 0) {
    clack.note(extras.join("\n"), "Incluídos como dependência");
  }
  return yes || guard(await clack.confirm({ message: `Instalar ${keys.length + extras.length} itens?` }));
};

export const askSelection = async ({ catalog, manifest, initialAgents, yes }) => {
  clack.intro("agent-kit");
  const agentIds = await askAgents(initialAgents);
  const keys = await askItems(catalog, manifest.items);
  if (!(await confirmPlan({ keys, catalog, yes }))) {
    abort();
  }
  return { agentIds, keys };
};

export const askRemoval = async (manifest) => {
  clack.intro("agent-kit");
  return guard(await clack.multiselect({
    message: "O que você quer remover deste repositório?",
    options: manifest.items.map((key) => ({ value: key, label: key })),
    required: true,
  }));
};

export const finish = (message) => clack.outro(message);
