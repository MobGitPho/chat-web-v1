<script setup lang="ts">
  import { ProfileType } from '@/enums/profile-type'
  import { ResponseErrorCode } from '@/enums/response-error-code'

  import Routes from '@/router/routes'

  import { CheckCircleRegular, LongArrowAltLeft } from '@vicons/fa'

  import { FormInst, FormRules, FormValidationError } from 'naive-ui'

  interface Props {
    mode?: 'creation' | 'edition'
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'creation',
  })

  const emits = defineEmits(['back'])

  const { t } = useI18n()
  const { request } = useApi()
  const { displayFormErrors } = useHelper()
  const { userHasSuperAdminRole } = useAccess()

  const authStore = useAuthStore()

  const router = useRouter()

  const dialog = useDialog()
  const message = useMessage()

  const isProceeding = ref(false)
  const formRef = ref<FormInst | null>(null)
  const formValue = ref<any>({})
  const rules: FormRules = {}

  const submit = () => {
    formRef.value?.validate(
      async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          isProceeding.value = true

          const task = await request({
            url: `/auth/profile`,
            method: 'post',
            data: {
              type: ProfileType.ADMIN,
              id: authStore.userData?.id,
              profileData: {},
            },
          })

          if (task.failure && task.error) {
            switch (task.error?.response?.data?.errorCode) {
              case ResponseErrorCode.AUTH_PROFILE_ALREADY_EXISTS:
                message.error(t('profileAlreadyExists'))
                break
              case ResponseErrorCode.AUTH_MISSING_DATA:
                message.error(t('missingData'))
                break
              case ResponseErrorCode.FORM_INVALID_DATA:
                displayFormErrors(task.error?.response?.data?.data)
                break
              case ResponseErrorCode.AUTH_USER_NOT_FOUND:
                message.error(t('userNotFound'))
                break
              case ResponseErrorCode.AUTH_PROFILE_TYPE_NOT_FOUND:
                message.error(t('profileTypeNotFound'))
                break
              default:
                message.error(t('registerProfileNotSuccessful'))
            }
          } else {
            if (userHasSuperAdminRole()) {
              authStore.userData = task.result.data

              router.replace(Routes.HOME.PATH)
            } else {
              await request({ url: '/auth/logout' })

              dialog.success({
                title: t('success'),
                content: t('accountCreatedWithSuccess1'),
                positiveText: t('ok'),
              })

              authStore.resetAuthData()

              router.replace(Routes.LOGIN.PATH)
            }
          }

          isProceeding.value = false
        }
      }
    )
  }

  const initData = () => {
    //
  }

  if (props.mode == 'edition') initData()
</script>

<template>
  <n-card size="medium" class="w-full">
    <CustomTransition name="slide-fade" appear>
      <section>
        <n-alert
          :title="props.mode == 'edition' ? t('update') : t('validation')"
          type="success"
          class="mb-10">
          {{
            props.mode == 'edition'
              ? t('updateCompleted')
              : t('registrationCompleted')
          }}
        </n-alert>
        <n-form
          ref="formRef"
          :model="formValue"
          :rules="rules"
          :show-label="false"
          :show-require-mark="false"
          size="medium">
        </n-form>
      </section>
    </CustomTransition>
    <CustomTransition name="slide-fade" appear>
      <section class="w-full flex">
        <n-button class="flex-1" :loading="isProceeding" @click="emits('back')">
          <template #icon>
            <n-icon>
              <LongArrowAltLeft />
            </n-icon>
          </template>
          {{ props.mode == 'edition' ? t('close') : t('back') }}
        </n-button>
        <div class="w-2"></div>
        <n-button
          class="flex-1"
          type="primary"
          icon-placement="right"
          :loading="isProceeding"
          @click="submit">
          <template #icon>
            <n-icon>
              <CheckCircleRegular />
            </n-icon>
          </template>
          {{ props.mode == 'edition' ? t('save') : t('validate') }}
        </n-button>
      </section>
    </CustomTransition>
  </n-card>
</template>

<style scoped lang="scss"></style>
