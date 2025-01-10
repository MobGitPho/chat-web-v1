<!-- eslint-disable no-undef -->
<script lang="ts">
  export default defineComponent({
    name: Routes.ABOUT.NAME,
  })
</script>

<!-- eslint-disable no-undef -->
<script setup lang="ts">
  import { ResponseErrorCode } from '@/enums/response-error-code'
  import Routes from '@/router/routes'

  import { ChevronDown, ChevronLeft } from '@vicons/fa'
  import { BugReportFilled, SendFilled } from '@vicons/material'

  const { t } = useI18n()

  const { ckEditorToolbarItems } = useHelper()
  const { request } = useApi()

  const loadingBar = useLoadingBar()
  const message = useMessage()

  const reportContent = ref('')
  const isSending = ref(false)

  const sendBugReport = async () => {
    isSending.value = true
    loadingBar.start()

    const task = await request({
      url: `/email`,
      method: 'post',
      data: {
        // @ts-ignore
        // eslint-disable-next-line no-undef
        subject: `${t('bugReport')} - ${__APP_NAME__}`,
        // @ts-ignore
        // eslint-disable-next-line no-undef
        title: `${t('bugReport')} - ${__APP_NAME__}`,
        content: reportContent.value,
        recipients: [import.meta.env.APP_BUG_REPORT_EMAIL],
        tags: ['bug-report'],
      },
    })

    if (task.failure && task.error) {
      switch (task.error?.response?.data?.errorCode) {
        case ResponseErrorCode.FORM_INVALID_DATA:
          message.error(t('invalidData'))
          break
        default:
          message.error(t('sendingFailed'))
      }
    } else {
      reportContent.value = ''
      message.success(t('bugReportSentSuccessfully'))
    }

    loadingBar.finish()
    isSending.value = false
  }

  // @ts-ignore
  const title = __APP_NAME__ || ''
  // @ts-ignore
  const version = __APP_VERSION__ || ''
</script>

<template>
  <PageLayout>
    <n-card hoverable embedded :title="title" size="large">
      <n-space justify="space-between">
        <div>{{ t('version') + ' ' + version }}</div>
        <div>&copy; copyright {{ new Date().getFullYear() }} | edPage</div>
      </n-space>
    </n-card>
    <div class="h-2"></div>
    <n-card hoverable embedded size="small">
      <n-collapse :default-expanded-names="[]" display-directive="show">
        <template #header-extra="{ collapsed }">
          <n-icon>
            <ChevronLeft v-if="collapsed" />
            <ChevronDown v-else />
          </n-icon>
        </template>
        <template #arrow>
          <span></span>
        </template>
        <n-collapse-item name="1">
          <template #header>
            <div class="flex">
              <n-icon size="21">
                <BugReportFilled />
              </n-icon>
              <span class="ml-2 text-base">{{ t('reportBug') }}</span>
            </div>
          </template>
          <n-grid cols="8" :x-gap="24" :y-gap="12" item-responsive>
            <n-gi span="8 600:5 800:6 1400:7">
              <CKEditorWrapper
                v-model="reportContent"
                :toolbar-items="ckEditorToolbarItems"
                :placeholder="t('describeBug')"
                :should-not-group-when-full="false"
                enable-upload />
            </n-gi>
            <n-gi>
              <n-button
                :disabled="reportContent.length === 0"
                :loading="isSending"
                @click="sendBugReport">
                <template #icon>
                  <n-icon>
                    <SendFilled />
                  </n-icon>
                </template>
                {{ t('sendReport') }}
              </n-button>
            </n-gi>
          </n-grid>
        </n-collapse-item>
      </n-collapse>
    </n-card>
  </PageLayout>
</template>

<style lang="scss"></style>
