const rewire = require('rewire');
const path = require('path');

// Pointing to file which we want to re-wire — this is original build script
const defaults = rewire('react-scripts/scripts/build.js');

// Getting configuration from original build script
let config = defaults.__get__('config');

config.entry = {
  main: [path.join(path.dirname(__dirname), 'src/index.tsx')],
  background: [
    path.join(
      path.dirname(__dirname),
      'src/chromeServices/index.ts'
    ),
  ],
  content: [
    path.join(path.dirname(__dirname), 'src/chromeServices/DOMEvaluator.tsx'),
  ],
};

// If we want to move build result into a different folder, we can do that!
// Please note: that should be an absolute path!
config.output.path = path.join(path.dirname(__dirname), 'build');

// If we want to rename resulting bundle file to not have hashes, we can do that!
config.output.filename = 'js/[name].js';
config.output.chunkFilename = "js/[name].chunk.js"

// Get rid of hash for css files
const miniCssExtractPlugin = config.plugins.find(element => element.constructor.name === "MiniCssExtractPlugin");
miniCssExtractPlugin.options.filename = "css/[name].css"
miniCssExtractPlugin.options.chunkFilename = "css/[name].css"

// Get rid of hash for media files
config.module.rules[1].oneOf.forEach(oneOf => {

  if (!oneOf.use) return;

  oneOf.use.forEach(loader => {
    if (!loader.options || loader.options.name !== 'static/media/[name].[hash].[ext]') return;

    loader.options.name = 'images/[name].[ext]';
  });
});

// And the last thing: disabling splitting
config.optimization.splitChunks = {
  cacheGroups: {
    default: false,
  },
};

config.optimization.runtimeChunk = false;
