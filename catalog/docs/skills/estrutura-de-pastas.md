Gera, sob demanda, a rule `.agents/rules/folder-structure.md`, que descreve como este repositório se organiza: a árvore real de pastas, o papel de cada camada, a direção permitida das dependências e o que os agentes podem ou não fazer em cada pasta.

O agente primeiro lê o código (manifestos, framework, imports, onde ficam testes e migrations), depois pergunta só o que o código não responde e escreve a rule. Se ela já existir, propõe apenas as diferenças.

Use quando quiser documentar ou padronizar a estrutura do projeto. A rule gerada é do projeto, não do kit: o `update` e o `remove` não mexem nela.
