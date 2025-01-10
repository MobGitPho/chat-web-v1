<script lang="ts">
  export default defineComponent({
    name: Routes.ADD_NEW_PASSWORD.NAME,
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
  import { ResponseErrorCode } from '@/enums/response-error-code'

  const { t } = useI18n()

  const route = useRoute()
  const router = useRouter()
  const message = useMessage()

  const appSettingStore = useAppSettingStore()

  const { request } = useApi()
  const { displayFormErrors } = useHelper()

  interface FormValue {
    email: string | null
    password: string | null
    passwordConfirmation: string | null
  }

  const isProceeding = ref(false)
  const formRef = ref<FormInst | null>(null)
  const formValue = ref<FormValue>({
    email: '',
    password: '',
    passwordConfirmation: '',
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

  const submit = (e: MouseEvent) => {
    e.preventDefault()
    formRef.value?.validate(
      async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          isProceeding.value = true

          const task = await request({
            url: `/auth/reset-password`,
            method: 'post',
            data: {
              email: formValue.value.email,
              token: route.params.token as string,
              password: formValue.value.password,
              passwordConfirmation: formValue.value.passwordConfirmation,
            },
          })

          if (task.failure && task.error) {
            switch (task.error?.response?.data?.errorCode) {
              case ResponseErrorCode.FORM_INVALID_DATA:
                displayFormErrors(task.error?.response?.data?.data)
                break
              default:
                message.error(t('passwordResetFailure'), {
                  closable: true,
                  duration: 5000,
                })
            }
          } else {
            message.success(t('passwordResetSuccess'), {
              closable: true,
              duration: 10000,
            })

            router.replace(Routes.LOGIN.PATH)
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

  onMounted(() => {
    if (!route.params.token) router.replace(Routes.LOGIN.PATH)

    formValue.value.email = route.query.email as string
  })
</script>

<template>
  <AuthLayout :display-server-alerts="!disableInstaller">
    <CustomTransition name="slide-fade" appear>
      <div class="container h-full">
        <div
          class="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
          <div class="md:w-8/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12 sm:w-full">
            <n-card size="medium" class="w-full">
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
                <n-form-item
                  v-if="!route.query.email"
                  :label="t('addressEmail')"
                  path="email">
                  <n-input
                    v-model:value="formValue.email"
                    :placeholder="t('addressEmail')"
                    class="w-full" />
                </n-form-item>
                <n-form-item :label="t('newPassword')" path="password">
                  <n-input
                    v-model:value="formValue.password"
                    :placeholder="t('newPassword')"
                    show-password-on="mousedown"
                    type="password"
                    class="w-full" />
                </n-form-item>
                <n-form-item
                  :label="t('confirmPassword')"
                  path="passwordConfirmation">
                  <n-input
                    v-model:value="formValue.passwordConfirmation"
                    :placeholder="t('confirmPassword')"
                    :disabled="!formValue.password"
                    show-password-on="mousedown"
                    type="password"
                    class="w-full" />
                </n-form-item>

                <n-button
                  block
                  type="primary"
                  :loading="isProceeding"
                  @click="submit">
                  {{ t('save') }}
                </n-button>
              </n-form>
            </n-card>
          </div>
        </div>
      </div>
    </CustomTransition>
  </AuthLayout>
</template>

<style scoped></style>
