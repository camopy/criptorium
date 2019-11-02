<template>
  <v-container fluid>
    <v-layout>
      <v-flex xs12>
        <v-card v-if="user">
          <v-card-text>
            <v-container>
              <v-layout row>
                <v-flex xs12 sm5>
                  <div class="display-1 text--primary">Meus dados</div>
                </v-flex>
                <v-flex xs12 sm7>
                  <div class="text--primary">{{user.name}}</div>
                  <div>{{user.email}}</div>
                  <div>CPF: {{user.cpf}}</div>
                  <div>Data de nascimento: {{birthday}}</div>
                </v-flex>
                  <v-flex xs12>
                    <v-divider class="my-3"></v-divider>
                  </v-flex>
                <v-flex xs12 sm5>
                  <div class="display-1 text--primary">Assinatura</div>
                  <v-btn v-if="user.preApproval.status === 'suspended'" color="primary" @click="onReactivatePlan">Reativar</v-btn>
                  <v-btn text color="error" v-else-if="user.plan.type === 'paid'" @click="onCancelPlan">Cancelar</v-btn>
                </v-flex>
                <v-flex xs12 sm7>
                  <div
                    class="text--primary"
                  >Plano {{user.plan.name}}{{user.plan.type === "free" ? "" : user.plan.period === "yearly" ? " - Anual" : " - Mensal"}}</div>
                  <div v-if="user.plan.type === 'paid'">R${{user.plan.period === "monthly" ? user.plan.price : user.plan.price/12}}/mês</div>
                  <div v-if="user.preApproval.status === 'suspended'">Sua assinatura vale até {{planDateLimit}}</div>
                </v-flex>
                <v-flex xs12>
                  <v-divider class="my-3"></v-divider>
                </v-flex>
                <v-flex xs12 sm5>
                  <div class="display-1 text--primary">Detalhes do plano</div>
                </v-flex>
                <v-flex xs12 sm7>
                  <div
                    class="text--primary"
                  >{{user.plan.name}} - {{user.plan.period === "yearly" ? "Anual" : "Mensal"}}</div>
                  <div>R${{user.plan.price/12}}/mês</div>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <CancelPlanDialog :visible="cancelPlanDialog" @close="cancelPlanDialog = false"/>
    <ReactivatePlanDialog :visible="reactivatePlanDialog" @close="reactivatePlanDialog = false"/>
  </v-container>
</template>

<script>
import Date from "@/mixins/Date";
import CancelPlanDialog from "@/components/plan/CancelPlanDialog";
import ReactivatePlanDialog from "@/components/plan/ReactivatePlanDialog";
import { analytics } from "@/main"

export default {
  mixins: [Date],
  components: {
    CancelPlanDialog,
    ReactivatePlanDialog
  },
  data: () => ({
    cancelPlanDialog: false,
    reactivatePlanDialog: false
  }),
  computed: {
    user() {
      return this.$store.getters.user;
    },
    birthday() {
      return this.formatDate(this.$store.getters.user.birthday);
    },
    planDateLimit() {
      let lastEventTimestamp = this.$store.getters.user.preApproval.lastEventTimestamp;
      return this.formatDate(this.moment(lastEventTimestamp).add(1, "M").format("x"));
    }
  },
  methods: {
    onReactivatePlan() {
      analytics.logEvent("resubscribe", { category: "plan", action: "click", description: "Click on reactivate plan" });
      this.reactivatePlanDialog = !this.reactivatePlanDialog
    },
    onCancelPlan() {
      analytics.logEvent("unsubscribe", { category: "plan", action: "click", description: "Click on cancel plan" });
      this.cancelPlanDialog = !this.cancelPlanDialog
    }
  }
};
</script>