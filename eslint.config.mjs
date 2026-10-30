import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
    rules: {
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-assign-module-variable": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn"
    }
  }
];
