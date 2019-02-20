import Vue from 'vue';
import Router from 'vue-router';

import Home from './views/Home.vue';

Vue.use(Router);

export default function createRouter() {
  return new Router({
    mode: 'history',

    scrollBehavior() {
      return { x: 0, y: 0 };
    },

    routes: [
      {
        path: '/',
        name: 'home.page',
        component: Home,
      },
      {
        path: '/about',
        name: 'about.page',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
      },
      {
        path: '*',
        component: () => import(/* webpackChunkName: "404" */ './views/NotFound.vue'),
        meta: {
          response: {
            statusCode: 404,
          },
        },
      },
    ],
  });
}
