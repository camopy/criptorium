export default {
  methods: {
    formatDate(date, currentFormat) {
      if (!date) return null;

      if(typeof(date) === "string") {
        date = Number(date);
      }

      if(currentFormat){
        return this.$moment(date, currentFormat).format("L");
      }

      return this.$moment(date).format("L");
    },
    formatDateToMonth(date) {
      if (!date) return null;

      return this.$moment(date).format("MM/YYYY");
    },
    timestamp() {
      return this.$moment().format("x");
    },
    moment(date) {
      if(date) {
        if(typeof(date) === "string") {
          date = Number(date);
        }
        return this.$moment(date);
      }
      return this.$moment();
    }
  }
};
