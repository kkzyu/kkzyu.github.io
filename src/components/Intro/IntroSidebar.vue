<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue';
    import personalInfoData from '@/assets/data/personal-info.json'; 
    import wordCloudData from '@/assets/data/word_frequency.json';
    import * as Utils from '@/assets/utils/pageUtils'; 

    const personalInfo = ref(personalInfoData);
    let scrollListener = null; 


    onMounted(async () => {
    scrollListener = Utils.setupSmoothScrollAndHighlight('.nav-link', '.main-content > [id], .publications > .topic-1 > [id]'); // Pass selectors
    try {
        if (wordCloudData && wordCloudData.default) {
        Utils.drawWordCloud(wordCloudData.default.words, 'word-cloud'); // Pass ID
        } else {
            console.warn("Default word cloud data not found.");
            Utils.drawWordCloud([], 'word-cloud');
        }
    } catch (error) {
        console.error('Error loading or drawing word cloud:', error);
        Utils.drawWordCloud([], 'word-cloud'); // Draw empty on error
    }
    });

    onBeforeUnmount(() => {
    if (scrollListener) {
        window.removeEventListener('scroll', scrollListener);
    }
    });

    // --- Methods ---
    const toggleSidebarHandler = () => {
    Utils.toggleSidebar('sidebar'); // Pass the ID of the sidebar
    };
</script>

<template>
    
      <h2>快速导航</h2>
      <ul class="nav-list">
         <li v-for="nav in personalInfo.sidebar.quickNav.filter(n => !n.children)" :key="nav.href">
          <a :href="nav.href" class="nav-link">{{ nav.text }}</a>
        </li>
         <li v-for="nav in personalInfo.sidebar.quickNav.filter(n => n.children)" :key="nav.href">
          <a :href="nav.href" class="nav-link">{{ nav.text }}</a>
          <ul>
             <li v-for="subNav in nav.children" :key="subNav.href">
               <a :href="subNav.href" class="nav-link">{{ subNav.text }}</a>
             </li>
          </ul>
        </li>
      </ul>
      <h2>作品关键词</h2>
      <div class="word-cloud">
         <svg id="word-cloud" width="300" height="200"></svg>
      </div>

</template>
<style scoped>


.nav-list {
    list-style: none;
    padding: 0;
    margin-top: 20px;
}

.nav-list li {
    margin: 12px 0;
    list-style: none;
}

.nav-list a {
    color: #333;
    text-decoration: none;
    padding: 6px 15px;
    border-radius: 4px;
    display: block;
    transition: 0.2s;
    font-size: 15px;
}

.nav-list a:hover,
.nav-list a.active {
    background: #f8f9fa;
    color: #770e1c;
    /* border-left: 3px solid #770e1c; */
    margin-left: -15px;
    padding-left: 25px;
    cursor: none !important;
}

/* 词云容器样式 */
.word-cloud {
    margin-top: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 10px;
    transition: all 0.3s ease;
}

#word-cloud text {
    cursor: default;
    transition: all 0.2s ease;
}

#word-cloud text:hover {
    fill: #ff6b6b;
    transform: scale(1.1);
}

</style>