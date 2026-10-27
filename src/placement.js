import path from "node:path";
import { CANONICAL_DIR, KIND, RULE_EXTENSION } from "./constants.js";
import { copyEntry, exists, linkEntry } from "./fs-utils.js";

const CONFLICT_REASON = "já existe e não foi criado pelo agent-kit (use --force para sobrescrever)";

const entryName = ({ kind, id }) => (kind === KIND.RULES ? `${id}${RULE_EXTENSION}` : id);

export const isFileItem = ({ kind }) => kind !== KIND.MCPS;

export const canonicalPath = (item) => path.join(CANONICAL_DIR, item.kind, entryName(item));

export const linkPaths = (item, agents) =>
  agents
    .filter((agent) => agent.links[item.kind])
    .map((agent) => path.join(agent.links[item.kind], entryName(item)));

export const itemPaths = (item, agents) => [canonicalPath(item), ...linkPaths(item, agents)];

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

export const placeFileItem = async (context, item) => {
  const relative = canonicalPath(item);
  if (!(await canWrite(context, relative))) {
    return;
  }
  await copyEntry(item.source, path.join(context.repo, relative));
  context.files.push(relative);
  context.installed.push(item.key);
  for (const link of linkPaths(item, context.agents)) {
    await placeLink(context, { canonical: relative, relative: link, isDirectory: item.kind === KIND.SKILLS });
  }
};
