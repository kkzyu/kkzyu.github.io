<template>
  <!-- <HeadAbout /> -->
  <div class="cv-container">
    <LanguageSwitcher :current-lang="currentLang" @lang-change="handleLangChange" />
    <CvHeader :personal-info="cvData.personalInfo" />
    <main class="cv-main">
      <CvSection 
        v-for="(section, key) in cvData.sections" 
        :key="key"
        :section="section"
      />
    </main>
  </div>
</template>

<script>
// import HeadAbout from '@/components/Head/HeadAbout.vue'
import LanguageSwitcher from '@/components/CV/LanguageSwitcher.vue'
import CvHeader from '@/components/CV/CvHeader.vue'
import CvSection from '@/components/CV/CvSection.vue'
import cvData from '@/assets/data/cv-info.json'

export default {
  components: {
    // HeadInfo,
    LanguageSwitcher,
    CvHeader,
    CvSection
  },
  data() {
    return {
      currentLang: 'cn'
    }
  },
  computed: {
    cvData() {
      return this.currentLang === 'cn' ? cvData.cv.cn : cvData.cv.en
    }
  },
  methods: {
    handleLangChange(lang) {
      this.currentLang = lang
    }
  }
}
</script>

<style scoped>
.cv-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.cv-main {
  margin-top: 2rem;
}

</style>