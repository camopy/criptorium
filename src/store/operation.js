import { db } from "../main";
import * as moment from "moment";
import axios from 'axios';
import { saveAs } from 'file-saver';

export default {
  actions: {
    generateTextFile({ commit, getters }, payload) {
      commit('setCreating', true);
      let params = {
        userId: getters.user.id,
        date: payload.date
      };

      return axios
        .get(
          'https://us-central1-cripto-rf-dev.cloudfunctions.net/generateOperationsTextFile',
          { params: params }
        )
        .then((response) => {
          console.log(response.data);
          let blob = new Blob([JSON.stringify(response.data).replace(/[[\]"]+/g,"").replace(/,/g, '\n')], {
            type: 'text/plain;charset=utf-8'
          });
          saveAs(blob, "Operacoes " + payload.date + '.txt');
          commit('setCreating', false);
        });
    },
    addOperation({commit, getters}, payload) {
      commit("setCreating", true);
      let user = getters.user;

      let operation = {
        time: moment(payload.date, "YYYY-MM-DD").format("x"),
        qty: payload.baseAssetQty,
        exchangeCountryCode: payload.exchangeCountryCode,
        exchangeName: payload.exchangeName,
        exchangeUrl: payload.exchangeUrl
      };

      if(payload.operation === "Troca"){
        operation.type = "trade";
        operation.baseAsset = payload.baseAsset;
        operation.commission = payload.commission;
        operation.commissionAsset = payload.commissionAsset;
        operation.isBuyer = payload.operationType === "Compra";
        operation.quoteAsset = payload.quoteAsset;
        operation.quoteQty = payload.quoteAssetQty;
        operation.symbol = payload.baseAsset + payload.quoteAsset;
        operation.price = payload.quoteAssetQty/payload.baseAssetQty;
      }
      else if (payload.operation === "Saque" || payload.operation === "Depósito") {
        operation.type = payload.operation === "Saque" ? "whitdraw" : "deposit";
        operation.symbol = payload.baseAsset;
      }

      return db.collection("users")
      .doc(user.id)
      .collection("operations")
      .doc()
      .set(operation)
      .then(function() {
        commit("setCreating", false);
        console.log("Operation added");
      })
      .catch(function(error) {
        commit("setCreating", false);
        console.error("Error adding operation: ", error);
      });
    }
  }
};