import assert from "node:assert/strict";
import { lstat, mkdir, readlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { install, update } from "../src/install.js";
import { BOTH_AGENTS, createRepo, readJsonFile, readTextFile } from "./helpers.js";

describe("install", () => {
  it("copia para .agents e cria symlinks relativos em .claude", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: BOTH_AGENTS, keys: ["skills/node", "rules/coding-standards"] });
    assert.equal(await readlink(path.join(repo, ".claude/skills/node")), "../../.agents/skills/node");
    assert.equal(await readlink(path.join(repo, ".claude/rules/coding-standards.md")), "../../.agents/rules/coding-standards.md");
    assert.match(await readTextFile(repo, ".claude/skills/node/SKILL.md"), /name: node/);
  });

  it("copia em vez de linkar com a opção copy", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: ["claude"], keys: ["skills/node"], copy: true });
    assert.ok((await lstat(path.join(repo, ".claude/skills/node"))).isDirectory());
  });

  it("não cria .claude quando só o Codex é escolhido", async () => {
    const repo = await createRepo();
    const { context } = await install({ repo, agentIds: ["codex"], keys: ["rules/tests"] });
    assert.deepEqual(context.files, [".agents/rules/tests.md", ".agents/README.md"]);
  });

  it("instala dependências e registra tudo no manifesto", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: BOTH_AGENTS, keys: ["skills/testes"] });
    const manifest = await readJsonFile(repo, ".agent-kit.json");
    assert.deepEqual(manifest.items, ["skills/testes", "rules/tests"]);
    assert.equal(manifest.kitVersion, "0.1.0");
  });

  it("preserva arquivo existente que não é do kit", async () => {
    const repo = await createRepo();
    await mkdir(path.join(repo, ".agents/rules"), { recursive: true });
    await writeFile(path.join(repo, ".agents/rules/tests.md"), "minha rule");
    const { context, manifest } = await install({ repo, agentIds: BOTH_AGENTS, keys: ["rules/tests"] });
    assert.equal(await readTextFile(repo, ".agents/rules/tests.md"), "minha rule");
    assert.equal(context.skipped[0].path, ".agents/rules/tests.md");
    assert.deepEqual(manifest.items, []);
  });

  it("sobrescreve arquivo existente com force", async () => {
    const repo = await createRepo();
    await mkdir(path.join(repo, ".agents/rules"), { recursive: true });
    await writeFile(path.join(repo, ".agents/rules/tests.md"), "minha rule");
    await install({ repo, agentIds: ["codex"], keys: ["rules/tests"], force: true });
    assert.match(await readTextFile(repo, ".agents/rules/tests.md"), /Regras de testes/);
  });

  it("update reinstala o que o kit criou sem conflitos", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: BOTH_AGENTS, keys: ["skills/node", "mcps/chrome-devtools"] });
    await writeFile(path.join(repo, ".agents/skills/node/SKILL.md"), "editado");
    const { context } = await update({ repo });
    assert.deepEqual(context.skipped, []);
    assert.match(await readTextFile(repo, ".agents/skills/node/SKILL.md"), /name: node/);
  });

  it("rejeita agente desconhecido", async () => {
    const repo = await createRepo();
    await assert.rejects(install({ repo, agentIds: ["windsurf"], keys: ["rules/tests"] }), /Agente desconhecido/);
  });
});
