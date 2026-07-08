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
  return requestClient.get(`/v1/Satff/Emailcode?email=${email}`);
}

/**
 * 校验邮箱验证码
 */
export async function checkEmailCodeApi(
  email: string,
  code: string,
  password: string,
) {
  return requestClient.get(
    `/v1/Satff/CheckEmailCode?email=${email}&inputCode=${code}&password=${password}`,
  );
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
