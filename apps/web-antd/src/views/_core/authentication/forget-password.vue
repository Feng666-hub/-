<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, ref } from 'vue';

import { AuthenticationForgetPassword, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { sendResetCodeApi } from '#/api/core/auth';

defineOptions({ name: 'ForgetPassword' });

const loading = ref(false);
const emailSent = ref(false);

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: 'example@example.com',
      },
      fieldName: 'email',
      label: $t('authentication.email'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.emailTip') })
        .email($t('authentication.emailValidErrorTip')),
    },
  ];
});

async function handleSubmit(values: Recordable<any>) {
  loading.value = true;
  try {
    await sendResetCodeApi(values.email);
    emailSent.value = true;
    message.success('临时密码已发送到您的邮箱，请查收后登录');
  } catch (error: any) {
    message.error(error.message || '发送失败，请重试');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthenticationForgetPassword
    :form-schema="formSchema"
    :loading="loading"
    :submit-button-text="emailSent ? '重新发送' : '发送临时密码'"
    @submit="handleSubmit"
  />
</template>
