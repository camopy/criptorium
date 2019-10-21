import { db } from '../main';
import { analytics } from '../main';

export default {
  state: {
    systemExchanges: []
  },
  mutations: {
    setSystemExchanges(state, payload) {
      state.systemExchanges = payload;
    }
  },
  actions: {
    loadSystemExchanges({commit}) {
      return this.unsubscribeSystemExchangesListener = db.collection('exchanges')
        .onSnapshot(
        (querySnapshot) => {
          let exchanges = querySnapshot.docs.map(function(exchange) {
            return { ...exchange.data(), id: exchange.id };
          });
          commit('setSystemExchanges', exchanges);
          return exchanges;
        },
        function(error) {
          console.error("Error getting system exchanges:", error);
          analytics.logEvent("error", { side: "client", category: "exchange", action: "get", error: error});
          return Promise.reject(error);
        });
    }
  },
  getters: {
    systemExchanges(state) {
      return state.systemExchanges;
    }
  }
};
