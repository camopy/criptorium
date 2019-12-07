<template>
  <v-content>
    <v-container fluid>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Criptorium</v-toolbar-title>
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
                        :prepend-icon="emailSVG"
                        v-model="email"
                        type="email"
                        :error-messages="emailErrors"
                        @input="$v.email.$touch()"
                        @blur="$v.email.$touch()"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex xs12>
                      <v-text-field
                        name="password"
                        label="Senha"
                        id="password"
                        :prepend-icon="passwordSVG"
                        v-model="password"
                        type="password"
                        :error-messages="passwordErrors"
                        @input="$v.password.$touch()"
                        @blur="$v.password.$touch()"
                      ></v-text-field>
                      <v-btn text color="text" to="/recoverPassword">Esqueci minha senha</v-btn>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="secondary" @click="onSignUp">Cadastrar</v-btn>
              <v-btn
                :disabled="!valid || loading"
                :loading="loading"
                color="primary"
                @click="onSignin"
                >Entrar
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
import { mdiEmail, mdiLockQuestion } from '@mdi/js';

export default {
  mixins: [validationMixin],
  validations: {
    email: { required, email },
    password: { required }
  },
  data: () => ({
    valid: true,
    email: "",
    password: "",
    passwordRules: [v => !!v || "Digite sua senha"],
    emailSVG: mdiEmail,
    passwordSVG: mdiLockQuestion
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
    },
    passwordErrors() {
      const errors = []
      if (!this.$v.password.$dirty) return errors
      !this.$v.password.required && errors.push('Senha é obrigatório')
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
    onSignin() {
      if (this.$refs.form.validate()) {
        analytics.logEvent("signin", { action: "confirm", category: "signin"});
        this.$store.dispatch("signUserIn", {
          email: this.email,
          password: this.password
        });
      }
    }
  }
};
</script>
