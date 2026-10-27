Padrões gerais que valem para todo código novo ou alterado, em qualquer linguagem do projeto:

- sem comentários, a não ser quando o código não consegue explicar sozinho (uma regex complexa, uma limitação externa);
- no máximo 100 linhas por arquivo ou classe e 30 por função;
- cláusulas guarda em vez de condicionais aninhadas, e poucos parâmetros por função (agrupe em objeto quando passar de três);
- sem linhas em branco dentro de funções, sem números e strings mágicos (use constantes nomeadas) e variáveis declaradas perto de onde são usadas;
- segredos e configuração sensível só em variáveis de ambiente, nunca no código.

Carregada sempre: o Claude Code lê a rule automaticamente, e o Codex a lê pelo trecho no `AGENTS.md`.
