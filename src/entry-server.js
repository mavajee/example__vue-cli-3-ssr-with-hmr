/* eslint-disable */
import createApp from './app';

export default context => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp();

    const { url } = context;
    const { fullPath } = router.resolve(url).route;

    context.response = {
      statusCode: 200
    };

    const handleError = (e) => {
      const { response = {} } = e;
      const statusCode = response.status ? response.status : 500;

      store.commit('error/SET_ERROR', { code: statusCode });

      context.response.statusCode = statusCode;
      context.state = store.state;

      console.error(e.stack);
      resolve(app);
    };

    if (fullPath !== url) {
      return reject({ url: fullPath });
    }

    router.push(url);

    router.onReady(() => {
      const matched = router.getMatchedComponents();

      const { response = {} } = router.currentRoute.meta;

      context.response = {
        ...context.response,
        ...response
      };

      const promised = [
        store.dispatch('init'),
        ...matched.map(({ asyncData }) => asyncData && asyncData({
          store,
          route: router.currentRoute
        }))
      ];

      Promise.all(promised)
        .then(() => {
          context.state = store.state;

          return resolve(app);
        })
        .catch(handleError);
    }, handleError);
  });
};
