import { db } from '../main';
import { functions } from '../main';
import { analytics } from "@/main";
import * as moment from 'moment';

export default {
  state: {
    paidPlans: [],
    subscribingUserToPagseguroPlan: false
  },
  mutations: {
    setPaidPlans(state, payload) {
      state.paidPlans = payload;
    },
    setSubscribingUserToPagseguroPlan(state, payload) {
      state.subscribingUserToPagseguroPlan = payload;
    }
  },
  actions: {
    loadPaidPlans({ commit }) {
      db.collection('plans')
        .where('status', '==', 'active')
        .where('type', '==', 'paid')
        .get()
        .then(
          (querySnapshot) => {
            let paidPlans = querySnapshot.docs.map(function(plan) {
                return { ...plan.data(), id: plan.id }
            });
            commit('setPaidPlans', paidPlans);
            return paidPlans;
          },
          function(error) {
            console.error('Error getting plans:', error);
            analytics.logEvent("error", { side: "client", category: "plan", operation: "get", error: error});
            return Promise.reject(error);
          }
        );
    },
    subscribeUserToPlan({ commit, getters }, payload) {
      commit('setSubscribingUserToPagseguroPlan', true);
      let subscribePlanTimestamp = moment().format("x");
      analytics.logEvent("form", {category: "plan", description: "Fill subscribe plan form", duration: Number(subscribePlanTimestamp) - Number(this.subscribePlanStepperDialogTimestamp)});
      analytics.logEvent("subscribe", { category: "plan", action: "confirm", description: "Subscribe plan"});
      let params = {
        userId: getters.user.id,
        ...payload
      };

      // eslint-disable-next-line no-undef
      PagSeguroDirectPayment.onSenderHashReady(async function(response) {
        try {
          if (response.status == 'error') {
            throw new Error("Falha ao comunicar com o PagSeguro");
          }

          await functions.httpsCallable("subscribeUserToPlan")({ ...params, senderHash: response.senderHash });

          commit('setSnackbarContent', {
            type: "success",
            message: "Assinatura enviada para análise de pagamento junto ao PagSeguro"
          });
          commit('setSubscribingUserToPagseguroPlan', false);
          analytics.logEvent("subscribed", { category: "plan", description: "Subscribed to plan", duration: Number(moment().format("x")) - Number(subscribePlanTimestamp)});
          return true;
        }
        catch (error) {
          console.error(error);
          commit('setSnackbarContent', {
            type: 'error',
            message: error.message
          });
          commit('setSubscribingUserToPagseguroPlan', false);
          analytics.logEvent("error", { side: "client", category: "plan", action: "subscribe", error: error});
        }
      });
    },
    async unsubscribeUserFromPlan({ commit }) {
      commit('setUpdating', true);

      try {
        await functions.httpsCallable('unsubscribeUserFromPlan')();

        commit('setSnackbarContent', {
          type: "success",
          message: "Assinatura cancelada"
        });
        commit('setUpdating', false);
      }
      catch (error) {
        console.error(error);
        commit('setSnackbarContent', {
          type: 'error',
          message: error.message
        });
        commit('setUpdating', false);
        analytics.logEvent("error", { side: "client", category: "plan", action: "unsubscribe", error: error});
      }
    },
    async resubscribeUserToPlan({ commit }) {
      commit('setUpdating', true);

      try {
        await functions.httpsCallable('resubscribeUserToPlan')();

        commit('setSnackbarContent', {
          type: "success",
          message: "Assinatura reativada"
        });
        commit('setUpdating', false);
      }
      catch (error) {
        console.error(error);
        commit('setSnackbarContent', {
          type: 'error',
          message: error.message
        });
        commit('setUpdating', false);
        analytics.logEvent("error", { side: "client", category: "plan", action: "resubscribe", error: error});
      }
    }
  },
  getters: {
    paidPlans(state) {
      return state.paidPlans;
    },
    subscribingUserToPagseguroPlan(state) {
      return state.subscribingUserToPagseguroPlan;
    }
  }
};
