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
        :visible="exchangeDialog"
        @close="exchangeDialog = false"
      ></AddExchangeDialog>
    </v-layout>
  </v-container>
</template>

<script>
import Exchanges from "../components/exchange/Exchanges";
import AddExchangeDialog from "../components/exchange/AddExchangeDialog";

export default {
  components: {
    Exchanges,
    AddExchangeDialog
  },
  data: () => ({
    exchangeDialog: false
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
      this.exchangeDialog = !this.exchangeDialog
    }
  }
};
</script>
