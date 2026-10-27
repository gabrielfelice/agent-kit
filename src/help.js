export const HELP = `agent-kit: leva rules, skills e MCPs para o repositório atual (Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI e OpenCode).

Uso:
  npx @gabrielfelice/agent-kit [comando] [opções]

Comandos:
  add        Escolhe e instala itens do catálogo (padrão). Sem flags, abre o menu interativo.
  list       Mostra o catálogo e o que já está instalado neste repositório.
  update     Reinstala os itens do manifesto com a versão atual do kit.
  remove     Remove itens instalados pelo kit. Sem flags, abre o menu interativo.
  snippet    Mostra o trecho sugerido para o AGENTS.md / CLAUDE.md / GEMINI.md.

Opções:
  --agents claude,codex    Agentes de destino: claude, codex, cursor, copilot, gemini, opencode
                           (padrão: os do manifesto, ou claude,codex).
  --rules a,b              Rules por nome.
  --skills a,b             Skills por nome.
  --mcps a,b               MCPs por nome.
  --dir <caminho>          Repositório de destino (padrão: diretório atual).
  --copy                   Copia nos diretórios dos agentes em vez de criar symlinks.
  --force                  Sobrescreve arquivos e MCPs que não foram criados pelo kit.
  -y, --yes                Não pede confirmação.
  -h, --help               Mostra esta ajuda.
`;
