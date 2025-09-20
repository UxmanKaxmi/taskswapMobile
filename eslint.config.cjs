const js = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: true,
        window: true,
        document: true,
        navigator: true,
        setTimeout: true,
        clearTimeout: true,
        require: true,
        process: true,
        __DEV__: true,
      },
    },
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
      '@typescript-eslint': tseslint,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react/react-in-jsx-scope': 'off',
      'import/no-unresolved': 'error',
      'import/no-named-as-default': 'warn',
      'import/no-extraneous-dependencies': 'warn',
      'import/no-duplicates': 'warn',
      'import/no-mutable-exports': 'warn',
      'import/no-cycle': 'warn',
      'case-sensitive-paths': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    files: ['*.config.js', 'metro.config.js', 'babel.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        require: true,
        module: true,
        __dirname: true,
        process: true,
        console: true,
      },
    },
  },
  {
    ignores: ['node_modules', 'ios', 'android', 'build', 'coverage'],
  },
];