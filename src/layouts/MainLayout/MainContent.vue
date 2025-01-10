<script setup lang="ts">
  import { contentKey } from '@/utils/keys'

  const { pickByTheme } = useHelper()

  const route = useRoute()

  const uiStore = useUserInterfaceStore()

  const key = () => route.name

  const contentLayout = ref()
  const size = ref(useElementSize(contentLayout))

  watch(
    () => size.value,
    (newValue) => {
      uiStore.contentLayoutSize = newValue
    },
    {
      immediate: true,
      deep: true,
    }
  )

  const onContentScroll = (e: any) => {
    uiStore.contentScrollPosition = {
      scrollTop: e.target.scrollTop,
      scrollLeft: e.target.scrollLeft,
      scrollHeight: e.target.scrollHeight,
    }
  }

  provide(contentKey, { contentLayout })

  const keepAliveComponents: string[] = []
</script>

<template>
  <n-layout-content
    ref="contentLayout"
    class="h-full"
    :native-scrollbar="false"
    :style="`background-color: ${pickByTheme(
      'rgba(255, 255, 255, 0.9)',
      'rgba(24, 24, 28, 1)'
    )}`"
    @scroll="onContentScroll">
    <MainHeader></MainHeader>
    <div class="flex justify-between items-center flex-wrap h-full pt-[60px]">
      <div class="h-full w-full overflow-x-auto pl-4 pr-8">
        <router-view v-slot="{ Component }">
          <CustomTransition appear>
            <div class="mx-auto mt-4">
              <KeepAlive :include="keepAliveComponents">
                <component :is="Component" :key="key()" />
              </KeepAlive>
            </div>
          </CustomTransition>
        </router-view>
      </div>
    </div>
  </n-layout-content>
</template>
