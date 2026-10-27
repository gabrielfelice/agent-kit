import { ENV_FORMAT, mapEnvPlaceholders } from "./env.js";
import { jsonMcp } from "./json-config.js";

const STDIO = "stdio";

const toVscodeServer = ({ command, args = [], env = {} }) => ({
  type: STDIO,
  command,
  args,
  env: mapEnvPlaceholders(env, ENV_FORMAT.vscode),
});

const toGeminiServer = ({ command, args = [], env = {} }) =>
  Object.keys(env).length === 0 ? { command, args } : { command, args, env };

const toOpencodeServer = ({ command, args = [], env = {} }) => ({
  type: "local",
  command: [command, ...args],
  environment: mapEnvPlaceholders(env, ENV_FORMAT.opencode),
  enabled: true,
});

export const cursorMcp = jsonMcp({ file: ".cursor/mcp.json", rootKey: "mcpServers", toServer: toVscodeServer });
export const copilotMcp = jsonMcp({ file: ".vscode/mcp.json", rootKey: "servers", toServer: toVscodeServer });
export const geminiMcp = jsonMcp({ file: ".gemini/settings.json", rootKey: "mcpServers", toServer: toGeminiServer });
export const opencodeMcp = jsonMcp({ file: "opencode.json", rootKey: "mcp", toServer: toOpencodeServer });
