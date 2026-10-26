import js from "@eslint/js";
import globals from "globals";

const MAX_FILE_LINES = 100;
const MAX_FUNCTION_LINES = 30;
const MAX_PARAMS = 3;
const MAX_DEPTH = 3;

export default [
  { ignores: ["node_modules/", "catalog/", "coverage/"] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: globals.node },
    rules: {
      "max-lines": ["error", { max: MAX_FILE_LINES }],
      "max-lines-per-function": ["error", { max: MAX_FUNCTION_LINES }],
      "max-params": ["error", MAX_PARAMS],
      "max-depth": ["error", MAX_DEPTH],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      "no-nested-ternary": "error",
      "prefer-arrow-callback": "error",
      curly: ["error", "all"],
    },
  },
  { files: ["test/**"], rules: { "max-lines-per-function": "off" } },
];
