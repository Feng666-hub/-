<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { MdiWechat } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
  ];
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    :show-third-party-login="false"
    @submit="authStore.authLogin"
  >
    <template #code-login-button>
      <Button class="w-1/2" size="large"> 手机号登录 </Button>
    </template>
    <template #qrcode-login-button>
      <Button class="ml-4 flex w-1/2 items-center justify-center" size="large">
        <MdiWechat class="text-green-500" />
        <span class="ml-1">微信扫码登录</span>
      </Button>
    </template>
  </AuthenticationLogin>
</template>
