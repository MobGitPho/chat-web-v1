<script setup lang="ts">
  const route = useRoute()

  useHead({
    title: () =>
      (route?.meta?.title ? route?.meta?.title + ' - ' : '') +
      import.meta.env.APP_NAME,
  })
</script>

<template>
  <n-layout position="absolute" class="root-layout">
    <n-layout has-sider position="absolute" class="container-layout">
      <MainSidebar></MainSidebar>
      <MainContent></MainContent>
    </n-layout>
  </n-layout>
</template>

<style scoped>
  .container-layout {
    z-index: 1;
  }
</style>
