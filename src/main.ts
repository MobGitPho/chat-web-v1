import App from './App.vue'
import { createApp } from 'vue'

import Vue3Lottie from 'vue3-lottie'
import CKEditor from '@ckeditor/ckeditor5-vue'
import Vue3GoogleLogin from 'vue3-google-login'
import { VueDraggableNext } from 'vue-draggable-next'
import { VueRecaptchaPlugin } from 'vue-recaptcha'
import { createHead } from '@unhead/vue'

import VueShepherdPlugin from 'vue-shepherd'
import './assets/styles/custom-shepherd.css'
import 'shepherd.js/dist/css/shepherd.css'

import VueTelInput from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'

import i18n from './i18n'
import pinia from './stores'
import router from './router'

import 'uno.css'
import 'animate.css'
import 'vfonts/Lato.css'
import 'vfonts/Roboto.css'
import 'vfonts/OpenSans.css'

import '@fontsource-variable/open-sans'

export const app = createApp(App)
  .use(i18n)
  .use(pinia)
  .use(router)
  .use(CKEditor)
  .use(Vue3Lottie)
  // @ts-ignore
  .use(VueTelInput)
  .use(createHead())
  // @ts-ignore
  .use(VueShepherdPlugin)
  .use(Vue3GoogleLogin, {
    clientId: import.meta.env.APP_GOOGLE_CLIENT_ID,
  })
  .use(VueRecaptchaPlugin, {
    v2SiteKey: import.meta.env.APP_RECAPTCHA_V2_KEY,
    v3SiteKey: import.meta.env.APP_RECAPTCHA_V3_KEY,
  })
  .component('Draggable', VueDraggableNext)

const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

app.mount('#app')

router.isReady().then(() => {
  /* Hide preloader */
  const preloader = document.getElementById('preloader')
  if (preloader) preloader.style.display = 'none'
})
