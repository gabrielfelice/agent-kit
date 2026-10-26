import { readFile } from "node:fs/promises";
import { parse } from "yaml";

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---/;

export const parseFrontmatter = (text) => {
  const match = FRONTMATTER_PATTERN.exec(text);
  return match ? (parse(match[1]) ?? {}) : {};
};

export const readFrontmatter = async (file) => parseFrontmatter(await readFile(file, "utf8"));
