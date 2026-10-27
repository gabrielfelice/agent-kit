Exigências permanentes sobre testes:

- todo código de produção precisa de teste; código sem teste é considerado incompleto;
- cobertura global mínima de 80% (statements, branches, functions e lines), com o CI falhando abaixo disso e sem esconder código com diretivas de exclusão;
- durante o trabalho, rodar só os testes do que mudou; a suíte completa com cobertura fica para o fim;
- pirâmide de testes: muitos unitários, poucos de integração e só as jornadas críticas em E2E, numa pasta própria (como `e2e/`);
- DOM simulado só nos testes que precisam dele, e prioridade para fluxos de maior risco (dinheiro, autenticação, dados pessoais etc.).

A skill `testes` complementa esta rule com práticas para escrever e revisar os testes.
