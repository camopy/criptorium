import * as firebase from "firebase";
import { db } from "../main";
import * as moment from "moment";

export default {
  state: {
    user: null
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    setExchanges(state, payload) {
      state.user.exchanges = payload;
    },
    setOperations(state, payload) {
      state.user.operations = payload;
    },
    setLastOperations(state, payload) {
      state.user.lastOperations = payload;
    }
  },
  actions: {
    signUserUp({ commit }, payload) {
      commit("setLoading", true);
      commit("clearError");

      const promises = [];

      let checkEmail = db
        .collection("users")
        .where("email", "==", payload.email)
        .get()
        .then(function(doc) {
          if (!doc.empty) {
            return Promise.reject(new Error("Email já cadastrado"));
          }
        })
        .catch(error => {
          commit("setLoading", false);
          commit("setError", error);
          console.log(error);
          return Promise.reject(error);
        });
      promises.push(checkEmail);

      let checkCpf = db
        .collection("users")
        .where("cpf", "==", payload.cpf)
        .get()
        .then(function(doc) {
          if (!doc.empty) {
            return Promise.reject(new Error("CPF já cadastrado"));
          }
        })
        .catch(error => {
          commit("setLoading", false);
          commit("setError", error);
          console.log(error);
          return Promise.reject(error);
        });
      promises.push(checkCpf);

      Promise.all(promises)
        .then(() => {
          firebase
            .auth()
            .createUserWithEmailAndPassword(payload.email, payload.password)
            .then(auth => {
              const newUser = {
                id: auth.user.uid,
                name: payload.name,
                email: payload.email,
                cpf: payload.cpf,
                birthday: payload.birthday,
                dateCreated: moment().toISOString(),
                exchanges: [],
              operations: [],
              lastOperations: []
              };
              commit("setUser", newUser);

              db.collection("users")
                .doc(auth.user.uid)
                .set(newUser)
                .then(function() {
                  commit("setLoading", false);
                  console.log("User added");
                })
                .catch(function(error) {
                  commit("setLoading", false);
                  console.error("Error adding user: ", error);
                });
            })
            .catch(error => {
              commit("setLoading", false);
              commit("setError", error);
              console.log(error);
            });
        })
        .catch(error => {
          commit("setLoading", false);
          console.error("Error signing user up: ", error);
        });
    },
    signUserIn({ commit }, payload) {
      commit("setLoading", true);
      commit("clearError");
      firebase
        .auth()
        .signInWithEmailAndPassword(payload.email, payload.password)
        .then(() => {
          commit("setLoading", false);
        })
        .catch(error => {
          commit("setLoading", false);
          commit("setError", error);
          console.log(error);
        });
    },
    logout({ commit }) {
      this.unsubscribeExchangesListener();
      this.unsubscribeOperationsListener();
      this.unsubscribeLastOperationsListener();
      this.unsubscribeSystemExchangesListener();
      firebase.auth().signOut();
      commit("setUser", null);
    },
    fetchUserData({ commit, dispatch }, payload) {
      commit("setLoading", true);
      db.collection("users")
        .doc(payload.uid)
        .get()
        .then(function(doc) {
          if (doc.exists) {
            const updatedUser = {
              id: payload.uid,
              name: doc.data().name,
              email: doc.data().email,
              cpf: doc.data().cpf,
              birthday: doc.data().birthday,
              dateCreated: doc.data().dateCreated,
              exchanges: [],
              operations: [],
              lastOperations: []
            };
            commit("setUser", updatedUser);
            commit("setLoading", false);
            return updatedUser;
          } else {
            return Promise.reject(new Error("Usuário não encontrado"));
          }
        })
        .then(updatedUser => {
          let promises = [];

          this.unsubscribeSystemExchangesListener = dispatch("loadSystemExchanges");

          this.unsubscribeExchangesListener = db
            .collection("users")
            .doc(updatedUser.id)
            .collection("exchanges")
            .onSnapshot(
              querySnapshot => {
                let exchanges = querySnapshot.docs.map(function(exchange) {
                  return {...exchange.data(), id: exchange.id};
                });
                // updatedUser.exchanges = exchanges;
                commit("setExchanges", exchanges);
                return exchanges;
              },
              function(error) {
                console.log("Error getting user exchanges:", error);
                commit("setLoading", false);
                return Promise.reject(error);
              }
            );
          promises.push(this.unsubscribeExchangesListener);

          this.unsubscribeOperationsListener = db
            .collection("users")
            .doc(updatedUser.id)
            .collection("operations")
            .onSnapshot(
              querySnapshot => {
                let operations = querySnapshot.docs.map(function(operation) {
                  return {...operation.data(), id: operation.id, operationType: operation.data().isBuyer === undefined ? '' : (operation.data().isBuyer === true ? 'Compra' : 'Venda'), timef: moment(operation.data().time).format("L")};
                });
                // updatedUser.operations = operations;
                commit("setOperations", operations);
                return operations;
              },
              function(error) {
                console.log("Error getting user operations:", error);
                commit("setLoading", false);
                return Promise.reject(error);
              }
            );
          promises.push(this.unsubscribeOperationsListener);

          this.unsubscribeLastOperationsListener = db
            .collection("users")
            .doc(updatedUser.id)
            .collection("lastOperations")
            .onSnapshot(
              querySnapshot => {
                let lastOperations = [];
                querySnapshot.docs.forEach(lastOperation => {
                  lastOperations[lastOperation.id] = lastOperation.data();
                });
                // updatedUser.lastOperations = lastOperations;
                commit("setLastOperations", lastOperations);
                return lastOperations;
              },
              function(error) {
                console.log("Error getting user lastOperations:", error);
                commit("setLoading", false);
                return Promise.reject(error);
              }
            );
          promises.push(this.unsubscribeLastOperationsListener);

          Promise.all(promises)
            .then(() => {
              commit("setLoading", false);
            })
            .catch(error => {
              commit("setLoading", false);
              console.error("Error fetching data: ", error);
            });
        })
        .catch(function(error) {
          console.log("Error getting user:", error);
          commit("setLoading", false);
        });
    },
    addExchange({commit, getters}, payload) {
      commit("setCreating", true);
      let user = getters.user;

      return db.collection("users")
      .doc(user.id)
      .collection("exchanges")
      .doc()
      .set(payload)
      .then(function() {
        commit("setCreating", false);
        console.log("Exchange added");
      })
      .catch(function(error) {
        commit("setCreating", false);
        console.error("Error adding exchange: ", error);
      });
    }
  },
  getters: {
    user(state) {
      return state.user;
    }
  }
};
