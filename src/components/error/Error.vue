<script>
import ErrorBase from './ErrorBase.vue';
import ErrorNotFound from './ErrorNotFound.vue';

export default {
  functional: true,

  props: {
    code: {
      required: true,
    },
    text: {
      required: true,
    },
  },

  render(h, ctx) {
    const code = String(ctx.props.code);

    switch (code) {
      case '404':
        return h(ErrorNotFound);
      default:
        return h(ErrorBase, { props: { ...ctx.props } });
    }
  },
};

</script>
