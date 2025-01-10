<script>
  export default {
    name: 'ImagePicker',
    inheritAttrs: false,
  }
</script>

<script setup>
  import {
    Cropper,
    Preview,
    CircleStencil,
    RectangleStencil,
  } from 'vue-advanced-cropper'

  import { CloudDownloadFilled } from '@vicons/material'

  import { ArrowsAltH, ArrowsAltV, UndoAlt, RedoAlt } from '@vicons/fa'

  import 'vue-advanced-cropper/dist/style.css'
  import 'vue-advanced-cropper/dist/theme.bubble.css'

  const { t } = useI18n()

  const message = useMessage()

  const emits = defineEmits([
    'croppedFileChange',
    'selectedFileChange',
    'save',
    'cancel',
  ])
  const props = defineProps({
    cropperAutoZoom: {
      type: Boolean,
      default: true,
    },
    cropperScalable: {
      type: Boolean,
      default: false,
    },
    cropperMovable: {
      type: Boolean,
      default: false,
    },
    cropperRatio: {
      type: Number,
      default: null,
    },
    roundPreview: {
      type: Boolean,
      default: false,
    },
    previewWidth: {
      type: Number,
      default: null,
    },
    previewHeight: {
      type: Number,
      default: 120,
    },
    sizeLimit: {
      type: Number,
      default: Infinity,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  })

  const cropper = ref(null)
  const files = ref([])
  const result = ref({
    coordinates: null,
    image: null,
  })

  watch(
    () => files.value,
    (val, oldVal) => {
      emits('selectedFileChange', val[0] || null)
    }
  )

  const calcPreviewWidth = computed(() => {
    if (props.previewWidth) return props.previewWidth

    if (result.value && result.value.coordinates)
      return (
        (result.value.coordinates.width / result.value.coordinates.height) *
        props.previewHeight
      )
    else return props.previewHeight
  })

  const onChange = ({ coordinates, image }) => {
    result.value = {
      coordinates,
      image,
    }

    const { canvas } = cropper.value.getResult()

    emits('croppedFileChange', result.value, canvas.toDataURL())
  }

  const flip = (x, y) => {
    if (cropper.value.imageTransforms.rotate % 180 !== 0) {
      cropper.value.flip(!x, !y)
    } else {
      cropper.value.flip(x, y)
    }
  }

  const rotate = (angle) => {
    cropper.value.rotate(angle)
  }

  const beforeImageUpload = ({ file, fileList }) => {
    const fFile = file.file
    const isImg =
      fFile.type === 'image/jpeg' ||
      'image/jpg' ||
      'image/gif' ||
      'image/png' ||
      'image/webp'
    const sizeLessThan = fFile.size / 1024 / 1024 < props.sizeLimit

    if (!isImg) message.error(t('uploadImageFormatWarning'))

    if (!sizeLessThan)
      message.error(t('uploadFileSizeWarning', [props.sizeLimit]))

    return isImg && sizeLessThan
  }

  const selectedFileChange = ({ file, fileList }) => {
    var reader = new FileReader()

    reader.readAsDataURL(file.file)
    reader.onload = function (e) {
      files.value = [this.result]
    }
  }

  const cancel = () => {
    if (!files.value.length) emits('cancel')

    files.value = []
  }

  const save = () => {
    const { canvas } = cropper.value.getResult()

    emits('save', result.value, canvas.toDataURL())
  }
</script>

<template>
  <n-spin :show="props.isLoading">
    <div class="picker-container">
      <div class="picker-content">
        <div v-if="!files.length">
          <n-upload
            ref="upload"
            :multiple="false"
            accept="image/png,image/gif,image/jpeg,image/jpg,image/webp"
            @change="selectedFileChange"
            @before-upload="beforeImageUpload">
            <n-upload-dragger>
              <div style="margin-bottom: 12px">
                <n-icon size="48" :depth="3">
                  <CloudDownloadFilled />
                </n-icon>
              </div>
              <n-text style="font-size: 16px">
                {{ t('clickOrDragFile') }}
              </n-text>
            </n-upload-dragger>
          </n-upload>
        </div>

        <div v-else>
          <div class="cropper-container">
            <Cropper
              ref="cropper"
              class="cropper"
              :src="files[0]"
              :auto-zoom="props.cropperAutoZoom"
              :stencil-props="{
                movable: props.cropperMovable,
                scalable: props.cropperScalable,
                aspectRatio: props.cropperRatio,
                previewClass: props.roundPreview
                  ? 'circle-stencil-preview'
                  : '',
              }"
              image-restriction="stencil"
              background-class="cropper-background"
              :stencil-component="
                props.roundPreview ? CircleStencil : RectangleStencil
              "
              @change="onChange" />

            <div class="vertical-buttons">
              <div
                class="square-button"
                title="Flip Horizontal"
                @click="flip(true, false)">
                <n-icon color="white" :size="20">
                  <ArrowsAltH />
                </n-icon>
              </div>
              <div
                class="square-button"
                title="Flip Vertical"
                @click="flip(false, true)">
                <n-icon color="white" :size="20">
                  <ArrowsAltV />
                </n-icon>
              </div>
              <div
                class="square-button"
                title="Rotate Clockwise"
                @click="rotate(90)">
                <n-icon color="white" :size="20">
                  <RedoAlt />
                </n-icon>
              </div>
              <div
                class="square-button"
                title="Rotate Counter-Clockwise"
                @click="rotate(-90)">
                <n-icon color="white" :size="20">
                  <UndoAlt />
                </n-icon>
              </div>
            </div>
          </div>

          <div class="preview-container">
            <Preview
              ref="preview"
              class="preview"
              :image="result.image"
              :width="calcPreviewWidth"
              :height="props.previewHeight"
              :class="{ round: props.roundPreview }"
              :coordinates="result.coordinates" />
          </div>
        </div>

        <div class="picker-action">
          <span class="dialog-footer">
            <n-button @click="cancel()">{{
              files.length ? t('back') : t('close')
            }}</n-button>
            &nbsp;&nbsp;
            <n-button v-if="files.length" type="primary" @click="save()">{{
              t('save')
            }}</n-button>
          </span>
        </div>
      </div>
    </div>
  </n-spin>
</template>

<style scoped>
  .picker-content {
    flex-grow: 1;
    overflow: hidden;
  }

  .picker-action {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    flex-shrink: 0;
    padding: 1rem 0 0;
  }

  .picker-close {
    position: absolute;
    right: 0.5rem;
    top: 1rem;
    border: 0;
    background: #e4eaec;
    border-radius: 45px;
    cursor: pointer;
  }

  .picker-close:hover .fa-times {
    transition: 0.5s;
    transform: rotate(90deg);
  }

  @media only screen and (max-width: 768px) {
    .picker-content {
      width: 100%;
    }
  }
</style>

<style scoped>
  .cropper-container {
    position: relative;
  }

  .cropper {
    width: 100%;
    height: 300px;
  }

  .preview-container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    margin-top: 10px;
  }

  .vertical-buttons {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }

  .square-button {
    background: rgba(black, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    width: 42px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: background 0.5s;
  }

  .square-button:hover {
    background: black;
  }

  .round {
    border-radius: 100px;
  }

  ::v-deep(.circle-stencil-preview) {
    border: dashed 1px rgba(255, 255, 255, 0.75);
  }

  ::v-deep(.cropper-background) {
    background: #ddd;
  }
</style>
