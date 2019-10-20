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
    setMoreOperations(state, payload) {
      state.user.operations.push(...payload);
    }
  },
  actions: {
    async signUserUp({ commit }, payload) {
      commit('setCreating', true);

      try {
        let response = await functions.httpsCallable("signUserUp")(payload);

        commit('setSnackbarContent', {
          type: "success",
          message: "Usuário criado com sucesso"
        });
        commit('setUser', response.data);
        commit('setCreating', false);
      }
      catch (error) {
        console.error(error);
        commit('setCreating', false);
        commit('setSnackbarContent', {
          type: 'error',
          message: error.message
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
      this.unsubscribeSystemExchangesListener();
      firebase.auth().signOut();
      commit('setUser', null);
    },
    fetchUserData({ commit, getters }, payload) {
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
            operations: user ? user.operations || [] : []
          };
          commit('setUser', updatedUser);
        });
      promises.push(this.unsubscribeUserListener);

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
