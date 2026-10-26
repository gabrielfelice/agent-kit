---
name: testes
description: Orienta a criação, configuração e revisão de testes automatizados do projeto, incluindo pirâmide de testes, isolamento e ferramentas.
---

# Práticas para testes automatizados

Use esta skill ao criar, alterar, configurar ou revisar testes automatizados.
Ela complementa as exigências permanentes de
[`.agents/rules/tests.md`](../../rules/tests.md), que continuam obrigatórias.

## Propriedades dos testes

Os testes devem ser FAST, INDEPENDENT, REPEATABLE e SELF-VALIDATED:

- mantenha a base unitária rápida; isole rede, banco, filesystem, relógio e
  serviços de terceiros com stubs, mocks ou injeção de dependências;
- faça cada teste funcionar isoladamente e em qualquer ordem, sem estado
  mutável compartilhado ou dependência de dados criados em outro teste;
- controle datas, aleatoriedade, IDs e respostas externas para que execuções
  repetidas produzam o mesmo resultado;
- valide retornos, estados, efeitos e erros esperados com assertions. Não use
  testes que apenas executem código, `expect(true).toBe(true)` ou verificações
  de ausência de exceção como evidência de comportamento.

Crie os testes na ordem mais eficiente para a implementação, preservando essas
propriedades.

## Estrutura dos cenários

Organize cada teste em Given/When/Then ou AAA (`Arrange`, `Act`, `Assert`).
Cada teste deve cobrir um único requisito ou comportamento; pode verificar
consequências inseparáveis da mesma regra, mas não deve combinar fluxos
independentes apenas para reduzir a quantidade de testes.

## Pirâmide e ferramentas

Mantenha mais testes de unidade, uma quantidade menor de integração e poucos
testes E2E para jornadas críticas do usuário:

1. Unidade: funções, componentes e regras de negócio rápidos e isolados.
2. Integração: interações selecionadas entre módulos, banco, filas ou
   adaptadores.
3. E2E: jornadas críticas do produto integrado.

Use Vitest para testes unitários e de integração do frontend e do backend, e
Playwright preferencialmente para E2E quando essas ferramentas forem adotadas
pelo projeto. Não instale dependências nem invente comandos: use somente a
configuração e os scripts existentes.

No frontend, cubra renderização relevante, carregamento, sucesso, erro,
validação, acessibilidade e interações. No backend, cubra regras de negócio,
entradas, autenticação, autorização, erros, persistência e integrações.

## Revisão

Antes de concluir, confira que os fluxos críticos receberam prioridade, que a
distribuição da suíte respeita a pirâmide e que cada teste realmente protege o
comportamento que declara validar. Para E2E, confirme também a localização em
`e2e/` na raiz, conforme a rule.
