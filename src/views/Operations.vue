<template>
  <v-container fluid>
    <v-layout>
      <Operations />
      <v-btn
        fab
        bottom
        right
        fixed
        dark
        color="primary"
        @click="onAddOperations"
      >
        <v-icon>{{plusSVG}}</v-icon>
      </v-btn>
      <AddOperationDialog :operationDialogTimestamp="operationDialogTimestamp" @close="operationDialogTimestamp = ''"></AddOperationDialog>
    </v-layout>
  </v-container>
</template>

<script>
import Operations from "../components/operation/Operations";
import AddOperationDialog from "../components/operation/AddOperationDialog";
import { analytics } from "@/main";
import { mdiPlus } from '@mdi/js';

export default {
  components: {
    Operations,
    AddOperationDialog
  },
  data: () => ({
    operationDialogTimestamp: "",
    fab: false,
    plusSVG: mdiPlus
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
    onAddOperations() {
      if(this.systemExchanges.length === 0) {
        this.$store.dispatch('loadSystemExchanges');
      }
      analytics.logEvent("add", { category: "operation", action: "click", description: 'Click on add operation'});
      this.operationDialogTimestamp = this.$moment().format("x");
    }
  }
};
</script>