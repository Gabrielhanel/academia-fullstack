export default [{
  files: ['**/*.mjs'],
  languageOptions: { ecmaVersion: 2026, sourceType: 'module' },
  rules: {
    complexity: ['warn', 5],
    'max-depth': ['warn', 3],
    'max-params': ['warn', 4],
    'max-lines-per-function': ['warn', { max: 20, skipBlankLines: true, skipComments: true }],
    'no-magic-numbers': ['warn', { ignore: [0, 1, -1, 2, 100], ignoreArrayIndexes: true }],
    eqeqeq: 'warn'
  }
}];
