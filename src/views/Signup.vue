<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Cripto RF - Cadastro</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form v-model="valid" lazy-validation>
                  <v-layout row wrap>
                    <v-flex xs12>
                      <v-text-field
                        name="name"
                        label="Nome"
                        id="name"
                        prepend-icon="fas fa-user"
                        v-model="name"
                        :error-messages="nameErrors"
                        @input="$v.name.$touch()"
                        @blur="$v.name.$touch()"
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
                        :error-messages="emailErrors"
                        @input="$v.email.$touch()"
                        @blur="$v.email.$touch()"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        name="cpf"
                        label="CPF"
                        id="cpf"
                        prepend-icon="fas fa-id-card"
                        v-model="cpf"
                        :error-messages="cpfErrors"
                        @input="$v.cpf.$touch()"
                        @blur="$v.cpf.$touch()"
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
                            :error-messages="birthdayErrors"
                            readonly
                            @input="$v.birthday.$touch()"
                            @blur="$v.birthday.$touch()"
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
                        :error-messages="passwordErrors"
                        @input="$v.password.$touch()"
                        @blur="$v.password.$touch()"
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
                        :error-messages="confirmPasswordErrors"
                        @input="$v.confirmPassword.$touch()"
                        @blur="$v.confirmPassword.$touch()"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  text
                  :disabled="!valid || creating"
                  :loading="creating"
                  @click="onSignUp"
                  color="primary"
                >Cadastrar</v-btn>
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
import { mask } from "vue-the-mask";
import { analytics } from "@/main";
import { validationMixin } from 'vuelidate';
import { required, email } from 'vuelidate/lib/validators';

export default {
  directives: {
    mask
  },
  mixins: [Date, validationMixin],
  validations: {
    name: { required },
    cpf: { required },
    birthday: { required },
    email: { required, email },
    password: { required },
    confirmPassword: { required }
  },
  data: () => ({
    valid: true,
    name: "",
    cpf: "",
    cpfMask: "###.###.###-##",
    birthday: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateMenu: false
  }),
  computed: {
    nameErrors() {
      const errors = []
      if (!this.$v.name.$dirty) return errors
      !this.$v.name.required && errors.push('Nome é obrigatório')
      return errors
    },
    emailErrors() {
      const errors = []
      if (!this.$v.email.$dirty) return errors
      !this.$v.email.email && errors.push('Digite um email válido')
      !this.$v.email.required && errors.push('Email é obrigatório')
      return errors
    },
    birthdayErrors() {
      const errors = []
      if (!this.$v.birthday.$dirty) return errors
      !this.$v.birthday.required && errors.push('Data de nascimento é obrigatório')
      return errors
    },
    cpfErrors() {
      const errors = []
      if (!this.$v.cpf.$dirty) return errors
      !this.$v.cpf.required && errors.push('CPF é obrigatório')
      !this.validateCpf(this.cpf.replace(/\D/g, '')) && errors.push('Digite um CPF válido')
      return errors
    },
    passwordErrors() {
      const errors = []
      if (!this.$v.password.$dirty) return errors
      !this.$v.password.required && errors.push('Senha é obrigatório')
      return errors
    },
    confirmPasswordErrors() {
      const errors = []
      if (!this.$v.confirmPassword.$dirty) return errors
      !this.$v.confirmPassword.required && errors.push('Senha é obrigatório')
      if(this.password !== this.confirmPassword) {
        errors.push('As senhas estão diferentes')
      }
      return errors
    },
    user() {
      return this.$store.getters.user;
    },
    creating() {
      return this.$store.getters.creating;
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
    dateMenu(val) {
      val && setTimeout(() => (this.$refs.datePicker.activePicker = "YEAR"));
    }
  },
  methods: {
    onSignUp() {
      this.$v.$touch();
      if (!this.$v.$error) {
        analytics.logEvent("signup", { action: "confirm", category: "signup"});
        this.$store.dispatch("signUserUp", {
          name: this.name,
          email: this.email,
          cpf: this.cpf.replace(/\D/g, ''),
          birthday: this.birthday,
          password: this.password
        });
      }
    },
    save(date) {
      this.$refs.dateMenu.save(date);
    },
    validateCpf(cpf) {
      let soma;
      let resto;
      soma = 0;
      if (cpf == "00000000000") return false;

      for (let i = 1; i <= 9; i++)
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
      resto = (soma * 10) % 11;

      if (resto == 10 || resto == 11) resto = 0;
      if (resto != parseInt(cpf.substring(9, 10))) return false;

      soma = 0;
      for (let i = 1; i <= 10; i++)
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
      resto = (soma * 10) % 11;

      if (resto == 10 || resto == 11) resto = 0;
      if (resto != parseInt(cpf.substring(10, 11))) return false;
      return true;
    }
  }
};
</script>
