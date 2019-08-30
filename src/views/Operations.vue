<template>
  <v-container fluid>
    <v-layout>
      <Operations />
    </v-layout>
  </v-container>
</template>

<script>
import Operations from "../components/operation/Operations";

export default {
  components: {
    Operations
  },
  computed: {
    user() {
      return this.$store.getters.user;
    }
  }
};
</script>
