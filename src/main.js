import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store'
import vuetify from './plugins/vuetify';
import moment from "moment";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/functions";
import "firebase/analytics";
import { environments } from '@/environments/environment';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

Vue.config.productionTip = false

const isProd = process.env.NODE_ENV === "production";
const firebaseConfig = isProd ? environments.prod.firebaseConfig : environments.dev.firebaseConfig;

moment.locale("pt-br");
Vue.prototype.$moment = moment;

if(isProd) {
  Sentry.init({
    dsn: 'https://9b0ae9d17fc74821acb9bb1cec6b5949@sentry.io/1784831',
    integrations: [new Integrations.Vue({Vue, attachProps: true})],
  });
}

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  created() {
    firebase.initializeApp(firebaseConfig);
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        analytics.setUserId(user.uid);
        analytics.logEvent("login", {provider: user.providerData});
        this.$store.dispatch("fetchUserData", user);
      }
    });
  }
}).$mount('#app')

export const auth = firebase.auth();
export const db = firebase.firestore();
export const functions = firebase.functions();
export const analytics = firebase.analytics();
