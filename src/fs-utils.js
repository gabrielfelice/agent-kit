import { cp, lstat, mkdir, readdir, readFile, rm, rmdir, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { JSON_INDENT } from "./constants.js";

export const exists = async (target) => {
  try {
    await lstat(target);
    return true;
  } catch {
    return false;
  }
};

export const readText = async (file) => ((await exists(file)) ? readFile(file, "utf8") : "");

export const readJson = async (file, fallback) => {
  const text = await readText(file);
  return text.trim() ? JSON.parse(text) : fallback;
};

export const writeText = async (file, text) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
};

export const writeJson = (file, data) => writeText(file, `${JSON.stringify(data, null, JSON_INDENT)}\n`);

export const removeEntry = (target) => rm(target, { recursive: true, force: true });

export const copyEntry = async (source, destination) => {
  await removeEntry(destination);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
};

export const linkEntry = async ({ target, link, isDirectory }) => {
  await removeEntry(link);
  await mkdir(path.dirname(link), { recursive: true });
  await symlink(path.relative(path.dirname(link), target), link, isDirectory ? "dir" : "file");
};

const isEmptyDir = async (dir) => (await exists(dir)) && (await readdir(dir)).length === 0;

export const pruneEmptyParents = async (root, relative) => {
  let dir = path.dirname(path.join(root, relative));
  while (dir.startsWith(root) && dir !== root && (await isEmptyDir(dir))) {
    await rmdir(dir);
    dir = path.dirname(dir);
  }
};
