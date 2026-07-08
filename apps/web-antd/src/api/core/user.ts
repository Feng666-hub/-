import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  const resp = await requestClient.get<any>('/v1/auth/userinfo');
  // 映射后端字段到前端 UserInfo 类型
  const userInfo: UserInfo = {
    avatar: resp.avatar || '',
    companyName: resp.companyName || '',
    companyRegion: resp.companyRegion || '',
    desc: resp.desc || '',
    email: resp.email || '',
    homePath: '/analytics',
    phoneNum: resp.phoneNum || '',
    realName: resp.realName || resp.userName || '',
    roles: (resp.roles || []).map(String),
    token: '',
    userId: String(resp.userId || resp.sId || ''),
    username: resp.userId || '',
  };
  return userInfo;
}

export interface UpdateStaffParams {
  companyName?: string;
  companyRegion?: string;
  email?: string;
  phoneNum?: string;
  realName?: string;
  sId: number;
}

/**
 * 更新员工信息
 */
export async function updateStaffApi(data: UpdateStaffParams) {
  return requestClient.post('/v1/Satff/UpdateStaff', data);
}
