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
            '@assets': './src/assets',
            '@lib': './src/lib',
            '@navigation': './src/navigation',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],

      // 👇 MUST BE LAST (reanimated 4 moved the babel plugin into react-native-worklets)
      'react-native-worklets/plugin',
    ],
  };
};