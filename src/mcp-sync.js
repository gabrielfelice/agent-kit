import { itemKey } from "./catalog.js";
import { unique } from "./collections.js";
import { KIND } from "./constants.js";

const serversFor = (catalog, names) =>
  Object.fromEntries(
    names
      .map((name) => catalog.byKey.get(itemKey(KIND.MCPS, name)))
      .filter(Boolean)
      .map((item) => [item.id, item.server]),
  );

const syncAgent = async (context, { agent, servers, owned }) => {
  const result = await agent.mcp.sync({ repo: context.repo, servers, owned, force: context.force });
  result.skipped.forEach(({ name, reason }) => {
    context.skipped.push({ path: `${agent.mcp.file} (${name})`, reason });
  });
  if (result.written.length > 0) {
    context.mcpFiles.push(`${agent.mcp.file}: ${result.written.join(", ")}`);
  }
  return result.written;
};

export const syncMcps = async (context, { catalog, ownership, change }) => {
  const next = { ...ownership };
  for (const agent of context.agents) {
    const owned = ownership[agent.id] ?? [];
    const desired = unique([...owned, ...change.add]).filter((name) => !change.drop.includes(name));
    if (owned.length === 0 && desired.length === 0) {
      continue;
    }
    next[agent.id] = await syncAgent(context, { agent, servers: serversFor(catalog, desired), owned });
  }
  return next;
};

export const installedMcpKeys = (names, ownership) =>
  names
    .filter((name) => Object.values(ownership).some((owned) => owned.includes(name)))
    .map((name) => itemKey(KIND.MCPS, name));
