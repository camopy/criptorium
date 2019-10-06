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
        if (response.status == 'error') {
          console.error(response);
          throw "Falha ao comunicar com o PagSeguro";
        }

        try {
          let signoutResponse = await functions.httpsCallable("signUserToPlan")({ ...params, senderHash: response.senderHash });
          if(signoutResponse.data.error) {
            throw signoutResponse.data.error;
          }
          commit('setSnackbarContent', {
            type: signoutResponse.data.type,
            message: signoutResponse.data.message
          });
          commit('setSigningUserToPagseguroPlan', false);
        }
        catch (error) {
          console.error(error);
          commit('setSnackbarContent', {
            type: 'error',
            message: error
          });
          commit('setSigningUserToPagseguroPlan', false);
        }
      });
    },
    async signoutUserFromPlan({ commit }, payload) {
      commit('setUpdating', true);

      try {
        const response = await functions.httpsCallable('signoutUserFromPlan')(payload);
        if(response.data.error) {
          throw response.data.error;
        }
        commit('setSnackbarContent', {
          type: response.data.type,
          message: response.data.message
        });
        commit('setUpdating', false);
      }
      catch (error) {
        console.error(error);
        commit('setSnackbarContent', {
          type: 'error',
          message: error
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
