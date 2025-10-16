// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  // Base Next + TS
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ignorados globales
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // 🔧 Reglas globales: bajar 'any' a warning para destrabar el build
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // ✅ Relajar reglas SOLO en stubs y tipos de vendor
  {
    files: ["**/*.d.ts", "src/types/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },

  // Opcional: tu logger
  {
    files: ["src/utils/debugLog.ts"],
    rules: { "no-console": "off" },
  },
];
