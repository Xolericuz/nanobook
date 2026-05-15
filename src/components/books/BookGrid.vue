<script setup lang="ts">
</script>

<template>
  <div class="book-grid">
    <slot />
  </div>
</template>

<style scoped>
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

@media (max-width: 768px) {
  .book-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>
