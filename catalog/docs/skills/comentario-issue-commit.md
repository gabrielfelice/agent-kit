Entra em ação quando você pede ao agente para commitar ("faz o commit", "commita", "sobe essas alterações"). Depois do commit, o agente descobre a issue ligada à branch (pelo nome da branch, pela mensagem do commit ou pelo PR) e publica nela um comentário explicando as alterações: resumo, linha do tempo por commit, camadas tocadas, migrações, áreas de atenção e como verificar. O comentário sempre diz se houve ou não migração.

Também serve para resumir ou documentar os commits recentes de uma branch.

Requer a CLI do host autenticada (`gh` no GitHub, `glab` no GitLab). Sem ela, ou sem issue identificável, o comentário é salvo em arquivo e o agente avisa.
