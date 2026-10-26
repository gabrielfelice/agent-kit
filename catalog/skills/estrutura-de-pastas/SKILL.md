---
name: estrutura-de-pastas
description: "Cria ou atualiza a rule de estrutura de pastas do projeto (.agents/rules/folder-structure.md), adaptada ao repositório atual a partir do código existente e de perguntas ao usuário. Use quando o usuário pedir para criar, documentar, revisar ou padronizar a estrutura de pastas, a organização de módulos, as fronteiras entre camadas ou a direção das dependências, ou quando o projeto não tiver essa rule e uma tarefa depender dela."
---

# Rule de estrutura de pastas

O resultado é um único arquivo, `.agents/rules/folder-structure.md`, que descreve como **este** repositório se organiza e o que agentes podem ou não fazer em cada pasta. A rule documenta a estrutura real e as decisões do time. Não invente arquitetura nem copie a de outro projeto.

## 1. Levante o que já existe

Antes de perguntar qualquer coisa, leia:

- a árvore do repositório até 3 níveis, ignorando `node_modules`, `dist`, `build`, `coverage` e pastas geradas;
- os manifestos: `package.json` (incluindo `workspaces`), `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `tsconfig*.json`, `pyproject.toml`, `go.mod`, `Cargo.toml` e equivalentes;
- o framework e suas pastas obrigatórias, como `app/` ou `pages/` no Next.js e `src/routes` no SvelteKit;
- onde ficam os testes (unitários, integração, E2E), as migrations, os clientes de banco e as integrações externas;
- `AGENTS.md`, `CLAUDE.md`, `README.md` e as outras rules de `.agents/rules/`, para não contradizer nada já decidido;
- os imports entre pastas, para descobrir a direção real das dependências.

Se a rule já existir, trate o pedido como atualização: compare o arquivo com o código atual e proponha apenas as diferenças.

## 2. Pergunte só o que o código não responde

Apresente ao usuário, de uma vez, um resumo curto do que encontrou e as perguntas que ficaram em aberto. Exemplos:

- Qual a fronteira entre domínio e infraestrutura? Onde não pode haver regra de negócio?
- Um módulo pode importar arquivos internos de outro, ou só a API pública?
- Onde ficam os testes de cada camada?
- Quem gera, revisa e aplica migrations? O agente pode rodá-las?
- Alguma pasta é só referência ou documentação, e não código executável?

Não pergunte o que já está evidente no repositório. Se o projeto for pequeno e não houver decisão a tomar, diga isso e escreva uma rule curta.

## 3. Escreva a rule

Use [references/exemplo-monorepo-npm-workspaces.md](references/exemplo-monorepo-npm-workspaces.md) como **modelo de forma**, não de conteúdo. Esse exemplo é de outro projeto: não copie as pastas, as ferramentas nem as políticas dele.

Estrutura esperada:

1. Título e um parágrafo explicando o critério de organização.
2. Árvore em bloco `text` com as pastas reais e um comentário curto por pasta. Use placeholders como `<dominio>` para pastas que se repetem.
3. Uma seção por camada ou área (por exemplo apps, módulos, infraestrutura e dados), com regras objetivas em lista.
4. Uma seção de dependências: a direção permitida, como evitar ciclos e o que é proibido importar.
5. As restrições para agentes, quando houver, como migrations, pastas geradas ou pastas que não podem ser alteradas.

Escreva regras verificáveis ("testes do módulo ficam em `packages/<dominio>/tests/`"), não intenções vagas ("mantenha o código organizado"). Mantenha o arquivo abaixo de 80 linhas.

## 4. Registre e confirme

- Salve em `.agents/rules/folder-structure.md`.
- Se o projeto usa Claude Code e tem `.claude/rules/`, crie o link `.claude/rules/folder-structure.md` apontando para `../../.agents/rules/folder-structure.md`, como o agent-kit faz com as outras rules.
- Se o `AGENTS.md` lista as rules, sugira ao usuário a linha que inclui a nova rule. Não edite o `AGENTS.md` sem pedido.
- Mostre o arquivo final ao usuário e destaque as decisões que vieram das respostas dele.
