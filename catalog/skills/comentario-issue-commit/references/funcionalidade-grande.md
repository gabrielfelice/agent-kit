# Variação: documentar uma funcionalidade grande

Use quando a entrega teve várias idas e vindas e o pedido é "documente a funcionalidade", não "explique os commits". Em vez da linha do tempo por commit, organize o comentário assim:

```markdown
# <Funcionalidade> — <frase de uma linha>

Tela/rota/endpoint, origem da demanda (link para a issue, PRD ou spec).
**Migrações:** nenhuma. | <N> — `<arquivo>` (pendente de aplicação)

## Resumo

O que passou a funcionar, o problema anterior e a causa. Diga explicitamente o que NÃO mudou
(sem migração, permissões intactas, fluxo X intacto). Use tabela Antes × Depois com casos
concretos.

## Histórico de ajustes (em ordem)

Tabela: # | Ajuste | Onde. Registre também ajustes revertidos e o estado final.

## Como a funcionalidade funciona

Subseções por assunto (o que entra, campos, regras, filtros, ordenação, totais, paginação,
permissões), com tabelas quando houver mais de dois itens comparáveis.

## Alterações no código

Uma tabela por pasta de primeiro nível tocada: Arquivo | Alteração, marcando `(novo)`.
Termine com "O que não mudou".

## Testes

Tabela: Arquivo | Cobertura, e a última execução em bloco de texto.
```

Do modelo principal continuam valendo:

- "Pendências" e "Como testar", logo depois do Resumo;
- "Áreas de atenção" e "Verificação", depois de "Testes", quando houver algo a registrar;
- o rodapé de autoria e o marcador invisível com os hashes cobertos, no fim do comentário.
