export default {
  methods: {
    formatDate(date, currentFormat) {
      if (!date) return null;

      if(currentFormat){
        return this.$moment(date, currentFormat).format("L");
      }

      return this.$moment(date).format("L");
    },
    formatDateToMonth(date) {
      if (!date) return null;

      return this.$moment(date).format("MM/YYYY");
    }
  }
};
