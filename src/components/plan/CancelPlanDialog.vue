<template>
  <v-dialog v-model="dialog" width="800px">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title">Cancelar assinatura</v-card-title>
      <v-flex xs12>
        <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
              <v-flex xs12>
                Você tem certeza que quer cancelar sua assinatura?
              </v-flex>
            </v-layout>
        </v-container>
      </v-flex>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text :disabled="updating" color="secondary" @click="dialog = false">Voltar</v-btn>
        <v-btn
          text
          :disabled="updating"
          color="primary"
          :loading="updating"
          @click="onCancelPlan"
        >
          Cancelar
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
        }
      }
    },
    user() {
      return this.$store.getters.user;
    },
    updating() {
      return this.$store.getters.updating;
    }
  },

  methods: {
    onCancelPlan() {
      this.$store
        .dispatch("signoutUserFromPlan", {
          userId: this.user.id,
          planId: this.user.plan.id
        })
        .then(() => {
          this.dialog = false;
        });
    }
  }
};
</script>
