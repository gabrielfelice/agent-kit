import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { exists } from "../src/fs-utils.js";
import { install, remove, update } from "../src/install.js";
import { cursorMcp, opencodeMcp } from "../src/mcp/json-agents.js";
import { renderRule } from "../src/rule-formats.js";
import { NEW_AGENTS, createRepo, readJsonFile, readTextFile } from "./helpers.js";

const CURSOR_RULE = ".cursor/rules/tests.mdc";
const COPILOT_RULE = ".github/instructions/tests.instructions.md";
const SCOPED_RULE = '---\ndescription: "Só para TS."\npaths:\n  - "src/**/*.ts"\n  - "test/**/*.ts"\n---\n\n# Corpo\n';

const writeRepoFile = async (repo, relative, content) => {
  await mkdir(path.dirname(path.join(repo, relative)), { recursive: true });
  await writeFile(path.join(repo, relative), content);
};

describe("rules convertidas", () => {
  it("gera .mdc com alwaysApply e .instructions.md com applyTo para todos os arquivos", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: ["cursor", "copilot"], keys: ["rules/tests"] });
    const cursor = await readTextFile(repo, CURSOR_RULE);
    assert.match(cursor, /^---\ndescription: .*\nalwaysApply: true\n---\n/);
    assert.match(cursor, /# Regras de testes/);
    assert.match(await readTextFile(repo, COPILOT_RULE), /^---\ndescription: .*\napplyTo: "\*\*"\n---\n/);
  });

  it("traduz paths para globs e applyTo", () => {
    assert.match(renderRule({ text: SCOPED_RULE, format: "cursor" }), /globs: src\/\*\*\/\*\.ts,test\/\*\*\/\*\.ts\nalwaysApply: false/);
    assert.match(renderRule({ text: SCOPED_RULE, format: "copilot" }), /applyTo: src\/\*\*\/\*\.ts,test\/\*\*\/\*\.ts\n---\n\n# Corpo/);
  });

  it("preserva arquivo homônimo do projeto, exceto com force", async () => {
    const repo = await createRepo();
    await writeRepoFile(repo, CURSOR_RULE, "minha rule");
    const { context } = await install({ repo, agentIds: ["cursor"], keys: ["rules/tests"] });
    assert.equal(context.skipped[0].path, CURSOR_RULE);
    assert.equal(await readTextFile(repo, CURSOR_RULE), "minha rule");
    await install({ repo, agentIds: ["cursor"], keys: ["rules/tests"], force: true });
    assert.match(await readTextFile(repo, CURSOR_RULE), /alwaysApply/);
  });

  it("não cria pastas de skills para os agentes que leem .agents/skills", async () => {
    const repo = await createRepo();
    const { context } = await install({ repo, agentIds: NEW_AGENTS, keys: ["skills/node"] });
    assert.deepEqual(context.files.filter((file) => file.includes("skills")), [".agents/skills/node"]);
  });
});

describe("MCPs dos novos agentes", () => {
  it("escreve o formato de cada agente", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: NEW_AGENTS, keys: ["mcps/playwright"] });
    assert.equal((await readJsonFile(repo, ".cursor/mcp.json")).mcpServers.playwright.type, "stdio");
    assert.equal((await readJsonFile(repo, ".vscode/mcp.json")).servers.playwright.command, "npx");
    assert.deepEqual(Object.keys((await readJsonFile(repo, ".gemini/settings.json")).mcpServers.playwright), ["command", "args"]);
    const opencode = (await readJsonFile(repo, "opencode.json")).mcp.playwright;
    assert.equal(opencode.type, "local");
    assert.deepEqual(opencode.command.slice(0, 3), ["npx", "-y", "@playwright/mcp@latest"]);
  });

  it("converte placeholders de variáveis de ambiente", async () => {
    const repo = await createRepo();
    const servers = { api: { command: "npx", env: { TOKEN: "${TOKEN}", FIXO: "1" } } };
    await cursorMcp.sync({ repo, servers, owned: [] });
    await opencodeMcp.sync({ repo, servers, owned: [] });
    assert.deepEqual((await readJsonFile(repo, ".cursor/mcp.json")).mcpServers.api.env, { TOKEN: "${env:TOKEN}", FIXO: "1" });
    assert.deepEqual((await readJsonFile(repo, "opencode.json")).mcp.api.environment, { TOKEN: "{env:TOKEN}", FIXO: "1" });
  });

  it("preserva outras configurações do .gemini/settings.json ao remover", async () => {
    const repo = await createRepo();
    await writeRepoFile(repo, ".gemini/settings.json", JSON.stringify({ theme: "Dracula" }));
    await install({ repo, agentIds: ["gemini"], keys: ["mcps/spec-workflow"] });
    await remove({ repo, keys: ["mcps/spec-workflow"] });
    assert.deepEqual(await readJsonFile(repo, ".gemini/settings.json"), { theme: "Dracula" });
  });
});

describe("update e remove com os novos agentes", () => {
  it("regera sem duplicar e remove tudo o que criou", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: NEW_AGENTS, keys: ["rules/tests", "mcps/playwright"] });
    await update({ repo });
    assert.equal(Object.keys((await readJsonFile(repo, "opencode.json")).mcp).length, 1);
    await remove({ repo, keys: ["rules/tests", "mcps/playwright"] });
    for (const relative of [".cursor", ".github", ".vscode", ".gemini", "opencode.json", ".agents"]) {
      assert.equal(await exists(path.join(repo, relative)), false, relative);
    }
  });
});
