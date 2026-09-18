// Minimal, zero-config-flat ESLint setup for the backend so `npm run lint`
// actually runs (previously the script existed but eslint was neither
// installed nor configured). TypeScript-aware, no formatting rules —
// formatting is owned by editors/Prettier on the frontend side.
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "uploads/**"],
  },
  ...tseslint.configs.recommended.map((cfg) =>
    cfg.files?.includes("**/*.ts") ? cfg : { ...cfg, files: ["src/**/*.ts", "test/**/*.ts"] },
  ),
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
    },
    rules: {
      // The existing codebase uses targeted `any` at Mongo/Express boundaries
      // (e.g. `(stream as any).host`); new code must avoid it, but flagging
      // every legacy one as an error would make lint unusable. Keep it
      // visible as a warning instead.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
);
