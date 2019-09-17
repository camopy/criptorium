<template>
  <v-container id="scroll-target" fluid>
    <v-layout v-if="user">
      <v-flex xs12>
        <v-row >
          <v-container>
            <v-layout>
          <v-spacer></v-spacer>

          <v-flex xs10 sm5 md5>
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
                  prepend-icon="fas fa-calendar"
                  clearable
                  @click:clear="filterOperationsFromFirestore"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="date"
                full-width
                type="month"
                min="2019-07"
                :max="new Date().toISOString().substr(0, 10)"
                no-title
                :show-current="this.$moment().format('YYYY-MM')"
                @change="save"
              ></v-date-picker>
            </v-menu>
          </v-flex>
            </v-layout>

          </v-container>
          <v-expansion-panels popout multiple>
            <v-expansion-panel v-for="operation in user.operations" :key="operation.id">
              <v-expansion-panel-header>
                <v-layout row>
                  <v-flex xs6 sm2>{{formatDate(operation.time, "x")}}</v-flex>
                  <v-flex xs6 sm2>{{operation.exchangeName}}</v-flex>
                  <v-flex
                    xs6
                    sm2
                  >{{operation.type === "trade" ? "Trade" : (operation.type === "whitdraw" ? 'Saque' : 'Depósito')}}</v-flex>
                  <v-flex xs6 sm2>{{operation.symbol}}</v-flex>
                  <v-flex
                    xs6
                    sm2
                  >{{operation.isBuyer === undefined ? "" : (operation.isBuyer === true ? 'Compra' : 'Venda')}}</v-flex>
                </v-layout>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
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
  </v-container>
</template>

<script>
import Date from "@/mixins/Date";

export default {
  mixins: [Date],
  created() {
    window.addEventListener("scroll", () => {
      this.bottom = this.bottomVisible();
    });
  },
  watch: {
    bottom(bottom) {
      if (bottom) {
        if(this.date){
          this.fetchOperationsFromFirestoreByMonth(this.date);
        }
        else {
          this.fetchOperationsFromFirestore();
        }
      }
    },
    date(value) {
      if(value) {
        this.filterOperationsByDateFromFirestore(value);
      }
    },
    lastReturnedOperationByMonth(value) {
      if(!value) {
        this.date = "";
      }
    }
  },
  data: () => ({
    bottom: false,
    date: "",
    dateMenu: false
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
      return this.$store.dispatch("fetchMoreOperations");
    },
    fetchOperationsFromFirestoreByMonth(date) {
      return this.$store.dispatch("fetchMoreOperationsByMonth", date);
    },
    filterOperationsFromFirestore() {
      this.date = "";
      return this.$store.dispatch("fetchOperations");
    },
    filterOperationsByDateFromFirestore(date) {
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
    }
  }
};
</script>
