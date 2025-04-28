<template>
  <div class="cv-container" ref="cvContainerRef">

    <a-card :bordered="false" class="header-card" v-if="cvData.personalInfo">
      <template #extra>
        <a-dropdown :trigger="['click']">
          <a-button type="text">
            <global-outlined /> {{ currentLang === 'cn' ? '中文' : 'English' }}
          </a-button>
          <template #overlay>
            <a-menu @click="handleLangChange">
              <a-menu-item key="cn"><check-outlined v-if="currentLang === 'cn'" /> 中文</a-menu-item>
              <a-menu-item key="en"><check-outlined v-if="currentLang === 'en'" /> English</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>

      <a-row :gutter="16" align="middle">
        <a-col :xs="24" :sm="6" style="text-align: center;">
          <a-avatar :size="120" :src="cvData.personalInfo.avatar || defaultAvatar" />
        </a-col>
        <a-col :xs="24" :sm="18">
          <h1>{{ cvData.personalInfo.name }}</h1>
          <a-tag v-if="cvData.personalInfo.title" color="blue">{{ cvData.personalInfo.title }}</a-tag>
          <div class="contact-info" style="margin-top: 8px;">
            <span v-if="cvData.personalInfo.phone"><phone-outlined /> {{ cvData.personalInfo.phone }}</span>
            <span v-if="cvData.personalInfo.email" style="margin-left: 16px;"><mail-outlined /> {{ cvData.personalInfo.email }}</span>
            <span v-if="!cvData.personalInfo.phone && !cvData.personalInfo.email && cvData.personalInfo.contact">{{ cvData.personalInfo.contact }}</span>
          </div>
        </a-col>
      </a-row>
    </a-card>


    <a-collapse v-model:activeKey="activeSections" accordion style="margin-top: 2rem;">
       <a-collapse-panel v-for="(section, key) in cvData.sections" :key="key" :header="section.title">
        <div v-if="section.content" v-html="section.content"></div>

        <ul v-else-if="Array.isArray(section.items) && typeof section.items[0] === 'string'">
            <li v-for="(item, index) in section.items" :key="index">{{ item }}</li>
        </ul>

        <a-timeline v-else-if="section.type === 'experience' && Array.isArray(section.items)">
          <a-timeline-item v-for="item in section.items" :key="item.id || item.time">
             <strong>{{ item.time }} - {{ item.company }}</strong>
             <div style="font-weight: 500;">{{ item.position }}</div>
            <p v-if="item.description">{{ item.description }}</p>
          </a-timeline-item>
        </a-timeline>

         <div v-else-if="Array.isArray(section.items) && typeof section.items[0] === 'object' && section.items[0].title !== undefined">
             <div v-for="(item, index) in section.items" :key="index" style="margin-bottom: 1rem;">
                <h4 style="margin-bottom: 0.25rem;">{{ item.title }}</h4>
                <p style="margin-left: 1rem;">{{ item.content }}</p>
             </div>
        </div>

        <div v-else>
            <p v-for="(item, index) in section.items" :key="index">{{ JSON.stringify(item) }}</p>
        </div>
      </a-collapse-panel>
    </a-collapse>

    <a-card v-if="cvData.skills && cvData.skills.length" title="技术技能" class="skill-card" style="margin-top: 2rem;">
       <div v-for="skill in cvData.skills" :key="skill.name" style="margin-bottom: 1rem;">
        <div class="skill-name">{{ skill.name }}</div>
         <a-progress :percent="skill.level" :stroke-color="skill.color || '#1890ff'"
          :status="skill.certified ? 'success' : 'normal'" />
      </div>
    </a-card>

    <a-spin :spinning="isDownloadingPdf" tip="正在生成 PDF..." size="large" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;">
    </a-spin>
    <a-float-button-group shape="circle" :style="{ right: '24px', bottom: '100px' }">
      <a-float-button tooltip="下载PDF" @click="downloadPDF" :disabled="isDownloadingPdf">
        <template #icon><download-outlined /></template>
      </a-float-button>
      <a-float-button tooltip="分享" @click="shareCV">
        <template #icon><share-alt-outlined /></template>
      </a-float-button>
    </a-float-button-group>

    <a-comment style="margin-top: 3rem;">
      <template #avatar>
         <a-avatar src="/images/kkz.jpg" alt="User Avatar" />
      </template>
      <template #content>
        <a-form-item>
          <a-textarea :rows="4" v-model:value="commentContent" placeholder="欢迎给我留言~" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="submitComment">提交留言</a-button>
        </a-form-item>
      </template>
    </a-comment>

  </div>
</template>

<script>
// Import necessary components from Ant Design Vue and Icons
import {
  Dropdown as ADropdown,
  Button as AButton,
  Menu as AMenu,
  MenuItem as AMenuItem,
  Card as ACard,
  Row as ARow,
  Col as ACol,
  Avatar as AAvatar,
  Tag as ATag,
  Collapse as ACollapse,
  CollapsePanel as ACollapsePanel,
  Timeline as ATimeline,
  TimelineItem as ATimelineItem,
  Progress as AProgress,
  FloatButtonGroup as AFloatButtonGroup,
  FloatButton as AFloatButton,
  Comment as AComment,
  FormItem as AFormItem,
  Textarea as ATextarea,
  Spin as ASpin, // Import Spin for loading indicator
  message // Import message for feedback
} from 'ant-design-vue';
import {
  GlobalOutlined, CheckOutlined, PhoneOutlined,
  MailOutlined, DownloadOutlined, ShareAltOutlined
} from '@ant-design/icons-vue';

// Import your CV data
import cvDataStructure from '@/assets/data/cv-info.json'; // Adjust path if needed
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
  name: 'CvPage', // Optional: Define component name
  components: {
    // Register Ant Design components
    ADropdown, AButton, AMenu, AMenuItem, ACard, ARow, ACol, AAvatar, ATag,
    ACollapse, ACollapsePanel, ATimeline, ATimelineItem, AProgress,
    AFloatButtonGroup, AFloatButton, AComment, AFormItem, ATextarea, ASpin,
    // Register Icons
    GlobalOutlined, CheckOutlined, PhoneOutlined,
    MailOutlined, DownloadOutlined, ShareAltOutlined
  },
  data() {
    return {
      currentLang: 'cn', // Default language
      // Initialize activeKey for collapse - can be empty array or default open section key
      activeSections: [], // Or e.g., ['education'] if 'education' is a key in your sections
      commentContent: '', // For the comment textarea
      defaultAvatar: '/images/kkz.jpg', // Default avatar if none provided
      isDownloadingPdf: false
    }
  },
  computed: {
    // Computed property to get the CV data based on the current language
    cvData() {
      // Ensure the structure cvDataStructure.cv[this.currentLang] exists
      return cvDataStructure.cv && cvDataStructure.cv[this.currentLang]
             ? cvDataStructure.cv[this.currentLang]
             : { personalInfo: {name:'CV'}, sections: {}, skills: [] }; // Return empty structure if data is missing
    }
  },
  methods: {
    // Method to handle language change from the dropdown menu
    handleLangChange(info) {
       // info.key contains the key of the clicked menu item ('cn' or 'en')
      this.currentLang = info.key;
      // Optionally reset active sections or perform other actions on lang change
      this.activeSections = [];
    },
    // Placeholder method for downloading PDF
    async downloadPDF() {
      if (this.isDownloadingPdf) return; // Prevent multiple clicks
      this.isDownloadingPdf = true;
      message.loading({ content: '正在生成PDF...', key: 'pdf', duration: 0 }); // Show loading message

      // Get the element to capture. Use 'ref' on the container.
      const cvElement = this.$refs.cvContainerRef; // Make sure you added ref="cvContainerRef" to the main div

      if (!cvElement) {
        message.error({ content: '无法找到CV内容元素', key: 'pdf', duration: 2 });
        this.isDownloadingPdf = false;
        return;
      }

      try {
          // Options for html2canvas (increase scale for better resolution)
          const canvasOptions = {
              scale: 2, // Increase scale for better quality
              useCORS: true, // If you have images from other origins
              logging: false,
          };

          const canvas = await html2canvas(cvElement, canvasOptions);
          const imgData = canvas.toDataURL('image/png');

          // Calculate PDF dimensions (using A4 size: 210mm x 297mm)
          const pdfWidth = 210;
          const pdfHeight = 297;
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

          // Adjust image size to fit within PDF page width (with small margins)
          const imgFinalWidth = imgWidth * ratio * 0.95; // 95% width to add margin
          const imgFinalHeight = imgHeight * ratio * 0.95;

          // Calculate centering position
          const positionX = (pdfWidth - imgFinalWidth) / 2;
          const positionY = 10; // Top margin

          // Create PDF instance (portrait, mm, a4)
          const pdf = new jsPDF('p', 'mm', 'a4');

          // Add image to PDF
          // Note: For multi-page content, this needs more complex logic to split the canvas
          pdf.addImage(imgData, 'PNG', positionX, positionY, imgFinalWidth, imgFinalHeight);

          // Generate filename
          const filename = `CV_${this.cvData.personalInfo.name.replace(/ /g, '_')}_${this.currentLang}.pdf`;

          // Save the PDF
          pdf.save(filename);

          message.success({ content: 'PDF已成功下载!', key: 'pdf', duration: 2 });

      } catch (error) {
          console.error("Error generating PDF:", error);
          message.error({ content: '生成PDF时出错', key: 'pdf', duration: 2 });
      } finally {
          this.isDownloadingPdf = false; // Reset loading state
      }
    },
    // Placeholder method for sharing CV
    async shareCV() {
      const shareData = {
        title: `简历: ${this.cvData.personalInfo?.name || '在线CV'}`,
        text: `查看 ${this.cvData.personalInfo?.name || '我'} 的在线简历`,
        url: window.location.href, // Use the current page URL
      };

      try {
        if (navigator.share) {
          // Use Web Share API if available
          await navigator.share(shareData);
          console.log('CV shared successfully via Web Share API');
          message.success('已成功分享!');
        } else if (navigator.clipboard) {
          // Fallback: Copy link to clipboard if Web Share API is not available
          await navigator.clipboard.writeText(shareData.url);
          console.log('CV link copied to clipboard');
          message.success('简历链接已复制到剪贴板!');
        } else {
          // If neither is available
          message.info('您的浏览器不支持分享或复制链接功能。');
        }
      } catch (error) {
        console.error('Error sharing CV:', error);
        // Don't show error message if user cancels share dialog ('AbortError')
        if (error.name !== 'AbortError') {
          message.error('分享时出错，请稍后重试。');
        }
      }
    },

    // Placeholder method for submitting comment
    submitComment() {
        console.log('Submit comment:', this.commentContent);
        if(!this.commentContent.trim()){
            message.warning('请输入留言内容 (Please enter a comment)');
            return;
        }
        message.success('留言已提交 (待处理) (Comment submitted (pending))');
        // Add actual comment submission logic here (e.g., API call)
        this.commentContent = ''; // Clear textarea after submission
    }
  },
  // Optional: Set initial active collapse panel when component mounts
  mounted() {
    // Open the first section by default if sections exist
    if (this.cvData.sections && Object.keys(this.cvData.sections).length > 0) {
        this.activeSections = [Object.keys(this.cvData.sections)[0]];
    }
  },
   getInitialActiveSections() {
    const sections = this.cvData.sections || {};
    const keys = Object.keys(sections);
    
    // 规则1：始终展开第一项
    if (keys.length === 0) return [];
    
    // 规则2：如果只有1-3个板块，全部展开
    if (keys.length <= 3) return keys;
    
    // 规则3：多于3个板块时，只展开第一个和包含"经验"的板块
    return keys.filter(key => 
      key === keys[0] || 
      key.toLowerCase().includes('experience') || 
      key.toLowerCase().includes('经验')
    );
  },
  
  // 记录用户手动操作
  handlePanelChange(activeKeys) {
    activeKeys.forEach(key => {
      this.manualToggleStates[key] = true;
    });
    Object.keys(this.cvData.sections).forEach(key => {
      if (!activeKeys.includes(key)) {
        this.manualToggleStates[key] = false;
      }
    });
  }
}
</script>

<style scoped>
.cv-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f9f9f9; /* Light background for contrast */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-card {
  margin-bottom: 2rem; /* Add space below header */
  background-color: #fff; /* White background for header card */
}

.contact-info span {
  margin-right: 16px; /* Space between contact items */
  display: inline-flex; /* Align icon and text */
  align-items: center;
  gap: 6px; /* Space between icon and text */
  color: #555; /* Slightly muted color for contact info */
}

.skill-card {
  background-color: #fff; /* White background for skills card */
}

.skill-name {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

/* Style adjustments for responsiveness */
@media (max-width: 768px) {
  .cv-container {
    padding: 1rem;
  }
  .header-card .ant-col {
      text-align: center; /* Center avatar and text on smaller screens */
  }
  .header-card h1 {
      font-size: 1.8rem; /* Smaller heading on mobile */
      margin-top: 1rem; /* Add space above name when stacked */
  }
   .contact-info span {
      display: block; /* Stack contact info on small screens */
      margin-right: 0;
      margin-bottom: 8px;
   }
}

/* Ensure Ant Design styles are properly loaded globally or scoped */
/* Example: You might need to import Ant Design CSS in your main.js */
/* import 'ant-design-vue/dist/reset.css'; */

/* Add specific styles for list items generated from simple strings */
ul {
    list-style-type: disc; /* Standard bullet points */
    padding-left: 20px; /* Indentation for list items */
    margin-top: 0.5rem;
}
li {
    margin-bottom: 0.5rem; /* Space between list items */
    line-height: 1.6; /* Improve readability */
}

/* Add styles for complex item titles/content if needed */
h4 {
    color: #333;
}
p {
    color: #666;
}
</style>