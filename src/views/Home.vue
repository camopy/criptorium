<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app>
      <v-list dense>
        <template v-for="item in items">
          <v-list-group
            v-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon
          >
            <template v-slot:activator>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <v-list-item v-for="(child, i) in item.children" :key="i" :to="child.to">
              <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ child.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :key="item.text" :to="item.to">
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app color="primary" dark>
      <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <span class="hidden-sm-and-down">Criptorium</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="user && user.plan.type === 'free'" color="secondary" @click="onUpgradeAccount">Upgrade</v-btn>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn slot="activator" v-on="on" to="/profile" icon>
            <v-icon>fas fa-user</v-icon>
          </v-btn>
        </template>
        <span>Perfil</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn slot="activator" v-on="on" @click="onLogout" icon>
            <v-icon>fas fa-sign-out-alt</v-icon>
          </v-btn>
        </template>
        <span>Sair</span>
      </v-tooltip>
    </v-app-bar>
    <v-content>
      <router-view></router-view>
    </v-content>
    <SubscribePlanStepper :subscribePlanStepperDialogTimestamp="subscribePlanStepperDialogTimestamp" @close="subscribePlanStepperDialogTimestamp = ''" />
  </v-app>
</template>

<script>
import SubscribePlanStepper from "../components/plan/SubscribePlanStepper";
import { analytics } from "@/main";
import Date from "@/mixins/Date";

export default {
  components: {
    SubscribePlanStepper
  },
  mixins: [Date],
  props: {
    source: String
  },
  data: () => ({
    drawer: null,
    subscribePlanStepperDialogTimestamp: "",
    items: [
      { icon: "fas fa-exchange-alt", text: "Operações", to: "/operations" },
      { icon: "fas fa-university", text: "Exchanges", to: "/exchanges" }
    ]
  }),
  computed: {
    paidPlans() {
      return this.$store.getters.paidPlans;
    },
    user() {
      return this.$store.getters.user;
    }
  },
  methods: {
    onLogout() {
      this.$store.dispatch("logout");
      this.$router.push("/signin");
    },
    onUpgradeAccount() {
      analytics.logEvent("begin_checkout", { category: "plan", description: "Click on upgrade plan"});
      if(this.paidPlans.length === 0) {
        this.$store.dispatch("loadPaidPlans");
      }
      this.subscribePlanStepperDialogTimestamp = this.timestamp();
    }
  }
};
</script>