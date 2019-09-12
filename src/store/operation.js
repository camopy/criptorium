// import * as firebase from "firebase";
// import { db } from "../main";
// import * as moment from "moment";
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

      axios
        .get(
          'https://us-central1-cripto-rf-dev.cloudfunctions.net/generateOperationsTextFile',
          { params: params }
        )
        .then((response) => {
          console.log(response.data);
          let blob = new Blob([JSON.stringify(response.data).replace(/[\[\]"]+/g,"").replace(/,/g, '\n')], {
            type: 'text/plain;charset=utf-8'
          });
          saveAs(blob, "Operacoes " + payload.date + '.txt');
          commit('setCreating', false);
        });
    }
  }
};
