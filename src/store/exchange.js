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
    async syncBinanceOperations({ commit, getters }, payload) {
      commit('setCreating', true);
      let systemExchange = getters.systemExchanges.find(exchange => {
        return exchange.id === payload.exchangeId;
      })
      let keys = {
        userId: getters.user.id,
        apiKey: payload.apiKey,
        privateKey: payload.privateKey,
        lastOperations: getters.user.lastOperations.binance,
        exchangeId: payload.id,
        exchangeName: systemExchange.name,
        exchangeUrl: systemExchange.url,
        exchangeCountryCode: systemExchange.countryCode
      };

      try {
        let response = await functions.httpsCallable("syncBinanceOperations")(keys);
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
