<script lang="ts">
  export default defineComponent({
    name: Routes.SETUP.NAME,
  })
</script>

<script setup lang="ts">
  import Routes from '@/router/routes'
  import {
    FormInst,
    FormItemRule,
    FormRules,
    FormValidationError,
    StepsProps,
  } from 'naive-ui'

  import { passwordStrength } from 'check-password-strength'
  import passwordStrengthOptions from '@/utils/password-strength-options'

  import {
    LongArrowAltLeft,
    LongArrowAltRight,
    CheckCircleRegular,
  } from '@vicons/fa'
  import { ResponseErrorCode } from '@/enums/response-error-code'

  interface DbFormValue {
    dbname: string | null
    username: string | null
    password: string | null
    host: string | null
  }

  interface AdminFormValue {
    lastname: string | null
    firstname: string | null
    email: string | null
    password: string | null
    passwordConfirmation: string | null
  }

  const { t } = useI18n()
  const { request } = useApi()
  const { displayFormErrors } = useHelper()
  const { userHasSuperAdminRole } = useAccess()
  const { defaultPrefs } = useUserPreference()

  const router = useRouter()
  const message = useMessage()

  const authStore = useAuthStore()
  const appSettingStore = useAppSettingStore()
  const disableInstaller: boolean = appSettingStore.getSettingValue(
    'disableInstaller',
    'boolean'
  ) as boolean

  const step = ref<number>(1)
  const stepStatus = ref<StepsProps['status']>('process')

  const isProceeding = ref<boolean>(false)
  const adminFormRef = ref<FormInst | null>(null)
  const adminFormValue = ref<AdminFormValue>({
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })
  const adminRules: FormRules = {
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
          if (value && value !== adminFormValue.value.password) {
            return new Error(t('nonCompliantPassword'))
          }

          return true
        },
      },
    ],
  }

  const dbFormRef = ref<FormInst | null>(null)
  const dbFormValue = ref<DbFormValue>({
    dbname: '',
    host: '',
    username: '',
    password: '',
  })
  const dbRules: FormRules = {
    dbname: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
    host: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
    username: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
    password: [
      {
        required: false,
      },
    ],
  }

  const prev = () => {
    if (step.value > 2) step.value--
  }

  const next = () => {
    if (step.value == 1) {
      dbFormRef.value?.validate(
        async (errors: Array<FormValidationError> | undefined) => {
          if (errors) message.warning(t('invalidForm'))
          else {
            isProceeding.value = true
            stepStatus.value = 'wait'

            const task = await request({
              url: '/database/create',
              method: 'post',
              data: dbFormValue.value,
            })

            if (task.success) {
              // Pause to give backend time to restart
              await new Promise((resolve) => setTimeout(resolve, 3000))
              const task1 = await request({ url: '/database/migrate' })
              const task2 = await request({ url: '/database/seed' })

              if (task1.success && task2.success) {
                step.value = 2
                stepStatus.value = 'process'
              } else {
                message.error(t('unableToInstallTablesInDb'))

                stepStatus.value = 'error'
              }
            } else {
              message.error(t('unableToCreateDbOrEditConfig'))

              stepStatus.value = 'error'
            }

            isProceeding.value = false
          }
        }
      )
    } else if (step.value == 2) {
      if (
        adminFormValue.value.lastname ||
        adminFormValue.value.firstname ||
        adminFormValue.value.email ||
        adminFormValue.value.password
      ) {
        adminFormRef.value?.validate(
          async (errors: Array<FormValidationError> | undefined) => {
            if (errors) message.warning(t('invalidForm'))
            else {
              isProceeding.value = true
              stepStatus.value = 'wait'

              const task = await request({
                url: `/auth/register`,
                method: 'post',
                data: {
                  lastname: adminFormValue.value.lastname,
                  firstname: adminFormValue.value.firstname,
                  email: adminFormValue.value.email,
                  password: adminFormValue.value.password,
                  passwordConfirmation:
                    adminFormValue.value.passwordConfirmation,
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

                stepStatus.value = 'error'
              } else {
                authStore.userData = task.result.data.user
                if (userHasSuperAdminRole()) {
                  appSettingStore.initDefaultSettings()
                }
                authStore.userData = null

                adminFormValue.value = {
                  lastname: '',
                  firstname: '',
                  email: '',
                  password: '',
                  passwordConfirmation: '',
                }

                step.value = 3
                stepStatus.value = 'finish'
              }

              isProceeding.value = false
            }
          }
        )
      } else {
        step.value = 3
        stepStatus.value = 'finish'
      }
    } else if (step.value == 3) {
      router.replace(Routes.LOGIN.PATH)
    }
  }

  onMounted(() => {
    if (disableInstaller) router.replace(Routes.LOGIN.PATH)
  })
</script>

<template>
  <AuthLayout :display-server-alerts="false">
    <div class="container h-full">
      <div
        class="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
        <div class="md:w-10/12 lg:w-7/12 xl:w-6/12 2xl:w-5/12 sm:w-full">
          <n-card size="medium" class="w-full">
            <template #header>
              <div class="w-full flex justify-center">
                <n-steps :current="step" :status="stepStatus">
                  <n-step :title="t('database')" />
                  <n-step :title="t('admin')" />
                  <n-step :title="t('completion')" />
                </n-steps>
              </div>
            </template>
            <div class="px-20">
              <section v-if="step == 1">
                <n-h3 class="text-center">{{
                  t('databaseConnectionInfo')
                }}</n-h3>
                <n-form
                  ref="dbFormRef"
                  :model="dbFormValue"
                  :rules="dbRules"
                  :show-label="false"
                  :show-require-mark="false"
                  size="medium">
                  <n-form-item :label="t('dbname')" path="dbname">
                    <n-input
                      v-model:value="dbFormValue.dbname"
                      :placeholder="t('dbname')"
                      class="w-full" />
                  </n-form-item>
                  <n-form-item :label="t('username')" path="username">
                    <n-input
                      v-model:value="dbFormValue.username"
                      :placeholder="t('username')"
                      class="w-full" />
                  </n-form-item>
                  <n-form-item :label="t('password')" path="password">
                    <n-input
                      v-model:value="dbFormValue.password"
                      :placeholder="t('password')"
                      show-password-on="mousedown"
                      type="password"
                      class="w-full" />
                  </n-form-item>
                  <n-form-item :label="t('host')" path="host">
                    <n-input
                      v-model:value="dbFormValue.host"
                      :placeholder="t('host')"
                      class="w-full" />
                  </n-form-item>
                </n-form>
              </section>
              <section v-else-if="step == 2">
                <n-h3 class="text-center">{{ t('createAdmin') }}</n-h3>
                <n-form
                  ref="adminFormRef"
                  :model="adminFormValue"
                  :rules="adminRules"
                  :show-label="false"
                  :show-require-mark="false"
                  size="medium">
                  <n-grid x-gap="12" :span="24">
                    <n-form-item-gi
                      :span="12"
                      :label="t('lastname')"
                      path="lastname">
                      <n-input
                        v-model:value="adminFormValue.lastname"
                        :placeholder="t('lastname')"
                        class="w-full" />
                    </n-form-item-gi>
                    <n-form-item-gi
                      :span="12"
                      :label="t('firstname_s')"
                      path="firstname">
                      <n-input
                        v-model:value="adminFormValue.firstname"
                        :placeholder="t('firstname_s')"
                        class="w-full" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-form-item :label="t('addressEmail')" path="email">
                    <n-input
                      v-model:value="adminFormValue.email"
                      :placeholder="t('addressEmail')"
                      class="w-full" />
                  </n-form-item>
                  <n-grid x-gap="12" :span="24">
                    <n-form-item-gi
                      :span="12"
                      :label="t('password')"
                      path="password">
                      <n-input
                        v-model:value="adminFormValue.password"
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
                        v-model:value="adminFormValue.passwordConfirmation"
                        :placeholder="t('confirmPassword')"
                        :disabled="!adminFormValue.password"
                        show-password-on="mousedown"
                        type="password"
                        class="w-full" />
                    </n-form-item-gi>
                  </n-grid>
                </n-form>
              </section>
              <section v-else-if="step == 3">
                <n-alert :title="t('installationCompleted')" type="success">
                  {{ t('confirmToReturnToLoginPage') }}
                </n-alert>
              </section>
            </div>
            <template #action>
              <section class="w-full flex justify-end px-20">
                <n-button-group>
                  <n-button
                    :loading="isProceeding"
                    :disabled="step < 3"
                    @click="prev">
                    <template #icon>
                      <n-icon>
                        <LongArrowAltLeft />
                      </n-icon>
                    </template>
                    {{ t('previous') }}
                  </n-button>
                  <n-button
                    icon-placement="right"
                    :loading="isProceeding"
                    @click="next">
                    <template #icon>
                      <n-icon>
                        <CheckCircleRegular v-if="step == 3" />
                        <LongArrowAltRight v-else />
                      </n-icon>
                    </template>
                    {{ step == 3 ? t('validate') : t('next') }}
                  </n-button>
                </n-button-group>
              </section>
            </template>
          </n-card>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<style scoped lang="scss"></style>
