<script lang="ts">
  export default defineComponent({
    name: Routes.LOGIN.NAME,
  })
</script>

<script setup lang="ts">
  import logo from '@/assets/images/logo.svg'

  import Routes from '@/router/routes'

  import {
    FormInst,
    FormItemRule,
    FormRules,
    FormValidationError,
  } from 'naive-ui'

  import { getCurrentTimestamp } from '@/utils/chronos'
  import { ResponseErrorCode } from '@/enums/response-error-code'

  const { t, locale } = useI18n()
  const { request } = useApi()
  const { displayFormErrors, updateLocale } = useHelper()

  const router = useRouter()
  const message = useMessage()

  const authStore = useAuthStore()
  const appSettingStore = useAppSettingStore()

  interface FormValue {
    email: string | null
    password: string | null
    remember: boolean
  }

  const isProceeding = ref<boolean>(false)
  const formRef = ref<FormInst | null>(null)
  const formValue = ref<FormValue>({
    email: '',
    password: '',
    remember: false,
  })
  const rules: FormRules = {
    email: [
      {
        required: true,
        message: t('fillRequired'),
      },
      {
        trigger: ['input'],
        validator(rule: FormItemRule, value: string) {
          if (value && !_v.isEmail(value)) {
            return new Error(t('invalidEmail'))
          }

          return true
        },
      },
    ],
    password: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
  }

  const submit = async (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault()

    formRef.value?.validate(
      async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          isProceeding.value = true

          authStore.userData = null

          const task = await request({
            url: `/auth/login`,
            method: 'post',
            data: formValue.value,
          })

          if (task.failure && task.error) {
            switch (task.error?.response?.data?.errorCode) {
              case ResponseErrorCode.AUTH_USER_NOT_FOUND:
              case ResponseErrorCode.AUTH_WRONG_PASSWORD:
                message.error(t('wrongEmailOrPassword'))
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
              default:
                message.error(t('unableToLogin'))
            }
          } else {
            formValue.value = {
              email: '',
              password: '',
              remember: false,
            }

            isProceeding.value = false

            authStore.userData = task.result.data.user
            authStore.accessToken = task.result.data.accessToken
            authStore.accessTokenDate = getCurrentTimestamp()
          }

          isProceeding.value = false
        }
      }
    )
  }

  const title = import.meta.env.APP_NAME

  const disableInstaller: boolean = appSettingStore.getSettingValue(
    'disableInstaller',
    'boolean'
  ) as boolean

  const allowRegistration: boolean = appSettingStore.getSettingValue(
    'allowRegistration',
    'boolean'
  ) as boolean

  watch(
    () => authStore.isUserConnected,
    (newValue) => {
      updateLocale(locale.value, false)

      if (newValue) router.replace(Routes.HOME.PATH)
    },
    {
      immediate: true,
    }
  )

  const cardVisible = ref(true)
</script>

<template>
  <AuthLayout :display-server-alerts="!disableInstaller">
    <CustomTransition name="slide-fade" appear>
      <div class="container h-full">
        <div
          class="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
          <div class="md:w-8/12 lg:w-5/12 xl:w-3.5/12 2xl:w-3/12 sm:w-full">
            <CustomTransition appear>
              <n-card v-show="cardVisible" size="small" class="w-full">
                <div class="flex justify-center mb-10">
                  <img :src="logo" class="w-10" :alt="title" />
                </div>
                <n-form
                  ref="formRef"
                  :model="formValue"
                  :rules="rules"
                  :show-label="false"
                  :show-require-mark="false"
                  size="medium">
                  <n-form-item :label="t('addressEmail')" path="email">
                    <n-input
                      v-model:value="formValue.email"
                      :placeholder="t('addressEmail')"
                      class="w-full"
                      @keyup.enter="submit" />
                  </n-form-item>
                  <n-form-item
                    :span="12"
                    :label="t('password')"
                    path="password">
                    <n-input
                      v-model:value="formValue.password"
                      :placeholder="t('password')"
                      show-password-on="mousedown"
                      type="password"
                      class="w-full"
                      @keyup.enter="submit" />
                  </n-form-item>

                  <div class="flex justify-around items-center mb-6">
                    <n-checkbox v-model:checked="formValue.remember">
                      {{ t('rememberMe') }}
                    </n-checkbox>
                    <n-button
                      text
                      @click="router.push(Routes.RESET_PASSWORD.PATH)">
                      {{ t('forgotPassword') }}
                    </n-button>
                  </div>

                  <n-button
                    type="primary"
                    :loading="isProceeding"
                    :disabled="!formValue.email || !formValue.password"
                    block
                    @click="submit">
                    {{ t('validate') }}
                  </n-button>

                  <n-divider ref="divider" class="!my-2">
                    <span class="text-sm">{{ t('or') }}</span>
                  </n-divider>

                  <PhoneAuth
                    class="mb-5"
                    @display-dialog="(val: boolean) => {
                      cardVisible = !val
                    }" />

                  <GoogleAuth />

                  <template v-if="allowRegistration">
                    <div class="h-3"></div>
                    <n-button
                      block
                      tertiary
                      type="primary"
                      @click="router.push(Routes.REGISTER.PATH)">
                      {{ t('dontHaveAccount') }} {{ t('register') }}
                    </n-button>
                  </template>
                </n-form>
              </n-card>
            </CustomTransition>
          </div>
        </div>
      </div>
    </CustomTransition>
  </AuthLayout>
</template>

<style scoped></style>
