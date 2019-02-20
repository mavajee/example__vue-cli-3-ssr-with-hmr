/* eslint global-require: 0 */
(() => {
  const path = require('path');
  const fs = require('fs');

  const clientBuild = path.join(__dirname, '..', 'dist', 'vue-ssr-client-manifest.json');
  const serverBuild = path.join(__dirname, '..', 'dist', 'vue-ssr-server-bundle.json');

  if (!fs.existsSync(clientBuild)) {
    throw new Error('The client build is not built yet. Build it by running "yarn build"');
  }
  if (!fs.existsSync(serverBuild)) {
    throw new Error('The server build is not built yet. Build it by running "yarn build"');
  }
})();
