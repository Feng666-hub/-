import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }

  /** 注册接口参数 */
  export interface RegisterParams {
    account?: string;
    code?: string;
    password?: string;
    username?: string;
    organizationId?: number[][];
  }

  /** 组织架构树节点 */
  export interface OrganizationTree {
    id: number;
    title: string;
    parentId?: number;
    children?: OrganizationTree[];
  }

  /** 微信登录二维码响应 */
  export interface WechatQrCodeResult {
    /** 微信二维码URL */
    qrCodeUrl: string;
    /** 微信授权URL */
    authUrl: string;
    /** 过期时间戳（毫秒） */
    expireTime: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  const resp = await requestClient.post<string>('/v1/auth/login', data);
  return { accessToken: resp };
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/v1/auth/Logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.post<string[]>('/v1/auth/codes');
}

/**
 * 发送邮箱验证码
 */
export async function sendEmailCodeApi(email: string) {
  const params = new URLSearchParams();
  params.append('email', email);
  return requestClient.get(`/v1/Satff/Emailcode?${params.toString()}`);
}

/**
 * 校验邮箱验证码
 * 注意：password需要URL编码，因为可能包含特殊字符
 */
export async function checkEmailCodeApi(
  email: string,
  code: string,
  password: string,
) {
  const params = new URLSearchParams();
  params.append('email', email);
  params.append('inputCode', code);
  params.append('password', password);
  return requestClient.get(`/v1/Satff/CheckEmailCode?${params.toString()}`);
}

/**
 * 注册用户
 */
export async function registerApi(data: AuthApi.RegisterParams) {
  return requestClient.post('/v1/Satff/Register', data);
}

/**
 * 获取组织架构树
 */
export async function getOrganizationTreeApi(orgId: number = 0) {
  return requestClient.get(
    `/v1/Organizationstructure/GetOrganizationstructureTree?orgId=${orgId}`,
  );
}

/**
 * 获取微信登录二维码
 */
export async function getWechatQrCodeApi() {
  return requestClient.post<AuthApi.WechatQrCodeResult>(
    '/v1/wechat/login/qrcode',
    {
      client_platform: 'web',
    },
  );
}

/**
 * 微信登录回调（由微信服务器调用，前端不直接调用）
 */
export async function wechatLoginCallbackApi(code: string, state: string) {
  return requestClient.get<string>('/v1/wechat/login/callback', {
    params: { code, state },
  });
}

/**
 * 发送重置密码验证码（临时密码）
 */
export async function sendResetCodeApi(email: string) {
  return requestClient.post('/v1/Satff/ResetPwd', {
    type: 'email',
    account: email,
  });
}

/**
 * 修改密码（通过UpdateStaff接口）
 */
export async function changePasswordApi(userId: string, newPassword: string) {
  return requestClient.post('/v1/Satff/UpdateStaff', {
    sId: Number(userId),
    passWord: newPassword,
  });
}

// ==================== 账号绑定/解绑 API ====================

/**
 * 发送绑定验证码
 * @param type 类型: "email" 或 "phone"
 * @param account 邮箱或手机号
 * @param purpose 用途: "bind" 首次绑定, "rebind" 换绑, "unbind" 解绑
 */
export async function sendBindingCodeApi(
  type: 'email' | 'phone',
  account: string,
  purpose: 'bind' | 'rebind' | 'unbind' = 'bind',
) {
  return requestClient.post('/v1/account-binding/send-code', {
    type,
    account,
    purpose,
  });
}

/**
 * 首次绑定手机/邮箱
 */
export async function bindAccountApi(
  type: 'email' | 'phone',
  account: string,
  code: string,
) {
  return requestClient.post('/v1/account-binding/bind', {
    type,
    account,
    code,
  });
}

/**
 * 换绑手机/邮箱
 */
export async function rebindAccountApi(
  type: 'email' | 'phone',
  account: string,
  code: string,
  verifyToken: string,
) {
  return requestClient.post('/v1/account-binding/rebind', {
    type,
    account,
    code,
    verifyToken,
  });
}

/**
 * 解绑手机/邮箱
 */
export async function unbindAccountApi(
  type: 'email' | 'phone',
  verifyToken: string,
) {
  return requestClient.post('/v1/account-binding/unbind', {
    type,
    verifyToken,
  });
}

/**
 * 验证登录密码，获取一次性身份Token
 */
export async function verifyPasswordForBindingApi(password: string) {
  return requestClient.post<string>('/v1/account-binding/verify-password', {
    password,
  });
}

// ==================== 微信绑定/解绑 API ====================

/**
 * 获取微信绑定二维码
 */
export async function getWechatBindQrCodeApi() {
  return requestClient.post<{ authUrl: string }>('/v1/wechat/bind/qrcode');
}

/**
 * 解绑微信
 */
export async function unbindWechatApi() {
  return requestClient.post('/v1/wechat/unbind');
}

/**
 * 获取微信绑定信息
 */
export async function getWechatBindInfoApi() {
  return requestClient.get<{
    bindTime: string;
    nickname: string;
  }>('/v1/wechat/bind/info');
}
