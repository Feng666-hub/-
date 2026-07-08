<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  Button,
  Form,
  Input,
  message,
  Steps,
  TreeSelect,
} from 'ant-design-vue';

import {
  checkEmailCodeApi,
  getOrganizationTreeApi,
  registerApi,
  sendEmailCodeApi,
} from '#/api';

defineOptions({ name: 'Register' });

const router = useRouter();
const loading = ref(false);
const currentStep = ref(0);
const countdown = ref(0);
const countdownTimer = ref<null | ReturnType<typeof setInterval>>(null);

// 第一步表单数据
const step1Form = ref({
  username: '',
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
});

// 第二步表单数据
const step2Form = ref({
  organizationId: null as null | number,
  companyName: '',
});

// 组织架构数据
const organizationTree = ref<any[]>([]);

// 步骤定义
const steps = [{ title: '基本信息' }, { title: '企业信息' }];

// 组件挂载时加载组织架构树
onMounted(() => {
  loadOrganizationTree();
});

// 发送验证码
async function handleSendCode() {
  if (!step1Form.value.email) {
    message.warning('请先输入邮箱');
    return;
  }
  try {
    await sendEmailCodeApi(step1Form.value.email);
    message.success('验证码已发送');
    startCountdown();
  } catch {
    message.error('发送验证码失败');
  }
}

// 开始倒计时
function startCountdown() {
  countdown.value = 60;
  countdownTimer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0 && countdownTimer.value) {
      clearInterval(countdownTimer.value);
      countdownTimer.value = null;
    }
  }, 1000);
}

// 下一步
async function handleNext() {
  if (currentStep.value === 0) {
    // 验证第一步表单
    if (!step1Form.value.username) {
      message.warning('请输入用户名');
      return;
    }
    if (!step1Form.value.email) {
      message.warning('请输入邮箱');
      return;
    }
    if (!step1Form.value.code) {
      message.warning('请输入验证码');
      return;
    }
    if (!step1Form.value.password) {
      message.warning('请输入密码');
      return;
    }
    if (step1Form.value.password.length < 8) {
      message.warning('密码至少8位');
      return;
    }
    if (step1Form.value.password !== step1Form.value.confirmPassword) {
      message.warning('两次密码输入不一致');
      return;
    }

    // 验证验证码
    try {
      await checkEmailCodeApi(
        step1Form.value.email,
        step1Form.value.code,
        step1Form.value.password,
      );
      // 加载组织架构树
      await loadOrganizationTree();
      currentStep.value = 1;
    } catch {
      message.error('验证码错误');
    }
  }
}

// 上一步
function handlePrev() {
  currentStep.value = 0;
}

// 加载组织架构树
async function loadOrganizationTree() {
  try {
    const res = await getOrganizationTreeApi(0);
    // API返回空数据时使用mock数据
    organizationTree.value =
      Array.isArray(res) && res.length > 0 ? res : getMockOrganizationTree();
  } catch {
    // API失败时使用mock数据
    organizationTree.value = getMockOrganizationTree();
  }
}

// Mock组织架构树数据
function getMockOrganizationTree() {
  return [
    {
      id: 1,
      title: '便利智链集团',
      children: [
        {
          id: 2,
          title: '华东区域',
          children: [
            { id: 4, title: '上海分公司' },
            { id: 5, title: '杭州分公司' },
            { id: 6, title: '南京分公司' },
          ],
        },
        {
          id: 3,
          title: '华南区域',
          children: [
            { id: 7, title: '广州分公司' },
            { id: 8, title: '深圳分公司' },
            { id: 9, title: '厦门分公司' },
          ],
        },
        {
          id: 10,
          title: '华北区域',
          children: [
            { id: 11, title: '北京分公司' },
            { id: 12, title: '天津分公司' },
          ],
        },
        {
          id: 13,
          title: '华中区域',
          children: [
            { id: 14, title: '武汉分公司' },
            { id: 15, title: '长沙分公司' },
          ],
        },
        {
          id: 16,
          title: '西南区域',
          children: [
            { id: 17, title: '成都分公司' },
            { id: 18, title: '重庆分公司' },
          ],
        },
      ],
    },
  ];
}

// 注册
async function handleRegister() {
  if (!step2Form.value.organizationId) {
    message.warning('请选择上级组织');
    return;
  }

  loading.value = true;
  try {
    // 执行注册（后端会自动验证验证码）
    await registerApi({
      account: step1Form.value.email,
      code: step1Form.value.code,
      password: step1Form.value.password,
      username: step1Form.value.username,
      organizationId: [[step2Form.value.organizationId]],
    });
    message.success('注册成功，请登录');
    router.push('/auth/login');
  } catch {
    message.error('注册失败');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <!-- 标题 -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold">创建一个账号 🚀</h2>
      <p class="mt-2 text-gray-500">让您的应用程序管理变得简单而有趣</p>
    </div>

    <!-- 步骤条 -->
    <div class="mb-8">
      <Steps :current="currentStep" :items="steps" size="small" />
    </div>

    <!-- 第一步：基本信息 -->
    <div v-if="currentStep === 0">
      <Form class="space-y-4" layout="vertical">
        <Form.Item label="用户名" required>
          <Input
            v-model:value="step1Form.username"
            placeholder="请输入用户名"
            size="large"
          />
        </Form.Item>

        <Form.Item label="邮箱" required>
          <Input
            v-model:value="step1Form.email"
            placeholder="请输入邮箱"
            size="large"
          />
        </Form.Item>

        <Form.Item label="验证码" required>
          <div class="flex gap-2">
            <Input
              v-model:value="step1Form.code"
              class="flex-1"
              placeholder="请输入验证码"
              size="large"
            />
            <Button
              :disabled="countdown > 0"
              size="large"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </Button>
          </div>
        </Form.Item>

        <Form.Item label="密码" required>
          <Input.Password
            v-model:value="step1Form.password"
            placeholder="密码"
            size="large"
          />
          <div class="mt-1 text-xs text-gray-400">
            使用 8 个或更多字符，混合字母、数字和符号
          </div>
        </Form.Item>

        <Form.Item label="确认密码" required>
          <Input.Password
            v-model:value="step1Form.confirmPassword"
            placeholder="确认密码"
            size="large"
          />
        </Form.Item>
      </Form>

      <Button
        block
        class="mt-4"
        size="large"
        type="primary"
        @click="handleNext"
      >
        下一步
      </Button>
    </div>

    <!-- 第二步：企业信息 -->
    <div v-if="currentStep === 1">
      <Form class="space-y-4" layout="vertical">
        <Form.Item label="上级组织" required>
          <TreeSelect
            v-model:value="step2Form.organizationId"
            :field-names="{ label: 'title', value: 'id' }"
            :tree-data="organizationTree"
            placeholder="请选择上级组织"
            size="large"
          />
        </Form.Item>

        <Form.Item label="公司名称">
          <Input
            v-model:value="step2Form.companyName"
            placeholder="请输入公司名称"
            size="large"
          />
        </Form.Item>
      </Form>

      <div class="mt-4 flex gap-4">
        <Button class="flex-1" size="large" @click="handlePrev">
          上一步
        </Button>
        <Button
          :loading="loading"
          class="flex-1"
          size="large"
          type="primary"
          @click="handleRegister"
        >
          注册
        </Button>
      </div>
    </div>

    <div class="mt-4 text-center text-sm">
      已经有账号了?
      <span
        class="vben-link text-sm font-normal"
        @click="router.push('/auth/login')"
      >
        去登录
      </span>
    </div>
  </div>
</template>
