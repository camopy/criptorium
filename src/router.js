import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Signup from "./views/Signup.vue";
import Signin from "./views/Signin.vue";

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
          // component: Operations
        },
        {
          path: "/profile",
          name: "profile",
          // component: Profile
        },
        {
          path: "/exchanges",
          name: "exchanges",
          // component: Profile
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
