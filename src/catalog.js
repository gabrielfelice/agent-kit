import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { CATALOG_DIR, KEY_SEPARATOR, KIND, MCP_EXTENSION, RULE_EXTENSION, SKILL_FILE } from "./constants.js";
import { readFrontmatter } from "./frontmatter.js";

const REQUIRES_FILE = "requires.json";

export const itemKey = (kind, id) => `${kind}${KEY_SEPARATOR}${id}`;

export const parseKey = (key) => {
  const [kind, id] = key.split(KEY_SEPARATOR);
  return { key, kind, id };
};

const createItem = ({ kind, id, source, description, server }) => ({
  key: itemKey(kind, id),
  kind,
  id,
  source,
  description: description ?? "",
  server,
});

const listEntries = async (dir, accept) =>
  (await readdir(dir, { withFileTypes: true })).filter(accept).map((entry) => entry.name).sort();

const loadRules = async (root) => {
  const dir = path.join(root, KIND.RULES);
  const names = await listEntries(dir, (entry) => entry.isFile() && entry.name.endsWith(RULE_EXTENSION));
  return Promise.all(names.map(async (name) => {
    const source = path.join(dir, name);
    const { description } = await readFrontmatter(source);
    return createItem({ kind: KIND.RULES, id: path.basename(name, RULE_EXTENSION), source, description });
  }));
};

const loadSkills = async (root) => {
  const dir = path.join(root, KIND.SKILLS);
  const names = await listEntries(dir, (entry) => entry.isDirectory());
  return Promise.all(names.map(async (name) => {
    const source = path.join(dir, name);
    const { description } = await readFrontmatter(path.join(source, SKILL_FILE));
    return createItem({ kind: KIND.SKILLS, id: name, source, description });
  }));
};

const loadMcps = async (root) => {
  const dir = path.join(root, KIND.MCPS);
  const names = await listEntries(dir, (entry) => entry.isFile() && entry.name.endsWith(MCP_EXTENSION));
  return Promise.all(names.map(async (name) => {
    const source = path.join(dir, name);
    const { description, ...server } = JSON.parse(await readFile(source, "utf8"));
    return createItem({ kind: KIND.MCPS, id: path.basename(name, MCP_EXTENSION), source, description, server });
  }));
};

const loadRequires = async (root) => JSON.parse(await readFile(path.join(root, REQUIRES_FILE), "utf8"));

export const loadCatalog = async (root = CATALOG_DIR) => {
  const [rules, skills, mcps, requires] = await Promise.all([
    loadRules(root),
    loadSkills(root),
    loadMcps(root),
    loadRequires(root),
  ]);
  const items = [...rules, ...skills, ...mcps];
  return { items, requires, byKey: new Map(items.map((item) => [item.key, item])) };
};

export const findItem = (catalog, key) => {
  const item = catalog.byKey.get(key);
  if (!item) {
    throw new Error(`Item desconhecido no catálogo: ${key}`);
  }
  return item;
};

export const expandRequires = (keys, requires) => {
  const result = new Set();
  const visit = (key) => {
    if (result.has(key)) {
      return;
    }
    result.add(key);
    (requires[key] ?? []).forEach(visit);
  };
  keys.forEach(visit);
  return [...result];
};
