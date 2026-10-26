---
description: "Padrões gerais de codificação: comentários, tamanho de arquivos e funções, aninhamento, parâmetros, constantes e segredos."
---

# Padrões de codificação

Estas regras se aplicam a todo código novo e a toda alteração feita no repositório. Os exemplos usam TypeScript, mas os princípios também devem ser aplicados a outras linguagens usadas no projeto.

## 1. Comentários

Não insira comentários no código. O código deve expressar sua intenção por meio de nomes claros, funções pequenas e uma estrutura simples.

Comentários só são aceitáveis quando forem absolutamente necessários para explicar algo que não pode ser tornado evidente pelo código, como uma expressão regular complexa ou uma limitação externa relevante.

### Incorreto

```ts
// Verifica se o usuário pode continuar.
const podeContinuar = usuario.ativo && usuario.perfil === "admin";
```

### Correto

```ts
const podeContinuar = usuario.ativo && usuario.perfil === "admin";
```

### Exceção aceitável

```ts
// Mantém a validação compatível com o formato de telefone recebido do serviço legado.
const telefoneLegado = /^\\+?55\\s?\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$/;
```

## 2. Limite de 100 linhas por arquivo e classe

Nunca crie classes ou arquivos `.ts` com mais de 100 linhas. Ao se aproximar desse limite, extraia responsabilidades coesas para outros arquivos, classes ou módulos.

O limite considera todas as linhas do arquivo, incluindo imports, tipos, constantes e linhas em branco. Uma classe também deve permanecer com no máximo 100 linhas dentro do arquivo em que for declarada.

### Incorreto

```ts
// Arquivo com 101 ou mais linhas, contendo validação, persistência,
// transformação de dados e envio de notificações na mesma classe.
export class CadastroService {
  // ... muitas linhas e responsabilidades diferentes ...
}
```

### Correto

```ts
export class CadastroService {
  constructor(
    private readonly validador: CadastroValidator,
    private readonly repositorio: CadastroRepository,
  ) {}

  async cadastrar(dados: CadastroInput): Promise<Cadastro> {
    const dadosValidados = this.validador.validar(dados);
    return this.repositorio.salvar(dadosValidados);
  }
}
```

As demais responsabilidades ficam em `cadastro-validator.ts` e `cadastro-repository.ts`.

## 3. Limite de 30 linhas por método ou função

Métodos e funções devem ter no máximo 30 linhas. Se o comportamento for maior, divida-o em métodos ou funções menores, cada um com uma única responsabilidade clara.

### Incorreto

```ts
function prepararPedido(pedido: Pedido): PedidoPronto {
  // ... mais de 30 linhas de validação, cálculo, transformação e persistência ...
}
```

### Correto

```ts
function prepararPedido(pedido: Pedido): PedidoPronto {
  validarPedido(pedido);
  const itens = calcularItens(pedido.itens);
  const total = calcularTotal(itens);
  return criarPedidoPronto(pedido, itens, total);
}
```

## 4. Aninhamento condicional e cláusulas guarda

Não aninhe mais de três níveis de `if`/`else`. Dê preferência a cláusulas guarda, também chamadas de *early return*, para encerrar casos inválidos ou excepcionais antes da lógica principal.

### Incorreto

```ts
function autorizar(usuario: Usuario, recurso: Recurso): boolean {
  if (usuario) {
    if (usuario.ativo) {
      if (usuario.perfil) {
        if (recurso.permitido) {
          return true;
        }
      }
    }
  }
  return false;
}
```

### Correto

```ts
function autorizar(usuario: Usuario | null, recurso: Recurso): boolean {
  if (!usuario || !usuario.ativo) return false;
  if (!usuario.perfil) return false;
  if (!recurso.permitido) return false;
  return true;
}
```

## 5. Quantidade de parâmetros

Evite mais de três parâmetros em métodos e funções. Quando quatro ou mais valores forem necessários, crie um objeto parâmetro com propriedades nomeadas. Isso torna a chamada mais legível e reduz erros de ordem.

### Incorreto

```ts
function criarFranquia(
  nome: string,
  cidade: string,
  estado: string,
  investimento: number,
): Franquia {
  return { nome, cidade, estado, investimento };
}
```

### Correto

```ts
type CriarFranquiaParams = {
  nome: string;
  cidade: string;
  estado: string;
  investimento: number;
};

function criarFranquia(params: CriarFranquiaParams): Franquia {
  return { ...params };
}
```

## 6. Linhas em branco dentro de métodos e funções

Evite linhas em branco dentro de métodos e funções. Mantenha o fluxo contínuo e use funções menores para separar responsabilidades. Linhas em branco são permitidas entre membros de uma classe e entre funções de um arquivo.

### Incorreto

```ts
function calcularTotal(itens: Item[]): number {
  const subtotal = somarItens(itens);

  const desconto = calcularDesconto(subtotal);

  return subtotal - desconto;
}
```

### Correto

```ts
function calcularTotal(itens: Item[]): number {
  const subtotal = somarItens(itens);
  const desconto = calcularDesconto(subtotal);
  return subtotal - desconto;
}

function calcularDesconto(subtotal: number): number {
  return subtotal * TAXA_DESCONTO;
}
```

## 7. Números e strings mágicos

Extraia números e strings mágicos para constantes com nomes que expressem o conceito. Assim, o significado fica claro e a alteração futura ocorre em um único lugar.

### Incorreto

```ts
if (tentativas >= 3) {
  throw new Error("Limite excedido");
}
if (usuario.tipo === "franqueado") {
  liberarAcesso(usuario);
}
```

### Correto

```ts
const MAXIMO_DE_TENTATIVAS = 3;
const TIPO_FRANQUEADO = "franqueado";
const MENSAGEM_LIMITE_EXCEDIDO = "Limite excedido";

if (tentativas >= MAXIMO_DE_TENTATIVAS) {
  throw new Error(MENSAGEM_LIMITE_EXCEDIDO);
}
if (usuario.tipo === TIPO_FRANQUEADO) {
  liberarAcesso(usuario);
}
```

## 8. Declaração e escopo de variáveis

Declare cada variável próximo do local em que ela será usada, evitando variáveis preparadas muito antes do consumo. Nunca use `var`; prefira `const` por padrão e `let` apenas quando a reatribuição for necessária.

### Incorreto

```ts
var nomeCompleto = obterNomeCompleto(usuario);
var permissao = obterPermissao(usuario);
var registro = montarRegistro(usuario);

salvar(registro);
mostrarNome(nomeCompleto);
if (permissao) liberarAcesso(usuario);
```

### Correto

```ts
const registro = montarRegistro(usuario);
salvar(registro);

const nomeCompleto = obterNomeCompleto(usuario);
mostrarNome(nomeCompleto);

const permissao = obterPermissao(usuario);
if (permissao) liberarAcesso(usuario);
```

## 9. Dados sensíveis e variáveis de ambiente

Nunca coloque dados sensíveis no código-fonte, como chaves de API, senhas, tokens, certificados ou credenciais. Armazene esses valores em um arquivo `.env` local, mantenha esse arquivo referenciado no `.gitignore` e leia as variáveis em tempo de execução.

Não registre valores sensíveis em logs, não os inclua em mensagens de erro e não os exponha em código executado no navegador. Em aplicações Next.js, variáveis com prefixo `NEXT_PUBLIC_` são públicas e não devem conter segredos.

### Incorreto

```ts
const chaveApi = "sk-exemplo-nao-coloque-segredos-aqui";

const resposta = await fetch("https://api.exemplo.com/dados", {
  headers: { Authorization: `Bearer ${chaveApi}` },
});
```

### Correto

```env
API_KEY=sk-exemplo-fora-do-codigo
```

```ts
const chaveApi = process.env.API_KEY;
if (!chaveApi) throw new Error("A variável API_KEY não foi configurada");

const resposta = await fetch("https://api.exemplo.com/dados", {
  headers: { Authorization: `Bearer ${chaveApi}` },
});
```

O arquivo `.env` ou `.env.local` deve estar no `.gitignore`. Se um segredo for exposto, considere-o comprometido, remova-o do histórico quando necessário e faça sua rotação no provedor responsável.
