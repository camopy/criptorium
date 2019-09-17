<template>
  <v-content>
    <v-container fluid>
      <v-layout v-if="error" align-center justify-center>
        <v-flex xs12 sm8 md4>
          <app-alert @dismissed="onDismissed" :text="error.message"></app-alert>
        </v-flex>
      </v-layout>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Cripto RF</v-toolbar-title>
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
                        required
                        :rules="emailRules"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex xs12>
                      <v-text-field
                        name="password"
                        label="Senha"
                        id="password"
                        prepend-icon="fas fa-lock"
                        v-model="password"
                        type="password"
                        required
                        :rules="passwordRules"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="secondary" @click="onSignUp">Cadastrar</v-btn>
              <v-btn
                text
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
export default {
  data: () => ({
    valid: true,
    email: "",
    emailRules: [
      v => !!v || "Digite seu email",
      v => /.+@.+/.test(v) || "Insira um email válido"
    ],
    password: "",
    passwordRules: [v => !!v || "Digite sua senha"]
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
      this.$router.push("/signup");
    },
    onSignin() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("signUserIn", {
          email: this.email,
          password: this.password
        });
      }
    },
    onDismissed() {
      this.$store.dispatch("clearError");
    }
  }
};
</script>
