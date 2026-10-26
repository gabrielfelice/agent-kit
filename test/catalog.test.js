import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { expandRequires, findItem, loadCatalog, parseKey } from "../src/catalog.js";
import { parseFrontmatter } from "../src/frontmatter.js";

describe("catálogo", () => {
  it("carrega rules, skills e MCPs com descrição", async () => {
    const catalog = await loadCatalog();
    const keys = catalog.items.map((item) => item.key);
    assert.ok(keys.includes("rules/coding-standards"));
    assert.ok(keys.includes("skills/estrutura-de-pastas"));
    assert.ok(keys.includes("mcps/chrome-devtools"));
    assert.ok(keys.includes("mcps/playwright"));
    assert.ok(catalog.items.every((item) => item.description.length > 0));
  });

  it("separa a descrição do MCP da definição do servidor", async () => {
    const item = findItem(await loadCatalog(), "mcps/chrome-devtools");
    assert.deepEqual(item.server, { command: "npx", args: ["-y", "chrome-devtools-mcp@latest"] });
  });

  it("falha com item desconhecido", async () => {
    const catalog = await loadCatalog();
    assert.throws(() => findItem(catalog, "skills/inexistente"), /Item desconhecido/);
  });

  it("inclui dependências transitivas sem repetir", () => {
    const requires = { "skills/a": ["rules/b"], "rules/b": ["rules/c"], "rules/c": ["skills/a"] };
    assert.deepEqual(expandRequires(["skills/a", "rules/b"], requires), ["skills/a", "rules/b", "rules/c"]);
  });

  it("decompõe uma chave em tipo e nome", () => {
    assert.deepEqual(parseKey("skills/node"), { key: "skills/node", kind: "skills", id: "node" });
  });
});

describe("frontmatter", () => {
  it("lê YAML entre os marcadores", () => {
    assert.deepEqual(parseFrontmatter('---\ndescription: "a: b"\n---\n# Título'), { description: "a: b" });
  });

  it("retorna objeto vazio sem frontmatter ou com bloco vazio", () => {
    assert.deepEqual(parseFrontmatter("# Título"), {});
    assert.deepEqual(parseFrontmatter("---\n\n---\n"), {});
  });
});
