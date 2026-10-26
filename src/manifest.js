import { readFile } from "node:fs/promises";
import path from "node:path";
import { KIT_ROOT, MANIFEST_FILE } from "./constants.js";
import { readJson, removeEntry, writeJson } from "./fs-utils.js";

const PACKAGE_FILE = "package.json";
const EMPTY_MANIFEST = Object.freeze({ agents: [], items: [], files: [], mcpServers: {} });

const kitVersion = async () => JSON.parse(await readFile(path.join(KIT_ROOT, PACKAGE_FILE), "utf8")).version;

export const readManifest = async (repo) => ({
  ...EMPTY_MANIFEST,
  ...(await readJson(path.join(repo, MANIFEST_FILE), {})),
});

export const writeManifest = async (repo, manifest) => {
  const file = path.join(repo, MANIFEST_FILE);
  if (manifest.items.length === 0) {
    return removeEntry(file);
  }
  return writeJson(file, { ...manifest, kitVersion: await kitVersion() });
};
