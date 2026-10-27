import { stringify } from "yaml";
import { parseFrontmatter } from "./frontmatter.js";

const FRONTMATTER_BLOCK = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const GLOB_SEPARATOR = ",";
const ALL_FILES = "**";
const YAML_OPTIONS = Object.freeze({ lineWidth: 0 });

const globsOf = (paths) => (Array.isArray(paths) ? paths : [paths].filter(Boolean)).join(GLOB_SEPARATOR);

const HEADERS = Object.freeze({
  cursor: ({ description, globs }) =>
    globs ? { description, globs, alwaysApply: false } : { description, alwaysApply: true },
  copilot: ({ description, globs }) => ({ description, applyTo: globs || ALL_FILES }),
});

export const renderRule = ({ text, format }) => {
  const { description = "", paths } = parseFrontmatter(text);
  const header = HEADERS[format]({ description, globs: globsOf(paths) });
  const body = text.replace(FRONTMATTER_BLOCK, "");
  return `---\n${stringify(header, YAML_OPTIONS)}---\n${body}`;
};
