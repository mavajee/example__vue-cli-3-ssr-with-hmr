import Vue from 'vue';

import ProgressBar from '@/components/progress-bar/ProgressBar.vue';
import createApp from '@/app';

const bar = new Vue(ProgressBar).$mount();

document.body.appendChild(bar.$el);
Vue.prototype.$bar = bar;

const { app, router, store } = createApp();
let stateLoaded = false;

if (window.__INITIAL_STATE__) { // eslint-disable-line
  // Load SSR state
  store.replaceState(window.__INITIAL_STATE__); // eslint-disable-line
  stateLoaded = true;
}
window.state = store.state;

const resetErrorIfExist = () => {
  if (store.state.errorCode) {
    store.commit('error/RESET_ERROR');
  }
};

const handleError = (e) => {
  const statusCode = e.response ? e.response.status : 500;

  store.commit('error/SET_ERROR', { code: statusCode });
};

router.onReady(() => {
  // load init state if ssr is not working
  if (!stateLoaded) {
    store.dispatch('init').then(() => {
      const currentComponents = router.getMatchedComponents();

      Promise.all(currentComponents.map(c => (
        c.asyncData && c.asyncData({ store, route: router.currentRoute })
      )));
    });
  }

  app.$mount('#app', true);

  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to);
    const prevMatched = router.getMatchedComponents(from);

    let diffed = false;
    const activated = matched.filter((c, i) => {
      diffed = diffed || prevMatched[i] !== c;
      return diffed;
    });

    if (!activated.length) {
      next();
      return;
    }

    const asyncComponents = activated.filter(c => !!c.asyncData);

    if (!asyncComponents.length) {
      resetErrorIfExist();
      next();
      return;
    }

    bar.start();

    Promise.all(asyncComponents.map(c => c.asyncData({ store, route: to })))
      .then(() => {
        bar.finish();
        resetErrorIfExist();
        next();
      })
      .catch((e) => {
        bar.fail().pause();
        handleError(e);
        next();
      });
  });
});
