<script setup>
    import {ref} from 'vue';
    import personalInfoData from '@/assets/data/personal-info.json'; 
    const personalInfo = ref(personalInfoData);
</script>
<template>
    <div class="publications demo--flex-direction-column">
    <h3 id="publications">作品速览</h3>

    <div v-for="topic in personalInfo.publications" :key="topic.topicId" class="topic-1 item">
      <p class="highlight bold" :id="topic.topicId">{{ topic.topicName }}</p>

      <div v-for="pub in topic.items" :key="pub.id || pub.title" class="publication">
         <a :href="pub.pdfLink || pub.docLink" download>
            <div class="thumbnail">
              <img :src="pub.thumbnailSrc" :alt="pub.title" />
            </div>
            <div class="information">
              <div class="bold highlight">
                {{ pub.title }}
              </div>
               <div class="authors" v-if="pub.authors && pub.authors.length">
                 <span v-for="(author, index) in pub.authors" :key="author" :class="{ 'bold': index === 0 }">
                   {{ author }}{{ index < pub.authors.length - 1 ? ', ' : '' }}
                 </span>
              </div>
               <div class="venue">
                <!-- <span v-if="pub.description" class="bold">keywords</span>: {{ pub.description }} -->
                <span v-if="pub.keywords" class="bold">关键词</span>: {{ pub.keywords }}
                 <span v-if="pub.excerpt">{{ pub.excerpt }}</span>
              </div>
               <div class="download-option demo--flex-direction-row">
                 <a v-if="pub.githubLink" :href="pub.githubLink" target="_blank" rel="noopener noreferrer" @click.stop>
                   <i class="icon-github item"></i>
                 </a>
                 <a v-if="pub.pdfLink" :href="pub.pdfLink" download @click.stop> <i class="icon-file item"></i>&nbsp;&nbsp;
                 </a>
                 <a v-if="pub.docLink" :href="pub.docLink" download @click.stop>
                   <i class="icon-file item"></i>
                 </a>
                  <a v-if="pub.pptxLink" :href="pub.pptxLink" download @click.stop>
                   <i class="icon-file item"></i></a>
              </div>
            </div>
         </a>
      </div>
    </div>
  </div>
</template>
<style scoped>
.publications {
    padding:50px 50px 0px 50px;
}

.publications h3 {
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.publications .topic-1 {
    margin-bottom: 30px;
    margin-left: 20px;
}

.publications .topic-1>p.highlight.bold {
    font-size: 1.2em;
    margin-bottom: 15px;
    color: #770e1c;
    /* Highlight topic title */
}

.publication {
    display: flex;
    gap: 30px;
    /* Space between thumbnail and info */
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    /* Separator */
    padding-bottom: 20px;
    padding-left: 20px;
    padding-top: 10px;
}

.publication:last-child {
    border-bottom: none;
    /* Remove border for the last item in a topic */
    margin-bottom: 0;
    padding-bottom: 0;
}

.publication a {
    text-decoration: none;
    display: flex;
    /* Ensure link wrapper works correctly */
    width: 100%;
}
.publication a:hover {
    color: #e1734a;
    /* Highlight color on hover */
}
.publication .thumbnail img {
    width: 180px;
    /* Adjust thumbnail size */
    height: 160px;
    /* Maintain aspect ratio */
    max-height: 120px;
    /* Optional max height */
    object-fit: cover;
    /* Crop if needed */
    border: 1.5px solid #f0f0f0;
}

.publication .information {
    flex-grow: 1;
    padding-left: 25px;
}

.publication .information .bold.highlight {
    font-size: 1.1em;
    margin-bottom: 5px;
    display: block;
    /* Ensure it takes full width */
}

.publication .authors {
    font-size: 0.9em;
    color: #555;
    margin-bottom: 8px;
}

.publication .venue {
    font-size: 0.9em;
    color: #777;
    margin-bottom: 10px;
    line-height: 1.5;
}

.publication .download-option {
    display: flex;
    gap: 15px;
    /* Space between icons */
    align-items: center;
}

.publication .download-option a {
    display: inline-block;
    /* Reset display for icon links */
    width: auto;
}

.publication .download-option .item {
    font-size: 1.5em;
    /* Adjust icon size via font-size for font icons */
    color: #777;
    transition: color 0.3s ease;
}

.publication .download-option a:hover .item {
    color: #e1734a;
    /* Highlight color on hover */
}

/* Add styles for icon classes (icon-file, icon-github) if using FontAwesome or similar */
/* Example placeholder if using pseudo-elements */
.icon-github::before {
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath d='M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z' fill='%23616161'/%3E%3C/svg%3E");
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    margin-right: -5px; 
}
.icon-file::before {
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z' fill='%23616161'/%3E%3C/svg%3E");
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    margin-left: -5px; 
}
</style>