<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useUserStore } from '@vben/stores';

import {
  Avatar,
  Button,
  Form,
  FormItem,
  Input,
  message,
  Upload,
} from 'ant-design-vue';

import { updateStaffApi } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'AccountProfile' });

const route = useRoute();
const userStore = useUserStore();
const authStore = useAuthStore();

const loading = ref(false);
const activeTab = ref('profile');

const formState = reactive({
  companyName: '',
  companyRegion: '',
  email: '',
  phoneNum: '',
  realName: '',
});

const userInfo = computed(() => userStore.userInfo);

onMounted(() => {
  if (route.query.tab === 'settings') {
    activeTab.value = 'settings';
  }
  loadUserInfo();
});

function loadUserInfo() {
  const info = userInfo.value;
  if (info) {
    formState.realName = info.realName || '';
    formState.email = info.email || '';
    formState.phoneNum = info.phoneNum || '';
    formState.companyName = info.companyName || '';
    formState.companyRegion = info.companyRegion || '';
  }
}

async function handleSave() {
  if (!userInfo.value) return;
  loading.value = true;
  try {
    await updateStaffApi({
      companyName: formState.companyName || undefined,
      companyRegion: formState.companyRegion || undefined,
      email: formState.email || undefined,
      phoneNum: formState.phoneNum || undefined,
      realName: formState.realName || undefined,
      sId: Number(userInfo.value.userId),
    });
    message.success('保存成功');
    await authStore.fetchUserInfo();
  } catch {
    message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

function handleBindPhone() {
  message.info('绑定手机号功能开发中');
}

function handleChangeEmail() {
  message.info('换绑邮箱功能开发中');
}

function handleUnbindEmail() {
  message.info('解绑邮箱功能开发中');
}

function handleUnbindWechat() {
  message.info('解绑微信功能开发中');
}

function handleChangePassword() {
  message.info('修改密码功能开发中');
}

function handleBeforeUpload(file: File) {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isImage) {
    message.error('只能上传 JPG/PNG 格式的图片');
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB');
    return false;
  }
  message.info('头像上传功能开发中');
  return false;
}
</script>

<template>
  <div class="flex gap-4">
    <!-- 左侧菜单 -->
    <div class="w-[160px] shrink-0">
      <div class="rounded-md bg-white p-2 shadow-sm">
        <div
          :class="
            activeTab === 'profile'
              ? 'bg-blue-50 font-medium text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          "
          class="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2.5 text-sm"
          @click="activeTab = 'profile'"
        >
          <span class="text-lg">&#128100;</span>
          个人资料
        </div>
        <div
          :class="
            activeTab === 'settings'
              ? 'bg-blue-50 font-medium text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          "
          class="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm"
          @click="activeTab = 'settings'"
        >
          <span class="text-lg">&#128100;</span>
          账号设置
        </div>
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="flex-1">
      <!-- 个人资料 -->
      <div
        v-if="activeTab === 'profile'"
        class="rounded-md bg-white p-6 shadow-sm"
      >
        <h3 class="mb-6 text-base font-medium">个人资料</h3>

        <div class="flex">
          <!-- 表单 -->
          <div class="flex-1">
            <Form
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 16 }"
              layout="horizontal"
            >
              <FormItem label="用户名">
                <Input
                  v-model:value="formState.realName"
                  placeholder="请输入用户名"
                />
              </FormItem>
              <FormItem label="手机号">
                <Input
                  v-model:value="formState.phoneNum"
                  placeholder="请输入"
                />
              </FormItem>
              <FormItem label="邮箱">
                <Input
                  v-model:value="formState.email"
                  placeholder="请输入邮箱"
                />
              </FormItem>
              <FormItem label="公司名称">
                <Input
                  v-model:value="formState.companyName"
                  placeholder="请输入公司名称"
                />
              </FormItem>
              <FormItem label="公司地区">
                <Input
                  v-model:value="formState.companyRegion"
                  placeholder="请选择公司地区"
                />
              </FormItem>
              <FormItem :wrapper-col="{ offset: 4, span: 16 }">
                <Button :loading="loading" type="primary" @click="handleSave">
                  保存
                </Button>
              </FormItem>
            </Form>
          </div>

          <!-- 头像上传 -->
          <div class="ml-8 flex w-[160px] flex-col items-center">
            <div
              class="mb-3 h-[120px] w-[120px] overflow-hidden rounded-lg bg-pink-50"
            >
              <img
                v-if="userInfo?.avatar"
                :src="userInfo.avatar"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-4xl"
              >
                &#128059;
              </div>
            </div>
            <Upload
              :before-upload="handleBeforeUpload"
              :show-upload-list="false"
              accept=".jpg,.jpeg,.png"
            >
              <Button size="small">上传头像</Button>
            </Upload>
            <p class="mt-2 text-center text-xs text-gray-400">
              格式：JPG、PNG<br />
              大小：5M以内
            </p>
          </div>
        </div>
      </div>

      <!-- 账号设置 -->
      <div
        v-if="activeTab === 'settings'"
        class="rounded-md bg-white p-6 shadow-sm"
      >
        <h3 class="mb-6 text-base font-medium">账号设置</h3>

        <div class="space-y-0">
          <!-- 手机号 -->
          <div
            class="flex items-center justify-between border-b border-gray-100 py-4"
          >
            <div>
              <div class="font-medium">手机号</div>
              <div class="mt-1 text-sm text-gray-500">未绑定</div>
            </div>
            <Button type="link" @click="handleBindPhone">绑定</Button>
          </div>

          <!-- 邮箱 -->
          <div
            class="flex items-center justify-between border-b border-gray-100 py-4"
          >
            <div>
              <div class="font-medium">邮箱</div>
              <div class="mt-1 text-sm text-gray-500">
                {{ userInfo?.email || '未绑定' }}
              </div>
            </div>
            <div class="flex gap-2">
              <Button type="link" @click="handleChangeEmail">换绑</Button>
              <Button danger type="link" @click="handleUnbindEmail">
                解绑
              </Button>
            </div>
          </div>

          <!-- 微信号 -->
          <div
            class="flex items-center justify-between border-b border-gray-100 py-4"
          >
            <div class="flex items-center gap-3">
              <Avatar
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=wechat"
              />
              <div>
                <div class="font-medium">微信号</div>
                <div class="mt-1 text-sm text-gray-500">
                  烧电焊的小黄鸭 · 绑定于 2026-07-06T14:23:03
                </div>
              </div>
            </div>
            <Button danger type="link" @click="handleUnbindWechat">解绑</Button>
          </div>

          <!-- 密码 -->
          <div class="flex items-center justify-between py-4">
            <div>
              <div class="font-medium">密码</div>
            </div>
            <Button type="link" @click="handleChangePassword">修改密码</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
