---
description: "Regras de testes: cobertura obrigatória e mínima de 80%, pirâmide de testes, ambiente e E2E."
---

# Regras de testes

Estas regras se aplicam a todo código novo e a toda alteração feita no projeto.
Use as ferramentas, os comandos e as pastas que o projeto já adota; não instale
dependências nem invente scripts para cumprir esta rule.

## Cobertura obrigatória

Todo código de produção deve ser coberto por testes automatizados adequados ao
seu nível na pirâmide de testes. Código sem teste deve ser tratado como
incompleto.

Os testes devem validar comportamentos relevantes, incluindo sucesso,
validações, erros e limites. Executar uma linha não substitui uma assertion que
falhe quando o comportamento mudar. Casos que não façam sentido para o domínio
devem ser decididos e documentados, nunca ocultados da cobertura.

## Cobertura mínima de 80%

O projeto deve manter cobertura global mínima de 80% para statements, branches,
functions e lines. O comando usado no CI deve falhar quando qualquer limite não
for atingido.

O percentual é um piso, não uma meta para testar apenas 80% do código. Não use
diretivas de exclusão, como `/* istanbul ignore */`, `/* c8 ignore */`,
`# pragma: no cover` ou listas de arquivos ignorados, para esconder código não
testado. Exclusões só são aceitáveis para código gerado ou configuração
comprovadamente impossível de exercitar, devem ser mínimas e justificadas na
documentação do projeto.

## Fluxo rápido e suite completa

Durante a implementação, rode primeiro só os testes do arquivo ou módulo
afetado, sem cobertura global, usando o script focado do projeto quando houver.
Se não houver, passe o caminho do arquivo ou diretório ao executor de testes do
projeto.

Antes de concluir uma tarefa, rode lint, os testes focados relevantes e build.
Rode a suite completa com cobertura ao concluir mudanças que afetem vários
módulos, regras transversais ou a configuração de testes, e mantenha essa suite
completa obrigatória no CI. A suite focada não substitui o limite global de 80%
exigido pelo CI.

## Responsabilidade de cada camada

Organize os testes pela fronteira que exercitam, sem repetir a mesma matriz de
casos em todas as camadas:

1. Unitários cobrem regras, casos de uso isolados com dependências falsas e
componentes renderizados em DOM simulado. Devem formar a maior parte da suite e
dar feedback rápido.
2. Integração cobre poucas interações reais entre módulos, adaptadores ou banco,
principalmente contratos e isolamento que os fakes não conseguem validar.
3. E2E cobre poucas jornadas completas e críticas no produto integrado. Não use
E2E para repetir renderização ou clique de componente já protegido por teste de
UI.

Um comportamento pode aparecer em mais de uma camada quando cada teste protege
uma falha diferente, como regra de autorização, consulta real ao banco e jornada
do usuário. Evite repetir a mesma assertion ou a mesma matriz de entradas sem
uma fronteira adicional que justifique a cobertura.

## Ambiente dos testes

Use o ambiente mais leve que o teste exige. Regras, casos de uso, rotas e
backend rodam sem DOM; só testes que renderizam componentes ou usam APIs do
navegador devem ativar um DOM simulado (como jsdom ou happy-dom), de preferência
por arquivo, e carregar bibliotecas de UI apenas nesses casos. Assim, testes sem
interface não pagam o custo de inicializar o DOM.

Quando a suite parecer lenta, meça as fases e os arquivos mais lentos com os
relatórios do executor antes de remover cobertura, reduzir concorrência ou
alterar timeouts. Mantenha ativos os caches que o executor oferecer para
execuções focadas repetidas.

## Prioridade por criticidade

A quantidade e a profundidade dos testes devem refletir o risco do negócio.
Priorize dinheiro, contratos, autenticação, autorização, estoque, dados
pessoais e conversão. A prioridade não justifica deixar código sem teste.

## Testes E2E

Mantenha os testes E2E numa pasta própria, separada do código de produção e dos
testes unitários, seguindo a convenção que o projeto já usa (como `e2e/` na
raiz). A configuração e os fixtures exclusivos da ferramenta de E2E também
devem ficar ali quando aplicável.

Ao criar, alterar, configurar ou revisar testes automatizados, carregue a skill
[`testes`](../skills/testes/SKILL.md), que complementa esta rule com práticas de
implementação e critérios de revisão.
