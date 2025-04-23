<script setup>
    import { ref } from 'vue';
  // Import the *complete* personal info data
    import personalInfoData from '@/assets/data/program-info.json';
    const personalInfo = ref(personalInfoData);
</script>
<template>
      <div class="main-content">
         <div v-if="personalInfo.summary">
            <p><span class="bold">主修课程：</span><span class="highlight">{{ personalInfo.summary.majorCourses.join('、') }}</span></p>
            我最近的努力方向：
          </div>
          <div v-if="personalInfo.summary">
            <p class="bold center">{{ personalInfo.summary.currentGoals.join('；') }}</p>
          </div>
          <div>
             点击查看我在学校web程序设计时创作的小项目——
          </div>
      </div>
</template>
<style scoped>
    .background{
    flex-direction: column;
    background-color: white;
    padding-bottom: 50px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08); /* Slightly stronger shadow */
    margin: 10px 20px 10px 20px;
}
.main-content{
    margin: 10px 100px 0 100px;

}
.about {
    display: flex;
    gap: 20px;
    margin-left: 100px;
    margin-right: 100px;
    margin-bottom: 30px;
}

.avatar {
    display: flex;
    align-items: center;
    gap: 30px;
    flex: 1;
    /* min-width: 400px; */
}

.portrait {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
}

.contacts {
    margin-top: 5px;
    display: flex;
    gap: 5px;
}

.icon {
    width: 24px;
    height: 24px;
    transition: opacity 0.3s;
}

.icon:hover {
    opacity: 0.7;
}

.info {
    /* flex: 0 0 auto; */
    text-align: right;
    padding-left: 30px;
    margin-left: auto;
    margin-top: 35px;
}
.summary {
    /* margin-top: 20px; */
    padding-top: 20px;
    padding-bottom: 20px;
    margin-left: 50px;
}
</style>