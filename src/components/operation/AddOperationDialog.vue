<template>
  <v-dialog v-model="dialog" width="800px">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title">Cadastrar operação</v-card-title>
      <v-flex xs12>
        <v-container grid-list-sm class="pa-4">
          <v-form ref="form" v-model="valid" lazy-validation class="ma-2">
            <v-layout row wrap>
              <v-flex xs12 sm6>
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
                      label="Data da operação"
                      prepend-icon="fas fa-calendar"
                      :rules="dateRules"
                      required
                      mask="##/##/####"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    ref="datePicker"
                    v-model="date"
                    :max="new Date().toISOString().substr(0, 10)"
                    min="2019-08-01"
                    no-title
                    @change="save"
                  ></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex xs12 sm6>
                <v-autocomplete
                  id="exchange"
                  name="exchange"
                  label="Exchange"
                  :items="exchangeList"
                  prepend-icon="fas fa-university"
                  v-model="exchange"
                  required
                  :rules="exchangeRules"
                ></v-autocomplete>
              </v-flex>
              <v-layout row v-if="exchange === 'Outra'">
                <v-flex xs12 sm4>
                  <v-text-field
                    name="exchangeName"
                    label="Nome da exchange"
                    id="exchangeName"
                    prepend-icon="fas fa-signature"
                    v-model="exchangeName"
                    required
                    :rules="exchangeNameRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm4>
                  <v-text-field
                    name="exchangeUrl"
                    label="URL da exchange"
                    id="exchangeUrl"
                    prepend-icon="fas fa-at"
                    v-model="exchangeUrl"
                    required
                    :rules="exchangeUrlRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm4>
                  <v-text-field
                    name="exchangeCountryCode"
                    label="País da exchange"
                    id="exchangeCountryCode"
                    prepend-icon="fas fa-globe"
                    v-model="exchangeCountryCode"
                    required
                    :rules="exchangeCountryCodeRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-flex xs12 sm6>
                <v-autocomplete
                  id="operation"
                  name="operation"
                  label="Operação"
                  :items="operationList"
                  prepend-icon="fas fa-exchange-alt"
                  v-model="operation"
                  required
                  :rules="operationRules"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 sm6 v-if="operation === 'Troca'">
                <v-autocomplete
                  id="operationType"
                  name="operationType"
                  label="Tipo da operação"
                  :items="operationTypeList"
                  prepend-icon="fas fa-cash-register"
                  v-model="operationType"
                  required
                  :rules="operationTypeRules"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 v-if="operation !== ''">
                <v-layout row>
                  <v-flex xs12 sm6>
                    <v-text-field
                      name="baseAsset"
                      label="Criptoativo"
                      id="baseAsset"
                      prepend-icon="fas fa-coins"
                      v-model="baseAsset"
                      required
                      :rules="baseAssetRules"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 v-if="operation === 'Troca'">
                    <v-text-field
                      name="quoteAsset"
                      label="Criptoativo de cotação"
                      id="quoteAsset"
                      prepend-icon="fas fa-coins"
                      v-model="quoteAsset"
                      required
                      :rules="quoteAssetRules"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6>
                    <v-text-field
                      name="baseAssetQty"
                      label="Quantidade"
                      id="baseAssetQty"
                      prepend-icon="fas fa-balance-scale"
                      v-model="baseAssetQty"
                      required
                      :rules="baseAssetQtyRules"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 v-if="operation === 'Troca'">
                    <v-text-field
                      name="quoteAssetQty"
                      label="Valor"
                      id="quoteAssetQty"
                      prepend-icon="fas fa-balance-scale"
                      v-model="quoteAssetQty"
                      required
                      :rules="quoteAssetQtyRules"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 v-if="operation === 'Troca'">
                    <v-text-field
                      name="commissionAsset"
                      label="Taxa (criptoativo)"
                      id="commissionAsset"
                      prepend-icon="fas fa-coins"
                      v-model="commissionAsset"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 v-if="operation === 'Troca'">
                    <v-text-field
                      name="commission"
                      label="Valor da taxa"
                      id="commission"
                      prepend-icon="fas fa-balance-scale"
                      v-model="commission"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-form>
        </v-container>
      </v-flex>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text :disabled="creating" color="secondary" @click="dialog = false">Cancelar</v-btn>
        <v-btn
          text
          :disabled="!valid || creating"
          color="primary"
          :loading="creating"
          @click="onAddOperation"
        >Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Date from "@/mixins/Date";

export default {
  props: {
    visible: Boolean
  },
  mixins: [Date],
  watch: {
    exchange(value) {
      if ((value !== null) & (value !== undefined) & value !== "Outra") {
        let exchange = this.systemExchanges.find(exchange => {
          return exchange.name === value;
        })
        this.exchangeName = exchange.name;
        this.exchangeUrl = exchange.url;
        this.exchangeCountryCode = exchange.countryCode;
      }
      else {
        this.exchangeName = "";
        this.exchangeUrl = "";
        this.exchangeCountryCode = "";
      }
    }
  },
  computed: {
    dialog: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
          this.$refs.form.reset();
          this.operation = "";
          this.date = "";
        }
      }
    },
    creating() {
      return this.$store.getters.creating;
    },
    computedDateFormatted() {
      return this.formatDate(this.date);
    },
    systemExchanges() {
      return this.$store.getters.systemExchanges;
    },
    exchangeList() {
      let exchangeList = this.$store.getters.systemExchanges.map(exchange => {
        return exchange.name;
      })
      exchangeList.push("Outra");
      return exchangeList;
    }
  },
  data: () => ({
    valid: true,
    operation: "",
    operationRules: [
      v => !!v || "Operação é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    operationList: ["Troca", "Depósito", "Saque"],
    exchange: "",
    exchangeRules: [
      v => !!v || "Exchange é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    exchangeName: "",
    exchangeNameRules: [
      v => !!v || "Nome da exchange é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    exchangeUrl: "",
    exchangeUrlRules: [
      v => !!v || "URL da exchange é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    exchangeCountryCode: "",
    exchangeCountryCodeRules: [
      v => !!v || "País da exchange é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    operationType: "",
    operationTypeRules: [
      v => !!v || "Tipo da operação é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    operationTypeList: ["Compra", "Venda"],
    date: "",
    dateRules: [
      v => !!v || "Data da operação é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    baseAsset: "",
    baseAssetRules: [
      v => !!v || "Criptoativo é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    baseAssetQty: "",
    baseAssetQtyRules: [
      v => !!v || "Quantidade é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    quoteAsset: "",
    quoteAssetRules: [
      v => !!v || "Criptoativo de cotação é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    quoteAssetQty: "",
    quoteAssetQtyRules: [
      v => !!v || "Valor é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    commissionAsset: "",
    commissionAssetRules: [
      v => !!v || "Taxa (criptoativoo) é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    commission: "",
    commissionRules: [
      v => !!v || "Valor da taxa é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    dateMenu: false
  }),

  methods: {
    save(date) {
      this.$refs.dateMenu.save(date);
    },
    onAddOperation() {
      if (this.$refs.form.validate()) {
        this.$store
          .dispatch("addOperation", {
            date: this.date,
            exchange: this.exchange,
            exchangeName: this.exchangeName,
            exchangeUrl: this.exchangeUrl,
            exchangeCountryCode: this.exchangeCountryCode,
            operation: this.operation,
            operationType: this.operationType,
            baseAsset: this.baseAsset,
            baseAssetQty: this.baseAssetQty,
            quoteAsset: this.quoteAsset,
            quoteAssetQty: this.quoteAssetQty,
            commissionAsset: this.commissionAsset,
            commission: this.commission
          })
          .then(() => {
            this.dialog = false;
          });
      }
    }
  }
};
</script>
