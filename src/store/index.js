import Vue from "vue";
import Vuex from "vuex";

import shared from "./shared";
import systemExchange from "./systemExchange";
import plan from "./plan";
import user from "./user";
import exchange from "./exchange";
import operation from "./operation";

Vue.use(Vuex);

export const store = new Vuex.Store({
  modules: {
    shared: shared,
    systemExchange: systemExchange,
    plan: plan,
    user: user,
    exchange: exchange,
    operation: operation
  }
});
