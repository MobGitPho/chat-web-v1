<script setup>
  import { transparentize } from '@/utils/functions.js'

  import { Chart, registerables } from 'chart.js'
  import { LineChart, useLineChart } from 'vue-chart-3'

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
    bgColor: {
      type: String,
      default: '',
    },
    borderColor: {
      type: String,
      default: '',
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
    label: {
      type: String,
      default: '',
    },
    xPrecision: {
      type: Number,
      default: 0,
    },
    yPrecision: {
      type: Number,
      default: 0,
    },
    tension: {
      type: Number,
      default: 0.5,
    },
    chartStyles: {
      type: Object,
      default: () => ({}),
    },
  })

  const data = computed(() => ({
    labels: props.labels,
    datasets: [
      {
        label: props.label,
        data: props.dataList,
        backgroundColor: transparentize(props.bgColor, 0.4),
        borderColor: props.borderColor || props.bgColor,
        tension: props.tension,
        fill: true,
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
