import path from "node:path";
import { parse, stringify } from "smol-toml";
import { readText, removeEntry, writeText } from "../fs-utils.js";

const CONFIG_FILE = ".codex/config.toml";
const BLOCK_START = "# >>> agent-kit: bloco gerenciado automaticamente, não edite";
const BLOCK_END = "# <<< agent-kit";
const NOT_FOUND = -1;
const CONFLICT_REASON = "já está definido no config.toml fora do bloco do agent-kit";

const outsideBlock = (text) => {
  const start = text.indexOf(BLOCK_START);
  const end = text.indexOf(BLOCK_END);
  if (start === NOT_FOUND || end === NOT_FOUND) {
    return text;
  }
  return `${text.slice(0, start)}${text.slice(end + BLOCK_END.length)}`;
};

const toCodexServer = ({ command, args = [], env = {} }) =>
  Object.keys(env).length === 0 ? { command, args } : { command, args, env };

const partition = (servers, external) => {
  const result = { managed: {}, written: [], skipped: [] };
  for (const [name, server] of Object.entries(servers)) {
    if (name in external) {
      result.skipped.push({ name, reason: CONFLICT_REASON });
      continue;
    }
    result.managed[name] = toCodexServer(server);
    result.written.push(name);
  }
  return result;
};

const render = (outside, managed) => {
  const block = Object.keys(managed).length === 0
    ? ""
    : [BLOCK_START, stringify({ mcp_servers: managed }).trim(), BLOCK_END].join("\n");
  return [outside.trim(), block].filter(Boolean).join("\n\n");
};

const sync = async ({ repo, servers }) => {
  const file = path.join(repo, CONFIG_FILE);
  const outside = outsideBlock(await readText(file));
  const result = partition(servers, parse(outside).mcp_servers ?? {});
  const content = render(outside, result.managed);
  await (content ? writeText(file, `${content}\n`) : removeEntry(file));
  return { written: result.written, skipped: result.skipped };
};

export const codexMcp = Object.freeze({ file: CONFIG_FILE, sync });
