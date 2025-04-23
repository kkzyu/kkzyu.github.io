<script setup>
    import { ref } from 'vue';
    import personalInfoData from '@/assets/data/program-info.json';
    const personalInfo = ref(personalInfoData);
</script>
<template>
      <div class="programs" id="programs" v-if="personalInfo.projects && personalInfo.projects.length > 0">
        <div class="themes demo--justify-space-evenly">
          <div class="theme item" v-for="project in personalInfo.projects" :key="project.id">
            
            <router-link :to="project.link" class="project-link">
               <img :src="project.imageSrc" :alt="project.title" />
              <div class="text">
                <div class="name highlight">{{ project.title }}</div>
              </div>
            </router-link>
          </div>
        </div>
        <div class="summary bold highlight" v-if="personalInfo.projectsClosingRemark">
          更多项目正在开发中，敬请期待！
        </div>
      </div>
       <div v-else class="summary highlight">
         暂无项目展示。
       </div>
</template>
<style scoped>
.theme {
    max-width: 350px;
    border-radius: 10px;
    overflow: hidden;
    width: calc(33.333% - 20px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.theme img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-bottom: 2px solid #770e1c;
}

.themes {
    margin-top: 30px;
    display: flex;
    gap: 5px;
}
.project-link {
    display: block; 
    text-decoration: none; 
    color: inherit; 
}
.demo--justify-space-evenly {
    justify-content: space-evenly;
}

.theme:hover{
    transform: scale(1.05);
}
.text {
    padding: 15px;
    text-align: center;
}

</style>