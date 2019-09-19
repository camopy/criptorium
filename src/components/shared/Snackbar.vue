<template>
  <v-snackbar v-model="snackbar" :value="content" :color="content.type">
    {{content.message}}
    <v-btn dark text @click="onClose">Close</v-btn>
  </v-snackbar>
</template>

<script>
export default {
  props: {
    content: Object
  },
  computed: {
    snackbar: {
      get() {
        return this.content;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
          this.$store.dispatch("clearSnackbarContent");
        }
      }
    }
  },
  methods: {
    onClose() {
      this.$emit("dismissed");
      this.$store.dispatch("clearSnackbarContent");
    }
  }
};
</script>