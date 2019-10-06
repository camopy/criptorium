const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const Binance = require('binance-api-node').default;
const moment = require('moment');
const xmlParser = require('xml-js');
const axios = require('axios');
const conf = require('./env');
const env = conf.sandbox;
// const env = process.env.NODE_ENV == 'production' ? conf.producao : conf.sandbox;
// const env = process.env.APP_ENV == 'production' ? conf.producao : conf.sandbox;

moment.locale('pt-br');
admin.initializeApp();

function userAuthenthication(userId, auth) {
  if (!auth) {
    console.log("User not authenticated")
    throw "Usuário não autenticado!";
  }
  if(userId !== auth.uid) {
    console.log("User not autorized")
    throw "Usuário não autorizado";
  }
}

function getUser(userId) {
  return admin
    .firestore()
    .collection('users')
    .doc(userId)
    .get()
    .then((userDoc) => {
      if (!userDoc.data()) {
        throw new Error('Usuário não encontrado');
      }
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    });
}

function createUser(user) {
  return admin
  .firestore()
  .collection('users')
    .doc(user.id)
    .set(user);
}

async function createAuthUser(user) {
  try {
    const authUser = await admin
      .auth()
      .createUser({ email: user.email, password: user.password, displayName: user.name });
    return authUser.uid;
  }
  catch (error) {
    if (error.errorInfo && error.errorInfo.code === "auth/email-already-exists") {
      throw "Email já cadastrado";
    }
    else {
      throw error;
    }
  }
}

function checkUserEmailAlreadyUsed(email) {
  admin.firestore()
    .collection('users')
    .where('email', '==', email)
    .get()
    .then(function(doc) {
      if (!doc.empty) {
        throw 'Email já cadastrado';
      }
    })
}

function checkUserCpfAlreadyUsed(cpf) {
  return admin.firestore()
    .collection('users')
    .where('cpf', '==', cpf)
    .get()
    .then(function(doc) {
      if (!doc.empty) {
        throw 'CPF já cadastrado';
      }
    })
}

function handleErrors(error) {
  if (typeof error === 'string') {
    return {error: error};
  }

  console.error(error);
  let message = 'Algum error ocorreu. Contate o suporte.';

  // console.log("Type", typeof(error));
  // console.log("error message", error.message);
  // console.log("error response",error.response);
  // console.log("error response statusText", error.response.statusText);
  // console.log("error.response.data", error.response.data);
  // console.log("error.response.data.errors", error.response.data.errors);

  if (error instanceof Error) {
    if (error.response && error.response.data && error.response.data.errors) {
      console.error(error.response.data.errors);
    }
    if (error.response && error.response.statusText) {
      console.error(error.response.statusText);
    }
  } else {
    const json = xmlParser.xml2js(error.response.data, { compact: true });
    console.error(json.errors.error.message._text);
  }

  return { error: message };
}

function getUserPagseguroPlan(reference) {
  return admin
    .firestore()
    .collection('user_pagseguro_plan')
    .doc(reference)
    .get()
    .then((planDoc) => {
      if (!planDoc.data()) {
        throw new Error('Plano pagseguro reference não encontrado');
      }

      return {
        id: planDoc.id,
        ...planDoc.data()
      };
    });
}

async function getPlan(planId) {
  const planDoc = await admin
    .firestore()
    .collection('plans')
    .doc(planId)
    .get();
  if (!planDoc.data()) {
    throw new Error('Plano não encontrado');
  }
  return {
    id: planDoc.id,
    ...planDoc.data()
  };
}

function getFreePlan() {
  return admin
    .firestore()
    .collection('plans')
    .where('type', '==', 'free')
    .where('status', '==', 'active')
    .get()
    .then((planSnapshot) => {
      if (planSnapshot.empty) {
        throw new Error('Plano Free não encontrado');
      }

      return {
        id: planSnapshot.docs[0].id,
        ...planSnapshot.docs[0].data()
      };
    });
}

function getUserOperationsByDatetimeRange(userId, startTimestamp, endTimestamp) {
  return admin
  .firestore()
  .collection('users/' + userId + '/operations')
  .where('time', '>=', startTimestamp)
  .where('time', '<=', endTimestamp)
  .get()
  .then(
    (querySnapshot) => {
      if(querySnapshot.empty) {
        throw "Nenhuma operação encontrada para a data selecionada";
      }
      return querySnapshot.docs.map(function(operation) {
        return formatOperation({ ...operation.data(), id: operation.id });
      });
    })
}

function formatOperation(operation) {
  switch (operation.type) {
    case 'trade':
      return tradeFormat(operation);
    case 'deposit':
      return depositFormat(operation);
    case 'whitdraw':
      return whitdrawFormat(operation);
  }
}

function tradeFormat(operation) {
  return (
    '0210|' +
    formatDate(operation.time) +
    '|II||' +
    (operation.isBuyer ? operation.baseAsset : operation.quoteAsset)
      .substr(0, 10)
      .toUpperCase() +
    '|' +
    Number(operation.isBuyer ? operation.qty : operation.quoteQty)
      .toFixed(10)
      .replace('.', '')
      .substr(0, 20) +
    '|' +
    (operation.isBuyer ? operation.quoteAsset : operation.baseAsset)
      .substr(0, 10)
      .toUpperCase() +
    '|' +
    Number(operation.isBuyer ? operation.quoteQty : operation.qty)
      .toFixed(10)
      .replace('.', '')
      .substr(0, 20) +
    '|' +
    operation.exchangeName.substr(0, 60).toUpperCase() +
    '|' +
    operation.exchangeUrl.substr(0, 80).toUpperCase() +
    '|' +
    operation.exchangeCountryCode.substr(0, 2).toUpperCase() +
    'CRLF'
  );
}

function depositFormat(operation) {
  return (
    '0410|' +
    formatDate(operation.time) +
    '|IV||' +
    operation.symbol.substr(0, 10) +
    '|' +
    Number(operation.qty)
      .toFixed(10)
      .replace('.', '')
      .substr(0, 20) +
    '|' +
    operation.exchangeName.substr(0, 60).toUpperCase() +
    '|' +
    operation.exchangeUrl.substr(0, 80).toUpperCase() +
    '|' +
    operation.exchangeCountryCode.substr(0, 2).toUpperCase() +
    'CRLF'
  );
}

function whitdrawFormat(operation) {
  return (
    '0510|' +
    formatDate(operation.time) +
    '|V||' +
    operation.symbol.substr(0, 10) +
    '|' +
    Number(operation.qty)
      .toFixed(10)
      .replace('.', '')
      .substr(0, 20) +
    '|' +
    operation.exchangeName.substr(0, 60).toUpperCase() +
    '|' +
    operation.exchangeUrl.substr(0, 80).toUpperCase() +
    '|' +
    operation.exchangeCountryCode.substr(0, 2).toUpperCase() +
    'CRLF'
  );
}

function formatDate(date) {
  return moment(date).format('DDMMYYYY');
}

function setPagseguroSession() {
  return axios({
    method: 'POST',
    url: env.providers.session,
    params: {
      email: env.email,
      token: env.token
    }
  }).then((response) => {
    return xmlParser.xml2js(response.data, { compact: true }).session.id._text;
  });
}

function getPagseguroCardBrand(sessionId, cardBin) {
  return axios({
    method: 'GET',
    url: env.providers.cardBrand,
    params: {
      tk: sessionId,
      creditCard: cardBin
    }
  }).then((response) => {
    if (!response.data.bin.brand) {
      throw 'Cartão inválido';
    }
    return response.data.bin.brand.name;
  });
}

function getPagseguroCardToken(sessionId, card, value) {
  return axios({
    method: 'POST',
    url: env.providers.cardToken,
    params: {
      sessionId: sessionId,
      amount: value,
      ...card
    }
  }).then((response) => {
    if (!response.data) {
      throw 'Cartão inválido';
    }
    return response.data.token;
  });
}

function updateUserAddressAndPhone(userId, address, phone) {
  return admin
    .firestore()
    .collection('users')
    .doc(userId)
    .update({ address: address, phone: phone });
}

function setUserPlanAndPreApproval(batch, userId, plan, preApproval) {
  let userDoc = admin
    .firestore()
    .collection('users')
    .doc(userId);

  return batch.update(userDoc, { plan: plan, preApproval: preApproval });
}

function setUserPlan(batch, userId, plan) {
  let userDoc = admin
    .firestore()
    .collection('users')
    .doc(userId);

  return batch.update(userDoc, { plan: plan });
}

function setUserPagseguroPlan(batch, userId, plan, preApproval) {
  let userPagseguroPlanDoc = admin
    .firestore()
    .collection('user_pagseguro_plan')
    .doc(preApproval.reference);

  return batch.set(userPagseguroPlanDoc, {
    userId: userId,
    plan: plan,
    preApproval: preApproval
  });
}

function setUserPagseguroTransaction(userId, transaction, batch) {
  let userPagseguroTransactionDoc = admin
    .firestore()
    .collection('user_pagseguro_transaction')
    .doc(transaction.code);

  if (batch) {
    return batch.set(userPagseguroTransactionDoc, {
      userId: userId,
      ...transaction
    });
  }

  return userPagseguroTransactionDoc.set({
    userId: userId,
    ...transaction
  });
}

function pagseguroSignoutFromPlan(preApprovalCode) {
  return axios({
    method: 'PUT',
    url: env.providers.preApproval + '/' + preApprovalCode + '/cancel',
    params: {
      email: env.email,
      token: env.token
    },
    headers: {
      accept: 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1',
      'content-type': 'application/json'
    }
  });
}

function pagseguroTransactionStatus(code) {
  let status = {
    transactionStatus: '',
    planStatus: ''
  };
  switch (code) {
    case '1':
      status.transactionStatus = 'aguardandoPagamento';
      status.planStatus = 'waitingPayment';
      break;
    case '2':
      status.transactionStatus = 'emAnalise';
      status.planStatus = 'waitingPayment';
      break;
    case '3':
      status.transactionStatus = 'paga';
      status.planStatus = 'active';
      break;
    case '4':
      status.transactionStatus = 'disponivel';
      status.planStatus = 'active';
      break;
    case '5':
      status.transactionStatus = 'emDisputa';
      status.planStatus = 'active';
      break;
    case '6':
      status.transactionStatus = 'devolvida';
      status.planStatus = 'cancelled';
      break;
    case '7':
      status.transactionStatus = 'cancelada';
      status.planStatus = 'cancelled';
      break;
    case '8':
      status.transactionStatus = 'debitado';
      status.planStatus = 'cancelled';
      break;
    case '9':
      status.transactionStatus = 'retencaoTemporaria';
      status.planStatus = 'active';
      break;
  }

  return status;
}

function pagseguroPaymentType(code) {
  switch (code) {
    case '1':
      return 'Cartão de Crédito';
    case '2':
      return 'Boleto';
    case '3':
      return 'Débito Online';
    case '4':
      return 'Saldo PagSeguro';
    case '5':
      return 'Oi Paggo';
    case '6':
      return 'Depósito em conta PagSeguro';
    case '7':
      return 'Depósito';
  }
}

function pagseguroPaymentTypeBrand(code) {
  switch (code) {
    case '101':
      return 'Cartão de crédito Visa';
    case '102':
      return 'Cartão de crédito MasterCard';
    case '103':
      return 'Cartão de crédito American Express';
    case '104':
      return 'Cartão de crédito Diners';
    case '105':
      return 'Cartão de crédito Hipercard';
    case '106':
      return 'Cartão de crédito Aura';
    case '107':
      return 'Cartão de crédito Elo';
    case '108':
      return 'Cartão de crédito PLENOCard';
    case '109':
      return 'Cartão de crédito PersonalCard';
    case '110':
      return 'Cartão de crédito JCB';
    case '111':
      return 'Cartão de crédito Discover';
    case '112':
      return 'Cartão de crédito BrasilCard';
    case '113':
      return 'Cartão de crédito FORTBRASIL';
    case '114':
      return 'Cartão de crédito CARDBAN';
    case '115':
      return 'Cartão de crédito VALECARD';
    case '116':
      return 'Cartão de crédito Cabal';
    case '117':
      return 'Cartão de crédito Mais!';
    case '118':
      return 'Cartão de crédito Avista';
    case '119':
      return 'Cartão de crédito GRANDCARD';
    case '120':
      return 'Cartão de crédito Sorocred';
    case '122':
      return 'Cartão de crédito Up Policard';
    case '123':
      return 'Cartão de crédito Banese Card';
    case '201':
      return 'Boleto Bradesco';
    case '202':
      return 'Boleto Santander';
    case '301':
      return 'Débito online Bradesco';
    case '302':
      return 'Débito online Itaú';
    case '303':
      return 'Débito online Unibanco';
    case '304':
      return 'Débito online Banco do Brasil';
    case '305':
      return 'Débito online Banco Real';
    case '306':
      return 'Débito online Banrisul';
    case '307':
      return 'Débito online HSBC';
    case '401':
      return 'Saldo PagSeguro';
    case '501':
      return 'Oi Paggo';
    case '701':
      return 'Depósito em conta - Banco do Brasil';
  }
}

// eslint-disable-next-line no-unused-vars
function getPagseguroPreApprovalPaymentOrders(preApprovalCode) {
  return axios({
    method: 'GET',
    url: env.providers.preApproval + "/" + preApprovalCode + "/payment-orders",
    params: {
      email: env.email,
      token: env.token
    },
    headers: {
      accept:
                'application/vnd.pagseguro.com.br.v1+json;charset=ISO-8859-1',
      'content-type': 'application/json'
    }
  }).then(async (response) => {
    return response.data;
  });
}

// eslint-disable-next-line no-unused-vars
function createPagseguroPlan() {
  let planData = {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'ISO-8859-1',
        standalone: 'yes'
      }
    },
    preApprovalRequest: {
      preApproval: {
        name: 'Pro Anual',
        charge: 'AUTO',
        reference: 'pro-yearly',
        period: 'YEARLY',
        amountPerPayment: "165.00"
      }
    }
  };

  axios({
    method: 'POST',
    url: env.providers.preApproval + '/request/',
    params: {
      email: env.email,
      token: env.token
    },
    headers: {
      accept:
        'application/vnd.pagseguro.com.br.v3+xml;charset=ISO-8859-1',
      'Content-Type': 'application/xml;charset=ISO-8859-1'
    },
    data: xmlParser.js2xml(planData, { compact: true })
  })
  .then((data) => {
    return xmlParser.xml2js(data.data, { compact: true });
  })
}

function getPagseguroPreApprovalNotification(notificationCode) {
  return axios({
    method: 'GET',
    url: env.preApprovalsNotificationURL + notificationCode,
    params: {
      email: env.email,
      token: env.token
    },
    headers: {
      'content-type': 'application/json'
    }
  }).then(async (response) => {
    return xmlParser.xml2js(response.data, { compact: true });
  });
}

async function preApprovalNotificationHandler(notificationCode) {
  try {
    let notification = await getPagseguroPreApprovalNotification(
      notificationCode
    );
    let reference = notification.preApproval.reference._text;
    let preApproval = {
      code: notification.preApproval.code._text,
      status: notification.preApproval.status._text.toLowerCase(),
      dateTime: reference.split('_')[2],
      reference: reference
    };
    let userId = reference.split('_')[0];
    let planId = reference.split('_')[1];

    if(preApproval.status === "payment_method_change") {
      await pagseguroSignoutFromPlan(preApproval.code);
      return notification;
    }

    const batch = admin.firestore().batch();

    if(["initiated", "pending"].includes(preApproval.status)) {
      setUserPagseguroPlan(batch, userId, await getPlan(planId), preApproval);
      setUserPlanAndPreApproval(batch, userId, await getFreePlan(), preApproval);
    }
    else if (preApproval.status === "active") {
      let plan = await getPlan(planId);
      setUserPagseguroPlan(batch, userId, plan, preApproval);
      setUserPlanAndPreApproval(batch, userId, plan, preApproval);
    }
    else if ([
      'cancelled',
      'cancelled_by_receiver',
      'cancelled_by_sender',
      'expired'
    ].includes(preApproval.status)) {
      let cancelDatetime = moment().format('x');
      setUserPagseguroPlan(batch, userId, await getPlan(planId), {
        ...preApproval,
        cancelDatetime: cancelDatetime
      });
      setUserPlanAndPreApproval(batch, userId, await getFreePlan(), {
        ...preApproval,
        cancelDatetime: cancelDatetime
      });
    }
    else if (preApproval.status === "suspended") {
      let suspendDatetime = moment().format('x');
      setUserPagseguroPlan(batch, userId, await getPlan(planId), {
        ...preApproval,
        suspendDatetime: suspendDatetime
      });
      setUserPlanAndPreApproval(batch, userId, await getFreePlan(), {
        ...preApproval,
        suspendDatetime: suspendDatetime
      });
    }

    return batch.commit().then(() => {
      return notification;
    });
  } catch (error) {
    return handleErrors(error);
  }
}

function getPagseguroTransactionNotification(notificationCode) {
  return axios({
    method: 'GET',
    url: env.transactionsNotificationURL + notificationCode,
    params: {
      email: env.email,
      token: env.token
    },
    headers: {
      'content-type': 'application/json'
    }
  }).then(async (response) => {
    return xmlParser.xml2js(response.data, { compact: true });
  });
}

async function transactionNotificationHandler(notificationCode) {
  try {
    let notification = await getPagseguroTransactionNotification(
      notificationCode
    );
    let transactionPlanReference = notification.transaction.reference._text;
    let transactionCode = notification.transaction.code._text;
    let transactionStatus = notification.transaction.status._text;
    let userId = transactionPlanReference.split('_')[0];
    let planId = transactionPlanReference.split('_')[1];
    let status = pagseguroTransactionStatus(transactionStatus);

    let transaction = {
      code: transactionCode,
      date: moment(notification.transaction.date._text).format("x"),
      lastEventDate: moment(notification.transaction.lastEventDate._text).format("x"),
      status: status.transactionStatus,
      cancelationSource: notification.transaction.cancelationSource
        ? notification.transaction.cancelationSource._text
        : '',
      reference: transactionPlanReference,
      paymentMethod: {
        type: pagseguroPaymentType(
          notification.transaction.paymentMethod.type._text
        ),
        brand: pagseguroPaymentTypeBrand(
          notification.transaction.paymentMethod.code._text
        )
      },
      value: Number(notification.transaction.grossAmount._text),
      discount: Number(notification.transaction.discountAmount._text),
      creditorFees: {
        installmentFeeAmount: Number(
          notification.transaction.creditorFees.installmentFeeAmount._text
        ),
        intermediationRateAmount: Number(
          notification.transaction.creditorFees.intermediationRateAmount._text
        ),
        intermediationFeeAmount: Number(
          notification.transaction.creditorFees.intermediationFeeAmount._text
        )
      },
      netAmount: Number(notification.transaction.netAmount._text),
      escrowEndDate: notification.transaction.escrowEndDate
        ? moment(notification.transaction.escrowEndDate._text).format("x")
        : '',
      sender: {
        name: notification.transaction.sender.name._text,
        phone: {
          areaCode: notification.transaction.sender.phone.areaCode._text,
          number: notification.transaction.sender.phone.number._text
        }
      }
    };

    if (status.planStatus === 'cancelled') {
      setUserPagseguroTransaction(userId, transaction);
      let userPagseguroPlan = await getUserPagseguroPlan(
        transactionPlanReference
      );
      pagseguroSignoutFromPlan(userPagseguroPlan.preApproval.code);
      return notification;
    }

    const batch = admin.firestore().batch();
    setUserPagseguroTransaction(userId, transaction, batch);
    setUserPlan(
      batch,
      userId,
      status.planStatus === 'active'
        ? await getPlan(planId)
        : await getFreePlan()
    );

    return batch.commit().then(() => {
      return notification;
    });
  } catch (error) {
    return handleErrors(error);
  }
}

exports.syncBinanceOperations = functions.https.onCall(async (data, context) => {
  try {
    userAuthenthication(data.userId, context.auth);
    let user = await getUser(data.userId);

    if (!user.plan.benefits.syncExchanges) {
      throw 'Operação não autorizada para o plano contratado';
    }

    const client = Binance({
      apiKey: data.apiKey,
      apiSecret: data.privateKey
    });

    client.exchangeInfo({ useServerTime: true }).then((exchangeInfo) => {
      const promises = [];
      const timeoutPromises = [];
      const batch = admin.firestore().batch();
      const lastOperations = data.lastOperations
        ? JSON.parse(data.lastOperations)
        : false;
      const exchangeId = data.exchangeId;
      const exchangeName = data.exchangeName;
      const exchangeUrl = data.exchangeUrl;
      const exchangeCountryCode = data.exchangeCountryCode;
      const syncTimestamp = moment().format('x');
      exchangeInfo.symbols.forEach((symbolInfo, index) => {
        let timeoutPromise = new Promise((resolve) =>
          setTimeout(() => {
            let symbol = symbolInfo.symbol;
            let baseAsset = symbolInfo.baseAsset;
            let quoteAsset = symbolInfo.quoteAsset;

            let tradeParams = {
              symbol: symbol,
              useServerTime: true,
              recvWindow: 10000000
            };
            let lastOperation = lastOperations
              ? lastOperations[symbol] || false
              : false;

            if (lastOperation) tradeParams.fromId = lastOperation.trade + 1;

            let trades = client.myTrades(tradeParams).then(
              (trades) => {
                let lastTradeId = '';
                trades.forEach((trade) => {
                  lastTradeId = trade.id;
                  if (trade.time >= 1561950000000) {
                    let operationDoc = admin
                      .firestore()
                      .collection('users/' + data.userId + '/operations/')
                      .doc();
                    batch.set(operationDoc, {
                      ...trade,
                      baseAsset: baseAsset,
                      quoteAsset: quoteAsset,
                      exchangeName: exchangeName,
                      exchangeUrl: exchangeUrl,
                      exchangeCountryCode: exchangeCountryCode,
                      type: 'trade'
                    });
                  }
                });

                if (trades.length > 0) {
                  let lastOperation = admin
                    .firestore()
                    .collection(
                      'users/' + data.userId + '/lastOperations/'
                    )
                    .doc('binance');
                  let symbolObj = {};
                  symbolObj[symbol] = { trade: lastTradeId };
                  batch.set(lastOperation, symbolObj, { merge: true });
                }

                return trades;
              },
              function(error) {
                console.error('Error getting binance account trades:', error);
                return Promise.reject(error);
              }
            );
            promises.push(trades);
            resolve();
          }, 500 * index)
        );
        timeoutPromises.push(timeoutPromise);
      });

      Promise.all(timeoutPromises).then(() => {
        let depositParams = {
          startTime: 1561950000000,
          useServerTime: true,
          recvWindow: 10000000
        };
        let lastDeposit = lastOperations
          ? lastOperations.deposit || false
          : false;

        if (lastDeposit) depositParams.startTime = lastDeposit + 1;

        let depositHistory = client.depositHistory(depositParams).then(
          (deposits) => {
            let lastDepositTimestamp = '';
            deposits.depositList.forEach((deposit) => {
              lastDepositTimestamp = deposit.insertTime;
              let symbol = deposit.asset;
              let time = deposit.insertTime;
              let qty = deposit.amount;
              delete deposit.asset;
              delete deposit.insertTime;
              delete deposit.amount;
              let operationDoc = admin
                .firestore()
                .collection('users/' + data.userId + '/operations/')
                .doc();
              batch.set(operationDoc, {
                ...deposit,
                symbol: symbol,
                time: time,
                qty: qty,
                exchangeName: exchangeName,
                exchangeUrl: exchangeUrl,
                exchangeCountryCode: exchangeCountryCode,
                type: 'deposit'
              });
            });

            if (deposits.depositList.length > 0) {
              let lastOperation = admin
                .firestore()
                .collection('users/' + data.userId + '/lastOperations/')
                .doc('binance');
              batch.set(
                lastOperation,
                { deposit: lastDepositTimestamp },
                { merge: true }
              );
            }

            return deposits;
          },
          function(error) {
            console.error(
              'Error getting binance account deposit history:',
              error
            );
            return Promise.reject(error);
          }
        );
        promises.push(depositHistory);

        let whitdrawParams = {
          startTime: 1561950000000,
          useServerTime: true,
          recvWindow: 10000000
        };
        let lastWhitdraw = lastOperations
          ? lastOperations.whitdraw || false
          : false;

        if (lastWhitdraw) whitdrawParams.startTime = lastWhitdraw + 1;

        let withdrawHistory = client.withdrawHistory(whitdrawParams).then(
          (whitdraws) => {
            let lastWhitdrawTimestamp = '';
            whitdraws.withdrawList.forEach((whitdraw) => {
              lastWhitdrawTimestamp = whitdraw.applyTime;
              let symbol = whitdraw.asset;
              let time = whitdraw.applyTime;
              let qty = whitdraw.amount;
              delete whitdraw.asset;
              delete whitdraw.applyTime;
              delete whitdraw.amount;
              let operationDoc = admin
                .firestore()
                .collection('users/' + data.userId + '/operations/')
                .doc();
              batch.set(operationDoc, {
                ...whitdraw,
                symbol: symbol,
                time: time,
                qty: qty,
                exchangeName: exchangeName,
                exchangeUrl: exchangeUrl,
                exchangeCountryCode: exchangeCountryCode,
                type: 'whitdraw'
              });
            });

            if (whitdraws.withdrawList.length > 0) {
              let lastOperation = admin
                .firestore()
                .collection('users/' + data.userId + '/lastOperations/')
                .doc('binance');
              batch.set(
                lastOperation,
                { whitdraw: lastWhitdrawTimestamp },
                { merge: true }
              );
            }

            return whitdraws;
          },
          function(error) {
            console.error(
              'Error getting binance account whitdraw history:',
              error
            );
            return Promise.reject(error);
          }
        );
        promises.push(withdrawHistory);

        Promise.all(promises)
          .then(() => {
            return batch.commit().then(() => {
              admin
                .firestore()
                .collection('users')
                .doc(data.userId)
                .collection('exchanges')
                .doc(exchangeId)
                .update({ lastSync: syncTimestamp })
                .then((response) => {
                  return {
                    type: 'success',
                    message: 'Operações sincronizadas com sucesso!',
                    content: response
                  };
                });
            });
          })
          .catch(error => {
            return handleErrors(error);
          });
      });
    });
  } catch(error) {
    return handleErrors(error);
  }
});

exports.generateOperationsTextFile = functions.https.onCall(async (data, context) => {
  try {
    userAuthenthication(data.userId, context.auth);
    let startTimestamp = Number(moment(data.date, 'YYYY-MM').format('x'));
    let endTimestamp = Number(
      moment(data.date, 'YYYY-MM')
        .endOf('month')
        .format('x')
    );

    let operations = await getUserOperationsByDatetimeRange(data.userId, startTimestamp, endTimestamp);

    return {
      type: 'success',
      message: 'Arquivo gerado com sucesso!',
      content: operations
    };
  } catch(error) {
    return handleErrors(error);
  }
});

exports.signUserToPlan = functions.https.onCall((data, context) => {
  try {
    userAuthenthication(data.userId, context.auth);

    let promises = [];
    promises.push(getPlan(data.plan.id));
    promises.push(getUser(data.userId));

    return Promise.all(promises)
      .then(async (response) => {
        let plan = response[0];
        let user = response[1];

        if (user.plan.type === "paid") {
          throw 'Já existe uma adesão ativa';
        }

        if (!user.address || !user.phone) {
          updateUserAddressAndPhone(user.id, data.address, data.phone);
        }

        let sessionId = await setPagseguroSession();
        let card = data.card;

        card.cardBrand = await getPagseguroCardBrand(
          sessionId,
          card.cardNumber.substr(0, 6)
        );

        let cardToken = await getPagseguroCardToken(
          sessionId,
          card,
          plan.price.toString()
        );

        let cardHolder = data.cardHolder;

        let signDatetime = moment().format('x');
        let sign = {
          plan: plan.id,
          reference: user.id + '_' + plan.id + '_' + signDatetime,
          sender: {
            name: user.name,
            email: user.email,
            hash: data.senderHash,
            phone: {
              areaCode: data.phone.areaCode || user.phone.areaCode,
              number: data.phone.number || user.phone.number
            },
            address: {
              street: data.address.street || user.address.street,
              number: data.address.number || user.address.number,
              complement: data.address.complement || user.address.complement,
              district: data.address.district || user.address.district,
              city: data.address.city || user.address.city,
              state: data.address.state || user.address.state,
              country: 'BRA',
              postalCode: data.address.postalCode || user.address.postalCode
            },
            documents: [
              {
                type: 'CPF',
                value: user.cpf
              }
            ]
          },
          paymentMethod: {
            type: 'CREDITCARD',
            creditCard: {
              token: cardToken,
              holder: {
                name: cardHolder.name,
                birthDate:
                  cardHolder.birthDate ||
                  moment(user.birthday, 'YYYY-MM-DD').format('DD/MM/YYYY'),
                documents: [
                  {
                    type: 'CPF',
                    value: cardHolder.cpf || user.cpf
                  }
                ],
                phone: {
                  areaCode: cardHolder.phone.areaCode || user.phone.areaCode,
                  number: cardHolder.phone.number || user.phone.number
                }
              }
            }
          }
        };

        let preApproval = await axios({
          method: 'POST',
          url: env.providers.preApproval,
          params: {
            email: env.email,
            token: env.token
          },
          headers: {
            accept:
              'application/vnd.pagseguro.com.br.v1+json;charset=ISO-8859-1',
            'content-type': 'application/json'
          },
          data: sign
        });

        return {
          type: 'success',
          message:
            'Assinatura enviada para análise de pagamento junto ao PagSeguro',
          content: preApproval.data.code
        };
      })
      .catch((error) => {
        return handleErrors(error);
      });
  } catch (error) {
    return handleErrors(error);
  }
});

exports.signoutUserFromPlan = functions.https.onCall(async (data, context) => {
  try {
    userAuthenthication(data.userId, context.auth);

    let user = await getUser(data.userId);

    if (user.plan.type === 'free') {
      throw 'Não há nenhuma assinatura ativa';
    }

    await pagseguroSignoutFromPlan(user.preApproval.code);

    return {
      type: 'success',
      message: 'Assinatura cancelada com sucesso!'
    };
  } catch (error) {
    return handleErrors(error);
  }
});

exports.pagseguroNotificationHandler = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    let notificationType = req.body.notificationType;
    let notificationCode = req.body.notificationCode;

    let notification =
      notificationType === 'transaction'
        ? await transactionNotificationHandler(notificationCode)
        : await preApprovalNotificationHandler(notificationCode);

    return res.status(200).send(notification);
  });
});

exports.signUserUp = functions.https.onCall(async (data) => {
  try {
    // checkUserEmailAlreadyUsed(data.email);
    await checkUserCpfAlreadyUsed(data.cpf.replace(/\D/g,''));
    let uid = await createAuthUser({email: data.email, name: data.name, password: data.password});
    let freePlan = await getFreePlan();

    const newUser = {
      id: uid,
      name: data.name,
      email: data.email,
      cpf: data.cpf.replace(/\D/g,''),
      birthday: data.birthday,
      dateCreated: moment().format("x"),
      plan: freePlan,
      exchanges: [],
      operations: [],
      lastOperations: []
    };
    await createUser(newUser);

    return {
      type: 'success',
      message: 'Cadastro realizado com sucesso!',
      content: newUser
    };
  } catch (error) {
    return handleErrors(error);
  }
})