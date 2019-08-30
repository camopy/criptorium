import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Signup from "./views/Signup.vue";
import Signin from "./views/Signin.vue";
import Exchanges from "./views/Exchanges.vue";
import Operations from "./views/Operations.vue";

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      children: [
        {
          path: "/operations",
          name: "operations",
          component: Operations
        },
        {
          path: "/profile",
          name: "profile",
          // component: Profile
        },
        {
          path: "/exchanges",
          name: "exchanges",
          component: Exchanges
        }
      ]
    },
    {
      path: "/signin",
      name: "signin",
      component: Signin
    },
    {
      path: "/signup",
      name: "signup",
      component: Signup
    }
  ]
})
