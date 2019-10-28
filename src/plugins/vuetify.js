import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'fa',
  },
  theme: {
    themes: {
      light: {
        primary: '#63A8C7',
        secondary: '#3ecf8e',
        accent: '#8c9eff',
        error: '#b71c1c',
        text: '#637381'
      },
      dark: {
        primary: colors.blue.lighten3,
      }
    },
    options: {
      customProperties: true,
    }
  }
});
