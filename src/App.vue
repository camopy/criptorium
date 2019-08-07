<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
  export default {
    computed: {
      userIsAuthenticated() {
        return (
          this.$store.getters.user !== null &&
          this.$store.getters.user !== undefined
        );
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