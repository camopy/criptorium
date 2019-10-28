<template>
  <v-dialog v-model="dialog" width="800px">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title">Cadastrar exchange</v-card-title>
      <v-flex xs12>
        <v-container grid-list-sm class="pa-4">
          <v-form ref="form" v-model="valid" lazy-validation class="ma-2">
            <v-layout row wrap>
              <v-flex xs12>
                <v-autocomplete
                  id="exchange"
                  name="exchange"
                  label="Exchange"
                  :items="exchangeList"
                  prepend-icon="fas fa-university"
                  v-model="exchange"
                  :error-messages="exchangeErrors"
                  @input="$v.exchange.$touch()"
                  @blur="$v.exchange.$touch()"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  name="apiKey"
                  label="API key"
                  id="apiKey"
                  prepend-icon="fas fa-key"
                  v-model="apiKey"
                  :error-messages="apiKeyErrors"
                  @input="$v.apiKey.$touch()"
                  @blur="$v.apiKey.$touch()"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  name="privateKey"
                  label="Secret key"
                  id="privateKey"
                  prepend-icon="fas fa-key"
                  v-model="privateKey"
                  :error-messages="privateKeyErrors"
                  @input="$v.privateKey.$touch()"
                  @blur="$v.privateKey.$touch()"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-form>
        </v-container>
      </v-flex>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text :disabled="creating" color="error" @click="dialog = ''">Cancelar</v-btn>
        <v-btn
          text
          :disabled="!valid || creating"
          color="primary"
          :loading="creating"
          @click="onAddExchange"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import Date from "@/mixins/Date";
import { analytics } from "@/main"

export default {
  props: {
    exchangeDialogTimestamp: String
  },
  mixins: [validationMixin, Date],
  validations: {
    exchange: { required },
    apiKey: { required },
    privateKey: { required },
  },
  watch: {
    exchange(value) {
      if ((value !== null) & (value !== undefined) & value !== "Outra") {
        let exchange = this.systemExchanges.find(exchange => {
          return exchange.name === value;
        })
        this.exchangeId = exchange.id;
      }
    }
  },
  computed: {
    dialog: {
      get() {
        return this.exchangeDialogTimestamp;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
          this.$v.$reset();
          // this.$refs.form.reset();
          // this.exchange = "";
          this.exchangeId = "";
          this.apiKey = "";
          this.privateKey = "";
        }
      }
    },
    creating() {
      return this.$store.getters.creating;
    },
    systemExchanges() {
      return this.$store.getters.systemExchanges;
    },
    exchangeList() {
      return this.$store.getters.systemExchanges.map(exchange => {
        return exchange.name;
      });
    },
    exchangeErrors() {
      const errors = []
      if (!this.$v.exchange.$dirty) return errors
      !this.$v.exchange.required && errors.push('Exchange é obrigatório')
      return errors
    },
    apiKeyErrors() {
      const errors = []
      if (!this.$v.apiKey.$dirty) return errors
      !this.$v.apiKey.required && errors.push('API Key é obrigatório')
      return errors
    },
    privateKeyErrors() {
      const errors = []
      if (!this.$v.privateKey.$dirty) return errors
      !this.$v.privateKey.required && errors.push('Private Key é obrigatório')
      return errors
    }
  },
  data: () => ({
    valid: true,
    exchange: "",
    apiKey: "",
    privateKey: "",
    exchangeId: ""
  }),

  methods: {
    onAddExchange() {
      this.$v.$touch();
      if (!this.$v.$error) {
        let addExchangeTimestamp = this.timestamp();
        analytics.logEvent("add", {category: "exchange", action: "confirm", description: 'Add exchange'});
        analytics.logEvent("form", {category: "exchange", description: 'Fill add exchange form', duration: addExchangeTimestamp - this.exchangeDialogTimestamp});
        this.$store
          .dispatch("addExchange", {
            name: this.exchange,
            apiKey: this.apiKey,
            privateKey: this.privateKey,
            systemExchange: this.exchangeId,
            lastSync: ""
          })
          .then(() => {
            analytics.logEvent("firestoreCall", {category: "exchange", operation: "set", description: 'Add exchange to firebase', duration: this.timestamp() - addExchangeTimestamp});
            this.dialog = "";
            console.log('Exchange added');
          });
      }
    }
  }
};
</script>
