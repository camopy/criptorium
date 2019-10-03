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

function getPlan(planId) {
  return admin
    .firestore()
    .collection('plans')
    .doc(planId)
    .get()
    .then((planDoc) => {
      if (!planDoc.data()) {
        throw new Error('Plano não encontrado');
      }

      return {
        id: planDoc.id,
        ...planDoc.data()
      };
    });
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

exports.syncBinanceOperations = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    let user = await getUser(req.query.userId);

    if (!user.plan.benefits.syncExchanges) {
      throw new Error('Operação não autorizada para o plano contratado');
    }

    const client = Binance({
      apiKey: req.query.apiKey,
      apiSecret: req.query.privateKey
    });

    client.exchangeInfo({ useServerTime: true }).then((exchangeInfo) => {
      const promises = [];
      const timeoutPromises = [];
      const batch = admin.firestore().batch();
      const lastOperations = req.query.lastOperations
        ? JSON.parse(req.query.lastOperations)
        : false;
      const exchangeId = req.query.exchangeId;
      const exchangeName = req.query.exchangeName;
      const exchangeUrl = req.query.exchangeUrl;
      const exchangeCountryCode = req.query.exchangeCountryCode;
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
                      .collection(
                        'users/' + req.query.userId + '/operations/'
                      )
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
                      'users/' + req.query.userId + '/lastOperations/'
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
                .collection('users/' + req.query.userId + '/operations/')
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
                .collection('users/' + req.query.userId + '/lastOperations/')
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
                .collection('users/' + req.query.userId + '/operations/')
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
                .collection('users/' + req.query.userId + '/lastOperations/')
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
            console.log(
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
                .doc(req.query.userId)
                .collection('exchanges')
                .doc(exchangeId)
                .update({ lastSync: syncTimestamp })
                .then((response) => {
                  return res.status(200).send({
                    type: 'success',
                    message: 'Operações sincronizadas com sucesso!',
                    content: response
                  });
                });
            });
          })
          .catch((error) => {
            console.log(error);
            return res.status(200).send({ type: 'error', message: error });
          });
      });
    });
  });
});

exports.generateOperationsTextFile = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    let startTimestamp = Number(moment(req.query.date, 'YYYY-MM').format('x'));
    let endTimestamp = Number(
      moment(req.query.date, 'YYYY-MM')
        .endOf('month')
        .format('x')
    );

    admin
      .firestore()
      .collection('users/' + req.query.userId + '/operations')
      .where('time', '>=', startTimestamp)
      .where('time', '<=', endTimestamp)
      .get()
      .then(
        (querySnapshot) => {
          let operations = querySnapshot.docs.map(function(operation) {
            return formatOperation({ ...operation.data(), id: operation.id });
          });
          return res.status(200).send({
            type: 'success',
            message: 'Arquivo gerado com sucesso!',
            content: operations
          });
        },
        function(error) {
          console.log('Error getting user operations:', error);
          return res.status(200).send({ type: 'error', message: error });
        }
      );
  });
});

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
    if(!response.data.bin.brand) {
      throw new Error("Cartão inválido");
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
  })
  .then((response) => {
    if(!response.data) {
      throw new Error("Cartão inválido");
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

function updateUserPlan(batch, userId, plan) {
  let userDoc = admin
    .firestore()
    .collection('users')
    .doc(userId);

  return batch.update(userDoc, { plan: plan });
}

function cancelUserPaidPlan(batch, userId, freePlan, cancelDatetime) {
  let userDoc = admin
    .firestore()
    .collection('users')
    .doc(userId);

  return batch.update(userDoc, { plan: freePlan, "preApproval.cancelDatetime": cancelDatetime });
}

function updateUserPreApproval(batch, userId, preApproval) {
  let userDoc = admin
    .firestore()
    .collection('users')
    .doc(userId);

  return batch.update(userDoc, { preApproval: preApproval });
}

function updateUserPlanStatus(batch, userId, status) {
  let userDoc = admin
    .firestore()
    .collection('users')
    .doc(userId);

  return batch.update(userDoc, { "plan.status": status });
}

function createUserPagseguroPlan(batch, user, plan, preApprovalCode, signDatetime) {
  let userPagseguroPlanDoc = admin
    .firestore()
    .collection('user_pagseguro_plan')
    .doc(user.id + '_' + plan.id + "_" + signDatetime);

  return batch.set(userPagseguroPlanDoc, {
    userId: user.id,
    plan: {
      ...plan
    },
    transactionStatus: "waiting",
    preApprovalCode: preApprovalCode,
    signDatetime: signDatetime
  });
}

function updateUserPagseguroPlan(batch, transactionPlanReference, transactionCode, transactionStatus, planStatus) {
  let userPagseguroPlanDoc = admin
    .firestore()
    .collection('user_pagseguro_plan')
    .doc(transactionPlanReference);

  return batch.update(userPagseguroPlanDoc, {
    transactionCode: transactionCode,
    transactionStatus: transactionStatus,
    status: planStatus
  });
}

function cancelUserPagseguroPlan(batch, userId, planId, preApprovalDatetime, cancelDatetime) {
  let userPagseguroPlanDoc = admin
    .firestore()
    .collection('user_pagseguro_plan')
    .doc(userId + '_' + planId + "_" + preApprovalDatetime);

  return batch.update(userPagseguroPlanDoc, {
    status: 'canceled',
    cancelDatetime: cancelDatetime
  });
}

function errorMessageHandler(error) {
  let message = 'Contate o suporte';
  console.error(error);

  // console.log("Type", typeof(error));
  // console.log("error message", error.message);
  // console.log("error response",error.response);
  // console.log("error response statusText", error.response.statusText);
  // console.log("error.response.data", error.response.data);
  // console.log("error.response.data.errors", error.response.data.errors);

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
    if (error.response && error.response.data && error.response.data.errors) {
      console.error(error.response.data.errors);
    }
    if (error.response && error.response.statusText) {
      console.error(error.response.statusText);
    }
  } else {
    const json = xmlParser.xml2js(error.response.data, { compact: true });
    message = json.errors.error.message._text;
    console.error(message);
  }

  return message;
}

exports.signUserToPlan = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    try {
      let plan = JSON.parse(req.query.plan);
      let promises = [];
      promises.push(getPlan(plan.id));
      promises.push(getUser(req.query.userId));

      Promise.all(promises)
        .then(async (response) => {
          let plan = response[0];
          let user = response[1];

          if (user.plan.id === plan.id) {
            throw new Error('Usuário já aderiu ao plano');
          }

          let address = JSON.parse(req.query.address);
          let phone = JSON.parse(req.query.phone);

          if (!user.address || !user.phone) {
            updateUserAddressAndPhone(user.id, address, phone);
          }

          let sessionId = await setPagseguroSession();
          let card = JSON.parse(req.query.card);

          card.cardBrand = await getPagseguroCardBrand(
            sessionId,
            card.cardNumber.substr(0, 6)
          );

          let cardToken = await getPagseguroCardToken(
            sessionId,
            card,
            plan.price.toString()
          );

          let cardHolder = JSON.parse(req.query.cardHolder);

          let signDatetime = moment().format("x");
          let sign = {
            plan: plan.id,
            reference: user.id + '_' + plan.id + "_" + signDatetime,
            sender: {
              name: user.name,
              email:  user.email,
              hash: req.query.senderHash,
              phone: {
                areaCode: phone.areaCode || user.phone.areaCode,
                number: phone.number || user.phone.number
              },
              address: {
                street: address.street || user.address.street,
                number: address.number || user.address.number,
                complement: address.complement || user.address.complement,
                district: address.district || user.address.district,
                city: address.city || user.address.city,
                state: address.state || user.address.state,
                country: 'BRA',
                postalCode: address.postalCode || user.address.postalCode
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
          })

          return {
            user: user,
            plan: plan,
            preApprovalCode: preApproval.data.code,
            signDatetime: signDatetime
          }
        })
        .then((response) => {
          let user = response.user;
          let plan = response.plan;
          let preApprovalCode = response.preApprovalCode;
          let signDatetime = response.signDatetime;

          const batch = admin.firestore().batch();

          createUserPagseguroPlan(
            batch,
            user,
            plan,
            preApprovalCode,
            signDatetime
          );

          let preApproval = {
            code: preApprovalCode,
            datetime: signDatetime
          };
          updateUserPreApproval(batch, user.id, preApproval);

          batch.commit().then((response) => {
            return res.status(200).send({
              type: 'success',
              message: 'Assinatura enviada para análise de pagamento junto ao PagSeguro',
              content: response.data
            });
          });
        })
        .catch((error) => {
          let message = errorMessageHandler(error);
          return res.status(200).send({ type: 'error', message: message });
        });
    } catch (error) {
      let message = errorMessageHandler(error);
      return res.status(200).send({ type: 'error', message: message });
    }
  });
});

exports.signoutUserFromPlan = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    let promises = [];
    promises.push(getFreePlan());
    promises.push(getUser(req.query.userId));

    Promise.all(promises)
      .then(async (response) => {
        let freePlan = response[0];
        let user = response[1];

        if (user.plan.type === 'free') {
          throw new Error('Não há nenhuma assinatura ativa');
        }

        let cancelDatetime = moment().format("x");
        await axios({
          method: 'PUT',
          url: env.providers.preApproval + "/" + user.preApproval.code + '/cancel',
          params: {
            email: env.email,
            token: env.token
          },
          headers: {
            accept:
              'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1',
            'content-type': 'application/json'
          }
        });

        return {
          user: user,
          freePlan: freePlan,
          cancelDatetime: cancelDatetime
        };
      })
      .then((response) => {
        let user = response.user;
        let freePlan = response.freePlan;
        let cancelDatetime = response.cancelDatetime;
        const batch = admin.firestore().batch();

        cancelUserPagseguroPlan(batch, user.id, user.plan.id, user.preApproval.datetime, cancelDatetime);
        cancelUserPaidPlan(batch, user.id, freePlan, cancelDatetime);

        return batch
          .commit()
          .then(() => {
            return res.status(200).send({
              type: 'success',
              message: 'Assinatura cancelada com sucesso!'
            });
          })
      })
      .catch((error) => {
        let message = errorMessageHandler(error);
        return res.status(200).send({ type: 'error', message: message });
      });
  });
});

function pagseguroTransactionStatus(code) {
  let status = {
    transactionStatus: "",
    planStatus: ""
  }
  switch (code) {
    case "1":
      status.transactionStatus = "aguardandoPagamento";
      status.planStatus = "waitingPayment";
      break;
    case "2":
        status.transactionStatus = "emAnalise";
        status.planStatus = "waitingPayment";
        break;
    case "3":
        status.transactionStatus = "paga";
        status.planStatus = "active";
        break;
    case "4":
      status.transactionStatus = "disponivel";
      status.planStatus = "active";
      break;
    case "5":
      status.transactionStatus = "emDisputa";
      status.planStatus = "waitingPayment";
      break;
    case "6":
      status.transactionStatus = "devolvida";
      status.planStatus = "canceled";
      break;
    case "7":
      status.transactionStatus = "cancelada";
      status.planStatus = "canceled";
      break;
    case "8":
      status.transactionStatus = "debitado";
      status.planStatus = "canceled";
      break;
    case "9":
      status.transactionStatus = "retencaoTemporaria";
      status.planStatus = "waitingPayment";
      break;
  }

  return status;
}

exports.pagseguroNotificationHandler = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    let notificationCode = req.body.notificationCode;

    axios({
      method: 'GET',
      url: env.notificationURL + notificationCode,
      params: {
        email: env.email,
        token: env.token
      },
      headers: {
        'content-type': 'application/json'
      }
    })
    .then(async response => {
      let notification = xmlParser.xml2js(response.data, { compact: true });
      let transactionPlanReference = notification.transaction.reference._text;
      let transactionCode = notification.transaction.code._text;
      let transactionStatus = notification.transaction.status._text;
      let userId = transactionPlanReference.split("_")[0];
      let planId = transactionPlanReference.split("_")[1];
      let status = pagseguroTransactionStatus(transactionStatus);

      const batch = admin.firestore().batch();

      updateUserPagseguroPlan(batch, transactionPlanReference, transactionCode, status.transactionStatus, status.planStatus);

      if(status.planStatus === "active") {
        let plan = await getPlan(planId);
        updateUserPlan(batch, userId, plan);
      }
      else {
        let freePlan = await getFreePlan();

        if(status.planStatus === "canceled"){
          cancelUserPaidPlan(batch, userId, freePlan, moment().format("x"));
        }
        else {
          updateUserPlan(batch, userId, freePlan);
        }
      }

      batch.commit()
      .then(() => {
        return res.status(200).send(status);
      })
    })
    .catch((error) => {
      let message = errorMessageHandler(error);
      return res.status(200).send({ type: 'error', message: message });
    });

  });
})

// function createPagseguroPlan() {
// let planData = {
//   _declaration: {
//     _attributes: {
//       version: '1.0',
//       encoding: 'ISO-8859-1',
//       standalone: 'yes'
//     }
//   },
//   preApprovalRequest: {
//     preApproval: {
//       name: 'Pro Anual',
//       charge: 'AUTO',
//       reference: 'pro-yearly',
//       period: 'YEARLY',
//       amountPerPayment: "165.00"
//     }
//   }
// };

// axios({
//   method: 'POST',
//   url: url + '/pre-approvals/request/',
//   params: auth,
//   headers: {
//     accept:
//       'application/vnd.pagseguro.com.br.v3+xml;charset=ISO-8859-1',
//     'Content-Type': 'application/xml;charset=ISO-8859-1'
//   },
//   data: xmlParser.js2xml(planData, { compact: true })
// })
//   .then((data) => {
//     const json = xmlParser.xml2js(data.data, { compact: true });
//     return res
//       .status(200)
//       .send({
//         type: 'success',
//         message: 'Plano criado com sucesso!',
//         content: json
//       });
//   })
//   .catch((err) => {
//     const json = xmlParser.xml2js(err.response.data, { compact: true });
//     console.error(json.errors.error.message._text);
//     return res.status(200).send({ type: 'error', message: json.errors.error.message._text });
//   });
// }
