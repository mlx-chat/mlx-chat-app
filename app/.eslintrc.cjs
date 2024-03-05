const namingConventions = [
  'error',
  {
    format: ['camelCase'],
    selector: 'default',
  },
  {
    format: ['camelCase', 'UPPER_CASE'],
    selector: 'variable',
  },
  {
    format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
    modifiers: ['const', 'exported', 'global'],
    selector: 'variable',
  },
  {
    format: ['camelCase'],
    leadingUnderscore: 'allow',
    selector: 'parameter',
  },
  {
    format: ['camelCase'],
    leadingUnderscore: 'allow',
    modifiers: ['private'],
    selector: 'memberLike',
  },
  {
    format: ['PascalCase', 'UPPER_CASE'],
    selector: ['enum', 'enumMember'],
  },
  {
    format: ['PascalCase'],
    selector: 'typeLike',
  },
  {
    format: null,
    modifiers: ['destructured'],
    selector: 'variable',
  },
  {
    format: null,
    modifiers: ['requiresQuotes'],
    selector: [
      'classProperty',
      'objectLiteralProperty',
      'typeProperty',
      'classMethod',
      'objectLiteralMethod',
      'typeMethod',
      'accessor',
      'enumMember',
    ],
  },
  {
    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
    leadingUnderscore: 'allow',
    selector: 'import',
  },
];

const tsxNamingConventions = [
  {
    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
    leadingUnderscore: 'forbid',
    modifiers: ['global'],
    selector: ['variable', 'function'],
  },
];

module.exports = {
  env: {
    es2020: true,
  },
  extends: [
    'airbnb-base',
    'plugin:jsdoc/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:no-unsanitized/DOM',
  ],
  ignorePatterns: [
    'node_modules',
    'main',
    '.eslintrc.*',
    'out',
  ],
  overrides: [
    // Config files
    {
      files: [
        'common/**/*.ts*',
        '**/app*config.ts',
        '**/app*Config.ts',
      ],
      rules: {
        '@typescript-eslint/member-ordering': ['error', { default: { order: 'alphabetically' } }],
        'sort-keys': ['error', 'asc', { minKeys: 2, natural: true }],
      },
    },
    {
      files: [
        '*.ts*',
      ],
      rules: {
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': 'off', // Using unused-imports plugin instead
        '@typescript-eslint/space-before-function-paren': [
          'error',
          {
            anonymous: 'never',
            asyncArrow: 'always',
            named: 'never',
          },
        ],
        'no-redeclare': 'off', // @typescript-eslint/no-redeclare is enabled and is more correct
        'no-shadow': 'off', // @typescript-eslint/no-shadow is enabled and is more correct
        'no-undef-init': 'off',
        'no-unused-vars': 'off', // Using unused-imports plugin instead
        'space-before-function-paren': 'off', // Using @typescript-eslint/space-before-function-paren instead
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': ['error', {
          args: 'after-used',
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        }],
      },
    },
    {
      files: [
        'src/**/*.ts*',
      ],
      rules: {
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/dot-notation': ['error', { allowIndexSignaturePropertyAccess: true }],
        '@typescript-eslint/no-base-to-string': ['error', {
          ignoredTypeNames: ['Error', 'RegExp'],
        }],
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-for-in-array': 'error',
        '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
        '@typescript-eslint/no-throw-literal': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/non-nullable-type-assertion-style': 'error',
        '@typescript-eslint/prefer-includes': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/prefer-string-starts-ends-with': 'error',
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/space-infix-ops': 'error',
        'dot-notation': 'off',
        'no-throw-literal': 'off',
        'require-await': 'off',
        'space-infix-ops': 'off',
      },
    },
    {
      files: [
        '*.tsx',
      ],
      rules: {
        '@typescript-eslint/naming-convention': [
          ...namingConventions,
          ...tsxNamingConventions,
        ],
        '@typescript-eslint/require-await': 'error',
        'require-await': 'off',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'jest-formatting',
    'modules-newlines',
    'unused-imports',
  ],
  root: true,
  rules: {
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          object: {
            message: [
              'The `object` type is currently hard to use ([see this issue](https://github.com/microsoft/TypeScript/issues/21732)).',
              'Consider using `Record<string, unknown>` instead, as it allows you to more easily inspect and use the keys.',
            ].join('\n'),
          },
        },
      },
    ],
    'implicit-arrow-linebreak': 'off',
    '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/init-declarations': 'error',
    '@typescript-eslint/member-ordering': 'error',
    '@typescript-eslint/naming-convention': namingConventions,
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
    '@typescript-eslint/no-use-before-define': ['error', {
      functions: false,
    }],
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/type-annotation-spacing': 'error',
    'array-element-newline': ['error', 'consistent'],
    'block-spacing': 'off',
    camelcase: 'off', // Using @typescript-eslint/naming-convention instead.
    'comma-dangle': 'off',
    'default-param-last': 'off',
    'import/extensions': 'off',
    'import/no-relative-packages': 'off',
    'import/order': 'off',
    'import/prefer-default-export': 'off',
    'jsdoc/check-indentation': ['error', { excludeTags: ['description', 'example'] }],
    'jsdoc/check-line-alignment': 'error',
    'jsdoc/check-tag-names': ['error', {
      definedTags: ['jest-environment', 'jest-environment-options'],
    }],
    'jsdoc/no-bad-blocks': 'error',
    'jsdoc/no-multi-asterisks': 'off',
    'jsdoc/no-undefined-types': 'off',
    'jsdoc/require-jsdoc': 'off',
    'jsdoc/require-param': 'off',
    'jsdoc/require-param-description': 'off',
    'jsdoc/require-param-name': 'off',
    'jsdoc/require-param-type': 'off',
    'jsdoc/require-property': 'off',
    'jsdoc/require-property-description': 'off',
    'jsdoc/require-property-name': 'off',
    'jsdoc/require-property-type': 'off',
    'jsdoc/require-returns': 'off',
    'jsdoc/require-returns-description': 'off',
    'jsdoc/require-returns-type': 'off',
    'jsdoc/require-yields': 'off',
    'jsdoc/require-yields-check': 'off',
    'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
    'max-classes-per-file': 'off',
    'max-len': ['error', {
      code: 100,
      ignorePattern: '(/* eslint |eslint-disable-next-line |@ts-expect-error )',
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreUrls: true,
    }],
    'max-params': ['error', 3],
    'new-cap': [
      'error',
      {
        capIsNew: true,
        capIsNewExceptions: [
          'express.Router',
          'Immutable.Map',
          'Immutable.Set',
          'Immutable.List',
          'RightRailView',
          'URLWithSearchParams',
        ],
        newIsCap: true,
        newIsCapExceptions: [],
        properties: true,
      },
    ],
    'no-console': 'error',
    'no-continue': 'off',
    'no-empty-function': 'off',
    'no-promise-executor-return': 'off',
    'no-redeclare': 'error',
    'no-restricted-properties': [
      'error',
    ],
    'no-restricted-syntax': [
      'error',
    ],
    'no-use-before-define': 'off',
    'no-void': ['error', { allowAsStatement: true }],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'never', next: 'import', prev: 'import' },
    ],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'prefer-exponentiation-operator': 'off',
    'prefer-regex-literals': 'off',
  },
  settings: {
    'import/typescript': {
      typescript: {},
    },
  },
};
