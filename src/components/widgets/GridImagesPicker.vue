<script lang="ts">
  export default defineComponent({
    name: 'GridImagesPicker',
  })
</script>

<script setup lang="ts">
  import { compressImage, dataUrlToFile } from '@/utils/functions'

  import { PlusFilled, DeleteFilled } from '@vicons/material'

  interface Props {
    modelValue: string
    uploadFolder?: string
    title?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    uploadFolder: 'images',
    title: '',
  })

  const emits = defineEmits(['update:modelValue'])

  const message = useMessage()
  const loadingBar = useLoadingBar()

  const { t } = useI18n()
  const { request } = useApi()
  const { fileUrl } = useHelper()

  const isProceeding = ref(false)
  const pickerVisible = ref(false)

  const images = computed({
    get() {
      let parsedValue

      try {
        parsedValue = JSON.parse(props.modelValue)
      } catch (e) {
        parsedValue = []
      }

      return parsedValue
    },
    set(value) {
      let parsedValue

      try {
        parsedValue = JSON.parse(value)
      } catch (e) {
        parsedValue = []
      }

      emits('update:modelValue', JSON.stringify(parsedValue))
    },
  })

  const clearImage = (index: number) => {
    let list = images.value
    if (Array.isArray(list)) list.splice(index, 1)
    else list = []
    images.value = JSON.stringify(list)
  }

  const saveImage = async (result: unknown, dataUrl: string) => {
    isProceeding.value = true

    var file = dataUrlToFile(dataUrl)
    file = await compressImage(file, { maxSizeMB: 1 })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', props.uploadFolder)

    loadingBar.start()

    const task = await request({
      url: '/file/upload',
      method: 'post',
      data: formData,
    })

    if (task.success && task.result) {
      const path = task.result.data.path

      let list = images.value
      if (Array.isArray(list)) list.push(path)
      else list = [path]
      images.value = JSON.stringify(list)

      pickerVisible.value = false
      loadingBar.finish()
    } else {
      loadingBar.finish()
      message.error(t('anErrorOccured'))
    }

    isProceeding.value = false
  }
</script>

<template>
  <section class="w-full">
    <section class="mb-2">
      <n-card :title="props.title">
        <template #header-extra>
          <n-button quaternary @click="pickerVisible = true">
            <template #icon>
              <n-icon>
                <PlusFilled />
              </n-icon>
            </template>
            {{ t('add') }}
          </n-button>
        </template>
        <n-scrollbar style="max-height: 175px">
          <n-image-group v-if="images && images.length" :show-toolbar="false">
            <n-space justify="space-around">
              <div
                v-for="(path, i) in images"
                :key="'img-' + i"
                class="relative border-dotted border border-red-500 h-[120px] picked-item">
                <n-image width="100" object-fit="cover" :src="fileUrl(path)" />
                <n-button
                  strong
                  circle
                  color="black"
                  style="position: absolute; top: 4px; right: 4px"
                  @click="clearImage(i)">
                  <template #icon>
                    <n-icon>
                      <DeleteFilled />
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </n-space>
          </n-image-group>
        </n-scrollbar>
      </n-card>
    </section>
  </section>
  <n-modal
    v-model:show="pickerVisible"
    preset="card"
    style="width: 650px"
    :bordered="false"
    :mask-closable="false"
    :close-on-esc="false">
    <ImagePicker
      :cropper-ratio="undefined"
      :round-preview="false"
      :is-loading="isProceeding"
      @cancel="pickerVisible = false"
      @save="saveImage" />
  </n-modal>
</template>

<style scoped>
  ::v-deep(.picked-item > .n-image > img) {
    object-fit: cover !important;
    height: 120px !important;
  }
</style>
