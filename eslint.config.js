import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'
import { shadcnConfig } from './eslint-shadcn-rules.js'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // Shadcn-specific rules for components
  {
    files: ['src/components/**/*.{ts,tsx}'],
    ...shadcnConfig,
    rules: {
      ...shadcnConfig.rules,
      // Additional component-specific rules
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'react-hooks/exhaustive-deps': 'warn',
      // Enforce consistent prop destructuring
      'prefer-const': 'error',
      // Ensure proper React imports
      'react-refresh/only-export-components': ['warn', { 
        allowConstantExport: true 
      }]
    }
  }
])
