import fr from '@/assets/images/flags/fr.svg'
import gb from '@/assets/images/flags/gb.svg'

import { API_BASE_URL, LANG_COOKIE } from '@/utils/constants'
import { UserPrefs } from '@/utils/types'

export const useHelper = () => {
  const { defaultPrefs } = useUserPreference()
  const { t, locale } = useI18n()
  const { request } = useApi()

  const uiStore = useUserInterfaceStore()
  const authStore = useAuthStore()

  const appAccentColor = import.meta.env.APP_ACCENT_COLOR
  const appPrimaryColor = import.meta.env.APP_PRIMARY_COLOR
  const appSecondaryColor = import.meta.env.APP_SECONDARY_COLOR

  const fileUrl = (path: string) => {
    if (path) {
      const encodedPath = encodeURI(path)
      if (_v.isURL(encodedPath)) return encodedPath
      else return `${API_BASE_URL}/storage/${encodedPath}`
    }

    return ''
  }

  const getTranslation = (data: any) => {
    let parsedData

    try {
      parsedData = JSON.parse(data)
    } catch (e) {
      parsedData = {}
    }

    return parsedData
    ? parsedData[locale.value.toUpperCase()] || parsedData['fr'] || ''
    : ''
    
    //parsedData[locale.value.toUpperCase()] || parsedData['fr'] || ''
  }

  const tr = (data: any) => {
    return getTranslation(data)
  }

  const pickByTheme = (
    lightVal: string | number | null,
    darkVal: string | number | null
  ) => {
    return uiStore.isLightTheme ? lightVal : darkVal
  }

  const is2XlScreen = useMediaQuery('(min-width: 1536px)')
  const isXlScreen = useMediaQuery(
    '(min-width: 1280px) and (max-width: 1535px)'
  )
  const isLgScreen = useMediaQuery(
    '(min-width: 1024px) and (max-width: 1279px)'
  )
  const isMdScreen = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isSmScreen = useMediaQuery('(max-width: 767px)')

  interface Language {
    label: string
    value: string
    flag: string
  }

  const languages: Language[] = [
    {
      label: t('french'),
      value: 'fr',
      flag: fr,
    },
    {
      label: t('english'),
      value: 'en',
      flag: gb,
    },
  ]
  const getLangageLabel = (value: string) =>
    languages.find((l) => l.value == value)?.label

  const getLanguageValue = (label: string) =>
    languages.find((l) => l.label == label)?.value

  const updateLocale = async (
    val: string,
    reload = true,
    updateUserPrefs = true
  ) => {
    locale.value = val
    localStorage.setItem(LANG_COOKIE, val)

    if (authStore.isUserConnected && updateUserPrefs) {
      const userPrefs = (authStore.userData?.preferences ||
        defaultPrefs.value) as UserPrefs
      userPrefs.locale = val

      await request({
        url: `/users/self/${authStore.userData?.id}`,
        method: 'put',
        data: {
          preferences: userPrefs,
        },
      })
    }

    if (reload) location.reload()
  }

  const displayFormErrors = (errors: any) => {
    if (errors) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [key, value] of Object.entries(errors)) {
        for (const error of value as string[]) {
          window.$message.error(error)
        }
      }
    }
  }

  const mergeArrays = (arr1: any, arr2: any, key: string) => {
    const arrayMap = new Map()

    arr1.concat(arr2).forEach((item: any) => {
      if (!arrayMap.has(item[key])) {
        arrayMap.set(item[key], { ...item })
      } else {
        arrayMap.set(item[key], { ...arrayMap.get(item[key]), ...item })
      }
    })

    return Array.from(arrayMap.values())
  }

  const ckEditorToolbarItems = [
    'fullScreen',
    '|',
    'heading',
    '|',
    'uploadImage',
    '|',
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'code',
    'subscript',
    'superscript',
    'selectAll',
    '|',
    'fontSize',
    'fontFamily',
    'fontColor',
    'fontBackgroundColor',
    '|',
    'horizontalLine',
    'blockQuote',
    'bulletedList',
    'numberedList',
    'alignment',
    '|',
    'outdent',
    'indent',
    '|',
    'link',
    'insertTable',
    'mediaEmbed',
    '|',
    'undo',
    'redo',
  ]

  return {
    is2XlScreen,
    isXlScreen,
    isLgScreen,
    isMdScreen,
    isSmScreen,
    appAccentColor,
    appPrimaryColor,
    appSecondaryColor,
    getTranslation,
    getLangageLabel,
    getLanguageValue,
    ckEditorToolbarItems,
    displayFormErrors,
    updateLocale,
    mergeArrays,
    pickByTheme,
    languages,
    fileUrl,
    tr,
  }
}
