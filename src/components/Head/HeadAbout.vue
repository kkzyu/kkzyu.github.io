<template>
    <div class="about">
        <HeadProfile />
        <HeadInfo />
    </div>
</template>
<script setup>
    import HeadInfo from '@/components/Head/HeadInfo.vue';
    import HeadProfile from '@/components/Head/HeadProfile.vue';
</script>
<style scoped>

.about {
    display: flex;
    gap: 20px;
    margin-left: 100px;
    margin-right: 100px;
    margin-bottom: 30px;
}

</style>
