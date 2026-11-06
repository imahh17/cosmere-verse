import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

export default defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      '.astro/**',
      'coverage/**',
      // Vendored Impeccable skill (third-party scripts) and its working files.
      '.claude/skills/**',
      '.impeccable/**',
    ],
  },
  tseslint.configs.strict,
  astro.configs.recommended,
  prettier,
  {
    rules: {
      // Enforce strict typing — `any` is forbidden per project standards.
      '@typescript-eslint/no-explicit-any': 'error',

      // Require explicit return types on public function signatures.
      '@typescript-eslint/explicit-function-return-type': 'warn',

      // Disallow unused variables; allow underscore-prefixed intentional ignores.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Enforce `import type` for type-only imports (compile-time safety).
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Warn on console usage; prefer a structured logger in production code.
      'no-console': 'warn',
    },
  },
  {
    // Config files are plain JS run by Node, not typed project code.
    files: ['*.config.{js,mjs}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
);
