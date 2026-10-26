import path from "node:path";
import { selectAgents } from "./agents.js";
import { expandRequires, findItem, loadCatalog, parseKey } from "./catalog.js";
import { unique, without } from "./collections.js";
import { pruneEmptyParents, removeEntry } from "./fs-utils.js";
import { readManifest, writeManifest } from "./manifest.js";
import { installedMcpKeys, syncMcps } from "./mcp-sync.js";
import { isFileItem, itemPaths, placeFileItem } from "./placement.js";

export const createContext = ({ repo, agents, owned, force = false, copy = false }) => ({
  repo,
  agents,
  force,
  copy,
  owned: new Set(owned),
  files: [],
  installed: [],
  skipped: [],
  mcpFiles: [],
});

export const install = async ({ repo, agentIds, keys, force, copy }) => {
  const catalog = await loadCatalog();
  const manifest = await readManifest(repo);
  const agents = selectAgents(agentIds);
  const context = createContext({ repo, agents, owned: manifest.files, force, copy });
  const items = expandRequires(keys, catalog.requires).map((key) => findItem(catalog, key));
  for (const item of items.filter(isFileItem)) {
    await placeFileItem(context, item);
  }
  const add = items.filter((item) => !isFileItem(item)).map((item) => item.id);
  const mcpServers = await syncMcps(context, { catalog, ownership: manifest.mcpServers, change: { add, drop: [] } });
  const next = {
    agents: unique([...manifest.agents, ...agentIds]),
    items: unique([...manifest.items, ...context.installed, ...installedMcpKeys(add, mcpServers)]),
    files: unique([...manifest.files, ...context.files]),
    mcpServers,
  };
  await writeManifest(repo, next);
  return { context, catalog, manifest: next };
};

export const update = async ({ repo, force }) => {
  const manifest = await readManifest(repo);
  return install({ repo, agentIds: manifest.agents, keys: manifest.items, force });
};

const removeFiles = async (context, items) => {
  const paths = items.flatMap((item) => itemPaths(item, context.agents)).filter((file) => context.owned.has(file));
  for (const relative of paths) {
    await removeEntry(path.join(context.repo, relative));
    await pruneEmptyParents(context.repo, relative);
  }
  return paths;
};

export const remove = async ({ repo, keys }) => {
  const catalog = await loadCatalog();
  const manifest = await readManifest(repo);
  const context = createContext({ repo, agents: selectAgents(manifest.agents), owned: manifest.files });
  const targets = keys.filter((key) => manifest.items.includes(key)).map(parseKey);
  const removedFiles = await removeFiles(context, targets.filter(isFileItem));
  const drop = targets.filter((item) => !isFileItem(item)).map((item) => item.id);
  const mcpServers = await syncMcps(context, { catalog, ownership: manifest.mcpServers, change: { add: [], drop } });
  const removed = targets.map((item) => item.key);
  const next = {
    ...manifest,
    items: without(manifest.items, removed),
    files: without(manifest.files, removedFiles),
    mcpServers,
  };
  await writeManifest(repo, next);
  return { removed, files: removedFiles, ignored: without(keys, removed), manifest: next };
};
