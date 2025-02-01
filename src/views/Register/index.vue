<script lang="ts">
  export default defineComponent({
    name: Routes.REGISTER.NAME,
  })
</script>

<script setup lang="ts">
  import logo from '@/assets/images/logo.svg'

  import passwordStrengthOptions from '@/utils/password-strength-options'

  import Routes from '@/router/routes'

  import {
    FormInst,
    FormItemRule,
    FormRules,
    FormValidationError,
  } from 'naive-ui'

  import { passwordStrength } from 'check-password-strength'

  import { getCurrentTimestamp } from '@/utils/chronos'
  import { ResponseErrorCode } from '@/enums/response-error-code'

  const { t } = useI18n()

  const router = useRouter()

  const message = useMessage()

  const { request } = useApi()
  const { displayFormErrors } = useHelper()
  const { userHasSuperAdminRole } = useAccess()
  const { defaultPrefs } = useUserPreference()

  const appSettingStore = useAppSettingStore()
  const authStore = useAuthStore()

  interface FormValue {
    lastname: string | null
    firstname: string | null
    email: string | null
    password: string | null
    passwordConfirmation: string | null
  }

  const isProceeding = ref<boolean>(false)
  const formRef = ref<FormInst | null>(null)
  const formValue = ref<FormValue>({
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })
  const rules: FormRules = {
    lastname: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
    firstname: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
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
      {
        trigger: ['input'],
        validator(rule: FormItemRule, value: string) {
          if (
            value &&
            ['too-weak'].includes(
              passwordStrength(value, passwordStrengthOptions as any).value
            )
          ) {
            return new Error(t('passwordTooWeak'))
          }

          return true
        },
      },
    ],
    passwordConfirmation: [
      {
        required: true,
        message: t('fillRequired'),
      },
      {
        trigger: ['input'],
        validator(rule: FormItemRule, value: string) {
          if (value && value !== formValue.value.password) {
            return new Error(t('nonCompliantPassword'))
          }

          return true
        },
      },
    ],
  }

  const submit = async (e: MouseEvent) => {
    e.preventDefault()

    formRef.value?.validate(
      async (errors: Array<FormValidationError> | undefined) => {
        if (errors) message.error(t('invalidForm'))
        else {
          isProceeding.value = true

          authStore.userData = null

          const task = await request({
            url: `/auth/register`,
            method: 'post',
            data: {
              ...formValue.value,
              preferences: defaultPrefs.value,
            },
          })

          if (task.failure && task.error) {
            switch (task.error?.response?.data?.errorCode) {
              case ResponseErrorCode.AUTH_MISSING_DATA:
                message.error(t('missingData'))
                break
              case ResponseErrorCode.FORM_INVALID_DATA:
                displayFormErrors(task.error?.response?.data?.data)
                break
              default:
                message.error(t('registrationNotSuccessful'))
            }
          } else {
            if (task.success && task.result) {
              authStore.userData = task.result.data.user
              authStore.accessToken = task.result.data.accessToken
              authStore.accessTokenDate = getCurrentTimestamp()
            } else router.replace(Routes.LOGIN.PATH)

            formValue.value = {
              lastname: '',
              firstname: '',
              email: '',
              password: '',
              passwordConfirmation: '',
            }
          }

          isProceeding.value = false
        }
      }
    )
  }

  const title = import.meta.env.APP_NAME

  watch(
    () => authStore.isUserConnected,
    (newValue) => {
      if (newValue) {
        if (userHasSuperAdminRole()) {
          appSettingStore.initDefaultSettings()
        }

        router.replace(Routes.HOME.PATH)
      }
    },
    {
      immediate: true,
    }
  )

  // Check settings
  const disableInstaller: boolean = appSettingStore.getSettingValue(
    'disableInstaller',
    'boolean'
  ) as boolean

  const allowRegistration: boolean = appSettingStore.getSettingValue(
    'allowRegistration',
    'boolean'
  ) as boolean

  if (!allowRegistration) router.replace(Routes.LOGIN.PATH)

  const cardVisible = ref(true)
</script>

<template>
  <AuthLayout :display-server-alerts="!disableInstaller">
    <CustomTransition name="slide-fade" appear>
      <div class="container h-full">
        <div
          class="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
          <div class="md:w-8/12 lg:w-5/12 xl:w-4/12 2xl:w-3.5/12 sm:w-full">
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
                  <n-grid x-gap="12" :span="24">
                    <n-form-item-gi
                      :span="12"
                      :label="t('lastname')"
                      path="lastname">
                      <n-input
                        v-model:value="formValue.lastname"
                        :placeholder="t('lastname')"
                        class="w-full" />
                    </n-form-item-gi>
                    <n-form-item-gi
                      :span="12"
                      :label="t('firstname_s')"
                      path="firstname">
                      <n-input
                        v-model:value="formValue.firstname"
                        :placeholder="t('firstname_s')"
                        class="w-full" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-form-item :label="t('addressEmail')" path="email">
                    <n-input
                      v-model:value="formValue.email"
                      :placeholder="t('addressEmail')"
                      class="w-full" />
                  </n-form-item>
                  <n-grid x-gap="12" :span="24">
                    <n-form-item-gi
                      :span="12"
                      :label="t('password')"
                      path="password">
                      <n-input
                        v-model:value="formValue.password"
                        :placeholder="t('password')"
                        show-password-on="mousedown"
                        type="password"
                        class="w-full" />
                    </n-form-item-gi>
                    <n-form-item-gi
                      :span="12"
                      :label="t('confirmPassword')"
                      path="passwordConfirmation">
                      <n-input
                        v-model:value="formValue.passwordConfirmation"
                        :placeholder="t('confirmPassword')"
                        :disabled="!formValue.password"
                        show-password-on="mousedown"
                        type="password"
                        class="w-full" />
                    </n-form-item-gi>
                  </n-grid>

                  <n-button
                    type="primary"
                    :loading="isProceeding"
                    :disabled="
                      !formValue.lastname ||
                      !formValue.firstname ||
                      !formValue.email ||
                      !formValue.password ||
                      !formValue.passwordConfirmation
                    "
                    block
                    @click="submit">
                    {{ t('validate') }}
                  </n-button>

                  <!--n-divider- ref="divider" class="!my-2">{{
                    t('or')
                  }}</n-divider-->

                  <!--PhoneAuth
                    class="mb-5"
                    @display-dialog="(val: boolean) => {
                cardVisible = !val
              }" /-->

                  <!--GoogleAuth /-->

                  <div class="mt-2">
                    <n-button
                      block
                      tertiary
                      type="primary"
                      @click="router.push(Routes.LOGIN.PATH)">
                      {{ t('alreadyHaveAccount') }} {{ t('toLogin') }}
                    </n-button>
                  </div>
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
