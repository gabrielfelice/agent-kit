const CREATED = "✔";
const SKIPPED = "↷";
const REMOVED = "✖";

export const renderInstall = ({ context }) => [
  ...context.files.map((file) => `${CREATED} ${file}`),
  ...context.mcpFiles.map((entry) => `${CREATED} ${entry}`),
  ...context.skipped.map(({ path, reason }) => `${SKIPPED} ${path}: ${reason}`),
];

export const renderRemove = ({ removed, files, ignored }) => [
  ...removed.map((key) => `${REMOVED} ${key}`),
  ...files.map((file) => `  ${file}`),
  ...ignored.map((key) => `${SKIPPED} ${key}: não está instalado por este agent-kit`),
];
