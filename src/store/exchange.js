import { functions } from "../main";
import { analytics } from "../main";

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
        let response = await functions.httpsCallable("syncExchangeOperations", { timeout: 480000 })(params);

        commit('setSnackbarContent', {type: "success", message: "Operações sincronizadas"});
        commit('setCreating', false);
        return response;
      } catch (error) {
          console.error(error);
          commit('setSnackbarContent', {type: "error", message: error.message});
          commit('setCreating', false);
          analytics.logEvent("error", {side: "client", category: "syncOperations", error: error});
      }
    }
  },
  getters: {
    operations(state) {
      return state.operations;
    }
  }
};
