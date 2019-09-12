<template>
  <v-dialog v-model="dialog" width="300px">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title">Gerar arquivo TXT</v-card-title>
      <v-flex xs12>
        <v-container grid-list-sm class="pa-4">
          <v-form ref="form" v-model="valid" lazy-validation class="ma-2">
            <v-layout row wrap>
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
                      label="Mês das operações"
                      prepend-icon="fas fa-calendar"
                      :rules="dateRules"
                      required
                      mask="##/##/####"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="date"
                    full-width
                    type="month"
                    min="2019-07"
                    :max="new Date().toISOString().substr(0, 10)"
                    no-title
                    :show-current='this.$moment().format("YYYY-MM")'
                    @change="save"
                  ></v-date-picker>
                </v-menu>
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
          @click="onGenerateTextFile"
        >Gerar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Date from "@/mixins/Date";
export default {
  mixins: [Date],
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
          this.date = "";
        }
      }
    },
    creating() {
      return this.$store.getters.creating;
    },
    computedDateFormatted() {
      return this.formatDateToMonth(this.date);
    }
  },
  data: () => ({
    valid: true,
    date: "",
    dateRules: [
      v => !!v || "Data é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    dateMenu: false
  }),

  methods: {
    onGenerateTextFile() {
      if (this.$refs.form.validate()) {
        this.$store
          .dispatch("generateTextFile", {
            date: this.date
          })
          .then(() => {
            this.dialog = false;
          });
      }
    },
    save(date) {
      this.$refs.dateMenu.save(date);
    },
  }
};
</script>
