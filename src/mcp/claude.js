import path from "node:path";
import { readJson, removeEntry, writeJson } from "../fs-utils.js";

const CONFIG_FILE = ".mcp.json";
const TRANSPORT = "stdio";
const CONFLICT_REASON = "já existe no .mcp.json e não foi criado pelo agent-kit (use --force para sobrescrever)";

const toClaudeServer = ({ command, args = [], env = {} }) => ({ type: TRANSPORT, command, args, env });

const withoutOwned = (servers, owned) =>
  Object.fromEntries(Object.entries(servers).filter(([name]) => !owned.includes(name)));

const mergeServers = ({ current, servers, force }) => {
  const result = { servers: { ...current }, written: [], skipped: [] };
  for (const [name, server] of Object.entries(servers)) {
    if (name in current && !force) {
      result.skipped.push({ name, reason: CONFLICT_REASON });
      continue;
    }
    result.servers[name] = toClaudeServer(server);
    result.written.push(name);
  }
  return result;
};

const persist = async (file, config) => {
  const isEmpty = Object.keys(config.mcpServers).length === 0 && Object.keys(config).length === 1;
  return isEmpty ? removeEntry(file) : writeJson(file, config);
};

const sync = async ({ repo, servers, owned, force }) => {
  const file = path.join(repo, CONFIG_FILE);
  const config = await readJson(file, {});
  const current = withoutOwned(config.mcpServers ?? {}, owned);
  const result = mergeServers({ current, servers, force });
  await persist(file, { ...config, mcpServers: result.servers });
  return { written: result.written, skipped: result.skipped };
};

export const claudeMcp = Object.freeze({ file: CONFIG_FILE, sync });
