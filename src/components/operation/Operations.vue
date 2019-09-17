<template>
  <v-container id="scroll-target" fluid>
    <v-layout v-if="user">
      <v-flex xs12>
        <v-row justify="center">
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
        this.fetchOperationsFromFirestore();
      }
    }
  },
  data: () => ({
    bottom: false
  }),
  computed: {
    user() {
      return this.$store.getters.user;
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  methods: {
    fetchOperationsFromFirestore() {
      return this.$store.dispatch("fetchMoreOperations");
    },
    bottomVisible() {
      const scrollY = window.scrollY;
      const visible = document.documentElement.clientHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const bottomOfPage = visible + scrollY + 50 >= pageHeight;
      const bottomVisible = bottomOfPage || pageHeight < visible;
      return bottomVisible;
    }
  }
};
</script>
