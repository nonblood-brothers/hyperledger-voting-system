import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(js.configs.recommended, importPlugin.flatConfigs.recommended, ...tseslint.configs.strictTypeChecked, {
    languageOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        parserOptions: {
            project: 'tsconfig.json',
            tsconfigRootDir: import.meta.dirname,
        },
    },
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {},
        },
    },
    rules: {
        'indent': 'error',
        'no-trailing-spaces': 'error',
        'quotes': ['error', 'single'],
        'import/order': ['error', {
            'newlines-between': 'always-and-inside-groups',
            'distinctGroup': true,
            'groups': ['type', 'builtin', 'parent', 'sibling', 'index'],
        }],
        'object-curly-spacing': ['error', 'always'],
        'import/no-named-as-default-member': 'off',
        'keyword-spacing': ['error'],
    }
});
