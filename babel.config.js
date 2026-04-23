// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
//   plugins: ['react-native-reanimated/plugin']
// };

module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
          src: './src',
          assets: './src/assets',
          config: './src/config.js',
        },
      },
    ],
    'react-native-reanimated/plugin', // ← must always be last
  ],
};