# Regras de Node.js

Estas regras se aplicam ao código executado no Node.js, incluindo APIs, jobs,
scripts e servidores HTTP. Os exemplos usam JavaScript com módulos ES.

## 1. Prefira `async`/`await` a callbacks

Use `async`/`await` para tornar o fluxo assíncrono linear e facilitar o
tratamento de erros com `try`/`catch`. APIs legadas que exigem callbacks devem
ser encapsuladas em uma Promise antes de serem usadas pelo restante da
aplicação.

### Incorreto

```js
fs.readFile("dados.json", "utf8", (erro, conteudo) => {
  if (erro) {
    console.error(erro);
    return;
  }
  processarDados(JSON.parse(conteudo), (erroProcessamento) => {
    if (erroProcessamento) console.error(erroProcessamento);
  });
});
```

### Correto

```js
import { readFile } from "node:fs/promises";

async function carregarDados() {
  const conteudo = await readFile("dados.json", "utf8");
  return processarDados(JSON.parse(conteudo));
}

try {
  await carregarDados();
} catch (erro) {
  logger.error("Não foi possível carregar os dados", erro);
}
```

## 2. Não bloqueie o event loop desnecessariamente

Evite operações síncronas e cálculos pesados no fluxo de requisições. Prefira
as APIs assíncronas do Node.js; para CPU intensiva, use `worker_threads`, uma
fila de trabalho ou outro processo. Dividir uma tarefa em pequenos blocos com
`setImmediate` é uma alternativa quando o cálculo puder ser cooperativo.

### Incorreto

```js
import { createHash } from "node:crypto";

server.on("request", (requisicao, resposta) => {
  const resultado = calcularMilhoesDeCombinações(requisicao.body);
  const hash = createHash("sha512").update(resultado).digest("hex");
  resposta.end(hash);
});
```

O cálculo síncrono impede que o processo atenda outras requisições enquanto
está em execução.

### Correto

```js
import { Worker } from "node:worker_threads";

function executarNoWorker(entrada) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./calcular-worker.js", import.meta.url), {
      workerData: entrada,
    });
    worker.once("message", resolve);
    worker.once("error", reject);
  });
}

const resultado = await executarNoWorker(requisicao.body);
resposta.end(resultado);
```

O arquivo `calcular-worker.js` deve realizar o cálculo com `workerData` e
publicar o resultado usando `parentPort.postMessage(resultado)`.

## 3. Centralize as variáveis de ambiente com `dotenv`

Coloque valores de configuração e segredos em `.env`, mantenha `.env` no
`.gitignore` e carregue-os com a biblioteca `dotenv` no ponto de entrada da
aplicação. Distribua apenas um `.env.example` sem segredos para documentar os
nomes esperados. Valide as variáveis obrigatórias durante a inicialização.

### Incorreto

```js
const porta = 3000;
const chaveApi = "chave-real-da-api";
```

Também é incorreto versionar `.env` ou expor segredos em variáveis destinadas
ao navegador.

### Correto

```env
# .env — arquivo local, não versionado
PORT=3000
API_KEY=chave-local-da-api
```

```env
# .env.example — arquivo versionado, sem valores reais
PORT=3000
API_KEY=
```

```js
import "dotenv/config";

const porta = Number(process.env.PORT ?? 3000);
const chaveApi = process.env.API_KEY;

if (!chaveApi) {
  throw new Error("A variável API_KEY não foi configurada");
}
```

Instale a dependência com `npm install dotenv` e não registre valores
confidenciais nos logs ou nas mensagens de erro.

## 4. Aplique graceful shutdown ao desligar o servidor HTTP

Capture `SIGINT` e `SIGTERM`, pare de aceitar novas conexões, aguarde as
requisições em andamento e feche recursos externos, como banco e filas. Use
um prazo máximo para evitar que o processo fique preso indefinidamente.

### Incorreto

```js
process.on("SIGTERM", () => process.exit(0));
```

Esse desligamento interrompe requisições em andamento e pode deixar recursos
abertos ou operações incompletas.

### Correto

```js
let encerrando = false;

async function desligar(sinal) {
  if (encerrando) return;
  encerrando = true;
  logger.info(`Recebido ${sinal}; encerrando o servidor`);

  const limite = setTimeout(() => {
    logger.error("O desligamento excedeu o prazo");
    process.exit(1);
  }, 10_000);
  limite.unref();

  await new Promise((resolver) => servidor.close(resolver));
  await banco.close();
  clearTimeout(limite);
  logger.info("Servidor encerrado");
}

for (const sinal of ["SIGINT", "SIGTERM"]) {
  process.once(sinal, () => {
    desligar(sinal).catch((erro) => {
      logger.error("Falha durante o desligamento", erro);
      process.exitCode = 1;
    });
  });
}
```

## 5. Centralize o logging em um adaptador

Use `console.log` para mensagens operacionais e `console.error` para erros,
mas nunca os chame diretamente em módulos de domínio, rotas ou serviços. Crie
um adaptador centralizado para padronizar formato, contexto e futura troca do
destino dos logs.

### Incorreto

```js
export async function criarLead(dados) {
  console.log("Criando lead", dados.email);
  try {
    return await repositorio.criar(dados);
  } catch (erro) {
    console.error("Erro ao criar lead", erro);
    throw erro;
  }
}
```

Além de espalhar a implementação de logging, esse exemplo pode expor dados
pessoais.

### Correto

```js
// logger.js
function formatar(nivel, mensagem, contexto = {}) {
  return JSON.stringify({
    nivel,
    mensagem,
    ...contexto,
    em: new Date().toISOString(),
  });
}

export const logger = {
  info(mensagem, contexto) {
    console.log(formatar("info", mensagem, contexto));
  },
  error(mensagem, erro, contexto = {}) {
    console.error(
      formatar("error", mensagem, { ...contexto, erro: erro?.message }),
    );
  },
};
```

```js
export async function criarLead(dados) {
  logger.info("Criando lead", { leadId: dados.id });
  try {
    return await repositorio.criar(dados);
  } catch (erro) {
    logger.error("Erro ao criar lead", erro, { leadId: dados.id });
    throw erro;
  }
}
```

O adaptador deve filtrar segredos e dados pessoais antes de formatá-los.

## 6. Versione os lock files

Mantenha o lock file gerado pelo gerenciador escolhido no repositório. Para
projetos que usam npm, versione `package-lock.json` e use `npm ci` em ambientes
de integração e produção para instalar exatamente as versões resolvidas.

### Incorreto

```gitignore
package-lock.json
```

Ou instalar dependências e descartar as alterações do lock file antes de
enviar o código.

### Correto

```text
package.json
package-lock.json
```

```sh
npm install
git add package.json package-lock.json
npm ci
```

Não mantenha vários lock files para gerenciadores diferentes. Atualize o lock
file junto com a alteração intencional de dependências.

## 7. Evite referências circulares entre módulos

Organize os módulos em uma direção clara de dependências. Referências
circulares podem produzir exports parcialmente inicializados, comportamento
dependente da ordem de carregamento e dificuldade para testar os módulos.

### Incorreto

```js
// cliente.js
import { listarPedidos } from "./pedido.js";
export function obterClienteComPedidos(id) {
  return { id, pedidos: listarPedidos(id) };
}
```

```js
// pedido.js
import { obterClienteComPedidos } from "./cliente.js";
export function listarPedidos(clienteId) {
  const cliente = obterClienteComPedidos(clienteId);
  return cliente.pedidos;
}
```

### Correto

```js
// pedido-repository.js
export async function listarPedidosPorCliente(clienteId) {
  return banco.pedidos.findMany({ clienteId });
}
```

```js
// cliente-service.js
import { listarPedidosPorCliente } from "./pedido-repository.js";

export async function obterClienteComPedidos(clienteId) {
  const cliente = await clienteRepository.buscarPorId(clienteId);
  const pedidos = await listarPedidosPorCliente(clienteId);
  return { ...cliente, pedidos };
}
```

Quando dois módulos realmente compartilharem um conceito, extraia tipos,
constantes ou funções puras para um terceiro módulo neutro, em vez de fazer um
módulo importar o outro de volta.

## 8. Prefira npm para instalar bibliotecas

Use npm como gerenciador padrão do projeto e registre os comandos no
`README.md`. Não misture npm, Yarn, pnpm ou Bun no mesmo projeto, pois cada um
pode produzir um lock file e uma resolução de dependências diferentes.

### Incorreto

```sh
yarn add express
pnpm add dotenv
npm install vitest
```

Essa mistura torna a instalação inconsistente e pode gerar múltiplos lock
files.

### Correto

```sh
npm install express dotenv
npm install --save-dev vitest
```

Use `npm install` para adicionar ou atualizar uma biblioteca e `npm ci` para
instalar as versões já fixadas pelo `package-lock.json`.
