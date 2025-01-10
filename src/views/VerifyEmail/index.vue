<script lang="ts">
  export default defineComponent({
    name: Routes.VERIFY_EMAIL.NAME,
  })
</script>

<script setup lang="ts">
  import logo from '@/assets/images/logo.svg'

  import Routes from '@/router/routes'
  import { ResponseErrorCode } from '@/enums/response-error-code'

  const { t } = useI18n()

  const { request } = useApi()

  const route = useRoute()
  const router = useRouter()

  const authStore = useAuthStore()
  const appSettingStore = useAppSettingStore()

  const isChecking = ref(true)
  const valid = ref<'yes' | 'no' | 'already' | null>(null)

  onMounted(async () => {
    if (!route.params.id || !route.params.hash) {
      router.replace(Routes.LOGIN.PATH)
    }

    const task = await request({
      url: `/auth/verify-email/${route.params.id}/${route.params.hash}?expires=${route.query.expires}&signature=${route.query.signature}`,
    })

    if (task.failure && task.error) {
      switch (task.error?.response?.data?.errorCode) {
        case ResponseErrorCode.AUTH_EMAIL_ALREADY_VERIFIED:
          valid.value = 'already'
          break
        default:
          valid.value = 'no'
          break
      }
    } else {
      valid.value = 'yes'

      authStore.userData = task.result.data.user
    }

    isChecking.value = false
  })

  const title = import.meta.env.APP_NAME

  const disableInstaller: boolean = appSettingStore.getSettingValue(
    'disableInstaller',
    'boolean'
  ) as boolean
</script>

<template>
  <AuthLayout :display-server-alerts="!disableInstaller">
    <div class="container h-full">
      <div
        class="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
        <div class="md:w-8/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12 sm:w-full">
          <n-spin :show="isChecking">
            <n-card size="medium" class="w-full">
              <div class="flex justify-center mb-2.5">
                <img :src="logo" class="w-10" :alt="title" />
              </div>
              <div class="text-center">
                <n-h3>
                  <n-text type="primary">
                    {{ t('emailVerification') }}
                  </n-text>
                </n-h3>
                <template v-if="valid != null">
                  <n-alert v-if="valid == 'yes'" type="success">
                    {{ t('verifyYourEmailSucceed') }}
                  </n-alert>
                  <n-alert v-else-if="valid == 'already'" type="info">
                    {{ t('yourEmailAlreadyVerified') }}
                  </n-alert>
                  <n-alert v-else type="error">
                    {{ t('verifyYourEmailFailed') }}
                  </n-alert>
                </template>
                <div
                  class="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
                  <p class="text-center font-semibold mx-4 mb-0">
                    <n-button text @click="router.replace(Routes.HOME.PATH)">{{
                      t('back')
                    }}</n-button>
                  </p>
                </div>
              </div>
            </n-card>
          </n-spin>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<style scoped></style>
