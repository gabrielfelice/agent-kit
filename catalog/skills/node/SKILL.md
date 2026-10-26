---
name: node
description: Aplica as regras e práticas do projeto ao criar ou alterar código executado no Node.js, incluindo APIs, jobs, scripts e servidores HTTP.
---

# Regras de Node.js

Estas regras se aplicam ao código executado no Node.js, incluindo APIs, jobs,
scripts e servidores HTTP. Os exemplos usam JavaScript com módulos ES.

A redação e os exemplos da regra original estão preservados em [references/exemplos-da-regra-original.md](references/exemplos-da-regra-original.md). Leia esse recurso ao implementar qualquer uma das oito regras originais, especialmente quando precisar de um exemplo. Aplique também as [10 boas práticas adicionais pesquisadas](references/boas-praticas-adicionais.md).

## Regras originais

1. Prefira `async`/`await` a callbacks.
2. Não bloqueie o event loop desnecessariamente.
3. Centralize as variáveis de ambiente com `dotenv`.
4. Aplique graceful shutdown ao desligar o servidor HTTP.
5. Centralize o logging em um adaptador.
6. Versione os lock files.
7. Evite referências circulares entre módulos.
8. Prefira npm para instalar bibliotecas.
