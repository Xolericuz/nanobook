<script setup lang="ts">
defineProps<{
  active?: boolean
}>()
</script>

<template>
  <button :class="['chip', { active }]">
    <slot />
  </button>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.chip.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}
</style>
