<script setup lang="ts">
  import { getCurrentTimestamp } from '@/utils/chronos'

  import { ResponseErrorCode } from '@/enums/response-error-code'

  import type { CallbackTypes } from 'vue3-google-login'
  import { decodeCredential } from 'vue3-google-login'

  const { t, locale } = useI18n()
  const { request } = useApi()
  const { pickByTheme } = useHelper()
  const { displayFormErrors } = useHelper()
  const { userHasSuperAdminRole } = useAccess()
  const { defaultPrefs } = useUserPreference()

  const message = useMessage()
  const loadingBar = useLoadingBar()

  const authStore = useAuthStore()
  const appSettingStore = useAppSettingStore()

  const btnConfig = computed(() => {
    return {
      type: 'standard',
      theme: pickByTheme('filled_blue', 'filled_black'),
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      locale: locale.value,
      width: 300,
    }
  })

  const allowRegistration = computed<boolean>(
    () =>
      appSettingStore.getSettingValue('allowRegistration', 'boolean') as boolean
  )

  const isProceeding = ref(false)

  const registerAccountWithGoogle: CallbackTypes.CredentialCallback = async (
    response
  ) => {
    loadingBar.start()
    isProceeding.value = true

    const userData: any = decodeCredential(response.credential)

    const task = await request({
      url: '/auth/google',
      method: 'post',
      data: {
        userData,
        clientId: response.clientId,
        credential: response.credential,
        allowRegistration: allowRegistration.value,
        preferences: defaultPrefs.value,
      },
    })

    if (task.failure && task.error) {
      loadingBar.error()

      switch (task.error?.response?.data?.errorCode) {
        case ResponseErrorCode.AUTH_REGISTRATION_FAILED:
          message.error(t('registrationFailure'))
          break
        case ResponseErrorCode.AUTH_MISSING_DATA:
          message.error(t('missingData'))
          break
        case ResponseErrorCode.FORM_INVALID_DATA:
          displayFormErrors(task.error?.response?.data?.data)
          break
        case ResponseErrorCode.AUTH_USER_DISABLED:
          message.error(t('disabledAccount'))
          break
        case ResponseErrorCode.AUTH_INVALID_TOKEN:
          message.error(t('invalidRequest'))
          break
        default:
          message.error(t('unableToLogin'))
      }
    } else {
      authStore.userData = task.result.data.user

      if (userHasSuperAdminRole()) {
        await appSettingStore.initDefaultSettings()
      }

      loadingBar.finish()

      authStore.accessToken = task.result.data.accessToken
      authStore.accessTokenDate = getCurrentTimestamp()
    }

    isProceeding.value = false
  }
</script>

<template>
  <n-space vertical class="text-center">
    <n-spin size="small" :show="isProceeding">
      <GoogleLogin
        :key="locale + '_gl_btn_' + pickByTheme('light', 'dark')"
        :callback="registerAccountWithGoogle"
        :button-config="btnConfig">
      </GoogleLogin>
    </n-spin>
  </n-space>
</template>

<style lang="scss" scoped></style>
