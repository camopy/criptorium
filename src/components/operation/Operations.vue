<template>
  <v-container fluid>
    <v-layout v-if="user" justify-center>
      <v-data-table
        :loading="loading"
        loading-text="Carregando operações"
        :headers="headers"
        :items="user.operations"
        :sort-by="['time']"
        :sort-desc="[true]"
        class="elevation-1"
      ></v-data-table>
    </v-layout>
  </v-container>
</template>

<script>
import Date from "@/mixins/Date";

export default {
  mixins: [Date],
  data: () => ({
    headers: [
      { text: "Operação", value: "type" },
      { text: "Exchange", value: "exchange" },
      {
        text: "Par",
        align: "left",
        value: "symbol"
      },
      { text: "Quantidade", value: "qty" },
      { text: "Preço", value: "price" },
      { text: "Valor", value: "quoteQty" },
      { text: "Taxa (Moeda)", value: "commissionAsset" },
      { text: "Taxa", value: "commission" },
      { text: "Data", value: "time" },
      { text: "Data Formatada", value: "timef" }
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
