Regras específicas de JavaScript e TypeScript, complementares à `coding-standards`:

- `const` por padrão, `let` só quando houver reatribuição, nunca `var`;
- `===` e `!==` sempre, sem `any` (use `unknown` e refine o tipo) e sem asserções de tipo desnecessárias;
- arrow functions em callbacks, sem ternários aninhados e `import`/`export` em vez de `require`;
- parâmetros e retornos que envolvem objetos tipados, tipos imutáveis (`readonly`) quando o contrato não exige mutação e valores opcionais tratados explicitamente;
- nomes de tipos e funções que falam a língua do domínio;
- o linter do projeto roda ao fim de cada tarefa.
