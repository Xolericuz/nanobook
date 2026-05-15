<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
})
</script>

<template>
  <button
    :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-block': block }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner" />
    <slot v-else />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
  white-space: nowrap;
  user-select: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent);
  color: white;
  padding: 10px 20px;
  font-size: 0.875rem;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
  box-shadow: var(--shadow-glow);
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 10px 20px;
  font-size: 0.875rem;
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  padding: 8px 16px;
  font-size: 0.875rem;
}

.btn-ghost:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-sm { padding: 6px 12px; font-size: 0.8125rem; }
.btn-lg { padding: 12px 28px; font-size: 1rem; }
.btn-block { width: 100%; }
</style>
