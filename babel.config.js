module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['@react-native/babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@app': './src/app',
            '@features': './src/features',
            '@shared': './src/shared',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
    ],
  };
};