import Vue from 'vue';
import Vuex from 'vuex';

import error from './modules/error';

Vue.use(Vuex);

export default function createRouter() {
  return new Vuex.Store({
    modules: { error },
    state: {},
    mutations: {},
    actions: {
      init() {
        console.info('Initialize store.');
      },
    },
  });
}
