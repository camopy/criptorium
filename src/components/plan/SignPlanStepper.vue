<template>
  <v-dialog v-model="dialog" width="800px">
    <v-overlay :value="plans.length == 0">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-form v-if="plans.length > 0" ref="form" v-model="valid" lazy-validation>
      <v-stepper v-model="stepper" vertical>
        <v-stepper-step :rules="planRules" editable step="1">Assinatura</v-stepper-step>

        <v-stepper-content step="1">
          <v-card color="grey lighten-3" class="mb-12">
            <v-card-title>Plano Pro</v-card-title>
            <v-card-text>
              Tenha acesso à sincronização das operações feitas em exchanges cadastradas através da API disponibilizada por cada uma delas
              <v-radio-group v-model="plan" column>
                <v-radio v-for="plan in plans" :key="plan.id"
                  :label="plan.period === 'yearly' ? 'Anual: R$' + plan.price.toFixed(2) + ' - equivalente a R$' + (plan.price/12).toFixed(2) + ' por mês' : 'Mensal: R$' + plan.price.toFixed(2)"
                  :value="plan"
                ></v-radio>
              </v-radio-group>
            </v-card-text>
          </v-card>
          <v-btn color="primary" @click="stepper = 2">Continue</v-btn>
          <v-btn text @click="dialog = false">Cancel</v-btn>
        </v-stepper-content>

        <v-stepper-step v-if="!user.address || !user.phone" :rules="userInfoRules" editable :step="userInfoStepNumber">Confirme seus dados</v-stepper-step>

        <v-stepper-content v-if="!user.address || !user.phone" :step="userInfoStepNumber">
          <v-card color="grey lighten-3" class="mb-12">
            <v-card-text>
              <v-layout row wrap>
                <v-flex xs12 sm6>
                  <v-container>
                    <v-text-field
                      name="phone"
                      label="Telefone"
                      id="phone"
                      v-model="phone"
                      required
                      v-mask="phoneMask"
                      :rules="phoneRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-container>
                    <v-text-field
                      name="CEP"
                      label="CEP"
                      id="CEP"
                      v-model="CEP"
                      required
                      v-mask="CEPMask"
                      :rules="CEPRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12>
                  <v-container>
                    <v-text-field
                      name="street"
                      label="Rua"
                      id="street"
                      v-model="street"
                      required
                      :rules="streetRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12 sm3>
                  <v-container>
                    <v-text-field
                      name="streetNumber"
                      label="Número"
                      id="streetNumber"
                      v-model="streetNumber"
                      required
                      :rules="streetNumberRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12 sm3>
                  <v-container>
                    <v-text-field
                      name="complement"
                      label="Coplemento"
                      id="complement"
                      v-model="complement"
                      required
                      :rules="complementRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-container>
                    <v-text-field
                      name="district"
                      label="Bairro"
                      id="district"
                      v-model="district"
                      required
                      :rules="districtRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-container>
                    <v-text-field
                      name="city"
                      label="Cidade"
                      id="city"
                      v-model="city"
                      required
                      :rules="cityRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-container>
                    <v-text-field
                      name="state"
                      label="Estado"
                      id="state"
                      v-model="state"
                      required
                      :rules="stateRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
          <v-btn color="primary" @click="stepper = 3">Continue</v-btn>
          <v-btn text @click="dialog = false">Cancel</v-btn>
        </v-stepper-content>

        <v-stepper-step :rules="paymentMethodRules" editable :step="paymentMethodStepNumber">Meio de pagamento</v-stepper-step>

        <v-stepper-content :step="paymentMethodStepNumber">
          <v-card color="grey lighten-3" class="mb-12">
            <v-card-title>Cartão de crédito</v-card-title>
            <v-card-text>
              <v-layout row wrap>
                <v-flex xs12 sm6>
                  <v-container>
                    <v-text-field
                      name="cardNumber"
                      label="Número"
                      id="cardNumber"
                      v-model="cardNumber"
                      required
                      v-mask="cardNumberMask"
                      :rules="cardNumberRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-container>
                    <v-text-field
                      name="cardName"
                      label="Nome"
                      id="cardName"
                      v-model="cardName"
                      required
                      :rules="cardNameRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-container>
                    <v-text-field
                      name="cardDate"
                      label="Data de validade"
                      id="cardDate"
                      v-model="cardDate"
                      required
                      v-mask="cardDateMask"
                      :rules="cardDateRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-container>
                    <v-text-field
                      name="cardSecurityCode"
                      label="Código de segurança"
                      id="cardSecurityCode"
                      v-model="cardSecurityCode"
                      required
                      v-mask="cardSecurityCodeMask"
                      :rules="cardSecurityCodeRules"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12>
                  <v-container>
                    <v-radio-group v-model="cardHolderRadio" row>
                      <v-radio label="Sou o titular do cartão" value="true"></v-radio>
                      <v-radio label="Não sou o titular do cartão" value="false"></v-radio>
                    </v-radio-group>
                  </v-container>
                </v-flex>
                <v-container v-if="cardHolderRadio == 'false'">
                  <v-layout row wrap>
                    <v-flex xs12 sm6>
                      <v-container>
                        <v-text-field
                          name="cardHolderCpf"
                          label="CPF do titular"
                          id="cardHolderCpf"
                          v-model="cardHolderCpf"
                          required
                          v-mask="cardHolderCpfMask"
                          :rules="cardHolderCpfRules"
                        ></v-text-field>
                      </v-container>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-container>
                        <v-text-field
                          name="cardHolderBirthdate"
                          label="Data de nascimento do titular"
                          id="cardHolderBirthdate"
                          v-model="cardHolderBirthdate"
                          required
                          v-mask="cardHolderBirthdateMask"
                          :rules="cardHolderBirthdateRules"
                        ></v-text-field>
                      </v-container>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-container>
                        <v-text-field
                          name="cardHolderPhone"
                          label="Telefone do titular"
                          id="cardHolderPhone"
                          v-model="cardHolderPhone"
                          required
                          v-mask="cardHolderPhoneMask"
                          :rules="cardHolderPhoneRules"
                        ></v-text-field>
                      </v-container>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-layout>
            </v-card-text>
          </v-card>
          <v-btn color="primary" :loading="creating" :disabled="!valid" @click="onSignPlan">Assinar</v-btn>
          <v-btn text @click="dialog = false">Cancel</v-btn>
        </v-stepper-content>
      </v-stepper>
    </v-form>
  </v-dialog>
</template>

<script>
import { mask } from "vue-the-mask";

export default {
  mounted() {
    let pagseguro = document.createElement("script");
    pagseguro.setAttribute(
      "src",
      "https://stc.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js"
    );
    document.head.appendChild(pagseguro);
  },
  directives: {
    mask
  },
  props: {
    visible: Boolean
  },
  watch: {
    creating() {
      this.dialog = this.creating;
    }
  },
  computed: {
    plans() {
      return this.$store.getters.paidPlans;
    },
    user() {
      return this.$store.getters.user;
    },
    creating() {
      return this.$store.getters.creating;
    },
    dialog: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
          this.$refs.form.reset();
          this.stepper = 1;
          this.plan = "";
          this.cardHolderRadio = "";
        }
      }
    },
    planRules() {
      return [() => !!this.plan || !!this.valid];
    },
    userInfoRules() {
      return [
        () =>
          !!this.phone ||
          !!this.CEP ||
          !!this.street ||
          !!this.streetNumber ||
          !!this.complement ||
          !!this.district ||
          !!this.city ||
          !!this.state ||
          !!this.valid
      ];
    },
    paymentMethodRules() {
      return [
        () =>
          (!!this.cardNumber && !!this.cardDate && !!this.cardSecurityCode) ||
          !!this.valid
      ];
    },
    paymentMethodStepNumber() {
      return (!this.user.address || !this.user.phone) ? 3 : 2;
    },
    userInfoStepNumber() {
      return (!this.user.address || !this.user.phone) ? 2 : 3;
    }
  },
  data: () => ({
    valid: true,
    stepper: 1,
    plan: "",
    cardHolderRadio: "",
    phone: "",
    phoneMask: "(##)#####-####",
    phoneRules: [
      v => !!v || "Telefone é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    cardHolderPhone: "",
    cardHolderPhoneMask: "(##)#####-####",
    cardHolderPhoneRules: [
      v => !!v || "Telefone do titular é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    cardHolderBirthdate: "",
    cardHolderBirthdateMask: "##/##/####",
    cardHolderBirthdateRules: [
      v => !!v || "Data de nascimento do titular é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    cardHolderCpf: "",
    cardHolderCpfMask: "###.###.###-##",
    cardHolderCpfRules: [
      v => !!v || "CPF do titular é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    CEP: "",
    CEPMask: "#####-###",
    CEPRules: [
      v => !!v || "CEP é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    street: "",
    streetRules: [
      v => !!v || "Rua é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    streetNumber: "",
    streetNumberRules: [
      v => !!v || "Número é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    complement: "",
    complementRules: [
      v => !!v || "Complemento é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    district: "",
    districtRules: [
      v => !!v || "Bairro é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    city: "",
    cityRules: [
      v => !!v || "Cidade é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    state: "",
    stateRules: [
      v => !!v || "Estado é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    cardNumber: "",
    cardNumberMask: "#### #### #### ####",
    cardNumberRules: [
      v => !!v || "Número do cartão é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    cardName: "",
    cardNameRules: [
      v => !!v || "Nome no cartão é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    cardDate: "",
    cardDateMask: "##/##",
    cardDateRules: [
      v => !!v || "Data de validade do cartão é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    cardSecurityCode: "",
    cardSecurityCodeMask: "###",
    cardSecurityCodeRules: [
      v => !!v || "Código de segurança do cartão é obrigatório"
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ]
  }),

  methods: {
    onSignPlan() {
      // if (this.$refs.form.validate()) {
        this.$store
          .dispatch("signUserToPlan", {
            plan: this.plan,
            phone: {
              areaCode: this.phone.replace(/ /g,'').substr(0, 2),
              number: this.phone.replace(/ /g,'').substr(2)
            },
            address: {
              street: this.street,
              number: this.streetNumber,
              complement: this.complement,
              district: this.district,
              city: this.city,
              state: this.state,
              country: "BR",
              postalCode: this.CEP.replace(/-/g,'')
            },
            card: {
              cardNumber: this.cardNumber.replace(/ /g,''),
              cardDate: this.cardDate,
              cardCvv: this.cardSecurityCode,
              cardExpirationMonth: this.cardDate.substr(0,2),
              cardExpirationYear: "20" + this.cardDate.substr(3, 2)
            },
            cardHolder: {
              name: this.cardName,
              birthDate: this.cardHolderBirthdate,
              cpf: this.cardHolderCpf,
              phone: {
                areaCode: this.cardHolderPhone.replace(/ /g,'').substr(0, 2),
                number: this.cardHolderPhone.replace(/ /g,'').substr(2)
              }
            }
          })
      // }
    }
  }
};
</script>
