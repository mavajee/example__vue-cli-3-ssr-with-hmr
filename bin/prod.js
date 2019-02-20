process.env.SSR_HOT_RELOAD = false;
process.env.NODE_ENV = 'production';

require('./../scripts/check-build-exist');

// Run server
require('./../server');