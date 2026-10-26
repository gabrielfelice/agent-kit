# Boas práticas adicionais de React

Estas práticas foram pesquisadas na documentação oficial do React. Avalie a
versão de React e a configuração adotadas pelo projeto antes de usar APIs cuja
disponibilidade varia por versão.

## 10. Mantenha componentes e hooks puros durante a renderização

Faça a renderização depender apenas de props, estado e contexto. Não altere
valores externos, props ou estado durante a renderização; coloque efeitos
colaterais em manipuladores de evento ou em Effects quando houver sincronização
com um sistema externo.

## 11. Chame hooks apenas no nível superior de componentes e hooks customizados

Não chame hooks em condições, laços, callbacks, blocos `try`/`catch` ou funções
JavaScript comuns. Declare-os antes de retornos condicionais para que o React
preserve a ordem das chamadas entre renderizações.

## 12. Trate props e estado como snapshots imutáveis

Para alterar objetos ou arrays guardados no estado, crie e defina uma nova
referência. Não modifique diretamente props, estado, argumentos recebidos por
hooks nem valores já usados em JSX.

## 13. Modele o estado para evitar redundância, duplicação e contradições

Calcule durante a renderização os dados derivados de props ou estado existente.
Agrupe valores que mudam juntos, guarde identificadores em vez de objetos
duplicados e prefira estruturas planas quando o estado aninhado dificultar
atualizações.

## 14. Mantenha uma única fonte de verdade para estado compartilhado

Quando dois ou mais componentes precisarem permanecer sincronizados, eleve o
estado ao ancestral comum mais próximo e distribua-o por props. Use contexto
quando o dado for realmente transversal na árvore, sem usá-lo para ocultar
propriedades que deveriam ser explícitas.

## 15. Use chaves estáveis e oriundas dos dados ao renderizar listas

Cada elemento produzido por `map` deve receber uma `key` única entre seus
irmãos. Prefira um identificador estável do dado; não gere chaves durante a
renderização nem use índice quando a lista puder reordenar, inserir ou remover
itens.

## 16. Declare todas as dependências reativas de um Effect

Inclua na lista de dependências cada prop, estado, variável ou função reativa
que o Effect usa. Não silencie o linter para remover uma dependência: altere a
estrutura do código, mova valores estáveis para fora do componente ou separe
sincronizações independentes.

## 17. Limpe recursos externos iniciados por Effects

Todo Effect que cria uma assinatura, conexão, timer, listener ou outro recurso
externo deve retornar uma função de limpeza correspondente. A limpeza deve
desfazer a configuração anterior antes da próxima sincronização e ao desmontar
o componente.

## 18. Use a forma atualizadora ao derivar o próximo estado do anterior

Quando o novo valor depende do estado anterior, passe uma função ao setter,
como `setContagem((atual) => atual + 1)`. Isso mantém corretas atualizações
enfileiradas e evita capturar um snapshot desatualizado.

## 19. Otimize somente após identificar trabalho custoso

Use `memo`, `useMemo` ou `useCallback` apenas como otimizações de desempenho
com uma causa observada e dependências corretas. A aplicação deve permanecer
correta sem essas APIs; primeiro corrija o fluxo de dados e a estrutura dos
componentes.

## Fontes

- [Componentes e hooks devem ser puros](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
- [Regras dos hooks](https://react.dev/reference/rules/rules-of-hooks)
- [Estruturando o estado](https://react.dev/learn/choosing-the-state-structure)
- [Compartilhando estado entre componentes](https://react.dev/learn/sharing-state-between-components)
- [Renderizando listas](https://react.dev/learn/rendering-lists)
- [Removendo dependências de Effects](https://react.dev/learn/removing-effect-dependencies)
- [Sincronizando com Effects](https://react.dev/learn/synchronizing-with-effects)
- [Adicionando interatividade](https://react.dev/learn/adding-interactivity)
- [`memo`](https://react.dev/reference/react/memo)
