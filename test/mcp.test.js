import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { exists } from "../src/fs-utils.js";
import { install, remove } from "../src/install.js";
import { BOTH_AGENTS, createRepo, readJsonFile, readTextFile } from "./helpers.js";

const CODEX_CONFIG = ".codex/config.toml";
const USER_CONFIG = 'model = "gpt-5"\n\n[mcp_servers.spec-workflow]\ncommand = "outro"\n';

const writeRepoFile = async (repo, relative, content) => {
  await mkdir(path.dirname(path.join(repo, relative)), { recursive: true });
  await writeFile(path.join(repo, relative), content);
};

describe("MCPs no Claude Code", () => {
  it("adiciona ao .mcp.json preservando servidores do projeto", async () => {
    const repo = await createRepo();
    await writeRepoFile(repo, ".mcp.json", JSON.stringify({ mcpServers: { meu: { command: "x" } } }));
    await install({ repo, agentIds: ["claude"], keys: ["mcps/chrome-devtools"] });
    const config = await readJsonFile(repo, ".mcp.json");
    assert.deepEqual(Object.keys(config.mcpServers), ["meu", "chrome-devtools"]);
    assert.equal(config.mcpServers["chrome-devtools"].type, "stdio");
  });

  it("não sobrescreve servidor homônimo do projeto, exceto com force", async () => {
    const repo = await createRepo();
    await writeRepoFile(repo, ".mcp.json", JSON.stringify({ mcpServers: { "spec-workflow": { command: "x" } } }));
    const first = await install({ repo, agentIds: ["claude"], keys: ["mcps/spec-workflow"] });
    assert.equal(first.context.skipped.length, 1);
    assert.equal((await readJsonFile(repo, ".mcp.json")).mcpServers["spec-workflow"].command, "x");
    await install({ repo, agentIds: ["claude"], keys: ["mcps/spec-workflow"], force: true });
    assert.equal((await readJsonFile(repo, ".mcp.json")).mcpServers["spec-workflow"].command, "npx");
  });
});

describe("MCPs no Codex", () => {
  it("escreve um bloco gerenciado e preserva o resto do config.toml", async () => {
    const repo = await createRepo();
    await writeRepoFile(repo, CODEX_CONFIG, USER_CONFIG);
    const { context } = await install({ repo, agentIds: ["codex"], keys: ["mcps/chrome-devtools", "mcps/spec-workflow"] });
    const text = await readTextFile(repo, CODEX_CONFIG);
    assert.ok(text.startsWith(USER_CONFIG.trim()));
    assert.match(text, /\[mcp_servers\.chrome-devtools\]/);
    assert.equal(context.skipped[0].path, ".codex/config.toml (spec-workflow)");
  });

  it("regrava o bloco sem duplicar na reinstalação", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: ["codex"], keys: ["mcps/chrome-devtools"] });
    await install({ repo, agentIds: ["codex"], keys: ["mcps/spec-workflow"] });
    const text = await readTextFile(repo, CODEX_CONFIG);
    assert.equal(text.match(/>>> agent-kit/g).length, 1);
    assert.match(text, /chrome-devtools[\s\S]*spec-workflow/);
  });

  it("inclui env quando o servidor declara variáveis", async () => {
    const { codexMcp } = await import("../src/mcp/codex.js");
    const repo = await createRepo();
    await codexMcp.sync({ repo, servers: { api: { command: "npx", env: { TOKEN: "${TOKEN}" } } } });
    assert.match(await readTextFile(repo, CODEX_CONFIG), /\[mcp_servers\.api\.env\]/);
  });
});

describe("remove", () => {
  it("apaga só o que o kit criou e limpa pastas vazias", async () => {
    const repo = await createRepo();
    await writeRepoFile(repo, CODEX_CONFIG, USER_CONFIG);
    await install({ repo, agentIds: BOTH_AGENTS, keys: ["skills/node", "mcps/chrome-devtools"] });
    const result = await remove({ repo, keys: ["skills/node", "mcps/chrome-devtools", "skills/react"] });
    assert.deepEqual(result.ignored, ["skills/react"]);
    assert.equal(await exists(path.join(repo, ".agents")), false);
    assert.equal(await exists(path.join(repo, ".mcp.json")), false);
    assert.equal(await exists(path.join(repo, ".agent-kit.json")), false);
    assert.equal(await readTextFile(repo, CODEX_CONFIG), USER_CONFIG);
  });

  it("mantém os demais itens instalados", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: BOTH_AGENTS, keys: ["mcps/chrome-devtools", "mcps/spec-workflow"] });
    const { manifest } = await remove({ repo, keys: ["mcps/chrome-devtools"] });
    assert.deepEqual(manifest.mcpServers, { claude: ["spec-workflow"], codex: ["spec-workflow"] });
    assert.deepEqual(Object.keys((await readJsonFile(repo, ".mcp.json")).mcpServers), ["spec-workflow"]);
  });
});
