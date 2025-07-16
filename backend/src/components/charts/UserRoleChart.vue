<template>
  <div class="space-y-4">
    <!-- Graphique en donut -->
    <div class="flex justify-center">
      <div class="relative h-48 w-48">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
    
    <!-- Légende -->
    <div class="grid grid-cols-2 gap-2">
      <div v-for="(item, index) in chartData" :key="item.label" class="flex items-center space-x-2">
        <div 
          :style="{ backgroundColor: colors[index] }" 
          class="w-3 h-3 rounded-full"
        ></div>
        <span class="text-sm text-gray-600">{{ item.label }}</span>
        <span class="text-sm font-semibold text-gray-900">{{ item.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartCanvas = ref(null)
let chart = null

const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']

const chartData = computed(() => {
  const roleLabels = {
    'client': 'Clients',
    'livreur': 'Livreurs',
    'commercant': 'Commerçants',
    'prestataire': 'Prestataires',
    'admin': 'Administrateurs'
  }
  
  return props.data.map(item => ({
    ...item,
    label: roleLabels[item.role] || item.role
  }))
})

const createChart = () => {
  if (!chartCanvas.value || !chartData.value.length) return

  const ctx = chartCanvas.value.getContext('2d')
  
  if (chart) {
    chart.destroy()
  }

  chart = new ChartJS(ctx, {
    type: 'doughnut',
    data: {
      labels: chartData.value.map(item => item.label),
      datasets: [
        {
          data: chartData.value.map(item => item.count),
          backgroundColor: colors,
          borderWidth: 0,
          hoverBackgroundColor: colors.map(color => color + 'CC')
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = Math.round((value / total) * 100)
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      },
      cutout: '60%'
    }
  })
}

watch(chartData, () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()
})
</script>