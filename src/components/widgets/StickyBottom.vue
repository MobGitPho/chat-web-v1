<script setup>
  const props = defineProps({
    bottom: {
      type: Number,
      default: 0,
    },
    zIndex: {
      type: Number,
      default: 1,
    },
    className: {
      type: String,
      default: '',
    },
  })

  const el = ref(null)

  const active = ref(false)
  const position = ref('')
  const width = ref(undefined)
  const height = ref(undefined)
  const isSticky = ref(false)

  onMounted(() => {
    height.value = el.value.getBoundingClientRect().height
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    handleScroll()
  })

  onActivated(() => {
    handleScroll()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
  })

  const sticky = () => {
    if (active.value) {
      return
    }
    position.value = 'fixed'
    active.value = true
    width.value = width.value + 'px'
    isSticky.value = true
  }

  const handleReset = () => {
    if (!active.value) {
      return
    }
    reset()
  }

  const reset = () => {
    position.value = ''
    width.value = 'auto'
    active.value = false
    isSticky.value = false
  }

  const handleScroll = () => {
    const w = el.value.getBoundingClientRect().width
    width.value = w || 'auto'
    const offsetBottom = el.value.getBoundingClientRect().bottom
    if (offsetBottom > props.bottom) {
      sticky()
      return
    }
    handleReset()
  }

  const handleResize = () => {
    if (isSticky.value) {
      width.value = el.value.getBoundingClientRect().width + 'px'
    }
  }
</script>

<template>
  <div ref="el" :style="{ height: height + 'px', zIndex: props.zIndex }">
    <div
      :class="props.className"
      :style="{
        bottom: isSticky ? props.bottom + 'px' : '',
        zIndex: props.zIndex,
        position,
        width,
        height: height + 'px',
      }">
      <slot>
        <div>Sticky Bottom</div>
      </slot>
    </div>
  </div>
</template>
