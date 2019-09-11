<template>
  <v-dialog v-model="dialog" width="800px">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title">Cadastrar operação</v-card-title>
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
                  required
                  :rules="exchangeRules"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  name="apiKey"
                  label="API key"
                  id="apiKey"
                  prepend-icon="fas fa-key"
                  v-model="apiKey"
                  required
                  :rules="apiKeyRules"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  name="privateKey"
                  label="Secret key"
                  id="privateKey"
                  prepend-icon="fas fa-key"
                  v-model="privateKey"
                  required
                  :rules="privateKeyRules"
                ></v-text-field>
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
          @click="onAddExchange"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    visible: Boolean
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
        }
      }
    },
    creating() {
      return this.$store.getters.creating;
    }
  },
  data: () => ({
    valid: true,
    exchange: "",
    exchangeRules: [
      v => !!v || "Exchange é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    apiKey: "",
    apiKeyRules: [
      v => !!v || "API Key é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    privateKey: "",
    privateKeyRules: [
      v => !!v || "Private Key é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    exchangeList: [
      "Binance", "Bittrex", "KuCoin", "Bitfinex"
    ]
  }),

  methods: {
    onAddExchange() {
      if (this.$refs.form.validate()) {
        this.$store
          .dispatch("addExchange", {
            name: this.exchange,
            apiKey: this.apiKey,
            privateKey: this.privateKey,
            lastSync: ""
          })
          .then(() => {
            this.dialog = false;
          });
      }
    }
  }
};
</script>
