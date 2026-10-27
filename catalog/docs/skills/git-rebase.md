Resolve conflitos de merge, rebase e cherry-pick de forma conservadora. O agente entende cada trecho em conflito, preserva a intenção dos dois lados, roda as verificações que o projeto já define e só faz `git add` do que entendeu.

Ele não continua a operação (`--continue`) nem faz commit sem pedido, e nunca roda comandos que descartam trabalho (`--abort`, `reset --hard`, force push). Um conflito arriscado ou ambíguo fica sem resolução, com a explicação do motivo.
