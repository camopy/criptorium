<template>
  <v-dialog v-model="dialog" width="unset">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title">Reativar assinatura</v-card-title>
      <v-flex xs12>
        <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
              <v-flex xs12>
                <div>Você tem certeza que quer reativar sua assinatura?</div>
                <div>A cobrança recorrente de R${{user.plan.price}} será reativada na próxima data de cobrança.</div>
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
          Reativar
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
      let reactivatePlanTimestamp = this.timestamp();
      analytics.logEvent("resubscribe", { category: "plan", action: "confirm", description: "Confirm reactivate plan"});
      this.$store
        .dispatch("resubscribeUserToPlan", {
          userId: this.user.id
        })
        .then(() => {
          analytics.logEvent("resubscribe", { category: "plan", action: "resubscribe", description: "Reactivate plan", duration: this.timestamp() - reactivatePlanTimestamp});
          this.dialog = false;
        });
    }
  }
};
</script>
