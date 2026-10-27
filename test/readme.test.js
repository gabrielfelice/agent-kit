import assert from "node:assert/strict";
import { access, lstat, mkdir, readlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { loadCatalog } from "../src/catalog.js";
import { CATALOG_DIR } from "../src/constants.js";
import { exists } from "../src/fs-utils.js";
import { install, remove, update } from "../src/install.js";
import { BOTH_AGENTS, createRepo, readJsonFile, readTextFile } from "./helpers.js";

const README = ".agents/README.md";
const CLAUDE_README = ".claude/README.md";

describe("README gerado", () => {
  it("documenta só os itens instalados, com dependências e comando dos MCPs", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: BOTH_AGENTS, keys: ["skills/testes", "mcps/playwright"] });
    const text = await readTextFile(repo, README);
    assert.match(text, /## Rules\n\n### `tests`/);
    assert.match(text, /\*\*Exigido por:\*\* `skills\/testes`/);
    assert.match(text, /\*\*Instala junto:\*\* `rules\/tests`/);
    assert.match(text, /\*\*Comando:\*\* `npx -y @playwright\/mcp@latest --browser chromium --isolated`/);
    assert.match(text, /\*\*Claude Code:\*\*/);
    assert.match(text, /\*\*Codex:\*\*/);
    assert.doesNotMatch(text, /### `node`/);
  });

  it("cria symlink em .claude e registra os dois no manifesto", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: ["claude"], keys: ["rules/tests"] });
    assert.equal(await readlink(path.join(repo, CLAUDE_README)), "../.agents/README.md");
    assert.doesNotMatch(await readTextFile(repo, README), /\*\*Codex:\*\*/);
    const manifest = await readJsonFile(repo, ".agent-kit.json");
    assert.ok(manifest.files.includes(README) && manifest.files.includes(CLAUDE_README));
  });

  it("cria symlinks em .codex, .cursor e .gemini, mas não em .github nem para o OpenCode", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: ["codex", "cursor", "copilot", "gemini", "opencode"], keys: ["rules/tests"] });
    for (const dir of [".codex", ".cursor", ".gemini"]) {
      assert.equal(await readlink(path.join(repo, dir, "README.md")), "../.agents/README.md");
    }
    assert.equal(await exists(path.join(repo, ".github/README.md")), false);
    await remove({ repo, keys: ["rules/tests"] });
    for (const dir of [".codex", ".cursor", ".gemini", ".github"]) {
      assert.equal(await exists(path.join(repo, dir)), false, dir);
    }
  });

  it("mantém a cópia no modo copy também no update e no remove", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: ["claude"], keys: ["rules/tests", "skills/node"], copy: true });
    await update({ repo });
    await remove({ repo, keys: ["skills/node"] });
    assert.ok((await lstat(path.join(repo, CLAUDE_README))).isFile());
    assert.ok((await lstat(path.join(repo, ".claude/rules/tests.md"))).isFile());
    assert.doesNotMatch(await readTextFile(repo, CLAUDE_README), /### `node`/);
  });

  it("some junto com o último item removido", async () => {
    const repo = await createRepo();
    await install({ repo, agentIds: BOTH_AGENTS, keys: ["rules/tests"] });
    const { files } = await remove({ repo, keys: ["rules/tests"] });
    assert.ok(files.includes(README) && files.includes(CLAUDE_README));
    assert.equal(await exists(path.join(repo, ".agents")), false);
    assert.equal(await exists(path.join(repo, ".claude")), false);
  });

  it("preserva um README do projeto", async () => {
    const repo = await createRepo();
    await mkdir(path.join(repo, ".agents"), { recursive: true });
    await writeFile(path.join(repo, README), "meu readme");
    const { context } = await install({ repo, agentIds: BOTH_AGENTS, keys: ["rules/tests"] });
    assert.equal(await readTextFile(repo, README), "meu readme");
    assert.ok(context.skipped.some((entry) => entry.path === README));
    assert.equal(await exists(path.join(repo, CLAUDE_README)), false);
  });

  it("todo item do catálogo tem texto em catalog/docs", async () => {
    const { items } = await loadCatalog();
    await Promise.all(items.map((item) => access(path.join(CATALOG_DIR, "docs", item.kind, `${item.id}.md`))));
  });
});
