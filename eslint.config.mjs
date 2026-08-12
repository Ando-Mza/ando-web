import { defineConfig, globalIgnores } from "eslint/config";
// Reglas oficiales de Next.js: Core Web Vitals (a11y, next/image, next/link,
// hooks de React, etc.) más las reglas específicas de TypeScript de Next.
// Se usa el preset oficial en vez de armar uno propio para quedar alineados
// con las convenciones que el propio framework espera y actualiza en cada
// major (acá Next 16).
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
// Apaga las reglas de estilo de ESLint que chocarían con el formateo de
// Prettier (comillas, punto y coma, etc.). A propósito NO se usa un plugin
// que corra Prettier como regla de ESLint: en B-Ando y ando-app eso mezclaba
// diferencias de formato con errores reales de código (ver 6.2 del informe).
// Prettier corre desacoplado, como chequeo aparte ("npm run format:check").
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**", // build de salida de Next, no se lintea código generado
    "out/**",
    "build/**",
    "next-env.d.ts", // archivo de tipos autogenerado por Next
  ]),
]);

export default eslintConfig;
