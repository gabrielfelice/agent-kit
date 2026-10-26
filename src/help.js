export const HELP = `agent-kit: leva rules, skills e MCPs para o repositório atual (Claude Code e Codex).

Uso:
  npx @gabrielfelice/agent-kit [comando] [opções]

Comandos:
  add        Escolhe e instala itens do catálogo (padrão). Sem flags, abre o menu interativo.
  list       Mostra o catálogo e o que já está instalado neste repositório.
  update     Reinstala os itens do manifesto com a versão atual do kit.
  remove     Remove itens instalados pelo kit. Sem flags, abre o menu interativo.
  snippet    Mostra o trecho sugerido para o AGENTS.md / CLAUDE.md.

Opções:
  --agents claude,codex    Agentes de destino (padrão: os do manifesto, ou todos).
  --rules a,b              Rules por nome.
  --skills a,b             Skills por nome.
  --mcps a,b               MCPs por nome.
  --dir <caminho>          Repositório de destino (padrão: diretório atual).
  --copy                   Copia para .claude/ em vez de criar symlinks.
  --force                  Sobrescreve arquivos e MCPs que não foram criados pelo kit.
  -y, --yes                Não pede confirmação.
  -h, --help               Mostra esta ajuda.
`;
