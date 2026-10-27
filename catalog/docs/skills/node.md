Práticas para código que roda no Node.js (APIs, jobs, scripts, servidores HTTP), carregadas quando a tarefa toca esse tipo de código. São 18 regras, entre elas:

- `async`/`await` em vez de callbacks e nada que bloqueie o event loop sem necessidade;
- variáveis de ambiente centralizadas, logging atrás de um adaptador e graceful shutdown no servidor HTTP;
- lock file versionado, npm como gerenciador, versão LTS declarada e módulos nativos com o prefixo `node:`;
- entrada validada e limitada na fronteira, timeouts e limites de concorrência em integrações externas, sem shell com entrada não confiável;
- erros tratados no limite certo, preservando a causa, e recursos (listeners, timers, conexões) liberados.

Os exemplos de cada regra ficam em `references/`, dentro da pasta da skill.
