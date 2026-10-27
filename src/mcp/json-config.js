import path from "node:path";
import { pruneEmptyParents, readJson, removeEntry, writeJson } from "../fs-utils.js";

const conflictReason = (file) => `já existe no ${file} e não foi criado pelo agent-kit (use --force para sobrescrever)`;

const withoutOwned = (servers, owned) =>
  Object.fromEntries(Object.entries(servers).filter(([name]) => !owned.includes(name)));

const mergeServers = ({ current, servers, force }, { file, toServer }) => {
  const result = { servers: { ...current }, written: [], skipped: [] };
  for (const [name, server] of Object.entries(servers)) {
    if (name in current && !force) {
      result.skipped.push({ name, reason: conflictReason(file) });
      continue;
    }
    result.servers[name] = toServer(server);
    result.written.push(name);
  }
  return result;
};

const withServers = (config, { rootKey, servers }) => {
  const rest = Object.fromEntries(Object.entries(config).filter(([key]) => key !== rootKey));
  return Object.keys(servers).length === 0 ? rest : { ...rest, [rootKey]: servers };
};

const persist = async ({ repo, file }, config) => {
  if (Object.keys(config).length > 0) {
    return writeJson(path.join(repo, file), config);
  }
  await removeEntry(path.join(repo, file));
  return pruneEmptyParents(repo, file);
};

export const jsonMcp = ({ file, rootKey, toServer }) => {
  const sync = async ({ repo, servers, owned, force }) => {
    const config = await readJson(path.join(repo, file), {});
    const current = withoutOwned(config[rootKey] ?? {}, owned);
    const result = mergeServers({ current, servers, force }, { file, toServer });
    await persist({ repo, file }, withServers(config, { rootKey, servers: result.servers }));
    return { written: result.written, skipped: result.skipped };
  };
  return Object.freeze({ file, sync });
};
