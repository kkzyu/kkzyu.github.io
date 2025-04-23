<template>
    <div
      ref="sparkElementRef"
      class="click-spark-container"
      :style="sparkStyle"
    >
      <svg
        ref="svgRef"
        width="30"
        height="30"
        viewBox="0 0 100 100"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="4"
        :stroke="color"
        transform="rotate(-20)"
      >
        <line
          v-for="i in 8"
          :key="i"
          x1="50"
          y1="30"
          x2="50"
          y2="4"
          stroke-dasharray="30"
          stroke-dashoffset="30"
          style="transform-origin: center"
        />
      </svg>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, nextTick } from 'vue';
  
  // --- Props ---
  const props = defineProps({
    // Color for the spark lines
    color: {
      type: String,
      default: 'currentColor', // Default to parent's text color
    },
    // Position from parent (set via style in parent)
    // Optional: Could pass x/y as props if preferred
  });
  
  // --- Refs ---
  const svgRef = ref(null); // Ref for the SVG element
  const sparkElementRef = ref(null); // Ref for the root div
  

  const animateSpark = () => {
    if (!svgRef.value) return; // Guard clause
  
    const sparks = [...svgRef.value.children];
    if (!sparks.length) return; // No lines to animate
  
    const size = parseInt(sparks[0].getAttribute('y1')); // Get length from y1 attribute (30)
    const offset = size / 2 + 'px';
  
    const keyframes = (i) => {
      const deg = `calc(${i} * (360deg / ${sparks.length}))`; // Calculate rotation for each spark
  
      return [
        {
          strokeDashoffset: size * 3, // Start further out
          transform: `rotate(${deg}) translateY(${offset})`, // Rotate and move outward
        },
        {
          strokeDashoffset: size, // Animate back to original dash offset
          transform: `rotate(${deg}) translateY(0)`, // Rotate and move inward to final position
        },
      ];
    };
  
    const options = {
      duration: 660,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      fill: 'forwards', // Keep the final state
    };
  
    sparks.forEach((spark, i) => spark.animate(keyframes(i), options));
  };
  
  // --- Expose Method ---
  // Make the animateSpark function callable from the parent component
  defineExpose({
    animate: animateSpark,
    element: sparkElementRef, // Expose element ref if parent needs dimensions
  });
  </script>
  
  <style scoped>
  .click-spark-container {
    position: absolute; /* Needed for positioning via top/left */
    top: 0;
    left: 0;
    pointer-events: none; /* Allows clicks to pass through */
    /* Ensure it's above other content if necessary */
    z-index: 9999;
    /* Start hidden or off-screen until positioned */
    opacity: 0;
  }
  /* Scoped styles for the SVG inside the component */
  svg {
    display: block; /* Prevents potential extra space below */
  }
  
  /* Removed :host styles as they are applied to the root .click-spark-container */
  </style>