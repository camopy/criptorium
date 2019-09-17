export default {
  state: {
    loading: false,
    deleting: false,
    creating: false,
    updating: false,
    error: null,
    snackbarContent: null
  },
  mutations: {
    setLoading(state, payload) {
      state.loading = payload;
    },
    setDeleting(state, payload) {
      state.deleting = payload;
    },
    setCreating(state, payload) {
      state.creating = payload;
    },
    setUpdating(state, payload) {
      state.updating = payload;
    },
    setError(state, payload) {
      state.error = payload;
    },
    setSnackbarContent(state, payload) {
      state.snackbarContent = payload;
    },
    clearError(state) {
      state.error = null;
    },
    clearSnackbarContent(state) {
      state.snackbarContent = null;
    }
  },
  actions: {
    clearError({ commit }) {
      commit("clearError");
    },
    clearSnackbarContent({ commit }) {
      commit("clearSnackbarContent");
    }
  },
  getters: {
    loading(state) {
      return state.loading;
    },
    deleting(state) {
      return state.deleting;
    },
    creating(state) {
      return state.creating;
    },
    updating(state) {
      return state.updating;
    },
    error(state) {
      return state.error;
    },
    snackbarContent(state) {
      return state.snackbarContent;
    }
  }
};
