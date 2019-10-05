const envs = {
  producao: {
    email: '',
    token: '',
    transactionsNotificationURL: 'https://ws.pagseguro.uol.com.br/v3/transactions/notifications/',
    preApprovalsNotificationURL: 'https://ws.pagseguro.uol.com.br/v2/pre-approvals/notifications/',
    providers: {
      session: 'https://ws.pagseguro.uol.com.br/v2/sessions',
      paymentMethods: 'https://pagseguro.uol.com.br/payment-methods',
      cardBrand: 'https://df.uol.com.br/df-fe/mvc/creditcard/v1/getBin',
      cardToken: 'https://df.uol.com.br/v2/cards',
      paymentInstallments: 'https://pagseguro.uol.com.br/checkout/v2/installments.json',
      checkoutTransaction: 'https://ws.pagseguro.uol.com.br/v2/transactions',
      cancelTransaction: 'https://ws.pagseguro.uol.com.br/v2/transactions/cancels',
      refundTransaction: 'https://ws.pagseguro.uol.com.br/v2/transactions/refunds',
      transaction: 'https://ws.pagseguro.uol.com.br/v2/transactions',
      preApproval: 'https://ws.pagseguro.uol.com.br/pre-approvals'
    }
  },
  sandbox: {
    email: 'paulorenato.cpb@gmail.com',
    token: '3D19535BD4EF4FFCB5533DF1F7E64D6B',
    transactionsNotificationURL: 'https://ws.sandbox.pagseguro.uol.com.br/v3/transactions/notifications/',
    preApprovalsNotificationURL: 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/notifications/',
    providers: {
      session: 'https://ws.sandbox.pagseguro.uol.com.br/v2/sessions',
      paymentMethods: 'https://ws.sandbox.pagseguro.uol.com.br/payment-methods',
      cardBrand: 'https://df.uol.com.br/df-fe/mvc/creditcard/v1/getBin',
      cardToken: 'https://df.uol.com.br/v2/cards',
      paymentInstallments: 'https://ws.sandbox.pagseguro.uol.com.br/checkout/v2/installments.json',
      checkoutTransaction: 'https://ws.sandbox.pagseguro.uol.com.br/v2/transactions',
      cancelTransaction: 'https://ws.sandbox.pagseguro.uol.com.br/v2/transactions/cancels',
      refundTransaction: 'https://ws.sandbox.pagseguro.uol.com.br/v2/transactions/refunds',
      transaction: 'https://ws.sandbox.pagseguro.uol.com.br/v2/transactions',
      preApproval: 'https://ws.sandbox.pagseguro.uol.com.br/pre-approvals'
    }
  }
};
module.exports = envs;