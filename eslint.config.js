import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const tsRecommendedRules = tsPlugin.configs.recommended?.rules ?? {};
const reactRecommendedRules = reactPlugin.configs.flat?.recommended?.rules ?? {};
const reactJsxRuntimeRules = reactPlugin.configs.flat?.['jsx-runtime']?.rules ?? {};
const reactHooksRecommendedRules = reactHooksPlugin.configs.flat?.recommended?.rules ?? {};

export default [
    {
        ignores: ['dist/**', 'node_modules/**', 'snapshot/**', 'public/**'],
    },
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                chrome: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            ...tsRecommendedRules,
            ...reactRecommendedRules,
            ...reactJsxRuntimeRules,
            ...reactHooksRecommendedRules,
            'no-undef': 'off',
            'no-useless-escape': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            'react-hooks/set-state-in-effect': 'off',
        },
    },
];
