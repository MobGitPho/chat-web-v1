<script lang="ts">
  export default defineComponent({
    name: Routes.RESET_PASSWORD.NAME,
  })
</script>

<script setup lang="ts">
  import logo from '@/assets/images/logo.svg'

  import Routes from '@/router/routes'
  import { ResponseErrorCode } from '@/enums/response-error-code'

  import { LockResetFilled } from '@vicons/material'

  import {
    FormInst,
    FormItemRule,
    FormRules,
    FormValidationError,
  } from 'naive-ui'

  const { t } = useI18n()

  const router = useRouter()
  const message = useMessage()

  const { request } = useApi()
  const { displayFormErrors } = useHelper()

  const authStore = useAuthStore()
  const appSettingStore = useAppSettingStore()

  interface FormValue {
    email: string | null
  }

  const isProceeding = ref(false)
  const formRef = ref<FormInst | null>(null)
  const formValue = ref<FormValue>({
    email: '',
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
  }

  const submit = (e: MouseEvent) => {
    e.preventDefault()
    formRef.value?.validate(
      async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          isProceeding.value = true

          const task = await request({
            url: `/auth/send-password-link`,
            method: 'post',
            data: {
              email: formValue.value.email,
            },
          })

          if (task.failure && task.error) {
            switch (task.error?.response?.data?.errorCode) {
              case ResponseErrorCode.FORM_INVALID_DATA:
                displayFormErrors(task.error?.response?.data?.data)
                break
              default:
                message.error(t('failedToSend'))
            }
          } else {
            formValue.value = {
              email: '',
            }

            message.success(t('weHaveSentYouPwdResetEmail'), {
              closable: true,
              duration: 10000,
            })
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

  watch(
    () => authStore.isUserConnected,
    (newValue) => {
      if (newValue) router.replace(Routes.HOME.PATH)
    },
    {
      immediate: true,
    }
  )
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
                <n-form-item :label="t('addressEmail')" path="email">
                  <n-input
                    v-model:value="formValue.email"
                    :placeholder="t('addressEmail')"
                    class="w-full" />
                </n-form-item>

                <n-button
                  type="primary"
                  block
                  :loading="isProceeding"
                  @click="submit">
                  <template #icon>
                    <n-icon>
                      <LockResetFilled />
                    </n-icon>
                  </template>
                  {{ t('resetPassword') }}
                </n-button>
                <div
                  class="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
                  <p class="w-full text-center font-semibold mx-4 mb-0">
                    <n-button text @click="router.push(Routes.LOGIN.PATH)">{{
                      t('toLogin')
                    }}</n-button>
                  </p>
                </div>
              </n-form>
            </n-card>
          </div>
        </div>
      </div>
    </CustomTransition>
  </AuthLayout>
</template>

<style scoped></style>
