<script setup>
  import { Chart, registerables } from 'chart.js'
  import { LineChart, useLineChart } from 'vue-chart-3'

  Chart.register(...registerables)

  const props = defineProps({
    labels: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: null,
    },
    xTitle: {
      type: String,
      default: null,
    },
    yTitle: {
      type: String,
      default: null,
    },
    legendPosition: {
      type: String,
      default: 'top',
    },
    xPrecision: {
      type: Number,
      default: 0,
    },
    yPrecision: {
      type: Number,
      default: 0,
    },
    chartStyles: {
      type: Object,
      default: () => ({}),
    },
    datasets: {
      type: Array,
      default: () => [],
    },
  })

  const data = computed(() => ({
    labels: props.labels,
    datasets: props.datasets,
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
    scales: {
      x: {
        display: true,
        title: {
          display: props.xTitle !== null,
          text: props.xTitle,
        },
        ticks: {
          precision: props.xPrecision,
        },
      },
      y: {
        display: true,
        title: {
          display: props.yTitle !== null,
          text: props.yTitle,
        },
        ticks: {
          precision: props.yPrecision,
        },
      },
    },
  }))

  const { lineChartProps } = useLineChart({
    chartData: data.value,
    options: options.value,
  })
</script>

<template>
  <LineChart v-bind="lineChartProps" :style="chartStyles" />
</template>
