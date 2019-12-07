<template>
  <v-app>
    <router-view></router-view>
    <AppSnackbar v-if="snackbarContent" :content="snackbarContent"/>
  </v-app>
</template>

<script>
import AppSnackbar from "@/components/shared/Snackbar";

  export default {
    components: {
      AppSnackbar
    },
    watch: {
      '$route' (to) {
        document.title = to.meta.title || 'Criptorium'
      }
    },
    computed: {
      userIsAuthenticated() {
        return (
          this.$store.getters.user !== null &&
          this.$store.getters.user !== undefined
        );
      },
      snackbarContent() {
        return this.$store.getters.snackbarContent;
      }
    },
    mounted() {
      if (!this.userIsAuthenticated) {
        this.$router.replace({ name: "signin" });
      }
    },
    props: {
      source: String
    }
  }
</script>