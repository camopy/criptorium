const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const Binance = require('binance-api-node').default;
const moment = require('moment');
moment.locale('pt-br');
admin.initializeApp();

exports.syncBinanceOperations = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    admin
      .firestore()
      .collection('exchanges')
      .doc('binance')
      .get()
      .then(
        (exchangeDoc) => {
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
            exchangeInfo.symbols.forEach((symbolInfo, index) => {
              let timeoutPromise = new Promise((resolve) =>
                setTimeout(() => {
                  let symbol = symbolInfo.symbol;
                  let baseAsset = symbolInfo.baseAsset;
                  let quoteAsset = symbolInfo.quoteAsset;

                  let tradeParams = { symbol: symbol, useServerTime: true };
                  let lastOperation = lastOperations
                    ? lastOperations[symbol] || false
                    : false;

                  if (lastOperation)
                    tradeParams.fromId = lastOperation.trade + 1;

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
                            exchangeName: exchangeDoc.data().name,
                            exchangeUrl: exchangeDoc.data().url,
                            exchangeCountryCode: exchangeDoc.data().countryCode,
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
                      console.log(
                        'Error getting binance account trades:',
                        error
                      );
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
                useServerTime: true
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
                      exchangeName: exchangeDoc.data().name,
                      exchangeUrl: exchangeDoc.data().url,
                      exchangeCountryCode: exchangeDoc.data().countryCode,
                      type: 'deposit'
                    });
                  });

                  if (deposits.depositList.length > 0) {
                    let lastOperation = admin
                      .firestore()
                      .collection(
                        'users/' + req.query.userId + '/lastOperations/'
                      )
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
                  console.log(
                    'Error getting binance account deposit history:',
                    error
                  );
                  return Promise.reject(error);
                }
              );
              promises.push(depositHistory);

              let whitdrawParams = {
                startTime: 1561950000000,
                useServerTime: true
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
                      exchangeName: exchangeDoc.data().name,
                      exchangeUrl: exchangeDoc.data().url,
                      exchangeCountryCode: exchangeDoc.data().countryCode,
                      type: 'whitdraw'
                    });
                  });

                  if (whitdraws.withdrawList.length > 0) {
                    let lastOperation = admin
                      .firestore()
                      .collection(
                        'users/' + req.query.userId + '/lastOperations/'
                      )
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
                .then((response) => {
                  return batch
                    .commit()
                    .then(() => {
                      return res.status(200).send(response);
                    })
                    .catch((error) => {
                      console.log(error);
                      return res.status(200).send(error);
                    });
                })
                .catch((error) => {
                  console.log(error);
                  return res.status(200).send(error);
                });
            });
          });
        },
        function(error) {
          console.log('Error getting exchange data:', error);
          return res.status(200).send(error);
        }
      );
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
          return res.status(200).send(operations);
        },
        function(error) {
          console.log('Error getting user operations:', error);
          return res.status(200).send(error);
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
    (operation.isBuyer ? operation.baseAsset : operation.quoteAsset).substr(0, 10).toUpperCase() +
    '|' +
    Number(operation.isBuyer ? operation.qty : operation.quoteQty)
      .toFixed(10)
      .replace('.', '')
      .substr(0, 20) +
    '|' +
    (operation.isBuyer ? operation.quoteAsset : operation.baseAsset).substr(0, 10).toUpperCase() +
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
