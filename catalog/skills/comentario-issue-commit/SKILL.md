---
name: comentario-issue-commit
description: "Skill genérica, para qualquer projeto e stack: faz o commit e publica automaticamente, na issue ligada à branch, um comentário explicando as alterações (resumo, linha do tempo por commit, camadas tocadas, migrações, áreas de atenção e verificação). DEVE ser chamada sempre que o usuário solicitar ao agente um commit de alterações feitas — \"faz o commit\", \"commita\", \"commit e push\", \"pode commitar\", \"sobe essas alterações\", \"commit this\" — mesmo que ele não mencione issue, comentário ou relatório. Use também quando o usuário pedir para explicar, resumir ou documentar os commits recentes de uma branch, ou para comentar na issue o que foi feito. O comentário sempre informa se foram ou não feitas migrações."
---

# Comentário na issue a cada commit

Quando o usuário pede um commit, o trabalho só termina quando a issue ligada à branch recebe um comentário explicando o que mudou. O leitor é um dev que não acompanhou o trabalho e vai ler só o comentário: ele precisa entender o que passou a funcionar, o que não mudou, se há migração para aplicar e o que merece conferência humana.

O pedido de commit já autoriza a publicação do comentário. Não pergunte "posso comentar na issue?"; publique e informe o link. Só deixe de publicar nos casos descritos em [Quando não publicar](#quando-não-publicar).

Esta skill não pressupõe stack, pasta nem ferramenta. Tudo o que depende do projeto (branch base, camadas, pasta de migrações, comandos de verificação, idioma, onde ficam as issues) é descoberto no próprio repositório a cada uso.

## Contexto do projeto

Antes de escrever, descubra como o projeto funciona. O que as instruções do projeto disserem vale mais do que qualquer padrão desta skill.

- Leia, se existirem e ainda não estiverem no contexto: `AGENTS.md`, `CLAUDE.md`, `README.md`, `CONTRIBUTING.md` e as rules do projeto (`.agents/rules/`, `.cursor/rules/` ou equivalente).
- Descubra a stack e os comandos reais pelo manifesto (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `Makefile`, `composer.json` etc.). Use só comandos que existem nele; nunca cite um script que o projeto não tem.
- Respeite as restrições do projeto (ex.: migrações, seeds e deploys só por humanos; convenção de mensagem de commit; branches protegidas).
- Se as instruções do projeto tiverem uma seção de configuração para esta skill, use os valores dela. Os itens possíveis, todos opcionais, são:

| Item | Sem configuração |
|---|---|
| Branch base | a indicada nas instruções do projeto; senão a padrão do remoto (`git symbolic-ref refs/remotes/origin/HEAD`); senão `main` |
| Mapa de camadas | classificação pela pasta de cada arquivo, conforme a arquitetura que o projeto descreve |
| Pasta e registro de migrações | descobertos conforme a seção [Migrações](#migrações) |
| Comandos de verificação | os que o manifesto define (lint, typecheck, testes, build, E2E) |
| Idioma do comentário | o idioma em que as issues do projeto são escritas; na dúvida, o idioma do usuário |
| Pasta dos relatórios em arquivo | `docs/reports/`; senão `docs/` |

## Fluxo

1. **Levante o contexto do projeto** (seção acima).
2. **Confira o que vai entrar no commit** (seção [Antes do commit](#antes-do-commit)).
3. **Faça o commit** como o usuário pediu, seguindo as convenções de commit do projeto.
4. **Descubra a issue ou as issues** (seção abaixo).
5. **Confira os comentários já publicados** para não duplicar (seção [Duplicidade e commits reescritos](#duplicidade-e-commits-reescritos)).
6. **Levante os dados** dos commits que entram no comentário.
7. **Escreva o comentário** no modelo desta skill, em um arquivo temporário fora do repositório (diretório de scratch da sessão ou `mktemp`). Um arquivo dentro do repositório ficaria como alteração não commitada logo após o commit.
8. **Publique** com a CLI do host do repositório. No GitHub: `gh issue comment <número> --body-file <arquivo>`. No GitLab: `glab issue note <número> --message "$(cat <arquivo>)"`. Descubra o host por `git remote get-url origin`.
9. **Informe ao usuário** o hash do commit, o link do comentário (a saída da CLI), se ele foi criado ou atualizado, e a linha de migrações.

Se o usuário pediu também o push, a ordem entre push e comentário não importa; o host transforma o hash em link assim que o commit chega ao remoto.

## Antes do commit

O comentário vai descrever publicamente o que entrou no commit, então vale conferir o conteúdo antes de ele existir. Olhe `git status` e o diff do que será commitado e procure:

- segredos: `.env` e variantes, chaves privadas, tokens, senhas ou credenciais em qualquer arquivo;
- artefatos gerados que o projeto não versiona (saídas de build, cobertura, relatórios de teste, caches);
- arquivos sem relação com o pedido, como alterações de outra tarefa que já estavam na worktree;
- binários grandes ou dumps de dados.

Adicione os arquivos pelo nome em vez de `git add -A`, para que só entre o que foi conferido. Se encontrar algo da lista, pare e pergunte ao usuário antes de commitar; segredo commitado continua no histórico mesmo depois de removido.

Se a branch atual for a padrão do repositório ou uma branch protegida, avise e confirme com o usuário antes de commitar, a menos que as instruções do projeto digam que commits diretos nela são o fluxo normal.

## Descobrir a issue

Use a primeira fonte que der resultado:

1. Número ou link de issue indicado pelo usuário no pedido.
2. Nome da branch, conforme a convenção do projeto. Formatos comuns: `642-descricao`, `feature/642-descricao`, `fix/issue-642`, `issue-642-descricao`. Quando houver mais de um número (`619-issue-43-...`), olhe as branches e os commits anteriores do repositório para saber qual deles é o número da issue no host; na dúvida, confira o título de cada candidata.
3. Referência na mensagem do commit (`#642`, `Refs #642`) ou no PR/MR aberto da branch (no GitHub, `gh pr view --json closingIssuesReferences,body`).

Confirme que a issue existe e que o título combina com o trabalho (no GitHub, `gh issue view <número> --json number,title,state`). Um número que aponta para uma issue sem relação com as alterações é pior do que nenhum comentário: nesse caso, pergunte ao usuário. Uma issue fechada ainda recebe o comentário; avise o usuário de que ela está fechada.

### Mais de uma issue

Quando os commits se referem a mais de uma issue (o usuário citou várias, ou as mensagens de commit apontam para issues diferentes), cada uma recebe um comentário com a parte que lhe diz respeito:

- se dá para separar os commits por issue, cada comentário cobre só os commits daquela issue;
- se um mesmo commit serve a várias, a issue da branch recebe o comentário completo e as outras recebem um comentário curto (Resumo do que as afeta, linha de Migrações, Pendências e o link do comentário completo).

Nunca omita a linha de Migrações nem as Pendências em nenhum deles: quem acompanha só uma das issues também precisa saber o que há para aplicar.

## Quando não publicar

Nestes casos, salve o comentário em arquivo, mostre o caminho e diga o motivo; o commit em si continua valendo:

- nenhuma issue foi encontrada pelas três fontes (pergunte o número ao usuário e publique quando ele responder);
- a CLI do host não está instalada ou autenticada, ou as issues ficam em um tracker sem CLI disponível (ex.: Jira, Linear sem integração configurada);
- o usuário pediu explicitamente para não comentar.

## Duplicidade e commits reescritos

Todo comentário termina com um marcador invisível que lista os hashes completos dos commits cobertos:

```html
<!-- comentario-issue-commit commits=<hash completo>,<hash completo> -->
```

Antes de publicar, leia os comentários da issue que têm esse marcador. No GitHub:

```bash
gh api "repos/{owner}/{repo}/issues/<número>/comments" --paginate \
  --jq '.[] | select(.body | contains("<!-- comentario-issue-commit")) | {id, html_url, autor: .user.login, marcador: (.body | capture("(?<m><!-- comentario-issue-commit[^>]*-->)").m)}'
```

Com isso, decida:

- **Os commits já estão cobertos** por um marcador: não publique de novo. Informe o link do comentário existente.
- **Um commit coberto foi reescrito** (`git commit --amend`, rebase, squash): o hash do marcador deixou de ser ancestral de `HEAD` (`git merge-base --is-ancestor <hash> HEAD` falha) e o commit novo ocupa o lugar dele. Atualize o comentário antigo em vez de criar outro, com o conteúdo refeito a partir do diff atual, o marcador com os hashes novos e, logo abaixo do título, a linha `Atualizado em <data>: <hash antigo> foi reescrito como <hash novo>.` (hashes em crase, 7 caracteres). No GitHub: `gh api -X PATCH "repos/{owner}/{repo}/issues/comments/<id>" -F body=@<arquivo>`.
- **Commits novos**, sem relação com os marcadores existentes: publique um comentário novo.

Só atualize comentários do próprio usuário autenticado (`gh api user --jq .login`). Se o comentário a atualizar for de outra pessoa, publique um novo e cite o anterior. Em outros hosts, use o equivalente da API (no GitLab, `glab api` nas notas da issue); se não houver como editar, publique um novo dizendo qual comentário ele substitui.

## Quais commits entram

- Padrão: os commits criados neste pedido. Cada pedido de commit gera um comentário, então commits anteriores já foram comentados na vez deles; os marcadores da issue confirmam isso.
- Se o usuário indicar um intervalo ou hashes, use exatamente o que ele indicou.
- Se o pedido for só explicar os commits recentes (sem commit novo), use `@{upstream}..HEAD`. Sem upstream, use `<branch-base>..HEAD` e avise no topo que a branch ainda não foi publicada. Se o intervalo estiver vazio porque tudo já foi enviado, diga isso no topo.
- A branch base é a definida em [Contexto do projeto](#contexto-do-projeto).
- Cite um commit anterior só quando ele explicar algo do commit novo (por exemplo, a origem de um teste quebrado), em uma frase, sem subseção própria.

## Como levantar os dados

- Use `git log --reverse` (do mais antigo ao mais novo), `git show --stat` e `git show`/`git diff` no intervalo.
- Descreva só o que está no diff. Não invente arquivo, função ou comportamento. Confira afirmações sobre código fora do diff (ex.: "a API não é chamada") lendo o arquivo.
- Alterações que ficaram fora do commit entram na seção "Alterações não commitadas".
- Nunca copie para o comentário valores de variáveis de ambiente, tokens, chaves ou dados pessoais vistos no diff ou em saídas de comando. A issue é lida por mais gente do que o repositório local; cite só o nome da variável.

### Migrações

Todo comentário informa se houve ou não migração, mesmo quando a resposta é não. Quem lê a issue precisa saber, sem abrir o diff, se há algo a aplicar no banco antes de testar.

- Descubra onde o projeto guarda migrações: primeiro nas instruções dele; senão, procure as pastas usuais da stack (`supabase/migrations/`, `prisma/migrations/`, `drizzle/`, `db/migrate/`, `alembic/versions/`, `<app>/migrations/` do Django, `src/main/resources/db/migration/`, `database/migrations/`, `migrations/`). Mudança em arquivo de schema declarativo (`schema.prisma`, `schema.rb`, `schema.sql`) também conta.
- Verifique com `git diff --name-status <intervalo> -- <pasta de migrações>` e olhe também as alterações não commitadas.
- Projeto sem banco ou sem migrações versionadas: escreva `**Migrações:** não se aplica (projeto sem migrações versionadas).`
- Sem migração: escreva `**Migrações:** nenhuma.` no topo e `**Sem migração nova.**` na lista do Resumo.
- Com migração: liste cada arquivo no topo com o estado (`pendente de aplicação` ou `aplicada em <ambiente>`). O estado vem do registro que o projeto mantiver (um arquivo de migrações aplicadas, por exemplo) ou de confirmação do usuário na conversa; sem um dos dois, é `pendente de aplicação`. Se o projeto aplica migrações automaticamente no deploy, diga isso em vez de "pendente". Repita a pendência em Áreas de atenção.
- Migração alterada ou removida também conta: diga qual arquivo e o que mudou.
- Esta skill só relata: não aplique migração nem marque uma como aplicada por causa dela.

### Verificação

Mostre a saída real dos comandos, não um resumo de memória. Reaproveite verificações já rodadas nesta sessão sobre o mesmo estado do código. Se algo não rodou, rode o que for proporcional à mudança (ao menos os testes da área tocada) ou escreva "não rodado". Quando uma falha ou aviso não vier dos commits registrados, diga de onde vem (commit anterior da branch ou já existente na branch base), conferindo em vez de supor.

## Modelo do comentário

```markdown
# Resumo de mudanças — branch `<nome-da-branch>`

Intervalo: `<intervalo ou hash>`. Entraram <N> commits.
**Migrações:** nenhuma. | <N> — `<arquivo>` (pendente de aplicação)

## Resumo

<Parágrafo 1: o que passou a funcionar, na visão do usuário ou do produto (tela, rota, comando ou endpoint afetado).>

<Parágrafo 2: qual era o problema antes e a causa técnica dele.>

- **Sem migração nova.** <frase de porquê> (ou **Migração nova.** <o que ela faz e que está pendente>)
- **Sem mudança de contrato da API.** <frase de porquê>
- <outros itens do que NÃO mudou e importa saber: **Sem env nova.**, **Sem dependência nova.**, **Permissões intactas.**, **Serviço X intacto.**>

<Quando o fluxo de dados mudou, um bloco text:>
Antes:   <origem> ──> <destino>        <observação curta>
Depois:  <origem> ──> <destino>

## Pendências

- [ ] <ação que um humano precisa fazer, com o alvo exato>
<ou "Nenhuma.">

## Como testar

1. <pré-condição ou passo>
2. <passo>

Resultado esperado: <o que deve acontecer>

## 1. Linha do tempo

| Commit | Camadas | Resumo |
|---|---|---|
| `<hash 7 chars>` | Backend, Contrato, Frontend | Frase curta do que o usuário ganha |

---

## 2. Commits

<details>
<summary><code><hash></code> — <título curto> · <Camadas></summary>

<conteúdo conforme "Seção de cada commit">

</details>

---

## 3. Alterações não commitadas

<Mesmo formato de um commit, também dentro de <details>, ou "Nenhuma.">

---

## 4. Áreas de atenção

<Lista curta, ou "Nenhuma.">

## 5. Verificação

<bloco text com comando e resultado, um por linha>
<comando de lint>         <resultado>
<comando de typecheck>    <resultado ou "não se aplica">
<comando de testes>       <resultado: suítes e testes>
<comando de build>        <resultado ou "não rodado">
<comando de E2E>          <resultado ou "não rodado">

---

<sub>Comentário gerado por um agent de IA (<nome do agent ou modelo>) a partir do diff de `<intervalo ou hash>`, em <AAAA-MM-DD>. Confira no código antes de tratar como fonte única.</sub>

<!-- comentario-issue-commit commits=<hashes completos separados por vírgula> -->
```

O rodapé de autoria deixa claro para quem lê a issue que o texto veio de um agent e de qual diff, o que ajuda a calibrar a confiança e a refazer a conferência. Use a data real (`date +%F`), não uma data suposta.

### Pendências

Lista de tarefas com tudo o que um humano precisa fazer para a mudança valer, cada item com o alvo exato. Caixas de marcar deixam visível na issue o que já foi feito e o que falta, e o host mostra o progresso.

- ``- [ ] Aplicar a migração `<arquivo>` em <ambiente>`` para cada migração pendente;
- variáveis de ambiente a criar (só o nome, nunca o valor) e em quais ambientes;
- scripts a rodar à mão (seed, backfill), jobs a agendar, permissões ou configurações a ajustar em serviços externos;
- snapshots ou baselines a regravar.

Liste só ações reais derivadas do diff e das instruções do projeto. Sem pendência, escreva "Nenhuma." em vez de uma lista vazia. Não marque nenhuma caixa: quem marca é quem executou.

### Como testar

Passos manuais curtos para quem vai validar a mudança, escritos a partir do diff:

- comece pelas pré-condições (pendências que precisam estar feitas, papel ou perfil de usuário, dado necessário);
- diga onde ir (tela, rota, comando ou endpoint) e o que fazer, em passos numerados;
- termine com o resultado esperado e, quando o commit corrige um bug, com o que acontecia antes;
- inclua um caso que não deve mudar quando houver risco de regressão (ex.: outro papel continua sem acesso).

Não invente passo que o diff não sustenta. Para mudança sem efeito observável (refatoração, tooling, docs), escreva o que comprova que nada quebrou, como o comando de teste da área, ou "Não se aplica (sem mudança de comportamento)."

### Camadas

Use sempre com inicial maiúscula e nesta ordem, listando só as realmente tocadas:

| Camada | O que entra |
|---|---|
| Banco | migrações, schema, seeds, tipos gerados do banco |
| Backend | rotas de API, serviços, regras de negócio server-side, jobs, middleware |
| Contrato | tipos/schemas compartilhados entre camadas, formato de request/response |
| Frontend | páginas, componentes, hooks, estilos, estado de UI |
| Tooling | manifesto e lockfile, configs de build/lint/teste/deploy, CI, scripts |
| Docs | documentação, instruções para agents, specs e PRDs |
| Testes | testes unitários, de integração e E2E, fixtures |

Se o projeto tiver um mapa de camadas configurado, use-o. Senão, classifique cada arquivo pela pasta onde ele está, conforme a arquitetura descrita no próprio projeto (o mapa de pastas do `AGENTS.md` ou do `README.md`, quando existir). Projeto sem uma das camadas (ex.: só backend, ou uma biblioteca sem banco) simplesmente não a usa.

Na Linha do tempo há uma linha por commit, e o resumo diz o efeito da mudança, não o nome dos arquivos.

### Seção de cada commit

Uma subseção por commit, na mesma ordem da tabela. Cada uma fica dentro de `<details>`, para que a issue mostre de imediato o Resumo, as Pendências e o Como testar, e o detalhe por commit abra sob demanda. No `<summary>`, use `<code>` no hash (crase não é renderizada ali) e deixe uma linha em branco depois dele, senão o Markdown de dentro não é renderizado. Um comentário com um único commit pequeno (1–3 linhas) dispensa o `<details>`.

1. Parágrafo de abertura (2–4 linhas): o que mudou e por quê, na visão do usuário ou do produto.
2. Quando o commit trocar um comportamento, mostre **Antes** e **Depois** (com bloco de código se for comando, fluxo ou layout de tela).
3. Um parágrafo por camada tocada, com o rótulo em negrito e ponto final, nesta ordem: **Banco.** **Backend.** **Contrato.** **Frontend.** **Tooling.** **Docs e testes.**
4. Em cada parágrafo de camada:
   - cite o caminho do arquivo com crase e marque `(novo)` ou `(removido)` quando for o caso;
   - diga o que cada arquivo faz e a função/classe/componente principal, não só que "foi alterado";
   - agrupe arquivos que só foram adaptados no fim da frase ("X, Y e Z foram adaptados");
   - explique decisões não óbvias (o porquê), como a causa de um bug corrigido;
   - em **Banco.**, diga se a migração já foi aplicada ou está pendente;
   - em **Backend.**, diga como a autenticação/autorização da rota ficou quando isso mudou.
5. Mencione testes novos ou ajustados com os identificadores (`UT-`, `IT-`, `E2E-` ou o padrão do projeto) quando existirem.
6. Se o commit tocar só uma área ou aplicação, diga isso ("Só o site mudou").

Commits muito pequenos (typo, ajuste de cor) ganham 1–3 linhas, sem parágrafo por camada.

### Áreas de atenção

Só o que merece conferência humana. Ações a executar ficam em Pendências; aqui entra o que precisa ser revisado ou conhecido, sem repetir a lista de lá:

- migrações ou mudanças de schema (o risco delas: dado afetado, ordem de aplicação, reversibilidade);
- mudanças em autenticação, autorização, permissões ou isolamento de dados (multi-tenant);
- arquivos removidos que podem ter outros usos;
- dependências, variáveis de ambiente, jobs agendados ou scripts novos;
- scripts que alteram dados reais (seed, backfill, teardown);
- mudanças que exigem regravar snapshots ou baselines visuais;
- dívida criada ou deixada (anti-padrões citados nas instruções do projeto);
- testes que não foram rodados;
- o que NÃO foi tocado quando isso for relevante.

## Regras de estilo

- Markdown, no idioma definido em [Contexto do projeto](#contexto-do-projeto). Os títulos e rótulos do modelo estão em português; traduza-os quando o comentário for em outro idioma.
- Hash sempre em crase, 7 caracteres.
- Nomes de arquivo, função, classe, componente, rota, parâmetro e variável sempre em crase.
- Frases diretas, sem adjetivo de marketing ("poderoso", "robusto").
- Nada de emoji.
- Não repita no parágrafo o que a tabela da Linha do tempo já disse; acrescente detalhe.
- Não proponha melhorias nem refatorações que não foram pedidas.
- Não escreva `@nome` nem `#número` soltos no texto. O host notifica a pessoa mencionada e cria uma referência cruzada na issue ou PR citada, mesmo quando o texto era um decorator (`@Injectable`), uma regra CSS (`@media`) ou um número qualquer. Dentro de crase nada disso é acionado, então use crase. Cite outra issue ou pessoa só quando a referência for intencional.
- Não use palavras de fechamento (`Closes`, `Fixes`, `Resolves` seguidas de número de issue) no comentário nem as acrescente à mensagem do commit por conta própria. Em mensagem de commit e descrição de PR elas fecham a issue no merge; isso é decisão do usuário.
- Hosts limitam o tamanho do comentário (no GitHub, 65.536 caracteres). Se passar disso, encurte os parágrafos por camada dos commits menores; não corte Resumo, Migrações, Áreas de atenção nem Verificação.

## Limites

- Além do commit pedido, esta skill não cria nem edita arquivos de código, não aplica migrações e não roda seeds nem deploys.
- A única edição permitida em comentários existentes é a atualização descrita em [Duplicidade e commits reescritos](#duplicidade-e-commits-reescritos). Não apague comentários nem edite os de outras pessoas, a menos que o usuário peça.
- Se o usuário pedir o relatório também em arquivo, salve na pasta de relatórios definida em [Contexto do projeto](#contexto-do-projeto), em kebab-case: `resumo-commit-<hash>-<tema>.md` para um commit, `resumo-mudancas-<branch-ou-issue>-<tema>.md` para vários. Esse arquivo fica fora do commit já feito; avise o usuário.

## Funcionalidade grande

Quando o usuário pedir "documente a funcionalidade" em vez de explicar commits (entrega com várias idas e vindas), use a estrutura de `references/funcionalidade-grande.md` no lugar da Linha do tempo e da seção Commits. A linha de migrações, as Pendências, o Como testar, o rodapé com o marcador, as regras de estilo e a publicação na issue continuam iguais.
