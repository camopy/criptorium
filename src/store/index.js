import Vue from "vue";
import Vuex from "vuex";

import shared from "./shared";
import user from "./user";
import exchange from "./exchange";
import operation from "./operation";

Vue.use(Vuex);

export const store = new Vuex.Store({
  modules: {
    shared: shared,
    user: user,
    exchange: exchange,
    operation: operation
  }
});
