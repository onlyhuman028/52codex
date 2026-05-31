import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import CommentAdmin from './CommentAdmin.vue'
import HomePage from './HomePage.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('CommentAdmin', CommentAdmin)
    app.component('HomePage', HomePage)
  }
} satisfies Theme
