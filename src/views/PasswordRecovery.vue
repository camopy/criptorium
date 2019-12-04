<template>
  <v-content>
    <v-container fluid>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Recupere sua senha</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-container>
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-layout row>
                    <v-flex xs12>
                      <v-text-field
                        name="email"
                        label="Email"
                        id="email"
                        prepend-icon="fas fa-envelope"
                        v-model="email"
                        type="email"
                        :error-messages="emailErrors"
                        @input="$v.email.$touch()"
                        @blur="$v.email.$touch()"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="error" to="/signin">Cancelar</v-btn>
              <v-btn
                :disabled="!valid || loading"
                :loading="loading"
                color="primary"
                @click="onRecoverPassword"
                >Enviar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
import { analytics } from "@/main";
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'
export default {
  mixins: [validationMixin],
  validations: {
    email: { required, email }
  },
  data: () => ({
    valid: true,
    email: ""
  }),
  props: {
    source: String
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    error() {
      return this.$store.getters.error;
    },
    loading() {
      return this.$store.getters.loading;
    },
    emailErrors() {
      const errors = []
      if (!this.$v.email.$dirty) return errors
      !this.$v.email.email && errors.push('Digite um email válido')
      !this.$v.email.required && errors.push('Email é obrigatório')
      return errors
    }
  },
  watch: {
    user(value) {
      if ((value !== null) & (value !== undefined)) {
        this.$router.push("/operations")
      }
    }
  },
  methods: {
    onSignUp() {
      analytics.logEvent("signup", { action: "click", category: "singup"});
      this.$router.push("/signup");
    },
    onRecoverPassword() {
      if (this.$refs.form.validate()) {
        analytics.logEvent("recoverPassword", { action: "confirm", category: "password"});
        this.$store.dispatch("recoverPassword", {
          email: this.email
        });
      }
    }
  }
};
</script>
