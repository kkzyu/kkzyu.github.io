<!-- CvHeader.vue -->
<template>
    <header class="cv-header">
      <h1>{{ personalInfo.name }}</h1>
      <p>{{ personalInfo.contact }}</p>
    </header>
  </template>
  
  <script>
  export default {
    props: {
      personalInfo: {
        type: Object,
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
  .cv-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    font-family: 'Arial', sans-serif;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
  }
  </style>