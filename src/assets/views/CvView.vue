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
            <span v-if="cvData.personalInfo.email" style="margin-left: 16px;"><mail-outlined /> {{
              cvData.personalInfo.email
              }}</span>
            <span v-if="!cvData.personalInfo.phone && !cvData.personalInfo.email && cvData.personalInfo.contact">{{
              cvData.personalInfo.contact }}</span>
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

        <div
          v-else-if="Array.isArray(section.items) && typeof section.items[0] === 'object' && section.items[0].title !== undefined">
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

    <a-spin :spinning="isDownloadingPdf" tip="正在生成 PDF..." size="large"
      style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;">
    </a-spin>
    <a-float-button-group shape="circle" :style="{ right: '24px', bottom: '100px' }">
      <a-float-button tooltip="下载PDF" @click="store.downloadPDF($refs.cvContainerRef)" :disabled="isDownloadingPdf">
        <template #icon><download-outlined /></template>
      </a-float-button>
      <a-float-button tooltip="分享" @click="store.shareCV">
        <template #icon><share-alt-outlined /></template>
      </a-float-button>
    </a-float-button-group>

    <div>
      <a-comment style="margin-top: 3rem;">
        <template #avatar>
          <a-avatar src="/images/kkz.jpg" alt="User Avatar" />
        </template>
        <template #content>
          <a-form>
            <a-form-item class="userinfo">
              <div class="input-group">
                <a-input v-model:value="newComment.nickname" placeholder="昵称" />
                <a-input v-model:value="newComment.email" placeholder="邮箱" />
              </div>
            </a-form-item>
            <a-form-item>
              <a-textarea :rows="4" v-model:value="newComment.content" placeholder="欢迎给我留言~" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="submitComment" :loading="submitting">提交留言</a-button>
            </a-form-item>
          </a-form>
        </template>
      </a-comment>

      <a-list v-if="comments.length" :data-source="comments" item-layout="horizontal" :loading="loading"
        style="margin-top: 2rem;">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-comment :author="item.nickname" :datetime="formatDateTime(item.created_at)" :content="item.content">
              <template #avatar>
                <a-avatar style="background-color: #87d068">{{ item.nickname.slice(0, 1) }}</a-avatar>
              </template>
              <template #actions>
                <span @click="openEditModal(item)">编辑</span>
                <a-popconfirm title="确定要删除这条评论吗?" ok-text="确定" cancel-text="取消" @confirm="deleteComment(item.id)">
                  <span>删除</span>
                </a-popconfirm>
              </template>
            </a-comment>
          </a-list-item>
        </template>
      </a-list>
      <a-empty v-else-if="!loading">
        <template #description>
          <span>还没有评论，快来抢沙发吧！</span>
        </template>
      </a-empty>

      <a-modal v-model:open="editModalVisible" title="编辑评论" ok-text="保存" cancel-text="取消" @ok="saveEditComment"
        :confirm-loading="editing">
        <a-textarea v-model:value="editingComment.content" :rows="4" placeholder="输入评论内容" />
      </a-modal>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useCvStore } from '@/stores/cvStore';
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { message, Modal } from 'ant-design-vue';

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
const comments = ref([]); // 评论列表
const loading = ref(false); // 评论列表加载状态
const submitting = ref(false); // 提交评论状态
const editing = ref(false); // 编辑评论状态

const newComment = reactive({ // 新评论表单数据
  nickname: '',
  content: '',
});

const editModalVisible = ref(false); // 编辑弹窗可见性
const editingComment = reactive({ // 正在编辑的评论数据
  id: null,
  content: '',
});

// 后端 API 地址 (确保端口号与你的 Flask 应用匹配)
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// --- 方法定义 ---

// 获取评论列表
const fetchComments = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/comments`);
    comments.value = response.data;
  } catch (error) {
    console.error("获取评论失败:", error);
    message.error('加载评论列表失败');
  } finally {
    loading.value = false;
  }
};

// 提交新评论
const submitComment = async () => {
  if (!newComment.content.trim()) {
    message.warning('评论内容不能为空');
    return;
  }
  submitting.value = true;
  try {
    const payload = {
      nickname: newComment.nickname.trim() || '匿名用户', // 如果昵称为空，则为'匿名用户'
      content: newComment.content.trim(),
    };
    const response = await axios.post(`${API_BASE_URL}/comments`, payload);
    // 将新评论添加到列表顶部
    comments.value.unshift(response.data);
    // 清空表单
    newComment.nickname = '';
    newComment.content = '';
    message.success('评论提交成功！');
  } catch (error) {
    console.error("提交评论失败:", error);
    message.error('提交评论失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

// 打开编辑弹窗
const openEditModal = (comment) => {
  editingComment.id = comment.id;
  editingComment.content = comment.content;
  editModalVisible.value = true;
};

// 保存编辑后的评论
const saveEditComment = async () => {
  if (!editingComment.content.trim()) {
    message.warning('评论内容不能为空');
    return;
  }
  editing.value = true;
  try {
    const payload = { content: editingComment.content.trim() };
    const response = await axios.put(`${API_BASE_URL}/comments/${editingComment.id}`, payload);
    // 更新列表中的评论
    const index = comments.value.findIndex(c => c.id === editingComment.id);
    if (index !== -1) {
      comments.value[index] = response.data;
    }
    editModalVisible.value = false;
    message.success('评论更新成功！');
  } catch (error) {
    console.error("更新评论失败:", error);
    if (error.response && error.response.status === 404) {
      message.error('评论不存在或已被删除');
      // 可以选择从列表中移除该评论
      comments.value = comments.value.filter(c => c.id !== editingComment.id);
    } else {
      message.error('更新评论失败，请稍后重试');
    }
  } finally {
    editing.value = false;
  }
};

// 删除评论
const deleteComment = async (commentId) => {
  // 可以加一个 loading 状态指示删除操作
  try {
    await axios.delete(`${API_BASE_URL}/comments/${commentId}`);
    // 从列表中移除评论
    comments.value = comments.value.filter(c => c.id !== commentId);
    message.success('评论删除成功！');
  } catch (error) {
    console.error("删除评论失败:", error);
    if (error.response && error.response.status === 404) {
      message.error('评论不存在或已被删除');
      // 确保从列表中移除
      comments.value = comments.value.filter(c => c.id !== commentId);
    } else {
      message.error('删除评论失败，请稍后重试');
    }
  }
};

// 格式化日期时间 (简单示例)
const formatDateTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    // 你可以使用更复杂的库如 date-fns 或 moment.js 来进行更友好的格式化
    return date.toLocaleString(); // 使用浏览器本地化设置
  } catch (e) {
    return isoString; // 解析失败则返回原始字符串
  }
};



// 生命周期
onMounted(() => {
  fetchComments(); // 组件挂载后获取评论
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
  background-color: #f9f9f9;
  /* Light background for contrast */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-card {
  margin-bottom: 2rem;
  /* Add space below header */
  background-color: #fff;
  /* White background for header card */
}

.contact-info span {
  margin-right: 16px;
  /* Space between contact items */
  display: inline-flex;
  /* Align icon and text */
  align-items: center;
  gap: 6px;
  /* Space between icon and text */
  color: #555;
  /* Slightly muted color for contact info */
}

.skill-card {
  background-color: #fff;
  /* White background for skills card */
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
    text-align: center;
    /* Center avatar and text on smaller screens */
  }

  .header-card h1 {
    font-size: 1.8rem;
    /* Smaller heading on mobile */
    margin-top: 1rem;
    /* Add space above name when stacked */
  }

  .contact-info span {
    display: block;
    /* Stack contact info on small screens */
    margin-right: 0;
    margin-bottom: 8px;
  }
}

/* Ensure Ant Design styles are properly loaded globally or scoped */
/* Example: You might need to import Ant Design CSS in your main.js */
/* import 'ant-design-vue/dist/reset.css'; */

/* Add specific styles for list items generated from simple strings */
ul {
  list-style-type: disc;
  /* Standard bullet points */
  padding-left: 20px;
  /* Indentation for list items */
  margin-top: 0.5rem;
}

li {
  margin-bottom: 0.5rem;
  /* Space between list items */
  line-height: 1.6;
  /* Improve readability */
}

/* Add styles for complex item titles/content if needed */
h4 {
  color: #333;
}

p {
  color: #666;
}

.ant-comment-actions>li>span {
  margin-right: 8px;
  cursor: pointer;
  color: #1890ff;
  /* Ant Design 主题色 */
}

.ant-comment-actions>li>span:hover {
  text-decoration: underline;
}

.input-group {
  display: flex;
  gap: 16px; /* 间距 */
}
.input-group > .ant-input {
  flex: 1; /* 等宽分配 */
}
</style>