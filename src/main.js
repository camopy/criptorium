import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store'
import vuetify from './plugins/vuetify';
import moment from "moment";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/functions";

import AlertCmp from "./components/shared/Alert";

moment.locale("pt-br");
Vue.prototype.$moment = moment;

Vue.config.productionTip = false

Vue.component("app-alert", AlertCmp);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  created() {
    firebase.initializeApp({
      apiKey: "AIzaSyDT6KOzSoGI06arMup0Mj6RYXLX7GRTMLg",
      authDomain: "cripto-rf-dev.firebaseapp.com",
      databaseURL: "https://cripto-rf-dev.firebaseio.com",
      projectId: "cripto-rf-dev",
      storageBucket: "cripto-rf-dev.appspot.com",
      messagingSenderId: "235200254503",
      appId: "1:235200254503:web:7aa45b7387a0891c"
    });
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.$store.dispatch("fetchUserData", user);
      }
    });
  }
}).$mount('#app')

export const db = firebase.firestore();
export const functions = firebase.functions();
