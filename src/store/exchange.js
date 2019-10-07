// import * as firebase from "firebase";
// import * as moment from "moment";
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
    async syncExchangeOperations({ commit, getters }, payload) {
      commit('setCreating', true);

      let params = {
        userId: getters.user.id,
        exchangeId: payload.id
      };

      try {
        let response = await functions.httpsCallable("syncExchangeOperations")(params);
        if(response.data.error) {
          throw response.data.error;
        }
        commit('setSnackbarContent', {type: response.data.type, message: response.data.message});
        commit('setCreating', false);
      } catch (error) {
        console.log(error);
          commit('setSnackbarContent', {type: "error", message: error});
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
