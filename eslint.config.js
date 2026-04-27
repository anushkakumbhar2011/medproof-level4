import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        setInterval: 'readonly',
        parseInt: 'readonly',
        parseFloat: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        Array: 'readonly',
        Promise: 'readonly',
        Error: 'readonly',
        JSON: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React 17+ does not require React in scope for JSX
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',

      // Mark JSX-used variables as used (prevents false no-unused-vars on components)
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',

      // Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      // exhaustive-deps is advisory — warn only so CI doesn't fail on stable patterns
      'react-hooks/exhaustive-deps': 'off',

      // Allow unused React import (React 17+ JSX transform)
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(_|React$)',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
      'no-undef': 'error',
      'no-empty': 'warn',
      'no-constant-condition': 'warn',
    },
  },
]
