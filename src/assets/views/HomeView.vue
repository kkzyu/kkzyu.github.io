<template>
  <HeadAbout />

  <div class="white-background">
    <div id="sidebar">
      <IntroSidebar />
    </div>
    <div class="main-content">
      <IntroSummary />
      <IntroPapers />
    </div>
  </div>

  <PubInfo />
</template>

<script setup>

import HeadAbout from '@/components/Head/HeadAbout.vue';

import IntroSummary from '@/components/Intro/IntroSummary.vue';
import IntroPapers from '@/components/Intro/IntroPapers.vue';
import IntroSidebar from '@/components/Intro/IntroSidebar.vue';

import PubInfo from '@/components/Publication/PubInfo.vue';

</script>
<style scoped>
.white-background {
    background-color: #fff;
    padding: 20px 20px 0px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 20px;
    margin-right: 20px;
    margin-left: 20px;
}
.main-content {
    flex-direction: column;
    padding: 20px 50px;
    max-width: calc(100% - 240px);
    transition: 0.3s;
}
#sidebar {
    width: 250px;
    min-height: 100vh;
    background: rgb(255, 255, 255);
    /* border-right: 2px solid #e0e0e0; */
    padding: 20px 15px;
    position: sticky;
    top: 0;
    transition: 0.3s;
    z-index: 10;
}
</style>

