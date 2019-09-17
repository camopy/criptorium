<template>
  <v-container fluid>
    <v-layout v-if="loading" column justify-center align-center>
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-slide-y-transition v-else mode="out-in">
      <v-layout v-if="user" row wrap>
        <v-flex xs12>
          <v-card v-for="exchange in user.exchanges" :key="exchange.id" class="mb-2">
            <v-container fluid>
              <v-layout row>
                <v-flex xs7 sm8 md9>
                  <v-card-title primary-title>
                    <div>
                      <h2 class="mb-0">{{ exchange.name }}</h2>
                      Última sincronização: {{ formatDate(exchange.lastSync, "x") }}
                    </div>
                  </v-card-title>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="onSync(exchange)" :loading="creating">Sincronizar</v-btn>
                  </v-card-actions>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      <AppSnackbar v-if="snackbarContent" :content="snackbarContent"/>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
import Date from "@/mixins/Date";
import AppSnackbar from "@/components/shared/Snackbar";

export default {
  components: {
    AppSnackbar
  },
  mixins: [Date],
  computed: {
    user() {
      return this.$store.getters.user;
    },
    loading() {
      return this.$store.getters.loading;
    },
    creating() {
      return this.$store.getters.creating;
    },
    snackbarContent() {
      return this.$store.getters.snackbarContent;
    }
  },
  methods: {
    onSync(exchange) {
      switch (exchange.exchangeId) {
        case "binance":
          return this.$store.dispatch("syncBinanceOperations", exchange);
      }
    }
  }
};
</script>
