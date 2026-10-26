# Boas práticas adicionais de Node.js

Estas práticas foram pesquisadas na documentação oficial do Node.js. Avalie a
versão de Node.js adotada pelo projeto antes de usar APIs cuja disponibilidade
varia por versão.

## 9. Declare e respeite uma versão LTS do Node.js

Defina a versão mínima suportada em `package.json` com `engines` e use uma linha
LTS em desenvolvimento, integração e produção. Isso evita diferenças de APIs,
runtime e dependências entre ambientes.

## 10. Use os módulos nativos com o prefixo `node:`

Em código novo, importe módulos nativos como `node:fs/promises` e
`node:crypto`. O prefixo torna inequívoca a origem do módulo e evita confusão
com pacotes de terceiros de mesmo nome.

## 11. Valide toda entrada na fronteira da aplicação

Valide corpo HTTP, parâmetros, variáveis de ambiente, arquivos e mensagens de
fila antes de usá-los no domínio. A validação deve impor formato, tipo, limites
de tamanho e valores permitidos; não confie que dados externos são bem-formados.

## 12. Defina limites de tamanho e complexidade para entradas

Estabeleça limites de corpo, paginação, profundidade de JSON, tamanho de
arquivo e custo de consultas. Além de proteger recursos, isso reduz o risco de
uma entrada maliciosa bloquear o event loop ou a fila de workers.

## 13. Cancele operações que não podem mais produzir valor

Propague `AbortSignal` para I/O, chamadas HTTP, timers e processos filhos que
aceitem cancelamento. Use um prazo explícito, trate `AbortError` de modo
conhecido e registre listeners de abort com `{ once: true }` para não reter
referências desnecessariamente.

## 14. Trate erros no limite correto e preserve a causa

Capture erros onde for possível acrescentar contexto ou convertê-los em uma
resposta ou resultado adequado. Ao encapsular um erro, use `new Error(mensagem,
{ cause: erro })`; não silencie rejeições nem use `uncaughtException` como
controle de fluxo. Registre detalhes internos sem retorná-los ao cliente.

## 15. Não execute comandos de shell com entrada não confiável

Prefira `spawn` ou `execFile` com o executável e argumentos separados. Evite
`shell: true`; quando ele for indispensável, jamais concatene entrada externa
ao comando e limite estritamente os valores aceitos.

## 16. Remova listeners, timers e conexões que não serão mais usados

Use `once` para eventos de ocorrência única e implemente limpeza em caminhos de
sucesso, erro e cancelamento. Listeners acumulados e handles abertos impedem o
processo de encerrar e podem causar vazamentos de memória.

## 17. Aplique timeouts e limites de concorrência a integrações externas

Toda chamada a banco, fila, API ou processo externo deve ter prazo e política
de concorrência apropriados ao caso de uso. Não repita tentativas sem limite;
use backoff e um máximo de tentativas quando a operação for idempotente.

## 18. Observe o processo antes de otimizar

Meça latência, erros, uso de memória e saturação do event loop em ambientes
representativos. Use ferramentas nativas de diagnóstico e profiling do Node.js
para confirmar o gargalo antes de introduzir workers, cache ou mudanças de
arquitetura.

## Fontes

- [Não bloqueie o Event Loop (ou a Worker Pool)](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [Documentação de `AbortSignal`](https://nodejs.org/api/globals.html#class-abortsignal)
- [Documentação de erros](https://nodejs.org/api/errors.html)
- [Documentação de processos filhos](https://nodejs.org/api/child_process.html)
- [Diagnósticos do Node.js](https://nodejs.org/en/learn/diagnostics)
