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
  InputPassword,
  message,
  Modal,
  Upload,
} from 'ant-design-vue';

import {
  bindAccountApi,
  changePasswordApi,
  rebindAccountApi,
  sendBindingCodeApi,
  unbindAccountApi,
  unbindWechatApi,
  updateStaffApi,
  verifyPasswordForBindingApi,
} from '#/api';
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

// 修改密码相关
const passwordModalVisible = ref(false);
const passwordLoading = ref(false);
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: '',
});

// 绑定/解绑相关
const bindingModalVisible = ref(false);
const bindingType = ref<'email' | 'phone'>('email');
const bindingAction = ref<'bind' | 'rebind' | 'unbind'>('bind');
const bindingLoading = ref(false);
const bindingForm = reactive({
  account: '',
  code: '',
  password: '',
});
const codeSending = ref(false);
const codeCountdown = ref(0);

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

// ==================== 密码修改 ====================

function handleChangePassword() {
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  passwordModalVisible.value = true;
}

async function handlePasswordSubmit() {
  if (!userInfo.value) return;

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error('两次输入的密码不一致');
    return;
  }

  if (passwordForm.newPassword.length < 6) {
    message.error('新密码长度至少6位');
    return;
  }

  passwordLoading.value = true;
  try {
    await changePasswordApi(
      String(userInfo.value.userId),
      passwordForm.newPassword,
    );
    message.success('密码修改成功');
    passwordModalVisible.value = false;
  } catch (error: any) {
    message.error(error.message || '密码修改失败');
  } finally {
    passwordLoading.value = false;
  }
}

// ==================== 绑定/解绑 ====================

function openBindingModal(
  type: 'email' | 'phone',
  action: 'bind' | 'rebind' | 'unbind',
) {
  bindingType.value = type;
  bindingAction.value = action;
  bindingForm.account = '';
  bindingForm.code = '';
  bindingForm.password = '';
  codeCountdown.value = 0;
  bindingModalVisible.value = true;
}

function getBindingTitle() {
  const typeLabel = bindingType.value === 'email' ? '邮箱' : '手机号';
  const actionLabels = {
    bind: '绑定',
    rebind: '换绑',
    unbind: '解绑',
  };
  return `${actionLabels[bindingAction.value]}${typeLabel}`;
}

function getBindingButtonText() {
  const actionLabels = {
    bind: '绑定',
    rebind: '换绑',
    unbind: '解绑',
  };
  return actionLabels[bindingAction.value];
}

async function handleSendCode() {
  if (!bindingForm.account) {
    message.error(`请输入${bindingType.value === 'email' ? '邮箱' : '手机号'}`);
    return;
  }

  codeSending.value = true;
  try {
    await sendBindingCodeApi(
      bindingType.value,
      bindingForm.account,
      bindingAction.value,
    );
    message.success('验证码已发送');
    codeCountdown.value = 60;
    const timer = setInterval(() => {
      codeCountdown.value--;
      if (codeCountdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    message.error(error.message || '发送验证码失败');
  } finally {
    codeSending.value = false;
  }
}

async function handleBindingSubmit() {
  bindingLoading.value = true;
  try {
    if (bindingAction.value === 'unbind') {
      // 解绑需要先验证密码获取token
      if (!bindingForm.password) {
        message.error('请输入登录密码进行验证');
        return;
      }
      const verifyToken = await verifyPasswordForBindingApi(
        bindingForm.password,
      );
      await unbindAccountApi(bindingType.value, verifyToken);
      message.success('解绑成功');
    } else if (bindingAction.value === 'bind') {
      await bindAccountApi(
        bindingType.value,
        bindingForm.account,
        bindingForm.code,
      );
      message.success('绑定成功');
    } else {
      // 换绑需要先验证密码获取token
      if (!bindingForm.password) {
        message.error('请输入登录密码进行验证');
        return;
      }
      const verifyToken = await verifyPasswordForBindingApi(
        bindingForm.password,
      );
      await rebindAccountApi(
        bindingType.value,
        bindingForm.account,
        bindingForm.code,
        verifyToken,
      );
      message.success('换绑成功');
    }
    bindingModalVisible.value = false;
    await authStore.fetchUserInfo();
  } catch (error: any) {
    message.error(error.message || '操作失败');
  } finally {
    bindingLoading.value = false;
  }
}

// ==================== 微信解绑 ====================

const unbindWechatModalVisible = ref(false);
const unbindWechatLoading = ref(false);
const unbindWechatPassword = ref('');

function handleUnbindWechat() {
  unbindWechatPassword.value = '';
  unbindWechatModalVisible.value = true;
}

async function handleUnbindWechatConfirm() {
  if (!unbindWechatPassword.value) {
    message.error('请输入密码');
    return;
  }

  unbindWechatLoading.value = true;
  try {
    await verifyPasswordForBindingApi(unbindWechatPassword.value);
    unbindWechatModalVisible.value = false;

    Modal.confirm({
      title: '确认解绑',
      content: '解绑后将无法使用微信登录，是否确认解绑？',
      okText: '确认解绑',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await unbindWechatApi();
          message.success('微信解绑成功');
          await authStore.fetchUserInfo();
        } catch (error: any) {
          message.error(error.message || '解绑失败');
        }
      },
    });
  } catch (error: any) {
    message.error(error.message || '密码验证失败');
  } finally {
    unbindWechatLoading.value = false;
  }
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
              <div class="mt-1 text-sm text-gray-500">
                {{ userInfo?.phoneNum || '未绑定' }}
              </div>
            </div>
            <div v-if="userInfo?.phoneNum" class="flex gap-2">
              <Button type="link" @click="openBindingModal('phone', 'rebind')">
                换绑
              </Button>
              <Button
                danger
                type="link"
                @click="openBindingModal('phone', 'unbind')"
              >
                解绑
              </Button>
            </div>
            <Button
              v-else
              type="link"
              @click="openBindingModal('phone', 'bind')"
            >
              绑定
            </Button>
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
            <div v-if="userInfo?.email" class="flex gap-2">
              <Button type="link" @click="openBindingModal('email', 'rebind')">
                换绑
              </Button>
              <Button
                danger
                type="link"
                @click="openBindingModal('email', 'unbind')"
              >
                解绑
              </Button>
            </div>
            <Button
              v-else
              type="link"
              @click="openBindingModal('email', 'bind')"
            >
              绑定
            </Button>
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
            <Button danger type="link" @click="handleUnbindWechat">
              解绑
            </Button>
          </div>

          <!-- 密码 -->
          <div class="flex items-center justify-between py-4">
            <div>
              <div class="font-medium">密码</div>
            </div>
            <Button type="link" @click="handleChangePassword">
              修改密码
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 修改密码弹窗 -->
  <Modal
    v-model:open="passwordModalVisible"
    :confirm-loading="passwordLoading"
    title="修改密码"
    @cancel="passwordModalVisible = false"
    @ok="handlePasswordSubmit"
  >
    <Form class="mt-4" layout="vertical">
      <FormItem label="新密码" required>
        <InputPassword
          v-model:value="passwordForm.newPassword"
          placeholder="请输入新密码"
        />
      </FormItem>
      <FormItem label="确认密码" required>
        <InputPassword
          v-model:value="passwordForm.confirmPassword"
          placeholder="请再次输入新密码"
        />
      </FormItem>
    </Form>
  </Modal>

  <!-- 绑定/解绑弹窗 -->
  <Modal
    v-model:open="bindingModalVisible"
    :confirm-loading="bindingLoading"
    :ok-button-props="{ danger: bindingAction === 'unbind' }"
    :ok-text="getBindingButtonText()"
    :title="getBindingTitle()"
    @cancel="bindingModalVisible = false"
    @ok="handleBindingSubmit"
  >
    <Form class="mt-4" layout="vertical">
      <!-- 解绑和换绑需要验证密码 -->
      <FormItem
        v-if="bindingAction === 'unbind' || bindingAction === 'rebind'"
        label="登录密码"
        required
      >
        <InputPassword
          v-model:value="bindingForm.password"
          placeholder="请输入当前登录密码进行验证"
        />
      </FormItem>

      <!-- 绑定和换绑需要输入新账号 -->
      <FormItem
        v-if="bindingAction === 'bind' || bindingAction === 'rebind'"
        :label="bindingType === 'email' ? '新邮箱' : '新手机号'"
        required
      >
        <Input
          v-model:value="bindingForm.account"
          :placeholder="
            bindingType === 'email' ? '请输入邮箱地址' : '请输入手机号'
          "
        />
      </FormItem>

      <!-- 绑定和换绑需要验证码 -->
      <FormItem
        v-if="bindingAction === 'bind' || bindingAction === 'rebind'"
        label="验证码"
        required
      >
        <div class="flex gap-2">
          <Input
            v-model:value="bindingForm.code"
            class="flex-1"
            placeholder="请输入验证码"
          />
          <Button
            :disabled="codeCountdown > 0"
            :loading="codeSending"
            @click="handleSendCode"
          >
            {{ codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码' }}
          </Button>
        </div>
      </FormItem>
    </Form>
  </Modal>

  <!-- 微信解绑密码验证弹窗 -->
  <Modal
    v-model:open="unbindWechatModalVisible"
    :confirm-loading="unbindWechatLoading"
    title="验证身份"
    @cancel="unbindWechatModalVisible = false"
    @ok="handleUnbindWechatConfirm"
  >
    <Form class="mt-4" layout="vertical">
      <FormItem label="登录密码" required>
        <InputPassword
          v-model:value="unbindWechatPassword"
          placeholder="请输入当前登录密码进行验证"
        />
      </FormItem>
    </Form>
  </Modal>
</template>
