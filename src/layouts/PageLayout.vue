<script setup lang="ts">
  import { ArrowBackIosFilled } from '@vicons/material'

  const route = useRoute()
  const router = useRouter()

  interface Props {
    title?: string | null
    displayTitle?: boolean
    displayBreadcrumb?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    title: null,
    displayTitle: true,
    displayBreadcrumb: false,
  })
</script>

<template>
  <Breadcrumb v-if="displayBreadcrumb" />
  <n-page-header class="mb-5" @back="router.back()">
    <template #header>
      <slot name="header"></slot>
    </template>
    <template v-if="props.displayTitle" #title>
      {{ props.title || route?.meta?.title || '' }}
    </template>
    <template #back>
      <n-icon>
        <ArrowBackIosFilled />
      </n-icon>
    </template>
    <template #extra>
      <slot name="header-extra"></slot>
    </template>
  </n-page-header>
  <slot></slot>
</template>
