import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
    { ignores: ['dist', 'node_modules'] },
    {
        // Build-time files. These run in Node, not the browser, so `process`,
        // `__dirname` and friends are legitimately available here.
        files: ['vite.config.js', 'scripts/**/*.{js,mjs}', 'src/prerender.jsx'],
        languageOptions: {
            globals: { ...globals.node },
        },
    },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/jsx-uses-react': 'off',          // not needed in React 17+
            'react/react-in-jsx-scope': 'off',      // not needed in React 17+
            'react/jsx-uses-vars': 'error',         // <- this is the fix: marks JSX-referenced imports as used
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^(_|React$)',
                },
            ],
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-useless-escape': 'warn',
        },
    },
];