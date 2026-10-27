Dá ao agente controle de um Chromium do Playwright, com janela visível, para percorrer jornadas de ponta a ponta: clicar, preencher formulários e conferir o resultado. É o mais indicado para validar fluxos de E2E.

A sessão é isolada (`--isolated`): cada execução começa sem cookies nem logins. Na primeira vez, o Playwright pode precisar baixar o Chromium. Convive com o `chrome-devtools`, mas cada MCP acrescenta as próprias ferramentas ao contexto do agente.
