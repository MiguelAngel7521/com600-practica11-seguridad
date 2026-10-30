const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**', 'coverage/**', 'evidencias/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'tests/**/*.js', '*.cjs', 'jest.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: 'error'
    }
  },
  { files: ['tests/**/*.js'], languageOptions: { globals: globals.jest } }
];
