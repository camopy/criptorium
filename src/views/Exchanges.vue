<template>
  <v-container fluid>
    <v-layout>
      <Exchanges />
      <v-tooltip left v-if="user">
        <template v-slot:activator="{ on }">
          <v-btn
            slot="activator"
            v-on="on"
            bottom
            right
            fab
            dark
            fixed
            small
            color="indigo"
            @click="exchangeDialog = !exchangeDialog"
          >
            <v-icon>fas fa-plus</v-icon>
          </v-btn>
        </template>
        <span>Cadastrar exchange</span>
      </v-tooltip>
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
    }
  }
};
</script>
