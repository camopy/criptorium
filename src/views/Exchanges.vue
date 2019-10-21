<template>
  <v-container fluid>
    <v-layout v-if="user && user.plan.benefits.syncExchanges">
      <Exchanges />
          <v-btn
            bottom
            right
            fab
            dark
            fixed
            color="primary"
            @click="onAddExchange"
          >
            <v-icon>fas fa-plus</v-icon>
          </v-btn>
      <AddExchangeDialog
        :exchangeDialogTimestamp="exchangeDialogTimestamp"
        @close="exchangeDialogTimestamp = ''"
      ></AddExchangeDialog>
    </v-layout>
  </v-container>
</template>

<script>
import Exchanges from "../components/exchange/Exchanges";
import AddExchangeDialog from "../components/exchange/AddExchangeDialog";
import Date from "@/mixins/Date";
import { analytics } from "@/main";

export default {
  components: {
    Exchanges,
    AddExchangeDialog
  },
  mixins: [Date],
  data: () => ({
    exchangeDialogTimestamp: ""
  }),
  computed: {
    user() {
      return this.$store.getters.user;
    },
    systemExchanges() {
      return this.$store.getters.systemExchanges;
    }
  },
  methods: {
    onAddExchange() {
      if(this.systemExchanges.length === 0) {
        this.$store.dispatch('loadSystemExchanges');
      }
      analytics.logEvent("add", {category: "exchange", action: "click", description: "Click on add exchange"});
      this.exchangeDialogTimestamp = this.timestamp();
    }
  }
};
</script>
