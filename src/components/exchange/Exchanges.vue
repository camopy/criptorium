<template lang="pug">
  v-container(fluid)
    v-layout(v-if="loading" column justify-center align-center)
      v-flex(xs12 class="text-xs-center")
        v-progress-circular(indeterminate color="primary")
    v-slide-y-transition(v-else mode="out-in")
      v-layout(v-if="user" row wrap)
        v-flex(xs12)
          v-card(v-for="exchange in user.exchanges" :key="exchange.id" class="mb-2")
                  v-card-title
                    div
                      div {{ exchange.name }}
                      span(v-if="exchange.lastSync" class="lastSync") Última sincronização: {{ formatDate(exchange.lastSync, "x") }}
                  v-card-actions
                    v-spacer
                    v-btn(text color="secondary" @click="onSync(exchange)" :loading="creating") Sincronizar
</template>

<script>
import Date from "@/mixins/Date";
import { analytics } from "@/main";

export default {
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
    }
  },
  methods: {
    onSync(exchange) {
      let syncTimestamp = this.timestamp();
      analytics.logEvent("sync", {
        category: "exchange",
        action: "click",
        description: "Sync exchange operations",
        exchange: exchange.systemExchange
      });
      return this.$store
        .dispatch("syncExchangeOperations", exchange)
        .then(() => {
          analytics.logEvent("sync", {
            category: "exchange",
            action: "sync",
            description: "Exchange API call",
            exchange: exchange.id,
            duration: Number(this.timestamp()) - Number(syncTimestamp)
          });
        });
    }
  }
};
</script>

<style scoped>
.lastSync {
  color: gray;
  font-size: 18px;
}
</style>