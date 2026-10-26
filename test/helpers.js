import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const createRepo = () => mkdtemp(path.join(os.tmpdir(), "agent-kit-"));

export const readJsonFile = async (repo, relative) => JSON.parse(await readFile(path.join(repo, relative), "utf8"));

export const readTextFile = (repo, relative) => readFile(path.join(repo, relative), "utf8");

export const BOTH_AGENTS = Object.freeze(["claude", "codex"]);
