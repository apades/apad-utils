import antfu from '@antfu/eslint-config'

export default antfu(
  {
    react: true,
    rules: {
      'node/prefer-global/process': 'off',
      'ts/no-require-imports': 'off',
      'react/prefer-destructuring-assignment': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-async-promise-executor': 'off',
      'no-useless-return': 'off',
    },
  },
)
