import { LANG_COOKIE } from '@/utils/constants'

import messages from '@intlify/unplugin-vue-i18n/messages'
import { createI18n } from 'vue-i18n'
import type { I18nOptions } from 'vue-i18n'

let navigatorLanguage =
  // @ts-ignore
  window.navigator.language || window.navigator.userLanguage

navigatorLanguage = navigatorLanguage.split('-')[0]

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem(LANG_COOKIE) || navigatorLanguage || 'fr',
  fallbackLocale: import.meta.env.APP_I18N_FALLBACK_LOCALE || 'fr',
  messages: messages as I18nOptions['messages'],
})
