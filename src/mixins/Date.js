export default {
  methods: {
    formatDate(date) {
      if (!date) return null;

      return this.$moment(date).format("L");
    }
  }
};
