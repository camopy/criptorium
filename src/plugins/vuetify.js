import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdiSvg',
  },
  theme: {
    themes: {
      light: {
        primary: '#006F8A',
        secondary: '#12AB68',
        accent: '#EFBB35',
        error: '#C33C3C',
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
