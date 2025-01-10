<script setup>
  import { transparentize } from '@/utils/functions.js'

  import { Chart, registerables } from 'chart.js'
  import { BarChart, useBarChart } from 'vue-chart-3'

  Chart.register(...registerables)

  const props = defineProps({
    label: {
      type: String,
      default: '',
    },
    labels: {
      type: Array,
      default: () => [],
    },
    dataList: {
      type: Array,
      default: () => [],
    },
    bgColors: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: null,
    },
    legendPosition: {
      type: String,
      default: 'top',
    },
  })

  const data = computed(() => ({
    labels: props.labels,
    datasets: [
      {
        label: props.label,
        data: props.dataList,
        borderColor: props.bgColors,
        backgroundColor: props.bgColors.map((item) =>
          transparentize(item, 0.2)
        ),
      },
    ],
  }))

  const options = computed(() => ({
    responsive: true,
    plugins: {
      legend: {
        display: !!props.label,
        position: props.legendPosition,
      },
      title: {
        display: props.title !== null,
        text: props.title,
      },
    },
  }))

  const { barChartProps } = useBarChart({
    chartData: data.value,
    options: options.value,
  })
</script>

<template>
  <BarChart v-bind="barChartProps" />
</template>
