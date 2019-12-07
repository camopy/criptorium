import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Signup from "./views/Signup.vue";
import Signin from "./views/Signin.vue";
import PasswordRecovery from "./views/PasswordRecovery.vue";
import Exchanges from "./views/Exchanges.vue";
import Operations from "./views/Operations.vue";
import UserInfo from "./views/UserInfo.vue";

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        title: 'Criptorium - Home'
      },
      children: [
        {
          path: "/operations",
          name: "operations",
          component: Operations,
          meta: {
            title: 'Criptorium - Operações'
          },
        },
        {
          path: "/profile",
          name: "profile",
          component: UserInfo,
          meta: {
            title: 'Criptorium - Perfil'
          },
        },
        {
          path: "/exchanges",
          name: "exchanges",
          component: Exchanges,
          meta: {
            title: 'Criptorium - Exchanges'
          },
        }
      ]
    },
    {
      path: "/signin",
      name: "signin",
      component: Signin,
      meta: {
        title: 'Criptorium - Login'
      },
    },
    {
      path: "/recoverPassword",
      name: "recoverPassword",
      component: PasswordRecovery,
      meta: {
        title: 'Criptorium - Recuperar senha'
      },
    },
    {
      path: "/signup",
      name: "signup",
      component: Signup,
      meta: {
        title: 'Criptorium - Cadastrar'
      },
    }
  ]
})
