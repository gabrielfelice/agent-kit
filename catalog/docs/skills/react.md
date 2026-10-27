Práticas para componentes, hooks e acesso a dados em React, carregadas quando a tarefa toca esse tipo de código. São 19 regras, entre elas:

- componentes funcionais, pequenos e reutilizáveis, sem espalhar props com spread;
- acesso ao backend fora do componente e lógica extraída para hooks `use…`;
- sem `useEffect` desnecessário, Effects com todas as dependências e com limpeza, `useMemo` só para cálculos pesados;
- renderização pura, props e estado tratados como imutáveis, estado sem redundância e com uma única fonte de verdade;
- chaves estáveis em listas, atributos de acessibilidade (`aria-*`) e estilo com Tailwind CSS.

Os exemplos de cada regra ficam em `references/`, dentro da pasta da skill.
