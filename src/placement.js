import { readFile } from "node:fs/promises";
import path from "node:path";
import { CANONICAL_DIR, KIND, RULE_EXTENSION } from "./constants.js";
import { copyEntry, exists, linkEntry, writeText } from "./fs-utils.js";
import { renderRule } from "./rule-formats.js";

const CONFLICT_REASON = "já existe e não foi criado pelo agent-kit (use --force para sobrescrever)";

const entryName = ({ kind, id }) => (kind === KIND.RULES ? `${id}${RULE_EXTENSION}` : id);

export const isFileItem = ({ kind }) => kind !== KIND.MCPS;

export const canonicalPath = (item) => path.join(CANONICAL_DIR, item.kind, entryName(item));

const linkPath = (item, agent) => path.join(agent.links[item.kind], entryName(item));

const generatedPath = (item, agent) => {
  const target = agent.generated[item.kind];
  return path.join(target.dir, `${item.id}${target.extension}`);
};

const agentPaths = (item, agent) => [
  ...(agent.links[item.kind] ? [linkPath(item, agent)] : []),
  ...(agent.generated?.[item.kind] ? [generatedPath(item, agent)] : []),
];

export const itemPaths = (item, agents) => [canonicalPath(item), ...agents.flatMap((agent) => agentPaths(item, agent))];

export const canWrite = async (context, relative) => {
  if (context.force || context.owned.has(relative)) {
    return true;
  }
  if (!(await exists(path.join(context.repo, relative)))) {
    return true;
  }
  context.skipped.push({ path: relative, reason: CONFLICT_REASON });
  return false;
};

export const placeLink = async (context, { canonical, relative, isDirectory }) => {
  if (!(await canWrite(context, relative))) {
    return;
  }
  const target = path.join(context.repo, canonical);
  const link = path.join(context.repo, relative);
  await (context.copy ? copyEntry(target, link) : linkEntry({ target, link, isDirectory }));
  context.files.push(relative);
};

const placeGenerated = async (context, { item, agent }) => {
  const relative = generatedPath(item, agent);
  if (!(await canWrite(context, relative))) {
    return;
  }
  const text = await readFile(item.source, "utf8");
  await writeText(path.join(context.repo, relative), renderRule({ text, format: agent.generated[item.kind].format }));
  context.files.push(relative);
};

const placeForAgent = async (context, { item, agent, canonical }) => {
  if (agent.links[item.kind]) {
    await placeLink(context, { canonical, relative: linkPath(item, agent), isDirectory: item.kind === KIND.SKILLS });
  }
  if (agent.generated?.[item.kind]) {
    await placeGenerated(context, { item, agent });
  }
};

export const placeFileItem = async (context, item) => {
  const relative = canonicalPath(item);
  if (!(await canWrite(context, relative))) {
    return;
  }
  await copyEntry(item.source, path.join(context.repo, relative));
  context.files.push(relative);
  context.installed.push(item.key);
  for (const agent of context.agents) {
    await placeForAgent(context, { item, agent, canonical: relative });
  }
};
