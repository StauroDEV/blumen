import './style.css'
import Theme from 'vitepress/theme'
import { h } from 'vue'

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
}
