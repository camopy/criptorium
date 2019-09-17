<template>
  <v-container fluid>
    <v-layout v-if="user">
      <v-flex xs12>
        <v-data-table
          :loading="loading"
          loading-text="Carregando operações"
          :headers="headers"
          :items="user.operations"
          item-key="id"
          :sort-by="['time']"
          :sort-desc="[true]"
          show-expand
          :expanded.sync="expanded"
          class="elevation-1"
        >
          <template v-slot:expanded-item="{ item }">
            <td :colspan="headers.length + 1">
              <v-layout row v-if="item.type === 'trade'">
                <v-flex xs12>Moeda de taxa: {{item.commissionAsset}}</v-flex>
                <v-flex xs12>Valor da taxa: {{item.commission}}</v-flex>
              </v-layout>
              <v-layout row v-if="item.type === 'whitdraw'">
                <v-flex xs12>Endereço: {{item.address}}</v-flex>
                <v-flex xs12>ID da transação: {{item.txId}}</v-flex>
                <v-flex xs12>Taxa da transação: {{item.transactionFee}}</v-flex>
              </v-layout>
              <v-layout row v-if="item.type === 'deposit'">
                <v-flex xs12>Endereço: {{item.address}}</v-flex>
                <v-flex xs12>ID da transação: {{item.txId}}</v-flex>
              </v-layout>
            </td>
          </template>
          <template v-slot:item.time="{ item }">{{formatDate(item.time)}}</template>
          <template
            v-slot:item.isBuyer="{ item }"
          >{{item.isBuyer === undefined ? "" : (item.isBuyer === true ? 'Compra' : 'Venda')}}</template>
          <template
            v-slot:item.type="{ item }"
          >{{item.type === "trade" ? "Trade" : (item.type === "whitdraw" ? 'Saque' : 'Depósito')}}</template>
          <template v-slot:item.qty="{ item }">{{Number(item.qty).toFixed(8)}}</template>
          <template v-slot:item.price="{ item }">{{item.price ? Number(item.price).toFixed(8) : ""}}</template>
          <template
            v-slot:item.quoteQty="{ item }"
          >{{item.quoteQty ? Number(item.quoteQty).toFixed(8) : ""}}</template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Date from "@/mixins/Date";

export default {
  mixins: [Date],
  data: () => ({
    expanded: [],
    headers: [
      { text: "Data", align: "right", value: "time", sortable: false },
      { text: "Operação", align: "right", value: "type", sortable: false },
      {
        text: "Exchange",
        align: "right",
        value: "exchangeName",
        sortable: false
      },
      {
        text: "Moeda",
        align: "right",
        value: "symbol",
        sortable: false
      },
      { text: "Tipo", align: "right", value: "isBuyer", sortable: false },
      { text: "Quantidade", align: "right", value: "qty", sortable: false },
      { text: "Preço (un)", align: "right", value: "price", sortable: false },
      { text: "Valor", align: "right", value: "quoteQty", sortable: false },
    ]
  }),
  computed: {
    user() {
      return this.$store.getters.user;
    },
    loading() {
      return this.$store.getters.loading;
    }
  }
};
</script>
