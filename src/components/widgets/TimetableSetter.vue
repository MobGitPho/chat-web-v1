<script lang="ts">
  export default defineComponent({
    name: 'TimetableSetter',
  })
</script>

<script setup lang="ts">
  import { MoreTimeFilled, CloseFilled } from '@vicons/material'
  import { FormInst, FormRules, FormValidationError } from 'naive-ui'
  import { hexToRgba } from '@/utils/functions'
  import { h } from 'vue'

  const { t } = useI18n()
  const { appPrimaryColor } = useHelper()

  interface Props {
    modelValue: string | null
    minHeight?: number | string
    readonly?: boolean
    disabled?: boolean
    fromPlaceholder?: string
    toPlaceholder?: string
    timeFormat?: string
    selectableHours?: number | number[] | undefined
    selectableMinutes?: number | number[] | undefined
    selectableSeconds?: number | number[] | undefined
  }

  interface Day {
    label: string
    value: number
  }

  interface DataItem {
    from: number | null
    to: number | null
    day?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    minHeight: 350,
    readonly: false,
    disabled: false,
    fromPlaceholder: '',
    toPlaceholder: '',
    timeFormat: 'HH:mm',
    selectableHours: undefined,
    selectableMinutes: undefined,
    selectableSeconds: undefined,
  })

  const emits = defineEmits(['update:modelValue'])

  const days: Day[] = [
    {
      label: t('monday'),
      value: 1,
    },
    {
      label: t('tuesday'),
      value: 2,
    },
    {
      label: t('wednesday'),
      value: 3,
    },
    {
      label: t('thursday'),
      value: 4,
    },
    {
      label: t('friday'),
      value: 5,
    },
    {
      label: t('saturday'),
      value: 6,
    },
    {
      label: t('sunday'),
      value: 7,
    },
  ]

  const tsFormRef = ref<FormInst | null>(null)
  const tsFormValue = ref<DataItem>({
    from: null,
    to: null,
  })
  const tsRules = computed<FormRules>(() => ({
    from: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
    to: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
  }))

  const addDialog = ref(false)
  const openAddDialog = (day: Day) => {
    tsFormValue.value = {
      from: null,
      to: null,
      day: day.value,
    }

    addDialog.value = true
  }

  const data = computed({
    get() {
      let parsedValue

      try {
        parsedValue = JSON.parse(props.modelValue || '[]')
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

  const rowsLength = computed<number>(() => {
    let maxArrayLength = 0

    if (data.value) {
      const countByDay = data.value.reduce(
        (accumulator: { [key: string]: number }, currentObject: DataItem) => {
          const day = currentObject.day
          if (day != null) accumulator[day] = (accumulator[day] || 0) + 1
          return accumulator
        },
        {}
      )

      for (const day in countByDay) {
        if (countByDay[day] > maxArrayLength) maxArrayLength = countByDay[day]
      }
    }

    return maxArrayLength
  })

  const addNewHour = () => {
    tsFormRef.value?.validate(
      (errors: Array<FormValidationError> | undefined) => {
        if (!errors && tsFormValue.value.day) {
          const obj = { ...tsFormValue.value }

          let clonedData = data.value
          if (Array.isArray(clonedData)) {
            clonedData.push(obj)
            clonedData.sort((obj1, obj2) => obj1.from - obj2.from)
          } else clonedData = [obj]
          data.value = JSON.stringify(clonedData)

          addDialog.value = false
        }
      }
    )

    return false
  }

  const deleteHour = (item: DataItem) => {
    const index = data.value.findIndex(
      (d: DataItem) =>
        d.from == item.from && d.to == item.to && d.day == item.day
    )

    let clonedData = data.value
    if (Array.isArray(clonedData)) clonedData.splice(index, 1)
    else clonedData = []
    data.value = JSON.stringify(clonedData)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)

    return `${String(date.getHours()).padStart(2, '0')}h${String(
      date.getMinutes()
    ).padStart(2, '0')}`
  }
</script>

<template>
  <section>
    <n-table
      stripe
      size="small"
      :single-line="false"
      :style="{
        minHeight:
          typeof props.minHeight == 'number'
            ? `${props.minHeight}px`
            : props.minHeight,
      }">
      <thead>
        <tr>
          <th v-for="(day, i) in days" :key="i">
            <div class="text-center">{{ day.label }}</div>
          </th>
        </tr>
        <tr v-if="!props.readonly">
          <th v-for="(day, i) in days" :key="i">
            <div class="text-center">
              <n-button
                quaternary
                type="primary"
                size="tiny"
                :disabled="props.disabled"
                @click="openAddDialog(day)">
                <template #icon>
                  <n-icon><MoreTimeFilled /></n-icon>
                </template>
                {{ t('add') }}
              </n-button>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, y) in rowsLength" :key="y">
          <td
            v-for="(day, i) in days"
            :key="i"
            :style="y < data.filter((d: DataItem) => d.day == day.value).length ? `background: ${hexToRgba(appPrimaryColor, 0.2)}` : ''">
            <div
              v-if="y < data.filter((d: DataItem) => d.day == day.value).length"
              class="text-center">
              <div>
                {{
                  formatTime(
                    data.filter((d: DataItem) => d.day == day.value)[y].from
                  )
                }}
              </div>
              -
              <div>
                {{
                  formatTime(
                    data.filter((d: DataItem) => d.day == day.value)[y].to
                  )
                }}
              </div>
              <div v-if="!props.readonly" class="mt-2">
                <n-button
                  circle
                  size="tiny"
                  type="error"
                  :disabled="props.disabled"
                  @click="
                    deleteHour(
                      data.filter((d: DataItem) => d.day == day.value)[y]
                    )
                  ">
                  <template #icon>
                    <n-icon>
                      <CloseFilled />
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </n-table>
    <n-modal
      v-model:show="addDialog"
      preset="dialog"
      style="width: 400px"
      :title="t('addNewHour')"
      :icon="() => h(MoreTimeFilled)"
      :mask-closable="false"
      :close-on-esc="false"
      :positive-text="t('add')"
      :negative-text="t('cancel')"
      @positive-click="addNewHour"
      @negative-click="addDialog = false">
      <n-form
        ref="tsFormRef"
        :model="tsFormValue"
        :rules="tsRules"
        :show-label="false"
        :show-require-mark="false"
        class="mt-10"
        size="small">
        <n-grid x-gap="12" :span="24">
          <n-form-item-gi
            :span="12"
            :label="props.fromPlaceholder || t('start')"
            path="from">
            <n-time-picker
              v-model:value="tsFormValue.from"
              :placeholder="props.fromPlaceholder || t('start')"
              :format="props.timeFormat"
              :hours="props.selectableHours"
              :minutes="props.selectableMinutes"
              :seconds="props.selectableSeconds"
              size="small"
              class="w-full" />
          </n-form-item-gi>
          <n-form-item-gi
            :span="12"
            :label="props.toPlaceholder || t('end')"
            path="to">
            <n-time-picker
              v-model:value="tsFormValue.to"
              :placeholder="props.toPlaceholder || t('end')"
              :format="props.timeFormat"
              :hours="props.selectableHours"
              :minutes="props.selectableMinutes"
              :seconds="props.selectableSeconds"
              size="small"
              class="w-full" />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-modal>
  </section>
</template>

<style scoped></style>
