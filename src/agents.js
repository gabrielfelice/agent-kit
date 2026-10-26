import { KIND } from "./constants.js";
import { claudeMcp } from "./mcp/claude.js";
import { codexMcp } from "./mcp/codex.js";

export const AGENTS = Object.freeze({
  claude: {
    id: "claude",
    label: "Claude Code",
    links: { [KIND.RULES]: ".claude/rules", [KIND.SKILLS]: ".claude/skills" },
    mcp: claudeMcp,
  },
  codex: { id: "codex", label: "Codex", links: {}, mcp: codexMcp },
});

export const AGENT_IDS = Object.freeze(Object.keys(AGENTS));

export const selectAgents = (ids) =>
  ids.map((id) => {
    const agent = AGENTS[id];
    if (!agent) {
      throw new Error(`Agente desconhecido: ${id}. Opções: ${AGENT_IDS.join(", ")}`);
    }
    return agent;
  });
