import { jsonMcp } from "./json-config.js";

const toClaudeServer = ({ command, args = [], env = {} }) => ({ type: "stdio", command, args, env });

export const claudeMcp = jsonMcp({ file: ".mcp.json", rootKey: "mcpServers", toServer: toClaudeServer });
