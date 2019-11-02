<template>
  <v-dialog v-model="dialog" :persistent="updating" width="unset">
    <v-card v-if="user">
      <v-card-title class="grey lighten-4 py-4 title">Cancelar assinatura</v-card-title>
      <v-flex xs12>
        <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
              <v-flex xs12>
                <div>Você tem certeza que quer cancelar sua assinatura?</div>
                <div>Você terá acesso as funcionalidades do seu plano até {{this.formatDate(planDateLimit)}}</div>
              </v-flex>
            </v-layout>
        </v-container>
      </v-flex>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text :disabled="updating" color="error" @click="dialog = false">Voltar</v-btn>
        <v-btn
          :disabled="updating"
          color="primary"
          :loading="updating"
          @click="onCancelPlan"
        >
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Date from "@/mixins/Date";
import { analytics } from "@/main";
export default {
  props: {
    visible: Boolean
  },
  mixins: [Date],
  computed: {
    dialog: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
        }
      }
    },
    user() {
      return this.$store.getters.user;
    },
    updating() {
      return this.$store.getters.updating;
    },
    planDateLimit() {
      let lastEventTimestamp = this.$store.getters.user.preApproval.lastEventTimestamp;
      return this.moment(lastEventTimestamp).add(1, "M").format("x");
    }
  },

  methods: {
    onCancelPlan() {
      let cancelPlanTimestamp = this.timestamp();
      analytics.logEvent("unsubscribe", { category: "plan", action: "confirm", description: "Confirm cancel plan"});
      this.$store
        .dispatch("unsubscribeUserFromPlan")
        .then(() => {
          analytics.logEvent("unsubscribed", { category: "plan", description: "Plan unsubscribed", duration: Number(this.timestamp()) - Number(cancelPlanTimestamp)});
          this.dialog = false;
        });
    }
  }
};
</script>
