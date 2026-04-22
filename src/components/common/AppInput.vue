<template>
  <div class="app-input" :class="{ focused, error }">
    <label v-if="label">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="focused = true"
      @blur="focused = false"
    />
    <span v-if="error" class="error-msg">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const focused = ref(false)
</script>

<style scoped lang="scss">
.app-input {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  input {
    background: var(--bg-card);
    border: 1px solid transparent;
    border-radius: 12px;
    padding: 14px 16px;
    color: var(--text-main);
    font-size: 16px;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--accent-cyan);
      box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.1);
    }
  }

  &.focused input {
    border-color: var(--accent-cyan);
  }

  &.error input {
    border-color: #ff4444;
  }

  .error-msg {
    font-size: 12px;
    color: #ff4444;
  }
}
</style>