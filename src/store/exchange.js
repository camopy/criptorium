import { functions } from "../main";

export default {
  state: {
    operations: null
  },
  mutations: {
    setOperations(state, payload) {
      state.operations = payload;
    }
  },
  actions: {
    async syncExchangeOperations({ commit }, payload) {
      commit('setCreating', true);

      let params = {
        exchangeId: payload.id
      };

      try {
        await functions.httpsCallable("syncExchangeOperations", { timeout: 480000 })(params);

        commit('setSnackbarContent', {type: "success", message: "Operações sincronizadas"});
        commit('setCreating', false);
      } catch (error) {
          console.error(error);
          commit('setSnackbarContent', {type: "error", message: error.message});
          commit('setCreating', false);
      }
    }
  },
  getters: {
    operations(state) {
      return state.operations;
    }
  }
};
