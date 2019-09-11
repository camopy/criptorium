<template>
  <v-container fluid>
    <v-layout>
      <Operations />

      <v-speed-dial
        v-model="fab"
        bottom
        right
        direction="left"
        fixed
        open-on-hover
        transition="'slide-y-reverse-transition'"
      >
        <template v-slot:activator>
          <v-btn v-model="fab" color="primary" dark fab>
            <v-icon v-if="fab">fas fa-times</v-icon>
            <v-icon v-else>fas fa-plus</v-icon>
          </v-btn>
        </template>
        <v-tooltip top v-if="user">
          <template v-slot:activator="{ on }">
            <v-btn
              slot="activator"
              v-on="on"
              fab
              dark
              small
              color="indigo"
              @click="operationDialog = !operationDialog"
            >
              <v-icon>fas fa-coins</v-icon>
            </v-btn>
          </template>
          <span>Cadastrar operação</span>
        </v-tooltip>
        <v-tooltip top v-if="user">
          <template v-slot:activator="{ on }">
            <v-btn
              slot="activator"
              v-on="on"
              fab
              dark
              small
              color="green"
              @click="generateOperationsTextFileDialog = !generateOperationsTextFileDialog"
            >
              <v-icon>fas fa-file-alt</v-icon>
            </v-btn>
          </template>
          <span>Gerar arquivo TXT</span>
        </v-tooltip>
      </v-speed-dial>
      <AddOperationDialog :visible="operationDialog" @close="operationDialog = false"></AddOperationDialog>
      <GenerateOperationsTextFileDialog :visible="generateOperationsTextFileDialog" @close="generateOperationsTextFileDialog = false"></GenerateOperationsTextFileDialog>
    </v-layout>
  </v-container>
</template>

<script>
import Operations from "../components/operation/Operations";
import AddOperationDialog from "../components/operation/AddOperationDialog";
import GenerateOperationsTextFileDialog from "../components/operation/GenerateOperationsTextFileDialog";

export default {
  components: {
    Operations,
    AddOperationDialog,
    GenerateOperationsTextFileDialog
  },
  data: () => ({
    operationDialog: false,
    generateOperationsTextFileDialog: false,
    fab: false
  }),
  computed: {
    user() {
      return this.$store.getters.user;
    }
  }
};
</script>