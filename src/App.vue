<template>
  <div id="app" @click="handleAppClick">
    
    <CursorEffect />

    <ClickSpark
      ref="clickSparkRef"
      :style="sparkPositionStyle"
      :color="sparkColor"
      v-show="showSpark"
    />

    <div class="content">
      <div id="header">
        <h3 class="bold">Alanniido @ ZJU</h3>
        <nav class="header-nav">
          <router-link to="/" class="nav-item">IDOweb</router-link>
          <router-link to="/cv" class="nav-item">CV</router-link>
          <router-link to="/programs" class="nav-item">Programs</router-link>
          <router-link to="/blog">Blog</router-link>
        </nav>
      </div>

      <router-view></router-view>

      <a href="#top" id="back-to-top" title="返回顶部">&nbsp;<span class="bold">𖤂</span>&nbsp;</a>
    </div>

    <div id="top"></div>
  </div>
</template>

<script setup>
// Use <script setup> for Composition API
import { ref, computed, nextTick } from 'vue';
import CursorEffect from '@/components/Cursor/CursorEffect.vue'; // Import CursorEffect
import ClickSpark from '@/components/Cursor/ClickSpark.vue'; // Import ClickSpark

// --- State Refs for ClickSpark ---
const sparkColor = ref('#b3e0ff'); // Initial spark color
const sparkX = ref(0); // X coordinate for the spark
const sparkY = ref(0); // Y coordinate for the spark
const showSpark = ref(false); // Control visibility
const clickSparkRef = ref(null); // Ref to access the ClickSpark component instance

// --- Computed Style for Positioning ClickSpark ---
const sparkPositionStyle = computed(() => {
  const sparkWidth = 30; // Spark dimensions
  const sparkHeight = 30;
  return {
    left: `${sparkX.value - sparkWidth / 2}px`,
    top: `${sparkY.value - sparkHeight / 2}px`,
    opacity: showSpark.value ? 1 : 0,
  };
});


const handleAppClick = async (event) => {

  sparkX.value = event.pageX; 
  sparkY.value = event.pageY;

  showSpark.value = true;
  await nextTick();

  // 4. Trigger the animation on the ClickSpark component instance
  if (clickSparkRef.value) {
    clickSparkRef.value.animate();
  }
};


</script>

<style>
html, body {
  font-family: 'Comic Sans MS', cursive, sans-serif; /* Or your preferred font */
  background: linear-gradient(135deg, #ffe6f0 0%, #e6f9ff 100%);
  min-height: 100vh;
  font-size: 18px;
  padding: 0; /* Remove body padding if #app handles it */
  margin: 0;
  color: #6a4a7a;
  /* cursor: none !important; */ /* Let CursorEffect handle this */
  position: relative; /* Needed if elements inside use absolute positioning relative to body */
}

/* Make sure #app takes up space for clicking */
#app {
    min-height: 100vh;
    padding: 10px; /* Restore padding here if removed from body */
    position: relative; /* Positioning context for absolute children like color picker */
}


.bold {
  font-weight: bold;
}

.highlighted {
  fill: #ff4d88 !important;
  font-weight: bold;
  text-shadow: 0 0 4px rgba(255, 0, 128, 0.4);
}

.center {
  text-align: center;
}

a {
  color: #696666;
  text-decoration: none;
}

a:hover {
  color: #e1734a;
  cursor: none !important;
  /* Let CursorEffect manage cursor style */
}

.content {
  margin-bottom: 100px; /* Space for back-to-top */
  padding-top: 20px; /* Add space below header */
}


#back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px; /* Adjusted position slightly */
  z-index: 999; /* Below color picker if needed */
  background-color: #b8ebfb;
  color: white;
  padding: 15px;
  border-radius: 50%;
  font-size: 18px;
  text-decoration: none;
  transition: background-color 0.3s, opacity 0.3s, visibility 0.3s;
  opacity: 0; /* Hidden by default */
  visibility: hidden;
}
/* Simple show/hide logic (better with JS Intersection Observer but CSS works) */
/* This requires an element with id="top" at the very top */
html:not(:target) #back-to-top { /* Show when not scrolled to #top */
   opacity: 1;
   visibility: visible;
}


#header {
  border-bottom: 2px solid #e0e0e0;
  margin: 0px 100px 0px 100px; /* Remove bottom margin */
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  /* padding: 15px 20px; Added top/bottom padding */
}

.header-nav {
  display: flex;
  gap: 30px;
}

.nav-item {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: #e1734a;
}

/* Add #top element style if needed, usually just an empty div */
#top {
    position: absolute;
    top: 0;
    left: 0;
    height: 1px; /* Make it occupy minimal space */
}

</style>