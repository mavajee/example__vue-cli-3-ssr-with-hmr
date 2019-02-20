const express = require('express');

const router = require('./router');
const initSsr = require('./core/ssr');

const PORT = 8089;
const app = express();

initSsr(app, router);
app.disable('x-powered-by');
app.use(router);

app.listen(PORT, () => {
  console.log(`Server started at localhost:${PORT}`);
});
