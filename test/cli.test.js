import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { parseCli } from "../src/args.js";
import { run } from "../src/cli.js";
import { summarize } from "../src/snippet.js";
import { createRepo } from "./helpers.js";

const capture = async (argv) => {
  const log = mock.method(console, "log", () => {});
  await run(argv);
  const output = log.mock.calls.map((call) => call.arguments.join(" ")).join("\n");
  log.mock.restore();
  return output;
};

describe("argumentos", () => {
  it("converte flags em chaves do catálogo", () => {
    const options = parseCli(["add", "--skills", "node, react", "--mcps", "chrome-devtools", "--agents", "codex"]);
    assert.deepEqual(options.keys, ["skills/node", "skills/react", "mcps/chrome-devtools"]);
    assert.deepEqual(options.agentIds, ["codex"]);
  });

  it("usa add como comando padrão", () => {
    assert.equal(parseCli([]).command, "add");
  });
});

describe("comandos", () => {
  it("add, list, snippet, update e remove sem interação", async () => {
    const dir = await createRepo();
    const added = await capture(["add", "--dir", dir, "--rules", "tests", "--skills", "node"]);
    assert.match(added, /✔ \.agents\/rules\/tests\.md/);
    assert.match(added, /leia as rules em `\.agents\/rules\/`: `tests\.md`/);
    assert.match(await capture(["list", "--dir", dir]), /✔ node/);
    assert.match(await capture(["snippet", "--dir", dir]), /`node`:/);
    assert.match(await capture(["update", "--dir", dir]), /✔ \.claude\/skills\/node/);
    assert.match(await capture(["remove", "--dir", dir, "--skills", "node", "--rules", "tests"]), /✖ skills\/node/);
    assert.match(await capture(["update", "--dir", dir]), /Nada instalado/);
    assert.match(await capture(["remove", "--dir", dir, "--skills", "node"]), /Nada instalado/);
    assert.match(await capture(["snippet", "--dir", dir]), /Nada instalado/);
  });

  it("mostra ajuda e rejeita comando desconhecido", async () => {
    assert.match(await capture(["--help"]), /Comandos:/);
    await assert.rejects(run(["instalar"]), /Comando desconhecido/);
  });

  it("exige flags quando não há terminal interativo", async () => {
    const dir = await createRepo();
    await assert.rejects(run(["add", "--dir", dir]), /Sem terminal interativo/);
  });
});

describe("resumo do trecho", () => {
  it("usa a primeira frase e corta textos longos", () => {
    assert.equal(summarize("Primeira frase. Segunda."), "Primeira frase.");
    assert.equal(summarize("x".repeat(200)).length, 160);
  });
});
