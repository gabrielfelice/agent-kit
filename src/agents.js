import { KIND } from "./constants.js";
import { claudeMcp } from "./mcp/claude.js";
import { codexMcp } from "./mcp/codex.js";
import { copilotMcp, cursorMcp, geminiMcp, opencodeMcp } from "./mcp/json-agents.js";

const generatedRules = (dir, extension, format) => ({ [KIND.RULES]: { dir, extension, format } });

export const AGENTS = Object.freeze({
  claude: {
    id: "claude",
    label: "Claude Code",
    links: { [KIND.RULES]: ".claude/rules", [KIND.SKILLS]: ".claude/skills" },
    readme: ".claude/README.md",
    mcp: claudeMcp,
  },
  codex: { id: "codex", label: "Codex", links: {}, mcp: codexMcp },
  cursor: {
    id: "cursor",
    label: "Cursor",
    links: {},
    generated: generatedRules(".cursor/rules", ".mdc", "cursor"),
    mcp: cursorMcp,
  },
  copilot: {
    id: "copilot",
    label: "GitHub Copilot (VS Code)",
    links: {},
    generated: generatedRules(".github/instructions", ".instructions.md", "copilot"),
    mcp: copilotMcp,
  },
  gemini: { id: "gemini", label: "Gemini CLI", links: {}, mcp: geminiMcp },
  opencode: { id: "opencode", label: "OpenCode", links: {}, mcp: opencodeMcp },
});

export const AGENT_IDS = Object.freeze(Object.keys(AGENTS));

export const DEFAULT_AGENT_IDS = Object.freeze(["claude", "codex"]);

export const selectAgents = (ids) =>
  ids.map((id) => {
    const agent = AGENTS[id];
    if (!agent) {
      throw new Error(`Agente desconhecido: ${id}. Opções: ${AGENT_IDS.join(", ")}`);
    }
    return agent;
  });
