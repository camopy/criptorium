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
                  <v-btn v-if="user.plan.name !== 'Free'" @click="cancelPlanDialog = !cancelPlanDialog">Cancelar</v-btn>
                </v-flex>
                <v-flex xs12 sm7>
                  <div
                    class="text--primary"
                  >Plano {{user.plan.name}}{{user.plan.name === "Free" ? "" : user.plan.period === "yearly" ? " - Anual" : " - Mensal"}}</div>
                  <div v-if="user.plan.name !== 'Free'">R${{user.plan.period === "monthly" ? user.plan.value : user.plan.value/12}}/mês</div>
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
                  <div>R${{user.plan.value/12}}/mês</div>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
      <AppSnackbar v-if="snackbarContent" :content="snackbarContent"/>
    </v-layout>
    <CancelPlanDialog :visible="cancelPlanDialog" @close="cancelPlanDialog = false"/>
  </v-container>
</template>

<script>
import Date from "@/mixins/Date";
import CancelPlanDialog from "@/components/plan/CancelPlanDialog";
import AppSnackbar from "@/components/shared/Snackbar";

export default {
  mixins: [Date],
  components: {
    CancelPlanDialog,
    AppSnackbar
  },
  data: () => ({
    cancelPlanDialog: false
  }),
  computed: {
    user() {
      return this.$store.getters.user;
    },
    birthday() {
      return this.formatDate(this.$store.getters.user.birthday);
    },
    snackbarContent() {
      return this.$store.getters.snackbarContent;
    }
  }
};
</script>