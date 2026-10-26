import { parseKey } from "./catalog.js";
import { KIND } from "./constants.js";

const HEADING = "## Rules, skills e MCPs (agent-kit)";
const MAX_SUMMARY = 160;
const SENTENCE_END = ". ";
const NOT_FOUND = -1;
const ELLIPSIS = "…";

export const summarize = (description) => {
  const end = description.indexOf(SENTENCE_END);
  const sentence = end === NOT_FOUND ? description : description.slice(0, end + 1);
  return sentence.length > MAX_SUMMARY ? `${sentence.slice(0, MAX_SUMMARY - 1)}${ELLIPSIS}` : sentence;
};

const describe = (items) => items.map((item) => `  - \`${item.id}\`: ${summarize(item.description ?? "")}`);

const ruleLines = (rules) =>
  rules.length === 0
    ? []
    : [`- Antes de alterar código, leia as rules em \`.agents/rules/\`: ${rules.map((rule) => `\`${rule.id}.md\``).join(", ")}.`];

const skillLines = (skills) =>
  skills.length === 0
    ? []
    : ["- Skills em `.agents/skills/`. Carregue cada uma quando o escopo da tarefa corresponder:", ...describe(skills)];

const mcpLines = (mcps) => (mcps.length === 0 ? [] : ["- MCPs configurados:", ...describe(mcps)]);

export const buildSnippet = ({ catalog, manifest }) => {
  const installed = manifest.items.map(parseKey).map((item) => catalog.byKey.get(item.key) ?? item);
  const ofKind = (kind) => installed.filter((item) => item.kind === kind);
  return [
    HEADING,
    "",
    ...ruleLines(ofKind(KIND.RULES)),
    ...skillLines(ofKind(KIND.SKILLS)),
    ...mcpLines(ofKind(KIND.MCPS)),
  ].join("\n");
};
