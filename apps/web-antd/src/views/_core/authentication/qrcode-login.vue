<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';

import { Button, message, Spin } from 'ant-design-vue';

import { getWechatQrCodeApi } from '#/api/core/auth';

defineOptions({ name: 'QrCodeLogin' });

const router = useRouter();
const loading = ref(false);
const qrcodeUrl = ref('');
const expired = ref(false);
const expireTime = ref(0);

let expireTimer: null | ReturnType<typeof setTimeout> = null;

/** 获取微信二维码 */
async function fetchQrCode() {
  loading.value = true;
  expired.value = false;

  try {
    const result = await getWechatQrCodeApi();
    qrcodeUrl.value = result.qrCodeUrl;
    expireTime.value = result.expireTime;

    // 计算剩余时间并设置过期定时器
    const remainingTime = expireTime.value - Date.now();
    if (expireTimer) clearTimeout(expireTimer);

    if (remainingTime > 0) {
      expireTimer = setTimeout(() => {
        expired.value = true;
        message.warning('二维码已过期，请刷新');
      }, remainingTime);
    } else {
      expired.value = true;
      message.warning('二维码已过期，请刷新');
    }
  } catch {
    message.error('获取微信二维码失败');
  } finally {
    loading.value = false;
  }
}

/** 打开微信授权页面（在新窗口中） */
function openWechatAuth() {
  if (qrcodeUrl.value) {
    window.open(qrcodeUrl.value, '_blank', 'width=800,height=600');
  }
}

/** 刷新二维码 */
function refresh() {
  if (expireTimer) clearTimeout(expireTimer);
  fetchQrCode();
}

/** 返回登录页 */
function goToLogin() {
  router.push(LOGIN_PATH);
}

onMounted(() => {
  fetchQrCode();
});

onUnmounted(() => {
  if (expireTimer) clearTimeout(expireTimer);
});
</script>

<template>
  <div>
    <!-- 标题 -->
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-bold">欢迎回来 📱</h2>
      <p class="mt-2 text-gray-500">请使用微信扫描二维码登录</p>
    </div>

    <!-- 二维码区域 -->
    <div class="flex flex-col items-center justify-center py-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex flex-col items-center">
        <Spin size="large" />
        <p class="mt-4 text-gray-500">正在加载二维码...</p>
      </div>

      <!-- 操作区域 -->
      <div v-else class="flex flex-col items-center">
        <!-- 过期状态 -->
        <div v-if="expired" class="mb-4">
          <p class="mb-4 text-red-500">二维码已过期</p>
          <Button type="primary" @click="refresh">点击刷新</Button>
        </div>

        <!-- 正常状态 -->
        <div v-else class="flex flex-col items-center">
          <p class="mb-4 text-sm text-gray-600">点击下方按钮打开微信扫码页面</p>
          <Button size="large" type="primary" @click="openWechatAuth">
            📱 打开微信扫码
          </Button>
          <p class="mt-4 text-xs text-gray-400">
            二维码有效期5分钟，请尽快扫码
          </p>
        </div>

        <!-- 错误状态 -->
        <div v-if="!qrcodeUrl && !loading" class="mt-4">
          <p class="mb-4 text-red-500">获取二维码失败</p>
          <Button type="primary" @click="refresh">重新获取</Button>
        </div>
      </div>
    </div>

    <!-- 返回登录按钮 -->
    <Button class="mt-4 w-full" size="large" @click="goToLogin()">
      返回登录
    </Button>
  </div>
</template>
