import * as d3 from 'd3'; // Import D3 if installed via npm
import d3Cloud from 'd3-cloud'; // Import d3-cloud if installed via npm
// If using CDN, make sure D3 and d3Cloud are loaded globally before these functions run

/**
 * Toggles the visibility of the sidebar element.
 * Assumes visibility is controlled by adding/removing a 'hidden' class.
 * @param {string} sidebarId - The ID of the sidebar element.
 */
export function toggleSidebar(sidebarId = 'sidebar') {
  const sidebar = document.getElementById(sidebarId);
  if (sidebar) {
    sidebar.classList.toggle('hidden'); // Assumes 'hidden' class controls visibility
  } else {
    console.error(`Sidebar element with ID "${sidebarId}" not found.`);
  }
}

/**
 * Sets up smooth scrolling for navigation links and highlights the active link based on scroll position.
 * @param {string} linkSelector - CSS selector for the navigation links.
 * @param {string} sectionSelector - CSS selector for the content sections to track.
 * @returns {Function | null} The scroll event listener function, or null if setup fails.
 */
export function setupSmoothScrollAndHighlight(linkSelector, sectionSelector) {
  const links = document.querySelectorAll(linkSelector);
  const sections = document.querySelectorAll(sectionSelector);
  const backToTopButton = document.getElementById('back-to-top'); // Get back-to-top button

  if (!links.length || !sections.length) {
    console.warn("Smooth scroll/highlight setup failed: Links or sections not found.");
    return null;
  }

  // Smooth scrolling for nav links
  links.forEach(link => {
    link.addEventListener('click', function (e) {
       // Only prevent default for internal hash links
       if (this.hash && this.hash.startsWith('#')) {
            e.preventDefault();
            const targetId = this.hash.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                 // Optionally close sidebar on mobile after clicking a link
                 // Consider viewport width if sidebar is only collapsible on mobile
                 if (window.innerWidth < 768) { // Example breakpoint
                     const sidebar = document.getElementById('sidebar'); // Assuming default ID
                     if (sidebar && !sidebar.classList.contains('hidden')) {
                         toggleSidebar('sidebar');
                     }
                 }
            }
       }
    });
  });

  // Scroll event listener for highlighting and back-to-top button
  const scrollHandler = () => {
    let currentSectionId = '';
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach(section => {
      // Adjust offset calculation if necessary (e.g., for fixed header height)
      const sectionTop = section.offsetTop - 100; // Offset for activation threshold
      if (scrollPosition >= sectionTop) {
        currentSectionId = section.id;
      }
    });

    // Highlight active link
    links.forEach(link => {
      link.classList.remove('active');
      // Check if the link's hash matches the current section ID
       if (link.hash === `#${currentSectionId}`) {
         link.classList.add('active');
       }
    });

    // Show/hide back-to-top button
    if (backToTopButton) {
      if (scrollPosition > 300) { // Show after scrolling down 300px
        backToTopButton.style.display = 'block';
      } else {
        backToTopButton.style.display = 'none';
      }
    }
  };

  window.addEventListener('scroll', scrollHandler);

   // Initial call to set state correctly on load
   scrollHandler();

  // Return the handler so it can be removed later
  return scrollHandler;
}


/**
 * Fetches word cloud data from a JSON file.
 * @param {string} jsonPath - The path to the word frequency JSON file.
 * @returns {Promise<object>} A promise that resolves with the parsed JSON data.
 */
export async function fetchWordCloudData(jsonPath) {
  try {
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading word cloud data:', error);
    throw error; // Re-throw error to be caught by caller
  }
}


/**
 * Draws a word cloud using D3 and d3-cloud.
 * @param {Array<object>} words - Array of word objects, e.g., [{text: 'word', size: 20}, ...].
 * @param {string} elementId - The ID of the SVG element to draw the cloud in.
 * @param {number} [width=200] - The width of the SVG canvas.
 * @param {number} [height=200] - The height of the SVG canvas.
 */
export function drawWordCloud(words, elementId = "word-cloud", width = 200, height = 200) {
   // Ensure D3 and d3Cloud are available (either from import or global scope)
   if (typeof d3 === 'undefined' || typeof d3Cloud === 'undefined') {
       console.error("D3 or d3-cloud is not loaded. Cannot draw word cloud.");
       return;
   }
  // Clear previous cloud if any
  d3.select(`#${elementId}`).selectAll("*").remove();

   // Normalize word sizes if necessary (example: scale size)
   const maxSize = Math.max(...words.map(w => w.size), 10); // Avoid division by zero
   const sizeScale = d3.scaleLinear()
       .domain([0, maxSize])
       .range([10, 30]); // Min/max font size in pixels

   const layoutWords = words.map(d => ({
       text: d.text,
       size: sizeScale(d.size) // Use scaled size
   }));


  const layout = d3Cloud()
    .size([width, height])
    .words(layoutWords)
    .padding(0.2) // Adjusted padding
    .rotate(() => 0) // No rotation
    .font("Impact") // Ensure this font is available
    .fontSize(d => d.size)
    .on("end", draw); // Callback function when layout is complete

  layout.start();

  // D3 drawing function (called by layout.on("end"))
  function draw(positionedWords) {
    const svg = d3.select(`#${elementId}`)
      .attr("width", width)
      .attr("height", height);

    // Check if SVG element exists
    if (svg.empty()) {
        console.error(`SVG element with ID "${elementId}" not found.`);
        return;
    }

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    g.selectAll("text")
      .data(positionedWords)
      .enter().append("text")
      .style("font-size", d => `${d.size}px`)
      .style("font-family", "Impact")
      .style("fill", "#333") // Base color
      .attr("text-anchor", "middle")
       .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`) // Use layout's x, y, rotate
      .text(d => d.text)
       .style("cursor", "pointer") // Add pointer cursor
       .on("mouseover", function (event, d) {
           // Bring to front
           d3.select(this).raise();
           // Highlight
           d3.select(this)
               .transition()
               .duration(200) // Faster transition
               .style("fill", "#e1734a"); // Highlight color
       })
       .on("mouseout", function (event, d) {
           // Restore original color
           d3.select(this)
               .transition()
               .duration(300)
               .style("fill", "#333"); // Base color
       });
  }
}