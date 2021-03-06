<template>
  <v-container id="scroll-target" fluid>
    <v-layout v-if="user">
      <v-flex xs12>
        <v-row>
          <v-container>
            <v-layout row wrap align-center>
              <v-btn
                dark
                small
                color="secondary"
                @click="generateOperationsTextFileDialog = !generateOperationsTextFileDialog"
              >Gerar TXT</v-btn>
              <v-spacer></v-spacer>
              <v-flex xs12 sm5 md5>
                <v-menu
                  ref="dateMenu"
                  :close-on-content-click="false"
                  v-model="dateMenu"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  full-width
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="computedDateFormatted"
                      label="Mês das operações"
                      :prepend-icon="calendarSVG"
                      clearable
                      @click:clear="filterOperationsFromFirestore"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="date"
                    full-width
                    type="month"
                    min="2019-08"
                    :max="new Date().toISOString().substr(0, 10)"
                    no-title
                    :show-current="this.$moment().format('YYYY-MM')"
                    @change="save"
                  ></v-date-picker>
                </v-menu>
              </v-flex>
            </v-layout>
          </v-container>
          <v-expansion-panels inset multiple>
            <v-expansion-panel v-for="operation in user.operations" :key="operation.id">
              <v-expansion-panel-header>
                <v-layout row align-center>
                  <v-flex xs6 sm2><span class="operationDate">{{formatDate(operation.time, "x")}}</span></v-flex>
                  <v-flex xs6 sm3><span>{{operation.exchangeName}}</span></v-flex>
                  <v-flex
                    xs6
                    sm2
                  ><span>{{operation.type === "trade" ? "Trade" : (operation.type === "whitdraw" ? 'Saque' : 'Depósito')}}</span></v-flex>
                  <v-flex xs6 sm2><span class="symbol">{{operation.symbol}}</span></v-flex>
                  <v-flex
                    xs6
                    sm3
                    v-if="operation.isBuyer === true"
                  ><span class="buyOperation">Compra</span></v-flex>
                  <v-flex
                    xs6
                    sm3
                    v-else-if="operation.isBuyer === false"
                  ><span class="sellOperation">Venda</span></v-flex>
                  <!-- <v-flex
                    xs6
                    sm3
                  ><span class="operationBuyer">{{operation.isBuyer === undefined ? "" : (operation.isBuyer === true ? 'Compra' : 'Venda')}}</span></v-flex> -->
                </v-layout>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="operationDetails">
                <v-layout v-if="operation.type==='trade'" row>
                  <v-flex xs6>Criptoativo: {{operation.baseAsset}}</v-flex>
                  <v-flex xs6>Quantidade: {{Number(operation.qty).toFixed(8)}}</v-flex>
                  <v-flex xs6>Criptoativo de cotação: {{operation.quoteAsset}}</v-flex>
                  <v-flex xs6>Preço: {{Number(operation.price).toFixed(8)}}</v-flex>
                  <v-flex xs12>Valor da operação: {{Number(operation.quoteQty).toFixed(8)}}</v-flex>
                  <v-flex v-if="operation.commissionAsset" xs6>Taxa: {{operation.commissionAsset}}</v-flex>
                  <v-flex
                    v-if="operation.commission"
                    xs6
                  >Valor da taxa: {{Number(operation.commission).toFixed(8)}}</v-flex>
                </v-layout>
                <v-layout v-else row>
                  <v-flex xs12>Quantidade: {{Number(operation.qty).toFixed(8)}}</v-flex>
                  <v-flex xs12>Endereço: {{operation.address}}</v-flex>
                  <v-flex xs12>ID da transação: {{operation.txId}}</v-flex>
                  <v-flex
                    xs12
                    v-if="operation.type==='whitdraw'"
                  >Taxa da transação: {{Number(operation.transactionFee).toFixed(8)}}</v-flex>
                </v-layout>
                <v-layout row>
                  <v-spacer />
                  <v-btn v-if="operation.addedByUser" text icon small @click="onDeleteOperation(operation)"><v-icon>{{deleteSVG}}</v-icon></v-btn>
                </v-layout>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-row>
        <v-container fluid>
          <v-layout v-if="loading" column justify-center align-center>
            <v-flex xs12 class="text-xs-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
    <GenerateOperationsTextFileDialog
      :visible="generateOperationsTextFileDialog"
      @close="generateOperationsTextFileDialog = false"
    ></GenerateOperationsTextFileDialog>
  </v-container>
</template>

<script>
import Date from "@/mixins/Date";
import { analytics } from "@/main";
import GenerateOperationsTextFileDialog from "@/components/operation/GenerateOperationsTextFileDialog";
import { mdiCalendar, mdiDelete } from '@mdi/js';

export default {
  components: {
    GenerateOperationsTextFileDialog
  },
  mixins: [Date],
  created() {
    window.addEventListener("scroll", () => {
      this.bottom = this.bottomVisible();
    });
  },
  watch: {
    bottom(bottom) {
      if (bottom) {
        if (this.date) {
          this.fetchOperationsFromFirestoreByMonth(this.date);
        } else {
          this.fetchOperationsFromFirestore();
        }
      }
    },
    date(value) {
      if (value) {
        this.filterOperationsByDateFromFirestore(value);
      }
    },
    lastReturnedOperationByMonth(value) {
      if (!value) {
        this.date = "";
      }
    }
  },
  data: () => ({
    bottom: false,
    date: "",
    dateMenu: false,
    generateOperationsTextFileDialog: false,
    calendarSVG: mdiCalendar,
    deleteSVG: mdiDelete
  }),
  computed: {
    user() {
      return this.$store.getters.user;
    },
    loading() {
      return this.$store.getters.loading;
    },
    computedDateFormatted() {
      return this.formatDateToMonth(this.date);
    },
    lastReturnedOperationByMonth() {
      return this.$store.getters.lastReturnedOperationByMonth;
    }
  },
  methods: {
    fetchOperationsFromFirestore() {
      analytics.logEvent("fetch", { category: "operation", filtered: false, description: "Fetch more operations"});
      return this.$store.dispatch("fetchMoreOperations");
    },
    fetchOperationsFromFirestoreByMonth(date) {
      analytics.logEvent("fetch", { category: "operation", filtered: true, description: "Fetch more operations by month"});
      return this.$store.dispatch("fetchMoreOperationsByMonth", date);
    },
    filterOperationsFromFirestore() {
      this.date = "";
      analytics.logEvent("filter", { category: "operation", filtered: false, description: "Reset filter operations"});
      return this.$store.dispatch("fetchOperations");
    },
    filterOperationsByDateFromFirestore(date) {
      analytics.logEvent("filter", { category: "operation", filtered: true, description: "Filter operations by month"});
      return this.$store.dispatch("fetchOperationsByMonth", date);
    },
    bottomVisible() {
      const scrollY = window.scrollY;
      const visible = document.documentElement.clientHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const bottomOfPage = visible + scrollY + 50 >= pageHeight;
      const bottomVisible = bottomOfPage || pageHeight < visible;
      return bottomVisible;
    },
    save(date) {
      this.$refs.dateMenu.save(date);
    },
    onDeleteOperation(operation) {
      let deleteOperationTimestamp = this.timestamp();
      analytics.logEvent("delete", { category: "operation", action: "confirm", description: "Delete operation"})
      this.$store.dispatch("deleteOperation", operation).then(() => {
        analytics.logEvent("firestoreCall", { category: "operation", operation: "delete", description: "Delete operation from firebase", duration: Number(this.timestamp()) - Number(deleteOperationTimestamp)});
      });
    }
  }
};
</script>

<style scoped>
.operationDate {
  /* font-weight: bold; */
  font-size: 16px;
}
.symbol {
  /* font-weight: bold; */
  font-size: 17px;
}
.buyOperation {
  color: var(--v-secondary-base);
}
.sellOperation {
  color: var(--v-error-base);
}
.operationDetails {
  color: var(--v-text-base);
}
</style>
