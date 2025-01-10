<script setup>
  const props = defineProps({
    moreStr: {
      type: String,
      default: 'Read more',
    },
    lessStr: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '#',
    },
    maxChars: {
      type: Number,
      default: 100,
    },
  })

  const isReadMore = ref(false)

  const formattedString = computed(() => {
    if (!isReadMore.value && props.text.length > props.maxChars)
      return props.text.substring(0, props.maxChars) + '...'

    return props.text
  })

  const triggerReadMore = (event, readMore) => {
    if (props.link == '#') event.preventDefault()

    if (props.lessStr) isReadMore.value = readMore
  }
</script>

<template>
  <div>
    <span v-html="formattedString"></span>
    <span v-show="props.text.length > props.maxChars">
      <a
        v-show="!isReadMore"
        id="readmore"
        :href="props.link"
        @click="triggerReadMore($event, true)"
        >{{ props.moreStr }}</a
      >
      <a
        v-show="isReadMore"
        id="readmore"
        :href="props.link"
        @click="triggerReadMore($event, false)"
        >{{ props.lessStr }}</a
      >
    </span>
  </div>
</template>
