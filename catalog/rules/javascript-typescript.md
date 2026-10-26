---
description: "Regras de JavaScript e TypeScript: const, comparação estrita, sem any, imports ES, tipos imutáveis e linter."
---

# Regras de JavaScript e TypeScript

Estas regras se aplicam a todo código JavaScript, TypeScript, JSX e TSX novo ou alterado no projeto. Os exemplos usam TypeScript quando a tipagem fizer parte do princípio.

## 1. Prefira `const` e nunca use `var`

Use `const` por padrão. Use `let` somente quando a variável precisar ser reatribuída. Nunca use `var`, pois seu escopo e comportamento de içamento tornam o código mais propenso a erros.

### Incorreto

```ts
var total = 0;
var indice = 0;
indice += 1;
```

### Correto

```ts
const itens = obterItens();
let indice = 0;
indice += 1;
const total = calcularTotal(itens);
```

Quando a variável não precisa ser reatribuída, não use `let` apenas por hábito.

## 2. Use comparação estrita

Use sempre `===` para igualdade e `!==` para desigualdade. Não use `==` nem `!=`, pois eles fazem coerção implícita de tipos e podem produzir resultados inesperados.

A sintaxe correta para desigualdade estrita é `!==`. O operador `!===` não existe em JavaScript ou TypeScript.

### Incorreto

```ts
if (codigo == 0) {
  return true;
}

if (usuario.id != idSelecionado) {
  bloquearUsuario(usuario);
}
```

### Correto

```ts
if (codigo === 0) {
  return true;
}

if (usuario.id !== idSelecionado) {
  bloquearUsuario(usuario);
}
```

## 3. Nunca use `any`

Não use `any` explícito nem recorra a ele para silenciar erros de tipagem. Prefira modelar o domínio com tipos, interfaces, unions e generics. Quando o valor realmente tiver formato desconhecido, use `unknown` e faça a validação ou o estreitamento antes de acessá-lo.

### Incorreto

```ts
function exibirFranquia(franquia: any): string {
  return franquia.nome;
}
```

### Correto

```ts
type Franquia = {
  nome: string;
};

function exibirFranquia(franquia: Franquia): string {
  return franquia.nome;
}
```

### Correto ao receber um valor desconhecido

```ts
function obterNome(dado: unknown): string {
  if (typeof dado !== "object" || dado === null || !("nome" in dado)) {
    return "";
  }

  const registro = dado as { nome: unknown };
  return typeof registro.nome === "string" ? registro.nome : "";
}
```

Evite também deixar parâmetros, retornos ou propriedades sem tipo quando isso fizer o TypeScript inferir `any` implícito.

## 4. Use arrow functions em callbacks

Prefira arrow functions em callbacks de `map`, `filter`, `reduce`, `sort`, `forEach`, promises e manipuladores de eventos. As funções principais do arquivo, exportadas ou responsáveis por uma regra de negócio, devem ser declaradas com `function` para deixar sua responsabilidade e seu nome evidentes.

### Incorreto

```ts
const nomes = franquias.map(function (franquia: Franquia): string {
  return franquia.nome;
});
```

### Correto

```ts
function listarNomes(franquias: Franquia[]): string[] {
  return franquias.map((franquia) => franquia.nome);
}
```

A regra não exige transformar toda função em arrow function. Use declarações nomeadas para as funções principais e arrows para funções curtas passadas como argumento.

## 5. Não aninhe operadores ternários

Use ternários apenas para decisões simples e sem aninhamento. Não coloque um ternário dentro de outro ternário nem use uma cadeia de condicionais para substituir uma regra de negócio complexa. Para mais de duas alternativas, prefira `if`, `switch` ou uma função nomeada.

### Incorreto

```ts
const etiqueta = ativo
  ? premium
    ? "Franquia premium ativa"
    : "Franquia ativa"
  : "Franquia inativa";
```

### Correto

```ts
function obterEtiqueta(ativo: boolean, premium: boolean): string {
  if (!ativo) return "Franquia inativa";
  if (premium) return "Franquia premium ativa";
  return "Franquia ativa";
}

const etiqueta = obterEtiqueta(ativo, premium);
```

Um ternário simples continua permitido quando melhora a leitura:

```ts
const mensagem = carregando ? "Carregando" : "Pronto";
```

## 6. Tipar parâmetros e retornos que envolvem objetos

Declare explicitamente os tipos dos parâmetros e dos retornos de funções quando eles forem objetos, listas de objetos ou estruturas derivadas de objetos. Prefira tipos nomeados para estruturas reutilizadas e para contratos relevantes.

### Incorreto

```ts
function criarContato(dados) {
  return {
    nome: dados.nome,
    email: dados.email,
  };
}
```

### Correto

```ts
type DadosDeContato = {
  nome: string;
  email: string;
};

type Contato = DadosDeContato & {
  id: string;
};

function criarContato(dados: DadosDeContato): Contato {
  return {
    id: gerarId(),
    nome: dados.nome,
    email: dados.email,
  };
}
```

Tipar o retorno também torna o contrato explícito e faz o compilador detectar alterações acidentais na estrutura devolvida.

## 7. Use `import` e `export`

Use módulos ES para importar e exportar valores, tipos e funções. Não use `require` nem `module.exports` em código novo.

### Incorreto

```ts
const formatarMoeda = require("./formatar-moeda");

module.exports = { formatarMoeda };
```

### Correto

```ts
import { formatarMoeda } from "./formatar-moeda";

export function exibirInvestimento(valor: number): string {
  return formatarMoeda(valor);
}
```

Para importar ou exportar apenas tipos, use `import type` e `export type` quando isso deixar a intenção clara.

## 8. Execute o linter ao concluir cada tarefa

Ao terminar qualquer tarefa que altere código, execute o comando de lint documentado pelo projeto. Corrija os problemas encontrados antes de concluir a tarefa. Se ainda não existir `package.json`, script de lint ou configuração correspondente, registre que o lint não pôde ser executado; não invente um comando.

### Correto

```bash
npm run lint
```

O comando acima é apenas um exemplo: use o gerenciador e o script oficialmente configurados no projeto.

## 9. Prefira tipos imutáveis quando o contrato não exigir mutação

Use `readonly` em propriedades, parâmetros e coleções que não devem ser alterados. Isso torna as intenções do contrato explícitas e reduz efeitos colaterais.

### Incorreto

```ts
type Configuracao = {
  nome: string;
  permissoes: string[];
};
```

### Correto

```ts
type Configuracao = {
  readonly nome: string;
  readonly permissoes: readonly string[];
};
```

Não use `readonly` como obstáculo artificial: remova-o quando a mutação fizer parte do contrato da função ou da estrutura.

## 10. Trate valores opcionais explicitamente

Represente a ausência de um valor com `undefined` ou `null` de forma consistente com o contrato. Não esconda casos opcionais com asserções não nulas (`!`) ou conversões de tipo sem validação.

### Incorreto

```ts
function obterNome(franquia?: Franquia): string {
  return franquia!.nome;
}
```

### Correto

```ts
function obterNome(franquia?: Franquia): string {
  return franquia?.nome ?? "Franquia não informada";
}
```

Use validações explícitas quando a ausência representar um erro de negócio, em vez de mascará-la com uma asserção.

## 11. Evite asserções de tipo desnecessárias

Não use `as` para forçar o compilador a aceitar um valor sem comprovar que ele atende ao contrato. Prefira tipar a origem dos dados, validar entradas externas e usar funções de estreitamento.

### Incorreto

```ts
const franquia = resposta.json() as Franquia;
```

### Correto

```ts
const dados: unknown = await resposta.json();
const franquia = validarFranquia(dados);
```

A função de validação deve confirmar a estrutura recebida e retornar `Franquia` ou sinalizar o erro de forma explícita.

## 12. Nomeie tipos e funções pelo domínio

Use nomes descritivos em português quando o código estiver voltado ao domínio brasileiro do projeto. Evite abreviações, nomes genéricos como `data`, `obj` e `result` quando eles não explicarem o conteúdo, e funções que misturem responsabilidades.

### Incorreto

```ts
function fn(data: unknown): unknown {
  return data;
}
```

### Correto

```ts
type PropostaDeFranquia = {
  investimentoInicial: number;
};

function calcularInvestimentoInicial(
  proposta: PropostaDeFranquia,
): number {
  return proposta.investimentoInicial;
}
```

Nomes claros reduzem a necessidade de comentários e ajudam a manter funções pequenas e fáceis de testar.
