import { db } from '../main';
import axios from 'axios';

export default {
  state: {
    paidPlans: []
  },
  mutations: {
    setPaidPlans(state, payload) {
      state.paidPlans = payload;
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
      commit('setCreating', true);
      let params = {
        userId: getters.user.id,
        ...payload
      };

      // eslint-disable-next-line no-undef
      PagSeguroDirectPayment.onSenderHashReady(function(response) {
        if (response.status == 'error') {
          throw new Error(response.message);
        }

        return axios
          .get(
            'https://us-central1-cripto-rf-dev.cloudfunctions.net/signUserToPlan',
            { params: { ...params, senderHash: response.senderHash } }
          )
          .then((response) => {
            console.log(response.data);
            commit('setSnackbarContent', {
              type: response.data.type,
              message: response.data.message
            });
            commit('setCreating', false);
          })
          .catch((error) => {
            console.error(error);
            commit('setSnackbarContent', {
              type: 'error',
              message: error.message
            });
            commit('setCreating', false);
          });
      });
    },
    signoutUserFromPlan({ commit }, payload) {
      commit('setUpdating', true);

      return axios
        .get(
          'https://us-central1-cripto-rf-dev.cloudfunctions.net/signoutUserFromPlan',
          { params: payload }
        )
        .then((response) => {
          console.log(response.data);
          commit('setSnackbarContent', {
            type: response.data.type,
            message: response.data.message
          });
          commit('setUpdating', false);
        })
        .catch((error) => {
          console.error(error);
          commit('setSnackbarContent', {
            type: 'error',
            message: error.message
          });
          commit('setUpdating', false);
        });
    }
  },
  getters: {
    paidPlans(state) {
      return state.paidPlans;
    }
  }
};
