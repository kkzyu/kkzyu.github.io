<!-- LanguageSwitcher.vue -->
<template>
    <div class="language-switcher">
      <button
        v-for="lang in languages"
        :key="lang.value"
        @click="handleClick(lang.value)"
        :class="{ active: currentLang === lang.value }"
      >
        {{ lang.label }}
      </button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      currentLang: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        languages: [
          { value: 'cn', label: '中文' },
          { value: 'en', label: 'English' }
        ]
      }
    },
    methods: {
      handleClick(lang) {
        this.$emit('lang-change', lang)
      }
    }
  }
  </script>
  
  <style scoped>
  .language-switcher {
    margin-bottom: 2rem;
    text-align: right;
  }
  
  button {
    padding: 0.5rem 1rem;
    margin-left: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    background: white;
    transition: all 0.3s;
  }
  
  button.active {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 50px;
    background: #f0d6f7;
    color: #8a4f7d;
    font-family: 'Comic Neue', cursive;
    font-weight: bold;
    box-shadow: 0 4px 8px rgba(220, 180, 220, 0.3);
  }
  </style>