export default {
  methods: {
    formatDate(date) {
      if (!date) return null;

      return this.$moment(date).format("L");
    },
    formatDateToMonth(date) {
      if (!date) return null;

      return this.$moment(date).format("MM/YYYY");
    }
  }
};
