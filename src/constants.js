import path from "node:path";
import { fileURLToPath } from "node:url";

export const KIT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const CATALOG_DIR = path.join(KIT_ROOT, "catalog");
export const MANIFEST_FILE = ".agent-kit.json";
export const CANONICAL_DIR = ".agents";
export const SKILL_FILE = "SKILL.md";
export const RULE_EXTENSION = ".md";
export const MCP_EXTENSION = ".json";
export const JSON_INDENT = 2;
export const KEY_SEPARATOR = "/";
export const KIND = Object.freeze({ RULES: "rules", SKILLS: "skills", MCPS: "mcps" });
export const KINDS = Object.freeze([KIND.RULES, KIND.SKILLS, KIND.MCPS]);
export const KIND_LABEL = Object.freeze({ rules: "Rules", skills: "Skills", mcps: "MCPs" });
