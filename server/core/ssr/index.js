const fs = require('fs');
const path = require('path');
const LRU = require('lru-cache');
const vueServerRender = require('vue-server-renderer');

// const { constants } = require('../../../config/server');

const ENABLE_HOT_RELOAD = process.env.SSR_HOT_RELOAD && process.env.NODE_ENV === 'development';

const cache = new LRU({
  max: 1000,
  maxAge: 1000 * 60 * 5,
});

const createBundleRendererWithDefaults = (bundle, options) =>
  vueServerRender.createBundleRenderer(bundle, {
    ...options,
    cache,
    runInNewContext: false,
  });

function initSsr(app, router) {
  const templatePath = path.resolve(__dirname, './../../templates/index.template.html');
  let renderer;
  let readyPromise;

  if (ENABLE_HOT_RELOAD) {
    readyPromise = require('./create-dev-server')(
      app,
      templatePath,
      (bundle, options) => {
        renderer = createBundleRendererWithDefaults(bundle, options);
      },
    );
  } else {
    const serverBundle = require('../../../dist/vue-ssr-server-bundle.json');
    const clientManifest = require('../../../dist/vue-ssr-client-manifest.json');
    const template = fs.readFileSync(templatePath, 'utf-8');

    renderer = createBundleRendererWithDefaults(serverBundle, { template, clientManifest });
  }

  function renderApp(req, res) {
    res.setHeader('Content-Type', 'text/html');

    const context = {
      // title: constants.TITLE,
      url: req.url,
      isProd: process.env.NODE_ENV === 'production',
    };

    renderer.renderToString(context, (err, html) => {
      if (err) {
        if (err.url) {
          res.redirect(err.url);
        } else {
          res.status(500).end('500 | Internal Server Error');

          console.error(`[SSR]: error during render : ${req.url}`);
          console.error(err.stack);
        }
        return;
      }

      res.status(context.response.statusCode || 200);
      res.send(html);
    });
  }

  const requestHandler = ENABLE_HOT_RELOAD
    ? (req, res) => { readyPromise.then(() => renderApp(req, res)); }
    : renderApp;

  router.get('*', requestHandler);
}

module.exports = initSsr;
