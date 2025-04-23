<script setup>
    import { ref } from 'vue';
    import personalInfoData from '@/assets/data/personal-info.json'; 
    const personalInfo = ref(personalInfoData);
</script>
<template>
    <div class="info">
      {{ personalInfo.status }}
      <div>
        {{ personalInfo.school }} (<a :href="personalInfo.schoolLink" target="_blank" rel="noopener noreferrer">ZJU SOM</a>)
      </div>
      <div>
        {{ personalInfo.major }}
      </div>
    </div>
</template>
<style scoped>
    .info {
    /* flex: 0 0 auto; */
    text-align: right;
    padding-left: 30px;
    margin-left: auto;
    margin-top: 35px;
}
</style>
