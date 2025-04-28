import { defineStore } from 'pinia';
import { message } from 'ant-design-vue';
import cvDataStructure from '@/assets/data/cv-info.json';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const useCvStore = defineStore('cv', {
  state: () => ({
    currentLang: 'cn',
    activeSections: [],
    commentContent: '',
    isDownloadingPdf: false,
    defaultAvatar: '/images/kkz.jpg',
    manualToggleStates: {}
  }),

  actions: {
    handleLangChange(lang) {
      this.currentLang = lang;
      this.activeSections = this.getInitialActiveSections;
    },

    async downloadPDF(cvElement) {
      if (this.isDownloadingPdf) return; // Prevent multiple clicks
      this.isDownloadingPdf = true;
      message.loading({ content: '正在生成PDF...', key: 'pdf', duration: 0 }); // Show loading message


      if (!cvElement) {
        message.error({ content: '无法找到CV内容元素', key: 'pdf', duration: 2 });
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
    submitComment() {
      if (!this.commentContent.trim()) {
        message.warning('请输入留言内容');
        return;
      }
      message.success('留言已提交 (待处理)');
      this.commentContent = '';
    },

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
  },

  getters: {
    cvData: (state) => {
      return cvDataStructure.cv && cvDataStructure.cv[state.currentLang] 
        ? cvDataStructure.cv[state.currentLang] 
        : { personalInfo: { name: 'CV' }, sections: {}, skills: [] };
    },
    
    getInitialActiveSections: (state) => {
      const sections = state.cvData.sections || {};
      const keys = Object.keys(sections);
      
      if (keys.length === 0) return [];
      if (keys.length <= 3) return keys;
      
      return keys.filter(key => 
        key === keys[0] || 
        key.toLowerCase().includes('experience') || 
        key.toLowerCase().includes('经验')
      );
    }
  }
});
