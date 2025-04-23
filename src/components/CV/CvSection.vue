
<template>
    <section class="cv-section">
      <h2 class="section-title">{{ section.title }}</h2>
      <div 
        v-for="(item, index) in section.items" 
        :key="index" 
        class="section-item"
      >
        <CvItem :item="item" />
      </div>
    </section>
  </template>
  
  <script>
  import CvItem from './CvItem.vue'
  
  export default {
    components: { CvItem },
    props: {
      section: {
        type: Object,
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
  .section-title {
    font-size: 1.8rem;
    color: #2c3e50;
    border-bottom: 2px solid #f0d6f7;
    padding-bottom: 0.5rem;
    margin: 2rem 0 1.5rem;
  }
  
  .section-item {
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 768px) {
    .section-title {
      font-size: 1.5rem;
    }
  }
  </style>