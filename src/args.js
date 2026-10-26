import path from "node:path";
import { parseArgs } from "node:util";
import { itemKey } from "./catalog.js";
import { KINDS } from "./constants.js";

const LIST_SEPARATOR = ",";
const DEFAULT_COMMAND = "add";
const STRING = { type: "string" };
const BOOLEAN = { type: "boolean" };

const OPTIONS = {
  agents: STRING,
  rules: STRING,
  skills: STRING,
  mcps: STRING,
  dir: STRING,
  yes: { ...BOOLEAN, short: "y" },
  force: BOOLEAN,
  copy: BOOLEAN,
  help: { ...BOOLEAN, short: "h" },
};

const splitList = (value) =>
  (value ?? "")
    .split(LIST_SEPARATOR)
    .map((entry) => entry.trim())
    .filter(Boolean);

export const parseCli = (argv) => {
  const { values, positionals } = parseArgs({ args: argv, options: OPTIONS, allowPositionals: true });
  return {
    command: positionals[0] ?? DEFAULT_COMMAND,
    repo: path.resolve(values.dir ?? process.cwd()),
    agentIds: splitList(values.agents),
    keys: KINDS.flatMap((kind) => splitList(values[kind]).map((id) => itemKey(kind, id))),
    yes: Boolean(values.yes),
    force: Boolean(values.force),
    copy: Boolean(values.copy),
    help: Boolean(values.help),
  };
};
