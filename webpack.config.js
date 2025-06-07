const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const { withNativeWind } = require('nativewind/webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['nativewind'],
    },
  }, argv);

  return withNativeWind(config, {
    input: './global.css',
  });
}; 