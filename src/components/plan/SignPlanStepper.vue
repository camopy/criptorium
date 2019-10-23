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
              <v-radio-group v-model="plan" column :error-messages="planErrors">
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
                      v-mask="phoneMask"
                      :error-messages="phoneErrors"
                      @input="$v.phone.$touch()"
                      @blur="$v.phone.$touch()"
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
                      v-mask="CEPMask"
                      :error-messages="CEPErrors"
                      @input="$v.CEP.$touch()"
                      @blur="$v.CEP.$touch()"
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
                      :error-messages="streetErrors"
                      @input="$v.street.$touch()"
                      @blur="$v.street.$touch()"
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
                      :error-messages="streetNumberErrors"
                      @input="$v.streetNumber.$touch()"
                      @blur="$v.streetNumber.$touch()"
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
                      :error-messages="complementErrors"
                      @input="$v.complement.$touch()"
                      @blur="$v.complement.$touch()"
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
                      :error-messages="districtErrors"
                      @input="$v.district.$touch()"
                      @blur="$v.district.$touch()"
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
                      :error-messages="cityErrors"
                      @input="$v.city.$touch()"
                      @blur="$v.city.$touch()"
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
                      :error-messages="stateErrors"
                      @input="$v.state.$touch()"
                      @blur="$v.state.$touch()"
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
                      v-mask="cardNumberMask"
                      :error-messages="cardNumberErrors"
                      @input="$v.cardNumber.$touch()"
                      @blur="$v.cardNumber.$touch()"
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
                      :error-messages="cardNameErrors"
                      @input="$v.cardName.$touch()"
                      @blur="$v.cardName.$touch()"
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
                      v-mask="cardDateMask"
                      :error-messages="cardDateErrors"
                      @input="$v.cardDate.$touch()"
                      @blur="$v.cardDate.$touch()"
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
                      v-mask="cardSecurityCodeMask"
                      :error-messages="cardSecurityCodeErrors"
                      @input="$v.cardSecurityCode.$touch()"
                      @blur="$v.cardSecurityCode.$touch()"
                    ></v-text-field>
                  </v-container>
                </v-flex>
                <v-flex xs12>
                  <v-container>
                    <v-radio-group v-model="cardHolderRadio" row :error-messages="cardHolderRadioErrors">
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
                          v-mask="cardHolderCpfMask"
                          :error-messages="cardHolderCpfErrors"
                          @input="$v.cardHolderCpf.$touch()"
                          @blur="$v.cardHolderCpf.$touch()"
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
                          v-mask="cardHolderBirthdateMask"
                          :error-messages="cardHolderBirthdateErrors"
                          @input="$v.cardHolderBirthdate.$touch()"
                          @blur="$v.cardHolderBirthdate.$touch()"
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
                          v-mask="cardHolderPhoneMask"
                          :error-messages="cardHolderPhoneErrors"
                          @input="$v.cardHolderPhone.$touch()"
                          @blur="$v.cardHolderPhone.$touch()"
                        ></v-text-field>
                      </v-container>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-layout>
            </v-card-text>
          </v-card>
          <v-btn color="primary" :loading="signingUserToPagseguroPlan" :disabled="!valid" @click="onSignPlan">Assinar</v-btn>
          <v-btn text @click="dialog = false">Cancel</v-btn>
        </v-stepper-content>
      </v-stepper>
    </v-form>
  </v-dialog>
</template>

<script>
import { mask } from "vue-the-mask";
import { analytics } from "@/main";
import Date from "@/mixins/Date";
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

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
  mixins: [Date, validationMixin],
  props: {
    signPlanStepperDialogTimestamp: String
  },
  watch: {
    signingUserToPagseguroPlan() {
      this.dialog = this.signingUserToPagseguroPlan;
    }
  },
  validations() {
    let validationFields = {
      plan: { required },
      cardNumber: { required },
      cardName: { required },
      cardDate: { required },
      cardSecurityCode: { required },
      cardHolderRadio: { required }
    };

    if(!this.user.address || !this.user.phone) {
      validationFields.phone = { required };
      validationFields.CEP = { required };
      validationFields.street = { required };
      validationFields.streetNumber = { required };
      validationFields.complement = { required };
      validationFields.district = { required };
      validationFields.city = { required };
      validationFields.state = { required };
      validationFields.city = { required };
    }

    validationFields.cardHolderCpf = this.cardHolderRadio ? "" : { required };
    validationFields.cardHolderBirthdate = this.cardHolderRadio ? "" : { required };
    validationFields.cardHolderPhone = this.cardHolderRadio ? "" : { required };

    return validationFields;
  },
  computed: {
    plans() {
      return this.$store.getters.paidPlans;
    },
    user() {
      return this.$store.getters.user;
    },
    signingUserToPagseguroPlan() {
      return this.$store.getters.signingUserToPagseguroPlan;
    },
    dialog: {
      get() {
        return this.signPlanStepperDialogTimestamp;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
          this.$refs.form.reset();
          this.$v.$reset();
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
    },
    planErrors() {
      const errors = []
      if (!this.$v.plan.$dirty) return errors
      !this.$v.plan.required && errors.push('Plano é obrigatório')
      return errors
    },
    phoneErrors() {
      const errors = []
      if (!this.$v.phone.$dirty) return errors
      !this.$v.phone.required && errors.push('Telefone é obrigatório')
      return errors
    },
    cardHolderRadioErrors() {
      const errors = []
      if (!this.$v.cardHolderRadio.$dirty) return errors
      !this.$v.cardHolderRadio.required && errors.push('Titular é obrigatório')
      return errors
    },
    cardHolderPhoneErrors() {
      const errors = []
      if (!this.$v.cardHolderPhone.$dirty) return errors
      !this.$v.cardHolderPhone.required && errors.push('Telefone do titular é obrigatório')
      return errors
    },
    cardHolderBirthdateErrors() {
      const errors = []
      if (!this.$v.cardHolderBirthdate.$dirty) return errors
      !this.$v.cardHolderBirthdate.required && errors.push('Data de nascimento do titular é obrigatório')
      return errors
    },
    cardHolderCpfErrors() {
      const errors = []
      if (!this.$v.cardHolderCpf.$dirty) return errors
      !this.$v.cardHolderCpf.required && errors.push('CPF do titular é obrigatório')
      return errors
    },
    CEPErrors() {
      const errors = []
      if (!this.$v.CEP.$dirty) return errors
      !this.$v.CEP.required && errors.push('CEP é obrigatório')
      return errors
    },
    streetErrors() {
      const errors = []
      if (!this.$v.street.$dirty) return errors
      !this.$v.street.required && errors.push('Rua é obrigatório')
      return errors
    },
    streetNumberErrors() {
      const errors = []
      if (!this.$v.streetNumber.$dirty) return errors
      !this.$v.streetNumber.required && errors.push('Número da rua é obrigatório')
      return errors
    },
    complementErrors() {
      const errors = []
      if (!this.$v.complement.$dirty) return errors
      !this.$v.complement.required && errors.push('Complemento é obrigatório')
      return errors
    },
    districtErrors() {
      const errors = []
      if (!this.$v.district.$dirty) return errors
      !this.$v.district.required && errors.push('Bairro é obrigatório')
      return errors
    },
    cityErrors() {
      const errors = []
      if (!this.$v.city.$dirty) return errors
      !this.$v.city.required && errors.push('Cidade é obrigatório')
      return errors
    },
    stateErrors() {
      const errors = []
      if (!this.$v.state.$dirty) return errors
      !this.$v.state.required && errors.push('Estado é obrigatório')
      return errors
    },
    cardNumberErrors() {
      const errors = []
      if (!this.$v.cardNumber.$dirty) return errors
      !this.$v.cardNumber.required && errors.push('Número do cartão é obrigatório')
      return errors
    },
    cardNameErrors() {
      const errors = []
      if (!this.$v.cardName.$dirty) return errors
      !this.$v.cardName.required && errors.push('Nome no cartão é obrigatório')
      return errors
    },
    cardDateErrors() {
      const errors = []
      if (!this.$v.cardDate.$dirty) return errors
      !this.$v.cardDate.required && errors.push('Data de validade do cartão é obrigatório')
      return errors
    },
    cardSecurityCodeErrors() {
      const errors = []
      if (!this.$v.cardSecurityCode.$dirty) return errors
      !this.$v.cardSecurityCode.required && errors.push('Código de segurança do cartão é obrigatório')
      return errors
    }
  },
  data: () => ({
    valid: true,
    stepper: 1,
    plan: "",
    cardHolderRadio: "",
    phone: "",
    phoneMask: "(##)#####-####",
    cardHolderPhone: "",
    cardHolderPhoneMask: "(##)#####-####",
    cardHolderBirthdate: "",
    cardHolderBirthdateMask: "##/##/####",
    cardHolderCpf: "",
    cardHolderCpfMask: "###.###.###-##",
    CEP: "",
    CEPMask: "#####-###",
    street: "",
    streetNumber: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    cardNumber: "",
    cardNumberMask: "#### #### #### ####",
    cardName: "",
    cardDate: "",
    cardDateMask: "##/##",
    cardSecurityCode: "",
    cardSecurityCodeMask: "###"
  }),

  methods: {
    onSignPlan() {
      this.$v.$touch();
      if (!this.$v.$error) {
        let signPlanTimestamp = this.timestamp();
        analytics.logEvent("form", {category: "plan", description: "Fill sign plan form", duration: signPlanTimestamp - this.signPlanStepperDialogTimestamp});
        analytics.logEvent("sign", { category: "plan", action: "confirm", description: "Sign plan"});
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
          }).then(() => {
            analytics.logEvent("signed", { category: "plan", description: "Sign plan", duration: this.timestamp() - signPlanTimestamp});
          })
      }
    }
  }
};
</script>