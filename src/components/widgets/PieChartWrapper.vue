<script setup>
  import { transparentize } from '@/utils/functions.js'

  import { Chart, registerables } from 'chart.js'
  import { PieChart, usePieChart } from 'vue-chart-3'

  Chart.register(...registerables)

  const props = defineProps({
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
        position: props.legendPosition,
      },
      title: {
        display: props.title !== null,
        text: props.title,
      },
    },
  }))

  const { pieChartProps } = usePieChart({
    chartData: data.value,
    options: options.value,
  })
</script>

<template>
  <PieChart v-bind="pieChartProps" />
</template>
