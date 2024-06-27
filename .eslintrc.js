module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/errors',
        'plugin:import/typescript',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'promise', 'import'],
    rules: {
        indent: 'off',
        'linebreak-style': ['error', 'unix'],
        semi: ['off'],
        'no-console': ['off'],
        'no-case-declarations': ['off'],
        'prefer-const': [
            'error',
            {
                destructuring: 'all',
            },
        ],
        'no-param-reassign': 'off',
        'promise/catch-or-return': 'error',
        'promise/param-names': 'error',
        'promise/no-return-wrap': 'error',
        'no-async-promise-executor': 'off',
        'object-curly-spacing': ['error', 'always'],
        'keyword-spacing': [
            'error',
            {
                before: true,
                after: true,
            },
        ],
        'block-spacing': ['error', 'always'],
        'space-before-blocks': ['error', 'always'],
        'space-in-parens': ['error', 'never'],
        'comma-dangle': [
            'error',
            {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'never',
            },
        ], // 'brace-style': ['error', 'stroustrup'],
        'prefer-destructuring': [
            'error',
            {
                VariableDeclarator: {
                    array: false,
                    object: true,
                },
                AssignmentExpression: {
                    array: false,
                    object: false,
                },
            },
        ],
        'import/first': 'error',
        'import/order': [
            'error',
            { groups: [['builtin', 'external', 'internal']] },
        ],
        'import/no-unresolved': 'off',
        '@typescript-eslint/no-angle-bracket-type-assertion': ['off'],
        '@typescript-eslint/no-explicit-any': ['off'],
        '@typescript-eslint/no-empty-function': ['off'],
        '@typescript-eslint/semi': ['error'],
        '@typescript-eslint/member-delimiter-style': ['error'],
        '@typescript-eslint/explicit-member-accessibility': [
            'warn',
            { accessibility: 'no-public' },
        ],
        '@typescript-eslint/ban-types': [
            'error',
            {
                types: {
                    String: {
                        message: 'Use string instead',
                        fixWith: 'string',
                    },
                    '{}': {
                        message: 'Use object instead',
                        fixWith: 'object',
                    },
                    Function: false,
                    object: false,
                },
            },
        ],
        '@typescript-eslint/indent': [
            'error',
            4,
            {
                SwitchCase: 1,
                ignoredNodes: [
                    'FunctionExpression > .params[decorators.length > 0]',
                    'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
                    'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key',
                ],
            },
        ],
    },
    overrides: [
        {
            files: ['*.json'],
            rules: {
                quotes: ['error', 'double'],
                semi: ['error', 'never'],
                'comma-dangle': ['error', 'never'],
                '@typescript-eslint/semi': ['off'],
            },
        },
        {
            files: ['*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': ['off'],
            },
        },
    ],
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                moduleDirectory: ['node_modules', 'src/'],
            },
            typescript: {
                alwaysTryTypes: true, // always try to resolve types under `<roo/>@types` directory even if it doesn't contain any source code, like `@types/unist`
            },
        },
    },
};
