<template>
    <div ref="cursor" class="cursor" :style="{ '--size': cursorSize + 'px' }" hidden>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path class="inner"
              d="M25,30a5.82,5.82,0,0,1-1.09-.17l-.2-.07-7.36-3.48a.72.72,0,0,0-.35-.08.78.78,0,0,0-.33.07L8.24,29.54a.66.66,0,0,1-.2.06,5.17,5.17,0,0,1-1,.15,3.6,3.6,0,0,1-3.29-5L12.68,4.2a3.59,3.59,0,0,1,6.58,0l9,20.74A3.6,3.6,0,0,1,25,30Z" />
        <path class="outer"
              d="M16,3A2.59,2.59,0,0,1,18.34,4.6l9,20.74A2.59,2.59,0,0,1,25,29a5.42,5.42,0,0,1-.86-.15l-7.37-3.48a1.84,1.84,0,0,0-.77-.17,1.69,1.69,0,0,0-.73.16l-7.4,3.31a5.89,5.89,0,0,1-.79.12,2.59,2.59,0,0,1-2.37-3.62L13.6,4.6A2.58,2.58,0,0,1,16,3m0-2h0A4.58,4.58,0,0,0,11.76,3.8L2.84,24.33A4.58,4.58,0,0,0,7,30.75a6.08,6.08,0,0,0,1.21-.17,1.87,1.87,0,0,0,.4-.13L16,27.18l7.29,3.44a1.64,1.64,0,0,0,.39.14A6.37,6.37,0,0,0,25,31a4.59,4.59,0,0,0,4.21-6.41l-9-20.75A4.62,4.62,0,0,0,16,1Z" />
      </svg>
    </div>
    </template>
  
  <script>
  export default {
    name: 'SmoothCursorEffect',
    data() {
      return {
        cursorSize: 20, 
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0,
        easingFactor: 0.2,
        animationFrameId: null,
        isMobile: false,
      };
    },
    mounted() {
      this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
      if (!this.isMobile) {
        this.initializeCursor();
        this.startAnimationLoop();
      } else {
        // Hide cursor on mobile
        if (this.$refs.cursor) {
            this.$refs.cursor.hidden = true;
        }
      }
    },
    beforeDestroy() {
      if (!this.isMobile) {
        document.body.removeEventListener('mousemove', this.updateTargetPosition);
        // Removed click listener removal
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }
        // Restore default cursor
        document.body.style.cursor = 'auto';
      }
    },
    methods: {
      initializeCursor() {
        const cursorEl = this.$refs.cursor;
        if (!cursorEl) return;
  
        try {
          const sizeStyle = getComputedStyle(cursorEl).getPropertyValue('--size');
          if (sizeStyle) {
            this.cursorSize = parseInt(sizeStyle, 10) || 20;
          }
        } catch (e) {
          console.error("Cannot read cursor size CSS variable:", e);
        }
  
        cursorEl.removeAttribute("hidden");
        // Hide default cursor
        document.body.style.cursor = 'none';
  
        // Initial position
        this.targetX = window.innerWidth / 2;
        this.targetY = window.innerHeight / 2;
        this.currentX = this.targetX;
        this.currentY = this.targetY;
        this.applyTransform();
  
        // Add mousemove listener
        document.body.addEventListener('mousemove', this.updateTargetPosition, { passive: true });
        // REMOVED click listener: document.body.addEventListener('click', this.handleClick);
      },
  
      updateTargetPosition(event) {
        this.targetX = event.clientX;
        this.targetY = event.clientY;
      },
  
      startAnimationLoop() {
        const animate = () => {
          const dx = this.targetX - this.currentX;
          const dy = this.targetY - this.currentY;
  
          // Apply easing for smooth movement
          this.currentX += dx * this.easingFactor;
          this.currentY += dy * this.easingFactor;
  
          this.applyTransform();
          this.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
      },
  
      applyTransform() {
        if (!this.$refs.cursor) return;
        this.$refs.cursor.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0) rotate(-45deg)`;
      },
    }
  };
  </script>
  
  <style scoped>
  /* Keep cursor styles */
  .cursor .inner {
    fill: var(--cursor-body-color, #F2F5F8); /* Use global variable or default */
  }
  .cursor .outer {
    fill: var(--cursor-outline-color, #59b4f0); /* Use global variable or default */
  }
  .cursor {
    --size: 20px; /* Default size, can be overridden */
    --body-color: #F2F5F8; /* Default body color */
    --outline-color: #b3e0ff; /* Default outline color */
  
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2147483647; /* Highest level */
    width: var(--size);
    height: var(--size);
    transition: opacity 0.3s ease;
    will-change: transform;
    transform-origin: center center;
    /* Adjust margin to center the cursor visually on the pointer */
    /* These might need tuning based on SVG origin if not centered */
     margin-left: calc(var(--size) / -2);
     margin-top: calc(var(--size) / -2);
  
    user-select: none;
    pointer-events: none; /* Allow clicks to pass through */
    cursor: none !important; /* Handled globally by JS now */
  }
  
  .cursor svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  
  </style>