<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <v-layout v-if="error" align-center justify-center>
          <v-flex xs12 sm8 md4>
            <app-alert
              @dismissed="onDismissed"
              :text="error.message"
            ></app-alert>
          </v-flex>
        </v-layout>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Cripto RF - Cadastro</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-layout row wrap>
                    <v-flex xs12>
                      <v-text-field
                        name="name"
                        label="Nome"
                        id="name"
                        prepend-icon="fas fa-user"
                        v-model="name"
                        required
                        :rules="nameRules"
                        type="letter"
                      ></v-text-field>
                    </v-flex>
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
                    <v-flex xs12>
                      <v-text-field
                        name="cpf"
                        label="CPF"
                        id="cpf"
                        prepend-icon="fas fa-id-card"
                        v-model="cpf"
                        required
                        :rules="cpfRules"
                        v-mask="cpfMask"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
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
                          label="Data de nascimento"
                          prepend-icon="fas fa-calendar"
                          :rules="birthdayRules"
                          required
                          mask="##/##/####"
                          v-on="on"
                        ></v-text-field>
                      </template>
                        <v-date-picker
                          ref="datePicker"
                          v-model="birthday"
                          :max="new Date().toISOString().substr(0, 10)"
                          min="1950-01-01"
                          no-title
                          @change="save"
                        ></v-date-picker>
                      </v-menu>
                    </v-flex>
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
                    <v-flex xs12>
                      <v-text-field
                        name="confirmPassword"
                        label="Confirme a senha"
                        id="confirmPassword"
                        prepend-icon="fas fa-lock"
                        v-model="confirmPassword"
                        type="password"
                        required
                        :rules="[comparePasswords]"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  text
                  :disabled="!valid || loading"
                  :loading="loading"
                  @click="onSignUp"
                  color="primary"
                  >Cadastrar</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Date from "@/mixins/Date";
import { mask } from 'vue-the-mask'

export default {
  directives: {
    mask,
  },
  mixins: [Date],
  data: () => ({
    valid: true,
    name: "",
    nameRules: [
      v => !!v || "Nome é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    cpf: "",
    cpfMask: '###.###.###-##',
    cpfRules: [
      v => !!v || "CPF é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    birthday: "",
    birthdayRules: [
      v => !!v || "Idade é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    email: "",
    emailRules: [
      v => !!v || "Email é obrigatório",
      v => /.+@.+/.test(v) || "Insira um email válido"
    ],
    password: "",
    passwordRules: [v => !!v || "Digite uma senha"],
    confirmPassword: "",
    dateMenu: false
  }),
  computed: {
    comparePasswords() {
      return this.password !== this.confirmPassword
        ? "As senhas estão diferentes"
        : true;
    },
    user() {
      return this.$store.getters.user;
    },
    error() {
      return this.$store.getters.error;
    },
    loading() {
      return this.$store.getters.loading;
    },
    computedDateFormatted() {
      return this.formatDate(this.birthday);
    }
  },
  watch: {
    user(value) {
      if ((value !== null) & (value !== undefined)) {
        this.$router.push("/");
      }
    },
    dateMenu (val) {
      val && setTimeout(() => (this.$refs.datePicker.activePicker = 'YEAR'))
    }
  },
  methods: {
    onSignUp() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("signUserUp", {
          name: this.name,
          email: this.email,
          cpf: this.cpf,
          birthday: this.birthday,
          password: this.password
        });
      }
    },
    onDismissed() {
      this.$store.dispatch("clearError");
    },
    save(date) {
      this.$refs.dateMenu.save(date);
    },
    // validateCpf(cpf) {
    //   var Soma;
    //   var Resto;
    //   Soma = 0;
    //   if (cpf == "00000000000") return false;

    //   for (i = 1; i <= 9; i++)
    //     Soma = Soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    //   Resto = (Soma * 10) % 11;

    //   if (Resto == 10 || Resto == 11) Resto = 0;
    //   if (Resto != parseInt(cpf.substring(9, 10))) return false;

    //   Soma = 0;
    //   for (i = 1; i <= 10; i++)
    //     Soma = Soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    //   Resto = (Soma * 10) % 11;

    //   if (Resto == 10 || Resto == 11) Resto = 0;
    //   if (Resto != parseInt(cpf.substring(10, 11))) return false;
    //   return true;
    // }
  }
};
</script>
