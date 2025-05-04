module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:prettier/recommended', // ✅ Enables eslint-plugin-prettier and displays Prettier errors
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    'react/react-in-jsx-scope': 'off', // ✅ Not needed in React Native
    'no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
    'react-native/no-inline-styles': 'off', // 👈 turn off if you use inline styles in components
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {argsIgnorePattern: '^_'},
        ],
      },
    },
  ],
};
