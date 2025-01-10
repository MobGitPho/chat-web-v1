<script setup lang="ts">
  window.$notification = useNaiveNotification()
  window.$loadingBar = useLoadingBar()
  window.$message = useMessage()
  window.$dialog = useDialog()
  window.$modal = useModal()
</script>

<template>
  <slot></slot>
</template>

<style scoped lang="scss"></style>
