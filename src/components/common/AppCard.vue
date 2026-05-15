<script setup lang="ts">
withDefaults(defineProps<{
  hover?: boolean
  padding?: string
}>(), {
  hover: false,
  padding: '20px',
})
</script>

<template>
  <div :class="['card', { 'card-hover': hover }]" :style="{ padding }">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.card-hover:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(124, 92, 252, 0.12);
}
</style>
