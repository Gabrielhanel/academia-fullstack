export default [{ files: ['analise/lint-alvo.mjs'], languageOptions: { ecmaVersion: 2026, sourceType: 'module' },
  rules: { 'no-unused-vars': 'error', 'no-undef': 'error', eqeqeq: 'error', 'no-var': 'error', 'prefer-const': 'error', complexity: ['warn', 5], 'no-nested-ternary': 'warn' } }];
