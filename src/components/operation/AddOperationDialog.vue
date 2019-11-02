<template>
  <v-dialog v-model="dialog" width="unset">
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
                      :error-messages="dateErrors"
                      @input="$v.date.$touch()"
                      @blur="$v.date.$touch()"
                      readonly
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
                  :loading="systemExchanges.length === 0"
                  prepend-icon="fas fa-university"
                  v-model="exchange"
                  :error-messages="exchangeErrors"
                  @input="$v.exchange.$touch()"
                  @blur="$v.exchange.$touch()"
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
                    :error-messages="exchangeNameErrors"
                    @input="$v.exchangeName.$touch()"
                    @blur="$v.exchangeName.$touch()"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm4>
                  <v-text-field
                    name="exchangeUrl"
                    label="URL da exchange"
                    id="exchangeUrl"
                    prepend-icon="fas fa-at"
                    v-model="exchangeUrl"
                    :error-messages="exchangeUrlErrors"
                    @input="$v.exchangeUrl.$touch()"
                    @blur="$v.exchangeUrl.$touch()"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm4>
                  <v-text-field
                    name="exchangeCountryCode"
                    label="País da exchange"
                    id="exchangeCountryCode"
                    prepend-icon="fas fa-globe"
                    v-model="exchangeCountryCode"
                    :error-messages="exchangeCountryCodeErrors"
                    @input="$v.exchangeCountryCode.$touch()"
                    @blur="$v.exchangeCountryCode.$touch()"
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
                  :error-messages="operationErrors"
                  @input="$v.operation.$touch()"
                  @blur="$v.operation.$touch()"
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
                  :error-messages="operationTypeErrors"
                  @input="$v.operationType.$touch()"
                  @blur="$v.operationType.$touch()"
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
                      :error-messages="baseAssetErrors"
                      @input="$v.baseAsset.$touch()"
                      @blur="$v.baseAsset.$touch()"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 v-if="operation === 'Troca'">
                    <v-text-field
                      name="quoteAsset"
                      label="Criptoativo de cotação"
                      id="quoteAsset"
                      prepend-icon="fas fa-coins"
                      v-model="quoteAsset"
                      :error-messages="quoteAssetErrors"
                      @input="$v.quoteAsset.$touch()"
                      @blur="$v.quoteAsset.$touch()"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6>
                    <v-text-field
                      name="baseAssetQty"
                      label="Quantidade"
                      id="baseAssetQty"
                      prepend-icon="fas fa-balance-scale"
                      v-model="baseAssetQty"
                      :error-messages="baseAssetQtyErrors"
                      @input="$v.baseAssetQty.$touch()"
                      @blur="$v.baseAssetQty.$touch()"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 v-if="operation === 'Troca'">
                    <v-text-field
                      name="quoteAssetQty"
                      label="Valor"
                      id="quoteAssetQty"
                      prepend-icon="fas fa-balance-scale"
                      v-model="quoteAssetQty"
                      :error-messages="quoteAssetQtyErrors"
                      @input="$v.quoteAssetQty.$touch()"
                      @blur="$v.quoteAssetQty.$touch()"
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
        <v-btn text :disabled="creating" @click="dialog = ''">Cancelar</v-btn>
        <v-btn
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
import { analytics } from "@/main";
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
  props: {
    operationDialogTimestamp: String
  },
  mixins: [Date, validationMixin],
  validations() {
    let validationFields = {
      date: { required },
      exchange: { required },
      exchangeName: { required },
      exchangeUrl: { required },
      exchangeCountryCode: { required },
      operation: { required },
      baseAsset: { required },
      baseAssetQty: { required },
    };

    if(this.operation === "Troca") {
      validationFields.operationType = { required };
      validationFields.quoteAsset = { required };
      validationFields.quoteAssetQty = { required };
    }

    return validationFields;
  },
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
        return this.operationDialogTimestamp;
      },
      set(value) {
        if (!value) {
          this.$v.$reset();
          this.$refs.form.reset();
          this.$emit("close");
          this.operation = "";
          this.date = "";
          // this.exchange = "",
          this.exchangeName = "";
          this.exchangeUrl = "";
          this.exchangeCountryCode = "";
          this.operation = "";
          this.operationType = "";
          this.baseAsset = "";
          this.quoteAsset = "";
          this.baseAssetQty = "";
          this.quoteAssetQty = "";
          this.commissionAsset = "";
          this.commission = "";
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
    },
    dateErrors() {
      const errors = []
      if (!this.$v.date.$dirty) return errors
      !this.$v.date.required && errors.push('Data da operação é obrigatório')
      return errors
    },
    operationErrors() {
      const errors = []
      if (!this.$v.operation.$dirty) return errors
      !this.$v.operation.required && errors.push('Operação é obrigatório')
      return errors
    },
    exchangeErrors() {
      const errors = []
      if (!this.$v.exchange.$dirty) return errors
      !this.$v.exchange.required && errors.push('Exchange é obrigatório')
      return errors
    },
    exchangeNameErrors() {
      const errors = []
      if (!this.$v.exchangeName.$dirty) return errors
      !this.$v.exchangeName.required && errors.push('Nome da exchange é obrigatório')
      return errors
    },
    exchangeUrlErrors() {
      const errors = []
      if (!this.$v.exchangeUrl.$dirty) return errors
      !this.$v.exchangeUrl.required && errors.push('URL da exchange é obrigatório')
      return errors
    },
    exchangeCountryCodeErrors() {
      const errors = []
      if (!this.$v.exchangeCountryCode.$dirty) return errors
      !this.$v.exchangeCountryCode.required && errors.push('País da exchange é obrigatório')
      return errors
    },
    operationTypeErrors() {
      const errors = []
      if (!this.$v.operationType.$dirty) return errors
      !this.$v.operationType.required && errors.push('Tipo da operação é obrigatório')
      return errors
    },
    baseAssetErrors() {
      const errors = []
      if (!this.$v.baseAsset.$dirty) return errors
      !this.$v.baseAsset.required && errors.push('Criptoativo é obrigatório')
      return errors
    },
    baseAssetQtyErrors() {
      const errors = []
      if (!this.$v.baseAssetQty.$dirty) return errors
      !this.$v.baseAssetQty.required && errors.push('Quantidade é obrigatório')
      return errors
    },
    quoteAssetErrors() {
      const errors = []
      if (!this.$v.quoteAsset.$dirty) return errors
      !this.$v.quoteAsset.required && errors.push('Criptoativo de cotação é obrigatório')
      return errors
    },
    quoteAssetQtyErrors() {
      const errors = []
      if (!this.$v.quoteAssetQty.$dirty) return errors
      !this.$v.quoteAssetQty.required && errors.push('Valor é obrigatório')
      return errors
    },
    commissionAssetErrors() {
      const errors = []
      if (!this.$v.commissionAsset.$dirty) return errors
      !this.$v.commissionAsset.required && errors.push('Taxa (criptoativo) é obrigatório')
      return errors
    },
    commissionErrors() {
      const errors = []
      if (!this.$v.commission.$dirty) return errors
      !this.$v.commission.required && errors.push('Valor da taxa é obrigatório')
      return errors
    },
  },
  data: () => ({
    valid: true,
    operation: "",
    operationList: ["Troca", "Depósito", "Saque"],
    exchange: "",
    exchangeName: "",
    exchangeUrl: "",
    exchangeCountryCode: "",
    operationType: "",
    operationTypeList: ["Compra", "Venda"],
    date: "",
    baseAsset: "",
    baseAssetQty: "",
    quoteAsset: "",
    quoteAssetQty: "",
    commissionAsset: "",
    commission: "",
    dateMenu: false
  }),

  methods: {
    save(date) {
      this.$refs.dateMenu.save(date);
    },
    onAddOperation() {
      this.$v.$touch();
      if (!this.$v.$error) {
        let addOperationTimestamp = this.timestamp();
        analytics.logEvent("add", {category: "operation", action: "confirm", description: 'Confirm add operation'});
        analytics.logEvent("form", {category: "operation", description: "Fill add operation form", duration: Number(addOperationTimestamp) - Number(this.operationDialogTimestamp)});
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
            analytics.logEvent("firestoreCall", {category: "operation", operation: "set", description: 'Add operation to firebase', duration: Number(this.timestamp()) - Number(addOperationTimestamp)});
            this.dialog = "";
          });
      }
    }
  }
};
</script>
