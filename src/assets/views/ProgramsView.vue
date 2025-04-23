<template>
    <HeadAbout />
  
    <div class="background">
      <ProSummary />
      <ProHref />
    </div>
  </template>
  
  <script setup>
  import HeadAbout from '@/components/Head/HeadAbout.vue';
  import ProSummary from '@/components/Programs/ProSummary.vue';
  import ProHref from '@/components/Programs/ProHref.vue';
  </script>
  
  <style scoped>
  .background{
    flex-direction: column;
    background-color: white;
    padding: 20px 0 50px 0;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08); /* Slightly stronger shadow */
    margin: 10px 20px 10px 20px;
}
</style>
 