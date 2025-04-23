<script setup>
    import {ref} from 'vue';
    import personalInfoData from '@/assets/data/personal-info.json'; 
    const personalInfo = ref(personalInfoData);
</script>
<template>
    <div class="summary" id="summary">
        <div>
          <p><span class="bold">主修课程：</span><span class="highlight">{{ personalInfo.summary.majorCourses.join('、') }}</span></p>
          我最近的努力方向：
        </div>
        <div>
          <p class="bold center">{{ personalInfo.summary.currentGoals.join('；') }}</p>
        </div>
        <div>
          点击预览我最近的参与撰写的论文——
        </div>
    </div>
</template>
<style scoped>
    
.main-content {
    flex-direction: column;
    /* flex: 1; */
    padding: 20px 50px;
    max-width: calc(100% - 240px);
    transition: 0.3s;
}

#sidebar.hidden + .main-content {
    padding-left: 100px;
    margin-left: 0;
}
.summary {
    padding-top: 30px;
    padding-bottom: 20px;
    margin-left: 50px;
}

</style>