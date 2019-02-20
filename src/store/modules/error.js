const DEFAULT_ERROR_CODE = 500;
const DEFAULT_ERROR_TEXT = 'Упс! Что-то пошло не так.';

const initialState = {
  code: undefined,
  text: undefined,
};

const mutations = {
  SET_ERROR(state, { code = DEFAULT_ERROR_CODE, text = DEFAULT_ERROR_TEXT }) {
    state.code = code;
    state.text = text;
  },
  RESET_ERROR(state) {
    state.code = undefined;
    state.text = undefined;
  },
};

export default {
  namespaced: true,
  state: initialState,
  mutations,
};
