import { db } from '../main';
import axios from 'axios';

export default {
  state: {
    plans: []
  },
  mutations: {
    setPlans(state, payload) {
      state.plans = payload;
    }
  },
  actions: {
    loadPlans({commit}) {
      db.collection('plans')
        .where("status", "==", "active")
        .get()
        .then(
        (querySnapshot) => {
          let plans = querySnapshot.docs.map(function(plan) {
            return { ...plan.data(), id: plan.id };
          });
          commit('setPlans', plans);
          return plans;
        },
        function(error) {
          console.log("Error getting plans:", error);
          commit("setLoading", false);
          return Promise.reject(error);
        });
    },
    signUserToPlan({commit, getters}, payload) {
      commit('setCreating', true);
      let params = {
        userId: getters.user.id,
        ...payload
      };

      // eslint-disable-next-line no-undef
      PagSeguroDirectPayment.onSenderHashReady(function(response){
        if(response.status == 'error') {
          console.error(response.message);
          commit('setSnackbarContent', {type: "error", message: response.message});
          commit('setCreating', false);
          return false;
        }

        return axios
        .get(
          'https://us-central1-cripto-rf-dev.cloudfunctions.net/signUserToPlan',
          { params: {...params, senderHash: response.senderHash} }
        )
        .then((response) => {
          console.log(response.data);
          commit('setSnackbarContent', {type: response.data.type, message: response.data.message});
          commit('setCreating', false);
        })
        .catch(error => {
          console.error(error);
          commit('setSnackbarContent', {type: "error", message: error.message});
          commit('setCreating', false);
        });
      });
    }
  },
  getters: {
    plans(state) {
      return state.plans;
    }
  }
};
