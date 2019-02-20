/* eslint-disable no-restricted-syntax */
const path = require('path');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const nodeExternals = require('webpack-node-externals'); // eslint-disable-line

const isDev = process.env.NODE_ENV === 'development';
const assetsDir = 'public';

const defaults = {
  get isServer() {
    return process.env.WEBPACK_TARGET === 'node';
  },
  get plugins() {
    const plugins = [];

    if (defaults.isServer) {
      plugins.push(new VueSSRServerPlugin());
    } else {
      plugins.push(new VueSSRClientPlugin());
    }

    return plugins;
  },
};

module.exports = {
  assetsDir,

  /**
   * Enable global scss variables
   */
  // css: {
  //   loaderOptions: {
  //     sass: {
  //       data: '@import "src/assets/styles/global.scss";',
  //     },
  //   },
  // },

  configureWebpack: () => ({
    plugins: defaults.plugins,
    entry: `./src/entry-${defaults.isServer ? 'server' : 'client'}`,
    target: defaults.isServer ? 'node' : 'web',
    node: defaults.isServer ? undefined : false,
    externals: defaults.isServer ? nodeExternals({ whitelist: [/\.css$/, /\?vue&type=style/] }) : undefined,

    output: {
      libraryTarget: defaults.isServer ? 'commonjs2' : undefined,
    },
  }),

  chainWebpack: (config) => {
    /**
     * Add alias for config
     */
    config.resolve.alias
      .set('@config', path.resolve(__dirname, 'config/client.js'));

    if (!isDev) {
      config
        /**
         * Change the output dir path for static assets in public
         */
        .plugin('copy')
        .tap((args) => {
          // eslint-disable-next-line no-param-reassign
          args[0][0].to = path.resolve(args[0][0].to, assetsDir);

          return args;
        })
        .end();

      /**
       * Remove generated index.html by html-webpack-plugin
       */
      config.plugins.delete('html').end();
      config.plugins.delete('preload').end();
      config.plugins.delete('prefetch').end();
      config.module.rule('js').uses.delete('cache-loader');
    }

    if (defaults.isServer) {
      /**
       * Not convert process.env variables to their values during build
       */
      config.plugins.delete('define').end();

      config.module.rule('js').use('babel-loader').tap((args = {}) => ({
        ...args,
        sourceType: 'unambiguous',
      }));
    }

    /**
     * To avoid error with proposal import and inline styles
     *
     * @see https://github.com/Akryum/vue-cli-plugin-ssr/blob/2995e52971bd6a7e32a748433f8d4175c92dfb4f/lib/webpack.js#L26
     */
    if (defaults.isServer) {
      config.plugins.delete('friendly-errors');

      const isExtracting = config.plugins.has('extract-css');

      if (isExtracting) {
        // Remove extract
        const langs = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus'];
        const types = ['vue-modules', 'vue', 'normal-modules', 'normal'];

        for (const lang of langs) {
          for (const type of types) {
            const rule = config.module.rule(lang).oneOf(type);
            rule.uses.delete('extract-css-loader');
          }
        }

        config.plugins.delete('extract-css');
      }
    }
  },

  devServer: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:51000/',
      },
    },
  },
};
