<template>
  <div
    class="c-progress-bar"
    :class="{'c-progress-bar--failed': !canSuccess}"
    :style="progressBarStyle"></div>
</template>

<script>
export default {
  data() {
    return {
      percent: 0,
      show: false,
      canSuccess: true,
      duration: 3000,
    };
  },

  methods: {
    start() {
      this.show = true;
      this.canSuccess = true;

      if (this.timer) {
        clearInterval(this.timer);
        this.percent = 0;
      }

      this.cut = 10000 / Math.floor(this.duration);

      this.timer = setInterval(() => {
        this.increase(this.cut * Math.random());
        if (this.percent > 95) {
          this.finish();
        }
      }, 100);

      return this;
    },
    increase(num) {
      this.percent = this.percent + Math.floor(num);
      return this;
    },
    finish() {
      this.percent = 100;
      this.hide();
      return this;
    },
    pause() {
      clearInterval(this.timer);

      return this;
    },
    hide() {
      clearInterval(this.timer);

      this.timer = null;

      setTimeout(() => {
        this.show = false;
        this.$nextTick(() => {
          setTimeout(() => {
            this.percent = 0;
          }, 200);
        });
      }, 500);

      return this;
    },
    fail() {
      this.canSuccess = false;
      return this;
    },
  },

  computed: {
    progressBarStyle() {
      return {
        width: `${this.percent}%`,
        opacity: this.show ? 1 : 0,
      };
    },
  },
};
</script>

<style lang="scss">
.c-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  width: 0;
  transition: width 0.2s, opacity 0.4s;
  opacity: 1;
  background-color: green;
  z-index: 999;
  pointer-events: none;

  &--failed {
    background: #c00;
  }
}
</style>
