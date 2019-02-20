<template>
  <div class="c-error">
    <div class="c-error__wrap">
      <div class="c-error__code">{{code}}</div>
      <div class="c-error__text">{{text}}</div>
    </div>

    <router-link
      v-if="showRedirectLink"
      to="/"
      class="c-error__link"
    >
      Вернуться на главную
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    code: {
      required: true,
    },
    text: {
      required: true,
    },
  },

  computed: {
    showRedirectLink() {
      return this.$route.path !== '/';
    },
  },
};
</script>
