<script setup lang="ts">
  import { differenceFromNow } from '@/utils/chronos'

  import { NotificationModel } from '@/models/notification'

  import { AccessTimeFilled, CheckFilled, DeleteFilled } from '@vicons/material'

  interface Props {
    item: NotificationModel
  }

  const props = defineProps<Props>()

  const emits = defineEmits(['closeBox'])

  const { t, locale } = useI18n()

  const router = useRouter()

  const { markAsRead, buildMessage, removeNotification, isUnread } =
    useNotification()

  const toNotificationTarget = async (notification: NotificationModel) => {
    if (notification.data.target) {
      try {
        await markAsRead(notification)

        router.push(notification.data.target)

        emits('closeBox')
      } catch (error) {
        console.log(error)
      }
    }
  }

  const message = ref<{ title: string; content: string }>({
    title: '',
    content: '',
  })
  const isLoading = ref<boolean>(false)
  const loadMessage = async () => {
    isLoading.value = true
    message.value = await buildMessage(props.item)
    isLoading.value = false
  }
  loadMessage()
</script>

<template>
  <n-list-item v-if="isLoading" class="item w-full">
    <n-thing>
      <template #header>
        <n-skeleton text style="width: 150px" />
      </template>
      <template #header-extra>
        <n-badge color="gray" dot></n-badge>
      </template>
      <template #description>
        <n-skeleton text style="width: 100%" :repeat="2" />
      </template>
      <template #footer>
        <n-space align="center" justify="space-between">
          <n-button text size="tiny" style="cursor: default">
            <template #icon>
              <n-icon><AccessTimeFilled /></n-icon>
            </template>
            <n-skeleton text style="width: 60px" />
          </n-button>
          <n-space align="center">
            <n-button text>
              <template #icon>
                <n-icon><DeleteFilled /></n-icon>
              </template>
              <n-skeleton text style="width: 60px" />
            </n-button>
          </n-space>
        </n-space>
      </template>
    </n-thing>
  </n-list-item>
  <n-list-item
    v-else
    class="item w-full"
    :style="`cursor: ${props.item.data.target ? 'pointer' : 'default'}`"
    @click="toNotificationTarget(props.item)">
    <n-thing>
      <template #header>
        <span class="title" @click="toNotificationTarget(props.item)">{{
          message.title
        }}</span>
      </template>
      <template #header-extra>
        <n-badge v-if="isUnread(props.item)" dot></n-badge>
      </template>
      <template #description>
        <span class="content" v-html="message.content"></span>
      </template>
      <template #footer>
        <n-space align="center" justify="space-between">
          <n-button text size="tiny" style="cursor: default">
            <template #icon>
              <n-icon><AccessTimeFilled /></n-icon>
            </template>
            {{
              differenceFromNow(props.item?.createdAt || '', {
                locale,
              })
            }}
          </n-button>
          <n-space align="center">
            <n-button
              v-if="isUnread(props.item)"
              text
              @click.stop="markAsRead(props.item)">
              <template #icon>
                <n-icon><CheckFilled /></n-icon>
              </template>
              {{ t('read') }}
            </n-button>
            <n-popconfirm
              v-if="props.item.data.removable"
              :positive-text="t('yes')"
              :negative-text="t('no')"
              trigger="hover"
              @positive-click="removeNotification(props.item)">
              <template #trigger>
                <n-button text>
                  <template #icon>
                    <n-icon><DeleteFilled /></n-icon>
                  </template>
                  {{ t('delete') }}
                </n-button>
              </template>
              {{ t('deleteNotificationQuestion') }}
            </n-popconfirm>
          </n-space>
        </n-space>
      </template>
    </n-thing>
  </n-list-item>
</template>

<style scoped lang="scss"></style>
