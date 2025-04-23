<script setup>
    import {ref} from 'vue';
    import personalInfoData from '@/assets/data/personal-info.json'; 
    const personalInfo = ref(personalInfoData);
</script>
<template>
    <div class="papers" id="papers">
        <div class="themes">
          <div class="theme item" v-for="paper in personalInfo.featuredPapers" :key="paper.id">
            <a :href="paper.pdfLink" download>
              <img :src="paper.imageSrc" :alt="paper.title" />
              <div class="text">
                <div class="name highlight">{{ paper.title }}</div>
                <div class="desc">{{ paper.keywords }}</div>
              </div>
            </a>
          </div>
        </div>
      </div>
</template>
<style scoped>
  .themes {
    margin-top: 30px;
    display: flex;
    gap: 15px;
}


.theme {
    max-width: 350px;
    border-radius: 10px;
    overflow: hidden;
    width: calc(33.333% );
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.theme img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-bottom: 2px solid #770e1c;
}

.text {
    padding: 15px;
}

.name {
    font-size: 1em;
    margin-bottom: 8px;
}

.desc {
    font-size: 0.85em;
    color: #666;
    display: none;
}

.theme .desc {
    display: flex;
}

.theme:hover {
    transform: scale(1.05);
    cursor: none !important;
}
</style>