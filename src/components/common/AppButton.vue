<template>
  <button class="app-button" :class="[variant, size, { disabled, loading }]" :disabled="disabled" @click="$emit('click')">
    <span v-if="loading" class="loader"></span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped lang="scss">
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background: linear-gradient(135deg, var(--accent-gold), #ff9500);
    color: #000;
    &:hover:not(.disabled) { box-shadow: 0 0 20px var(--accent-glow); }
  }

  &.secondary {
    background: var(--bg-card);
    color: var(--text-main);
    border: 1px solid var(--accent-cyan);
  }

  &.ghost {
    background: transparent;
    color: var(--text-muted);
  }

  &.sm { padding: 8px 16px; font-size: 14px; }
  &.md { padding: 12px 24px; font-size: 16px; }
  &.lg { padding: 16px 32px; font-size: 18px; }

  &.disabled, &:disabled { opacity: 0.5; cursor: not-allowed; }

  .loader {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>