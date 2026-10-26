# Estrutura modular

O repositório usa npm workspaces para separar pontos de bootstrap, módulos de domínio e infraestrutura. A organização deve manter fronteiras lógicas reversíveis, sem definir fronteiras de deploy além da aplicação que as compõe.

```text
.
├── apps/
│   └── web/                    # Bootstrap do framework web, páginas e rotas HTTP
├── packages/
│   ├── <dominio>/              # Módulo de domínio autocontido
│   │   ├── src/                # API pública, casos de uso e adaptadores internos
│   │   └── tests/              # Testes isolados do módulo
│   └── shared/
│       └── <infraestrutura>/   # Capacidade técnica reutilizável
├── e2e/                        # Testes E2E do produto integrado
└── docs/                       # Documentação de produto, não código executável
```

## Apps

- `apps/` contém executáveis. Um app apenas compõe módulos e adapta o framework; não contém regra de negócio, acesso a dados ou entidades de domínio.
- Rotas HTTP são finas: validam a entrada de transporte e delegam para a API pública do módulo.
- Componentes de tela pertencem ao módulo de domínio que os representa. As rotas do app apenas importam seus exports públicos.

## Módulos de domínio

- Cada pasta em `packages/<dominio>/` é um bounded context com `package.json` e `exports` explícitos.
- Consumidores importam somente o nome público do pacote; nunca arquivos internos de outro módulo.
- Um módulo não importa implementações, repositórios ou entidades de outro módulo. A comunicação entre domínios ocorre por contrato HTTP, evento ou interface pública deliberada.
- Mantenha tipos, casos de uso, adaptadores HTTP e persistência próximos do domínio. Crie subpastas apenas quando houver código correspondente.
- Testes isolados do módulo ficam em `packages/<dominio>/tests/`; testes do app ficam em `apps/web/tests/`.

## Infraestrutura e dados

- `packages/shared/` contém apenas capacidades técnicas, como banco, configuração e logging. Nunca coloque regra de negócio em shared.
- Cada módulo é dono de suas tabelas e só acessa o próprio estado. O banco pode ser compartilhado, mas tabelas e schemas não são acessados diretamente por outros módulos.
- Clientes de banco e integrações externas ficam em `packages/shared/database/` ou em um adaptador interno do módulo proprietário.
- Agentes podem escrever migrations em `packages/shared/database/migrations/`, mas nunca as aplicam em banco algum. O agente avisa no início da tarefa que ela exige migration e, no fim, que há migration pendente.

## Dependências

- A direção permitida é `apps → API pública do módulo → infraestrutura`. Shared não importa domínios.
- Evite ciclos. Quando houver um conceito realmente transversal, extraia um contrato pequeno para infraestrutura neutra em vez de criar imports bidirecionais.
- Não crie pastas vazias nem `.gitkeep` para antecipar funcionalidades.
