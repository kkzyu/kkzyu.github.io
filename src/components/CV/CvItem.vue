<!-- CvItem.vue -->
<template>
    <div class="cv-item">
      <template v-if="isComplexItem">
        <h3 class="item-title">{{ item.title }}</h3>
        <p class="item-content">{{ item.content }}</p>
      </template>
      <p v-else class="simple-item">{{ item }}</p>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      item: {
        type: [Object, String],
        required: true
      }
    },
    computed: {
      isComplexItem() {
        return typeof this.item === 'object'
      }
    }
  }
  </script>
  
  <style scoped>
  .item-title {
    font-weight: 600;
    color: #34495e;
    margin-bottom: 0.5rem;
  }
  
  .item-content {
    line-height: 1.6;
    color: #7f8c8d;
    margin-left: 1rem;
  }
  
  .simple-item {
    line-height: 1.6;
    margin-left: 1rem;
    color: #34495e;
  }
  </style>