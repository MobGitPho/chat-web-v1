<script setup lang="ts">
  import { GOOGLE_MAPS_API_KEY } from '@/utils/constants'
  import { hexToRgba } from '@/utils/functions'

  import { darkTheme, dateEnUS, dateFrFR, enUS, frFR } from 'naive-ui'

  import { app } from '@/main'
  import { initLocalDbData } from '@/modules/local-db'
  import Wrapper from '@/Wrapper.vue'
  import VueGoogleMaps from '@fawmi/vue-google-maps'

  const { locale } = useI18n()

  const appSettingStore = useAppSettingStore()
  const notifStore = useNotificationStore()
  const uiStore = useUserInterfaceStore()
  const accessStore = useAccessStore()
  const authStore = useAuthStore()

  const { appPrimaryColor, appSecondaryColor, appAccentColor, pickByTheme } =
    useHelper()

  const isLoading = ref(false)

  const themeOverrides = computed(() => {
    const settings: any = {
      common: {
        primaryColor: appPrimaryColor,
        fontWeightStrong: '600',
      },
      Menu: {
        itemTextColorHoverHorizontal: appSecondaryColor,
        itemIconColorHoverHorizontal: appSecondaryColor,
        itemColorActive: appSecondaryColor,
        itemColorHover: hexToRgba(appSecondaryColor, 0.3),
        itemColorActiveCollapsed: appSecondaryColor,
        arrowColorChildActiveHover: appAccentColor,
        arrowColorChildActive: appAccentColor,
        arrowColorActiveHover: appAccentColor,
        arrowColorActive: appAccentColor,
        arrowColorHover: appAccentColor,
        arrowColor: appAccentColor,
      },
      Button: {
        colorPrimary: appPrimaryColor,
        colorHoverPrimary: appSecondaryColor,
        colorFocusPrimary: appSecondaryColor,
        colorPressedPrimary: appSecondaryColor,
        borderHover: `1px solid ${appSecondaryColor}`,
        borderHoverPrimary: `1px solid ${appSecondaryColor}`,
        borderFocus: `1px solid ${appSecondaryColor}`,
        borderFocusPrimary: `1px solid ${appSecondaryColor}`,
        borderPressed: `1px solid ${appSecondaryColor}`,
        borderPressedPrimary: `1px solid ${appSecondaryColor}`,
        textColorPrimary: '#FFFFFF',
        textColorHoverPrimary: '#FFFFFF',
        textColorFocusPrimary: '#FFFFFF',
        textColorPressedPrimary: '#FFFFFF',
        textColorDisabledPrimary: '#FFFFFF',
        textColorHover: appPrimaryColor,
        textColorTextHover: appPrimaryColor,
        textColorTextFocus: appPrimaryColor,
        textColorTextPressed: appPrimaryColor,
      },
      Input: {
        caretColor: appPrimaryColor,
        loadingColor: appPrimaryColor,
        borderHover: `1px solid ${appPrimaryColor}`,
        borderFocus: `1px solid ${appPrimaryColor}`,
      },
      PageHeader: {
        backColorHover: appPrimaryColor,
        backColorPressed: appPrimaryColor,
      },
      Switch: {
        railColorActive: appSecondaryColor,
        loadingColor: appSecondaryColor,
      },
      Tabs: {
        colorSegment: pickByTheme('#f2f2f2', 'rgba(0, 0, 0, 1)'),
      },
      Card: {
        colorEmbedded: pickByTheme('rgb(250, 250, 252)', 'rgb(44, 44, 50)'),
      },
      LoadingBar: {
        colorLoading: appAccentColor,
      },
    }

    if (uiStore.isLightTheme) {
      settings['DataTable'] = {
        thColor: appSecondaryColor,
        thColorHover: appPrimaryColor,
        thIconColor: '#ffffff',
        thTextColor: '#ffffff',
      }
    }

    return settings
  })

  // Initialize some data
  initLocalDbData()

  // Load access data
  accessStore.loadRoles()
  accessStore.loadPermissions()
  // Load other data
  authStore.reloadUserData()
  appSettingStore.loadSettings()
  notifStore.startNotificationsListener()

  // Initialize some plugins: VueGoogleMaps
  const init = async () => {
    isLoading.value = true

    const googleMapsOptions = {
      load: {
        key: GOOGLE_MAPS_API_KEY,
        libraries: ['places'],
      },
    }

    app.use(VueGoogleMaps, googleMapsOptions)

    isLoading.value = false
  }

  init()

  // Set theme root class
  watch(
    () => uiStore.isLightTheme,
    () => {
      document.documentElement.className = `${pickByTheme(
        'light',
        'dark'
      )}-theme`
    },
    { immediate: true }
  )
</script>

<template>
  <router-view v-slot="{ Component }">
    <n-config-provider
      :theme-overrides="themeOverrides"
      :locale="locale == 'fr' ? frFR : enUS"
      :theme="uiStore.isLightTheme ? null : darkTheme"
      :date-locale="locale == 'fr' ? dateFrFR : dateEnUS">
      <n-modal-provider>
        <n-loading-bar-provider>
          <n-message-provider
            :placement="authStore.isUserConnected ? 'bottom-right' : 'top'">
            <n-dialog-provider>
              <n-notification-provider :max="2" placement="bottom-right">
                <Wrapper>
                  <component :is="Component" :key="locale" />
                </Wrapper>
              </n-notification-provider>
            </n-dialog-provider>
          </n-message-provider>
        </n-loading-bar-provider>
      </n-modal-provider>
    </n-config-provider>
  </router-view>
</template>

<style lang="scss" src="@/assets/styles/app.scss"></style>
