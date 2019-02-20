const mergeWebpack = require('webpack-merge');
const WebpackBar = require('webpackbar')
const Service = require('@vue/cli-service/lib/Service');
const PluginAPI = require('@vue/cli-service/lib/PluginAPI');
const validateWebpackConfig = require('@vue/cli-service/lib/util/validateWebpackConfig')

/**
 * Undocumented way getting webpack configurations. Use it careful
 * @returns {{options: Object, api: PluginAPI}}
 */
function getApiAndOptions() {
  const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd());
  service.init();

  const api = new PluginAPI('id', service);
  const options = service.projectOptions;

  return { api, options };
}

/**
 *
 * @param {'client' | 'server'} target
 */
module.exports = function getWebpackConfig(target) {
  const { api, options } = getApiAndOptions();
  const isClient = target === 'client';
  // const isProd = api.mode === 'production';

  /**
   * FIXME: Придумать как через Service прокинуть параметр
   * Чтобы разные инстанции cli "сервиса" создавали разные конфигурации для клиента и для сервера
   * Самый простой способ это переопределять в env
   */
  const webpackTarget = process.env.WEBPACK_TARGET;
  if (target === 'server') {
    process.env.WEBPACK_TARGET = 'node';
  }

  let webpackConfig = api.resolveChainableWebpackConfig()

  // Plugins redefinition
  webpackConfig.plugins.delete('progress');
  webpackConfig.plugins.delete('preload');
  webpackConfig.plugins.delete('prefetch');

  if (isClient) {
    // Remove cleat output. Need for WebpackBar
    webpackConfig.plugin('friendly-errors')
      .tap((args) => {
        return [{
          ...args[0],
          clearConsole: false,
        }];
      })
      .end();
  } else {
    webpackConfig.plugins.delete('hmr');
    webpackConfig.plugins.delete('no-emit-on-errors');
    webpackConfig.plugins.delete('friendly-errors');

    // const isExtracting = webpackConfig.plugins.has('extract-css');
    // if (isExtracting) {
    //   // Remove extract
    //   const langs = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus']
    //   const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    //   for (const lang of langs) {
    //     for (const type of types) {
    //       const rule = webpackConfig.module.rule(lang).oneOf(type)
    //       rule.uses.delete('extract-css-loader')
    //       // Critical CSS
    //       // rule.use('css-context').loader(CssContextLoader).before('css-loader')
    //     }
    //   }
    //   webpackConfig.plugins.delete('extract-css');
    // }
  }

  webpackConfig = api.resolveWebpackConfig(webpackConfig);

  webpackConfig = mergeWebpack(webpackConfig, {
    // entry: config.entry(target),
    stats: 'none',
    devServer: {
      stats: 'errors-only',
      quiet: true,
      noInfo: true,
    },
  });

  if (isClient) {
    webpackConfig = mergeWebpack(webpackConfig, {
      plugins: [
        new WebpackBar({
          name: 'Client',
          color: 'green',
        }),
      ],
    });
  } else {
    webpackConfig = mergeWebpack(webpackConfig, {
      plugins: [
        new WebpackBar({
          name: 'Server',
          color: 'orange',
        }),
      ],
      output: {
        libraryTarget: 'commonjs2',
      },
      target: 'node',
      devtool: 'source-map',
      optimization: {
        splitChunks: false,
        minimize: false,
        // https://medium.com/@kenneth_chau/speeding-up-webpack-typescript-incremental-builds-by-7x-3912ba4c1d15
        removeAvailableModules: false,
        removeEmptyChunks: false,
      },
    });

    delete webpackConfig.node;
  }

  for (const rule of webpackConfig.module.rules) {
    if (rule.use) {
      for (const item of rule.use) {
        if (item.loader === 'cache-loader' && !isClient) {
          // Change cache directory for server-side
          item.options.cacheIdentifier += '-server';
          item.options.cacheDirectory += '-server';
        } else if (item.loader === 'vue-loader') {
          // Optimize SSR only on server-side
          if (isClient) {
            item.options.optimizeSSR = false;
          } else {
            item.options.cacheIdentifier += '-server';
            item.options.cacheDirectory += '-server';
            item.options.optimizeSSR = true;
          }
        }
      }
    }
  }

  // restore env arg before call this function
  process.env.WEBPACK_TARGET = webpackTarget;

  validateWebpackConfig(webpackConfig, api, options);
  return webpackConfig;
};
