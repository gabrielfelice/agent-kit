const PLACEHOLDER = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

export const ENV_FORMAT = Object.freeze({
  vscode: (name) => `\${env:${name}}`,
  opencode: (name) => `{env:${name}}`,
});

export const mapEnvPlaceholders = (env, format) =>
  Object.fromEntries(
    Object.entries(env).map(([key, value]) => [key, String(value).replace(PLACEHOLDER, (_, name) => format(name))]),
  );
