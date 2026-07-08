<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { DEFAULT_HOME_PATH } from '@vben/constants';
import { useAccessStore } from '@vben/stores';

import { message, Spin } from 'ant-design-vue';

import { wechatLoginCallbackApi } from '#/api/core/auth';

defineOptions({ name: 'WechatCallback' });

const route = useRoute();
const router = useRouter();
const accessStore = useAccessStore();

const loading = ref(true);
const error = ref('');

onMounted(async () => {
  const { code, state, error: wechatError } = route.query;

  // 检查是否有错误
  if (wechatError) {
    error.value = `微信登录失败: ${wechatError}`;
    loading.value = false;
    message.error(error.value);
    setTimeout(() => router.replace('/auth/login'), 3000);
    return;
  }

  // 检查参数是否完整
  if (!code || !state) {
    error.value = '缺少必要的回调参数';
    loading.value = false;
    message.error(error.value);
    setTimeout(() => router.replace('/auth/login'), 3000);
    return;
  }

  try {
    // 调用后端回调接口获取Token
    const accessToken = await wechatLoginCallbackApi(
      code as string,
      state as string,
    );

    if (accessToken) {
      // 存储Token
      accessStore.setAccessToken(accessToken);

      message.success('微信登录成功');

      // 跳转到首页
      router.push(DEFAULT_HOME_PATH);
    } else {
      throw new Error('未获取到登录凭证');
    }
  } catch (error_: any) {
    error.value = error_.message || '微信登录失败，请重试';
    message.error(error.value);
    setTimeout(() => router.replace('/auth/login'), 3000);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <div class="text-center">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex flex-col items-center">
        <Spin size="large" />
        <p class="mt-4 text-gray-500">正在处理微信登录...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center">
        <p class="mb-4 text-red-500">{{ error }}</p>
        <p class="text-sm text-gray-500">3秒后自动返回登录页...</p>
      </div>
    </div>
  </div>
</template>
