import { parseCli } from "./args.js";
import { COMMANDS } from "./commands.js";
import { HELP } from "./help.js";

const HELP_COMMAND = "help";

export const run = async (argv) => {
  const options = parseCli(argv);
  if (options.help || options.command === HELP_COMMAND) {
    console.log(HELP);
    return;
  }
  const handler = COMMANDS[options.command];
  if (!handler) {
    throw new Error(`Comando desconhecido: ${options.command}. Use --help para ver os comandos.`);
  }
  await handler(options);
};
