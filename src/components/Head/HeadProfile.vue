<script setup>
import { ref } from 'vue';
import personalInfoData from '@/assets/data/personal-info.json'; 
const personalInfo = ref(personalInfoData);
</script>

<template>
    <div class="avatar">
        <img :src="personalInfo.avatarSrc" class="portrait" />
        <div>
            <div>
                <div><span class="highlight bold">{{ personalInfo.greeting }}</span> World!</div>
                <div>我是<span class="highlight bold">{{ personalInfo.name }}</span></div>
                <div>({{ personalInfo.alias }})!</div>
            </div>
            <div class="contacts">
                <a v-for="contact in personalInfo.contacts" :key="contact.type" :href="contact.url">
                    <img :src="contact.iconSrc" class="icon" />
                </a>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .avatar {
    display: flex;
    align-items: center;
    gap: 30px;
    flex: 1;
    /* min-width: 400px; */
}

.portrait {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
}

.contacts {
    margin-top: 5px;
    display: flex;
    gap: 5px;
}

.icon {
    width: 24px;
    height: 24px;
    transition: opacity 0.3s;
}

.icon:hover {
    opacity: 0.7;
}

.info {
    /* flex: 0 0 auto; */
    text-align: right;
    padding-left: 30px;
    margin-left: auto;
    margin-top: 35px;
}
</style>
