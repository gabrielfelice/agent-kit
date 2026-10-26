---
name: react
description: Aplica as regras e práticas do projeto ao criar ou alterar componentes, hooks e módulos de acesso a dados em aplicações React.
---

# Regras para React

Estas regras se aplicam a componentes, hooks e módulos de acesso a dados em
aplicações React. Os exemplos usam TypeScript e JSX/TSX.

A redação e os exemplos da regra original estão preservados em
[references/exemplos-da-regra-original.md](references/exemplos-da-regra-original.md).
Leia esse recurso ao implementar qualquer uma das nove regras originais,
especialmente quando precisar de um exemplo. Aplique também as
[10 boas práticas adicionais pesquisadas](references/boas-praticas-adicionais.md).

## Regras originais

1. Crie componentes pequenos e reutilizáveis.
2. Evite passar props com spread operators.
3. Evite `useEffect` desnecessário.
4. Use `useMemo` para cálculos pesados entre re-renderizações.
5. Separe o acesso ao backend do código do componente.
6. Use hooks com `use` para separar lógica do componente.
7. Prefira componentes funcionais.
8. Utilize propriedades de acessibilidade (`aria-*`).
9. Estilize componentes com Tailwind CSS.
