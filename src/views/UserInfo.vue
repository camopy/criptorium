<template>
  <v-container fluid>
    <v-layout>
      <v-flex xs12>
        <v-card v-if="user">
          <v-card-text>
            <v-layout row wrap>
              <v-flex xs12 sm6>
                <v-text-field
                  name="name"
                  label="Nome"
                  id="name"
                  prepend-icon="fas fa-user"
                  v-model="user.name"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6>
                <v-text-field
                  name="email"
                  label="Email"
                  id="email"
                  prepend-icon="fas fa-envelope"
                  v-model="user.email"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6>
                <v-text-field
                  name="cpf"
                  label="CPF"
                  id="cpf"
                  prepend-icon="fas fa-id-card"
                  v-model="user.cpf"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6>
                <v-text-field
                  name="birthday"
                  label="Data de nascimento"
                  id="birthday"
                  prepend-icon="fas fa-calendar"
                  v-model="birthday"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Date from "@/mixins/Date";

export default {
  mixins: [Date],
  computed: {
    user() {
      return this.$store.getters.user;
    },
    birthday() {
      return this.formatDate(this.$store.getters.user);
    }
  }
};
</script>