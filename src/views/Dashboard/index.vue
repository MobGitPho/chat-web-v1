<script lang="ts">
  export default defineComponent({
    name: Routes.DASHBOARD.NAME,
  })
</script>

<script setup lang="ts">
  import { AuthType } from '@/enums/auth-type'

  import Routes from '@/router/routes'

  const { t } = useI18n()
  const { request } = useApi()

  const dialog = useDialog()
  const message = useMessage()

  const authStore = useAuthStore()

  // Email verification
  const isSending = ref(false)
  const resend = async () => {
    isSending.value = true

    const task = await request({
      url: `/auth/send-verification-email`,
    })

    if (task.failure && task.error) {
      message.error(t('failedToSend'))
    } else {
      dialog.success({
        title: t('success'),
        content: t('verificationLinkSent'),
        positiveText: t('ok'),
      })
    }

    isSending.value = false
  }
</script>

<template>
  <template
    v-if="
      authStore.userData?.emailVerifiedAt === null &&
      authStore.userData?.authType != AuthType.PHONE
    ">
    <n-spin :show="isSending">
      <n-alert
        :title="t('verifyYourEmail')"
        type="warning"
        class="cursor-pointer"
        @click="resend">
        {{ t('weHaveSentYouVerificationEmail') }}
      </n-alert>
    </n-spin>
    <br />
  </template>
</template>

<style scoped lang="scss"></style>
