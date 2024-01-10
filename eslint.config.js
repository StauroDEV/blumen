import stylistic from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import ts from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import js from '@eslint/js'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { files: ['src/**/*.ts', 'eslint.config.js'], ...js.configs.recommended },
  { files: ['src/**/*.ts', 'eslint.config.js'], ...stylistic.configs['recommended-flat'] },
  { files: ['src/**/*.ts', 'eslint.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals[''],
      },
      parser: tsParser,
      parserOptions: {
        config: './tsconfig.json',
        ecmaFeatures: { modules: true },
        ecmaVersion: 'latest',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      ts,
    },
    rules: {
      ...ts.configs['eslint-recommended'].rules,
      ...ts.configs['recommended'].rules,
      '@stylistic/max-len': ['error', { code: 120 }],
      'no-var': 'error',
    },
  },
]
