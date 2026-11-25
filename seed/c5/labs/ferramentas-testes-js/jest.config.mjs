export default {
  testMatch: ['<rootDir>/jest/**/*.test.mjs'],
  transform: {},                       // ESM nativo: sem Babel
  coverageProvider: 'v8',
  collectCoverageFrom: ['src/dominio.mjs', 'src/servico.mjs'],
  coverageReporters: ['text-summary', 'text']
};
