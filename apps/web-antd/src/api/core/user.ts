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
    desc: resp.desc || '',
    homePath: '/analytics',
    realName: resp.realName || resp.userName || '',
    roles: (resp.roles || []).map(String),
    token: '',
    userId: String(resp.userId || resp.sId || ''),
    username: resp.userId || '',
  };
  return userInfo;
}
