import firebase from 'firebase/app';
import 'firebase/auth';
import { db } from '../main';
import { functions } from '../main';

export default {
  state: {
    user: null
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    setPlan(state, payload) {
      state.user.plan = payload;
    },
    setExchanges(state, payload) {
      state.user.exchanges = payload;
    },
    setOperations(state, payload) {
      state.user.operations = payload;
    },
    setLastOperations(state, payload) {
      state.user.lastOperations = payload;
    },
    setMoreOperations(state, payload) {
      state.user.operations.push(...payload);
    }
  },
  actions: {
    async signUserUp({ commit }, payload) {
      commit('setCreating', true);

      try {
        let response = await functions.httpsCallable("signUserUp")(payload);
        if(response.data.type === "error") {
          throw response.data.message;
        }
        commit('setSnackbarContent', {
          type: response.data.type,
          message: response.data.message
        });
        commit('setUser', response.data.content);
        commit('setCreating', false);
      }
      catch (error) {
        console.error(error);
        commit('setCreating', false);
        commit('setSnackbarContent', {
          type: 'error',
          message: error
        });
      }
    },
    signUserIn({ commit }, payload) {
      commit('setLoading', true);
      commit('clearError');
      firebase
        .auth()
        .signInWithEmailAndPassword(payload.email, payload.password)
        .then(() => {
          commit('setLoading', false);
        })
        .catch((error) => {
          commit('setLoading', false);
          commit('setError', error);
          console.log(error);
        });
    },
    logout({ commit }) {
      this.unsubscribeUserListener();
      this.unsubscribeExchangesListener();
      this.unsubscribeOperationsListener();
      this.unsubscribeLastOperationsListener();
      this.unsubscribeSystemExchangesListener();
      firebase.auth().signOut();
      commit('setUser', null);
    },
    fetchUserData({ commit, dispatch, getters }, payload) {
      commit('setLoading', true);
      let promises = [];
      this.unsubscribeUserListener = db
        .collection('users')
        .doc(payload.uid)
        .onSnapshot((doc) => {
          let user = getters.user;
          if (!doc.exists) {
            throw new Error('Usuário não encontrado');
          }
          const updatedUser = {
            id: payload.uid,
            ...doc.data(),
            exchanges: user ? user.exchanges || [] : [],
            operations: user ? user.operations || [] : [],
            lastOperations: user ? user.lastOperations || [] : []
          };
          commit('setUser', updatedUser);
        });
      promises.push(this.unsubscribeUserListener);

      dispatch('loadSystemExchanges');

      this.unsubscribeExchangesListener = db
        .collection('users')
        .doc(payload.uid)
        .collection('exchanges')
        .onSnapshot((querySnapshot) => {
          let exchanges = querySnapshot.docs.map(function(exchange) {
            return { ...exchange.data(), id: exchange.id };
          });
          commit('setExchanges', exchanges);
        });
      promises.push(this.unsubscribeExchangesListener);

      this.unsubscribeOperationsListener = db
        .collection('users')
        .doc(payload.uid)
        .collection('operations')
        .orderBy('time', 'desc')
        .limit(15)
        .onSnapshot((querySnapshot) => {
          let operations = querySnapshot.docs.map(function(operation) {
            return { ...operation.data(), id: operation.id };
          });
          let lastReturnedOperation =
            querySnapshot.docs[querySnapshot.docs.length - 1];
          commit('setLastReturnedOperation', lastReturnedOperation);
          commit('setLastReturnedOperationByMonth', null);
          commit('setOperations', operations);
        });
      promises.push(this.unsubscribeOperationsListener);

      this.unsubscribeLastOperationsListener = db
        .collection('users')
        .doc(payload.uid)
        .collection('lastOperations')
        .onSnapshot((querySnapshot) => {
          let lastOperations = [];
          querySnapshot.docs.forEach((lastOperation) => {
            lastOperations[lastOperation.id] = lastOperation.data();
          });
          commit('setLastOperations', lastOperations);
        });
      promises.push(this.unsubscribeLastOperationsListener);

      Promise.all(promises)
        .then(() => {
          commit('setLoading', false);
        })
        .catch((error) => {
          commit('setLoading', false);
          console.error('Error fetching data: ', error);
        });
    },
    addExchange({ commit, getters }, payload) {
      commit('setCreating', true);
      let user = getters.user;

      return db
        .collection('users')
        .doc(user.id)
        .collection('exchanges')
        .doc()
        .set(payload)
        .then(function() {
          commit('setCreating', false);
          commit('setSnackbarContent', {
            type: 'success',
            message: 'Exchange adicionada com sucesso!'
          });
          console.log('Exchange added');
        })
        .catch(function(error) {
          commit('setCreating', false);
          console.error('Error adding exchange: ', error);
        });
    }
  },
  getters: {
    user(state) {
      return state.user;
    }
  }
};
