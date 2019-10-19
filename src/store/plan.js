import { db } from '../main';
import { functions } from '../main';

export default {
  state: {
    paidPlans: [],
    signingUserToPagseguroPlan: false
  },
  mutations: {
    setPaidPlans(state, payload) {
      state.paidPlans = payload;
    },
    setSigningUserToPagseguroPlan(state, payload) {
      state.signingUserToPagseguroPlan = payload;
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
            console.log('Error getting plans:', error);
            return Promise.reject(error);
          }
        );
    },
    signUserToPlan({ commit, getters }, payload) {
      commit('setSigningUserToPagseguroPlan', true);
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

          await functions.httpsCallable("signUserToPlan")({ ...params, senderHash: response.senderHash });

          commit('setSnackbarContent', {
            type: "success",
            message: "Assinatura enviada para análise de pagamento junto ao PagSeguro"
          });
          commit('setSigningUserToPagseguroPlan', false);
        }
        catch (error) {
          console.error(error);
          commit('setSnackbarContent', {
            type: 'error',
            message: error.message
          });
          commit('setSigningUserToPagseguroPlan', false);
        }
      });
    },
    async signoutUserFromPlan({ commit }, payload) {
      commit('setUpdating', true);

      try {
        await functions.httpsCallable('signoutUserFromPlan')(payload);

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
      }
    }
  },
  getters: {
    paidPlans(state) {
      return state.paidPlans;
    },
    signingUserToPagseguroPlan(state) {
      return state.signingUserToPagseguroPlan;
    }
  }
};
