import path from "node:path";
import { CANONICAL_DIR } from "./constants.js";
import { pruneEmptyParents, removeEntry, writeText } from "./fs-utils.js";
import { canWrite, placeLink } from "./placement.js";
import { renderReadme } from "./readme-content.js";

const CANONICAL_README = path.join(CANONICAL_DIR, "README.md");

const readmeLinks = (agents) => agents.map((agent) => agent.readme).filter(Boolean);

const writeReadme = async (context, text) => {
  if (!(await canWrite(context, CANONICAL_README))) {
    return [];
  }
  await writeText(path.join(context.repo, CANONICAL_README), text);
  context.files.push(CANONICAL_README);
  for (const relative of readmeLinks(context.agents)) {
    await placeLink(context, { canonical: CANONICAL_README, relative, isDirectory: false });
  }
  return [];
};

const dropReadme = async (context) => {
  const owned = [CANONICAL_README, ...readmeLinks(context.agents)].filter((file) => context.owned.has(file));
  for (const relative of owned) {
    await removeEntry(path.join(context.repo, relative));
    await pruneEmptyParents(context.repo, relative);
  }
  return owned;
};

export const syncReadme = async (context, { catalog, manifest }) =>
  manifest.items.length === 0 ? dropReadme(context) : writeReadme(context, await renderReadme({ catalog, manifest }));
