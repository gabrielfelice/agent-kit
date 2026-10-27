import path from "node:path";
import { selectAgents } from "./agents.js";
import { expandRequires, findItem, loadCatalog, parseKey } from "./catalog.js";
import { unique, without } from "./collections.js";
import { pruneEmptyParents, removeEntry } from "./fs-utils.js";
import { readManifest, writeManifest } from "./manifest.js";
import { installedMcpKeys, syncMcps } from "./mcp-sync.js";
import { isFileItem, itemPaths, placeFileItem } from "./placement.js";
import { syncReadme } from "./readme.js";

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
  const context = createContext({ repo, agents, owned: manifest.files, force, copy: copy || manifest.copy });
  const items = expandRequires(keys, catalog.requires).map((key) => findItem(catalog, key));
  for (const item of items.filter(isFileItem)) {
    await placeFileItem(context, item);
  }
  const add = items.filter((item) => !isFileItem(item)).map((item) => item.id);
  const mcpServers = await syncMcps(context, { catalog, ownership: manifest.mcpServers, change: { add, drop: [] } });
  const next = {
    agents: unique([...manifest.agents, ...agentIds]),
    items: unique([...manifest.items, ...context.installed, ...installedMcpKeys(add, mcpServers)]),
    mcpServers,
    copy: context.copy,
  };
  await syncReadme(context, { catalog, manifest: next });
  const written = { ...next, files: unique([...manifest.files, ...context.files]) };
  await writeManifest(repo, written);
  return { context, catalog, manifest: written };
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
  const context = createContext({ repo, agents: selectAgents(manifest.agents), owned: manifest.files, copy: manifest.copy });
  const targets = keys.filter((key) => manifest.items.includes(key)).map(parseKey);
  const removedFiles = await removeFiles(context, targets.filter(isFileItem));
  const drop = targets.filter((item) => !isFileItem(item)).map((item) => item.id);
  const mcpServers = await syncMcps(context, { catalog, ownership: manifest.mcpServers, change: { add: [], drop } });
  const removed = targets.map((item) => item.key);
  const items = without(manifest.items, removed);
  const files = [...removedFiles, ...(await syncReadme(context, { catalog, manifest: { ...manifest, items } }))];
  const next = { ...manifest, items, files: unique([...without(manifest.files, files), ...context.files]), mcpServers };
  await writeManifest(repo, next);
  return { removed, files, ignored: without(keys, removed), manifest: next };
};
