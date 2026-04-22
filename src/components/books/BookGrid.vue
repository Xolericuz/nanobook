<template>
  <div class="book-grid">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  padding: 20px;
}
</style>