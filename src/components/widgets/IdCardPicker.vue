<script lang="ts">
  export default defineComponent({
    name: 'IdCardPicker',
  })
</script>

<script setup lang="ts">
  import { compressImage, dataUrlToFile } from '@/utils/functions'

  import { PlusFilled, DeleteFilled } from '@vicons/material'

  interface Props {
    modelValue: string
    uploadFolder?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    uploadFolder: 'id-cards',
  })

  const emits = defineEmits(['update:modelValue'])

  const message = useMessage()
  const loadingBar = useLoadingBar()

  const { t } = useI18n()
  const { request } = useApi()
  const { fileUrl } = useHelper()

  type Face = 'recto' | 'verso'

  const isProceeding = ref(false)
  const pickerFace = ref<Face>('recto')
  const pickerVisible = ref(false)

  const idCard = computed({
    get() {
      let parsedValue

      try {
        parsedValue = JSON.parse(props.modelValue)
      } catch (e) {
        parsedValue = ['', '']
      }

      return parsedValue
    },
    set(value) {
      let parsedValue

      try {
        parsedValue = JSON.parse(value)
      } catch (e) {
        parsedValue = ['', '']
      }

      emits('update:modelValue', JSON.stringify(parsedValue))
    },
  })

  const openPicker = (face: Face) => {
    pickerFace.value = face
    pickerVisible.value = true
  }

  const clearIdCardImage = (face: Face) => {
    if (face == 'recto') idCard.value = JSON.stringify(['', idCard.value[1]])
    else idCard.value = JSON.stringify([idCard.value[0], ''])
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

      if (pickerFace.value == 'recto') {
        idCard.value = JSON.stringify([path, idCard.value[1]])
      } else {
        idCard.value = JSON.stringify([idCard.value[0], path])
      }

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
      <n-card size="small" :title="t('frontSide')">
        <template #header-extra>
          <n-button
            v-if="idCard[0]"
            quaternary
            @click="clearIdCardImage('recto')">
            <template #icon>
              <n-icon>
                <DeleteFilled />
              </n-icon>
            </template>
            {{ t('clear') }}
          </n-button>
          <n-button v-else quaternary @click="openPicker('recto')">
            <template #icon>
              <n-icon>
                <PlusFilled />
              </n-icon>
            </template>
            {{ t('add') }}
          </n-button>
        </template>
        <n-space v-if="idCard[0]" justify="center" align="center">
          <img
            class="cursor-pointer"
            style="height: 100px"
            :src="fileUrl(idCard[0] || '')"
            @click="openPicker('recto')" />
        </n-space>
      </n-card>
    </section>
    <section class="mb-2">
      <n-card size="small" :title="t('backSide')">
        <template #header-extra>
          <n-button
            v-if="idCard[1]"
            quaternary
            @click="clearIdCardImage('verso')">
            <template #icon>
              <n-icon>
                <DeleteFilled />
              </n-icon>
            </template>
            {{ t('clear') }}
          </n-button>
          <n-button v-else quaternary @click="openPicker('verso')">
            <template #icon>
              <n-icon>
                <PlusFilled />
              </n-icon>
            </template>
            {{ t('add') }}
          </n-button>
        </template>
        <n-space v-if="idCard[1]" justify="center" align="center">
          <img
            class="cursor-pointer"
            style="height: 100px"
            :src="fileUrl(idCard[1] || '')"
            @click="openPicker('verso')" />
        </n-space>
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

<style scoped></style>
