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
        color="indigo"
        @click="operationDialog = !operationDialog"
      >
        <v-icon>fas fa-plus</v-icon>
      </v-btn>
      <AddOperationDialog :visible="operationDialog" @close="operationDialog = false"></AddOperationDialog>
    </v-layout>
  </v-container>
</template>

<script>
import Operations from "../components/operation/Operations";
import AddOperationDialog from "../components/operation/AddOperationDialog";

export default {
  components: {
    Operations,
    AddOperationDialog
  },
  data: () => ({
    operationDialog: false,
    fab: false
  }),
  computed: {
    user() {
      return this.$store.getters.user;
    }
  }
};
</script>