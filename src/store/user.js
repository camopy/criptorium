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
                dateCreated: moment().toISOString()
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
      firebase.auth().signOut();
      commit("setUser", null);
      commit("setLoading", false);
    },
    fetchUserData({ commit }, payload) {
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
              dateCreated: doc.data().dateCreated
            };
            commit("setUser", updatedUser);
            return updatedUser;
          } else {
            return Promise.reject(new Error("Usuário não encontrado"));
          }
        })
        // .then(updatedUser => {
        //   let promises = [];
        //   this.unsubscribeUserTimelineListener = db
        //     .collection("users")
        //     .doc(updatedUser.id)
        //     .collection("timeline")
        //     .orderBy("inputDate", "desc")
        //     .onSnapshot(
        //       querySnapshot => {
        //         let timeline = querySnapshot.docs.map(function(timeline) {
        //           return timeline.data();
        //         });
        //         updatedUser.timeline = timeline;
        //         commit("setUser", updatedUser);
        //         return timeline;
        //       },
        //       function(error) {
        //         console.log("Error getting user timeline:", error);
        //         commit("setLoading", false);
        //         return Promise.reject(error);
        //       }
        //     );
        //   promises.push(this.unsubscribeUserTimelineListener);

        //   if (updatedUser.accountType === "patient") {
        //     this.unsubscribePendingInvitesListener = db
        //       .collection("pending_invites")
        //       .where("patientId", "==", updatedUser.id)
        //       .onSnapshot(
        //         querySnapshot => {
        //           let pendingInvites = querySnapshot.docs.map(function(
        //             pending_invite
        //           ) {
        //             return pending_invite.data();
        //           });
        //           updatedUser.pendingInvites = pendingInvites;
        //           commit("setUser", updatedUser);
        //           return pendingInvites;
        //         },
        //         function(error) {
        //           console.log("Error getting pending_invites:", error);
        //           commit("setLoading", false);
        //           return Promise.reject(error);
        //         }
        //       );

        //     promises.push(this.unsubscribePendingInvitesListener);

        //     this.unsubscribeDoctorPatientListener = db
        //       .collection("doctor_patient")
        //       .where("patientId", "==", updatedUser.id)
        //       .onSnapshot(
        //         querySnapshot => {
        //           let doctors = querySnapshot.docs.map(function(doctor) {
        //             return doctor.data();
        //           });
        //           updatedUser.doctors = doctors;
        //           commit("setUser", updatedUser);
        //           return doctors;
        //         },
        //         function(error) {
        //           console.log("Error getting doctor_patient:", error);
        //           commit("setLoading", false);
        //           return Promise.reject(error);
        //         }
        //       );
        //     promises.push(this.unsubscribeDoctorPatientListener);
        //   } else {
        //     this.unsubscribePendingInvitesListener = db
        //       .collection("pending_invites")
        //       .where("doctorId", "==", updatedUser.id)
        //       .onSnapshot(
        //         querySnapshot => {
        //           let pendingInvites = querySnapshot.docs.map(function(
        //             pending_invite
        //           ) {
        //             return pending_invite.data();
        //           });
        //           updatedUser.pendingInvites = pendingInvites;
        //           commit("setUser", updatedUser);
        //           return pendingInvites;
        //         },
        //         function(error) {
        //           console.log("Error getting pending_invites:", error);
        //           commit("setLoading", false);
        //           return Promise.reject(error);
        //         }
        //       );
        //     promises.push(this.unsubscribePendingInvitesListener);

        //     this.unsubscribeDoctorPatientListener = db
        //       .collection("doctor_patient")
        //       .where("doctorId", "==", updatedUser.id)
        //       .onSnapshot(
        //         querySnapshot => {
        //           let patients = querySnapshot.docs.map(function(patient) {
        //             return patient.data();
        //           });
        //           updatedUser.patients = patients;
        //           commit("setUser", updatedUser);
        //           return patients;
        //         },
        //         function(error) {
        //           console.log("Error getting doctor_patient:", error);
        //           commit("setLoading", false);
        //           return Promise.reject(error);
        //         }
        //       );
        //     promises.push(this.unsubscribeDoctorPatientListener);
        //   }

        //   Promise.all(promises)
        //     .then(() => {
        //       commit("setLoading", false);
        //     })
        //     .catch(error => {
        //       commit("setLoading", false);
        //       console.error("Error fetching data: ", error);
        //     });
        // })
        .catch(function(error) {
          console.log("Error getting user:", error);
          commit("setLoading", false);
        });
    }
  },
  getters: {
    user(state) {
      return state.user;
    }
  }
};
