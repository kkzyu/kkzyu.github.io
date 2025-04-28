<template>
  <div class="cv-container" ref="cvContainerRef">

    <a-card :bordered="false" class="header-card" v-if="cvData.personalInfo">
      <template #extra>
        <a-dropdown :trigger="['click']">
          <a-button type="text">
            <global-outlined /> {{ currentLang === 'cn' ? '中文' : 'English' }}
          </a-button>
          <template #overlay>
            <a-menu @click="({ key }) => store.handleLangChange(key)">
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
      <a-float-button tooltip="下载PDF" @click="store.downloadPDF($refs.cvContainerRef)" :disabled="isDownloadingPdf">
        <template #icon><download-outlined /></template>
      </a-float-button>
      <a-float-button tooltip="分享" @click="store.shareCV">
        <template #icon><share-alt-outlined /></template>
      </a-float-button>
    </a-float-button-group>

    <a-comment style="margin-top: 3rem;">
      <template #avatar>
         <a-avatar src="/images/kkz.jpg" alt="User Avatar" />
      </template>
      <template #content>
        <a-form-item>
          <a-textarea :rows="4" v-model:value="store.commentContent" placeholder="欢迎给我留言~" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="store.submitComment">提交留言</a-button>
        </a-form-item>
      </template>
    </a-comment>

  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useCvStore } from '@/stores/cvStore';
import { ref, onMounted } from 'vue';

// 导入 Ant Design Vue 图标组件
import {
  GlobalOutlined,
  CheckOutlined,
  PhoneOutlined,
  MailOutlined,
  DownloadOutlined,
  ShareAltOutlined
} from '@ant-design/icons-vue';

// 导入其他 Ant Design Vue 组件
import {
  Card,
  Dropdown,
  Button,
  Menu,
  MenuItem,
  Row,
  Col,
  Avatar,
  Tag,
  Collapse,
  CollapsePanel,
  Timeline,
  TimelineItem,
  Progress,
  FloatButtonGroup,
  FloatButton,
  Comment,
  FormItem,
  Textarea,
  Spin
} from 'ant-design-vue';



// 组件引用
const cvContainerRef = ref(null);

// 初始化 Store
const store = useCvStore();
const { 
  currentLang,
  activeSections,
  commentContent,
  isDownloadingPdf,
  cvData
} = storeToRefs(store);

// 方法代理
const handleLangChange = ({ key }) => store.handleLangChange(key);
const downloadPDF = () => store.downloadPDF(cvContainerRef.value);
const submitComment = () => store.submitComment();

// 生命周期
onMounted(() => {
  if (Object.keys(cvData.value.sections).length > 0) {
    store.activeSections = store.getInitialActiveSections;
  }
});
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