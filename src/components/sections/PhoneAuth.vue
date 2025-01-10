<script setup lang="ts">
  import { getCurrentTimestamp } from '@/utils/chronos'

  import { ResponseErrorCode } from '@/enums/response-error-code'

  import { LocalPhoneFilled, SyncFilled } from '@vicons/material'

  import {
    FormInst,
    FormItemRule,
    FormRules,
    FormValidationError,
  } from 'naive-ui'

  import { isValidPhoneNumber } from 'libphonenumber-js'
  import {
    useChallengeV2,
    useRecaptchaContext,
    useRecaptchaProvider,
  } from 'vue-recaptcha'
  import { useTimer } from 'vue-timer-hook'

  const ctx = useRecaptchaContext()

  if (!ctx.scriptInjected) {
    useRecaptchaProvider()
  }

  const emits = defineEmits(['displayDialog'])

  const { t } = useI18n()
  const { request } = useApi()
  const { displayFormErrors } = useHelper()
  const { userHasSuperAdminRole } = useAccess()
  const { defaultPrefs } = useUserPreference()

  const uiStore = useUserInterfaceStore()
  const appSettingStore = useAppSettingStore()
  const authStore = useAuthStore()

  const isProceeding = ref(false)

  const displayDialog = ref(false)

  const message = useMessage()
  const loadingBar = useLoadingBar()

  const allowRegistration = computed<boolean>(
    () =>
      appSettingStore.getSettingValue('allowRegistration', 'boolean') as boolean
  )

  watch(
    () => displayDialog.value,
    (nv) => {
      emits('displayDialog', nv)
    }
  )

  const componentStore = defineStore('phone-auth-store', () => {
    const loopsNumber = ref<number>(0)

    return { loopsNumber }
  })()

  interface FormValue {
    lastname: string | null
    firstname: string | null
    phone: string | null
  }

  const displayCodeForm = ref(false)
  const getUserName = ref(false)
  const dataFormRef = ref<FormInst | null>(null)
  const dataFormValue = ref<FormValue & { phone: string }>({
    lastname: '',
    firstname: '',
    phone: '',
  })
  const dataRules = computed<FormRules>(() => ({
    lastname: [
      {
        required: getUserName.value,
        message: t('fillRequired'),
      },
    ],
    firstname: [
      {
        required: getUserName.value,
        message: t('fillRequired'),
      },
    ],
    phone: [
      {
        required: true,
        message: t('fillRequired'),
      },
      {
        trigger: ['input'],
        validator(rule: FormItemRule, value: string) {
          if (!isValidPhoneNumber(value)) {
            return new Error(t('invalidNumber'))
          }

          return new Promise((resolve, reject) => {
            return request({ url: `/username/phone/${value}` })
              .then((response) => {
                if (
                  response.success &&
                  response.result.data &&
                  response.result.data.firstname &&
                  response.result.data.lastname
                ) {
                  getUserName.value = false
                  resolve()
                } else {
                  if (
                    dataFormValue.value.lastname &&
                    dataFormValue.value.firstname
                  ) {
                    resolve()
                  } else {
                    getUserName.value = true
                    reject(Error())
                  }
                }
              })
              .catch(() => {
                getUserName.value = true
                reject(Error())
              })
          })
        },
      },
    ],
  }))
  const { root, onVerify } = useChallengeV2({
    options: {
      theme: uiStore.isLightTheme ? 'light' : 'dark',
      size: 'normal',
    },
  })
  const recaptchaResponse = ref()
  onVerify(async (response) => {
    recaptchaResponse.value = response
  })

  const codeFormRef = ref<FormInst | null>(null)
  const codeFormValue = ref<{ code: string }>({
    code: '',
  })
  const codeRules: FormRules = {
    code: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
  }

  /* TIMER */

  const timer = useTimer(undefined, componentStore.loopsNumber > 0)

  const startTimer = () => {
    const time = new Date()
    time.setSeconds(time.getSeconds() + 120 * (componentStore.loopsNumber || 1))
    timer.restart(time.getTime())
  }

  if (componentStore.loopsNumber > 0) startTimer()

  const formatDuration = (duration: number) =>
    duration.toString().padStart(2, '0')

  const minutes = computed(() => formatDuration(timer.minutes.value))
  const seconds = computed(() => formatDuration(timer.seconds.value))

  /* TIMER */

  const submitData = () => {
    if (displayCodeForm.value) {
      codeFormRef.value?.validate(
        async (errors: Array<FormValidationError> | undefined) => {
          if (!errors) {
            loadingBar.start()
            isProceeding.value = true

            const task = await request({
              url: '/auth/phone/verify',
              method: 'post',
              data: {
                code: codeFormValue.value,
                provider: 'wassa_sms',
                ...dataFormValue.value,
              },
            })

            if (task.failure && task.error) {
              loadingBar.error()

              switch (task.error?.response?.data?.errorCode) {
                case ResponseErrorCode.AUTH_USER_NOT_FOUND:
                  message.error(t('userNotFound'))
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
                case ResponseErrorCode.AUTH_CODE_VERIFICATION_FAILED:
                  message.error(t('wrongCode'))
                  break
                default:
                  message.error(t('unableToLogin'))
              }
            } else {
              componentStore.loopsNumber = 0

              authStore.userData = task.result.data.user

              if (userHasSuperAdminRole()) {
                await appSettingStore.initDefaultSettings()
              }

              loadingBar.finish()

              authStore.accessToken = task.result.data.accessToken
              authStore.accessTokenDate = getCurrentTimestamp()

              displayCodeForm.value = false
              displayDialog.value = false
            }

            isProceeding.value = false
          }
        }
      )
    } else {
      dataFormRef.value?.validate(
        async (errors: Array<FormValidationError> | undefined) => {
          if (!errors) {
            if (recaptchaResponse.value) {
              isProceeding.value = true

              const task = await request({
                url: '/auth/phone',
                method: 'post',
                data: {
                  preferences: defaultPrefs.value,
                  allowRegistration: allowRegistration.value,
                  provider: 'wassa_sms',
                  ...dataFormValue.value,
                },
              })

              if (task.failure && task.error) {
                switch (task.error?.response?.data?.errorCode) {
                  case ResponseErrorCode.AUTH_USER_NOT_FOUND:
                    message.error(t('userNotFound'))
                    break
                  case ResponseErrorCode.AUTH_MISSING_DATA:
                    message.error(t('missingData'))
                    break
                  case ResponseErrorCode.FORM_INVALID_DATA:
                    displayFormErrors(task.error?.response?.data?.data)
                    break
                  case ResponseErrorCode.AUTH_CODE_SENDING_FAILED:
                    message.error(t('verificationCodeSendingFailed'))
                    break
                  default:
                    message.error(t('anErrorOccured'))
                }
              } else {
                displayCodeForm.value = true

                componentStore.loopsNumber += 1
                startTimer()
              }

              isProceeding.value = false
            }
          }
        }
      )
    }

    return false
  }

  const resendVerificationCode = async () => {
    isProceeding.value = true

    const task = await request({
      url: '/auth/phone',
      method: 'post',
      data: {
        preferences: defaultPrefs.value,
        allowRegistration: allowRegistration.value,
        provider: 'wassa_sms',
        ...dataFormValue.value,
      },
    })

    if (task.failure && task.error) {
      switch (task.error?.response?.data?.errorCode) {
        case ResponseErrorCode.AUTH_USER_NOT_FOUND:
          message.error(t('userNotFound'))
          break
        case ResponseErrorCode.AUTH_MISSING_DATA:
          message.error(t('missingData'))
          break
        case ResponseErrorCode.FORM_INVALID_DATA:
          displayFormErrors(task.error?.response?.data?.data)
          break
        case ResponseErrorCode.AUTH_CODE_SENDING_FAILED:
          message.error(t('verificationCodeSendingFailed'))
          break
        default:
          message.error(t('anErrorOccured'))
      }
    } else {
      message.success(t('success'))

      componentStore.loopsNumber += 1
      startTimer()
    }

    isProceeding.value = false
  }

  const back = () => {
    if (displayCodeForm.value) displayCodeForm.value = false
    else {
      displayDialog.value = false
    }
  }
</script>

<template>
  <section>
    <n-space vertical class="text-center">
      <n-spin size="small" :show="isProceeding">
        <n-button
          block
          type="warning"
          :loading="isProceeding"
          @click="displayDialog = true">
          <template #icon>
            <n-icon>
              <LocalPhoneFilled />
            </n-icon>
          </template>
          {{ t('continueWithPhoneNumber') }}
        </n-button>
      </n-spin>
    </n-space>
    <n-modal
      v-model:show="displayDialog"
      :loading="isProceeding"
      preset="dialog"
      style="width: 450px"
      :bordered="false"
      :closable="false"
      :show-icon="false"
      :mask-closable="false"
      :title="t('continueWithPhoneNumber')">
      <n-form
        v-show="!displayCodeForm"
        ref="dataFormRef"
        :model="dataFormValue"
        :rules="dataRules"
        :show-label="false"
        :show-require-mark="false"
        size="medium"
        class="mt-5">
        <n-form-item :label="t('phoneNumber')" path="phone">
          <VueTelInputWrapper v-model="dataFormValue.phone" />
        </n-form-item>
        <CustomTransition appear>
          <n-grid v-if="getUserName" x-gap="12" :span="24">
            <n-form-item-gi :span="12" :label="t('lastname')" path="lastname">
              <n-input
                v-model:value="dataFormValue.lastname"
                :placeholder="t('lastname')"
                class="w-full" />
            </n-form-item-gi>
            <n-form-item-gi
              :span="12"
              :label="t('firstname_s')"
              path="firstname">
              <n-input
                v-model:value="dataFormValue.firstname"
                :placeholder="t('firstname_s')"
                class="w-full" />
            </n-form-item-gi>
          </n-grid>
        </CustomTransition>
        <div class="flex flex-col items-center">
          <div ref="root" class="mb-2" />
          <div class="text-xs">{{ t('phoneAuthHelp1') }}</div>
        </div>
      </n-form>
      <n-form
        v-show="displayCodeForm"
        ref="codeFormRef"
        :model="codeFormValue"
        :rules="codeRules"
        :show-label="false"
        :show-require-mark="false"
        size="medium"
        class="mt-5">
        <n-form-item :label="t('verificationCode')" path="code">
          <n-input
            v-model:value="codeFormValue.code"
            :placeholder="t('verificationCode')"
            class="w-full" />
        </n-form-item>
        <n-button
          :loading="isProceeding"
          :disabled="timer.isRunning.value"
          block
          type="primary"
          @click="resendVerificationCode">
          <template #icon>
            <n-icon>
              <SyncFilled />
            </n-icon>
          </template>
          {{ t('resendVerificationCode') }}
          <template v-if="timer.isRunning.value">
            &nbsp;
            <span>{{ minutes }}</span>
            <span>&nbsp;:&nbsp;</span>
            <span>{{ seconds }}</span>
          </template>
        </n-button>
        <div class="flex flex-col items-center mt-5">
          <div class="text-xs">{{ t('phoneAuthHelp2') }}</div>
        </div>
      </n-form>
      <template #action>
        <n-space>
          <n-button :loading="isProceeding" @click="back">{{
            t('back')
          }}</n-button>
          <n-button
            type="primary"
            :disabled="displayCodeForm ? false : timer.isRunning.value"
            :loading="isProceeding"
            @click="submitData">
            {{ displayCodeForm ? t('validate') : t('verify') }}
            <span v-if="!displayCodeForm && timer.isRunning.value">
              &nbsp;
              <span>{{ minutes }}</span>
              <span>&nbsp;:&nbsp;</span>
              <span>{{ seconds }}</span>
            </span>
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </section>
</template>

<style scoped lang="scss"></style>
