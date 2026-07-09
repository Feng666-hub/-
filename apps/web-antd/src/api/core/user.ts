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

/** 用户列表项 */
export interface UserItem {
  staffId: number;
  realName: string;
  userName: string;
  phoneNum: string;
  email: string;
  sex: null | number;
  approved: null | number;
  addtime: string;
  avatarUrl: null | string;
  orgName: string[];
  roleNames: string;
}

/** 用户列表响应 */
export interface UserListResponse {
  items: UserItem[];
  total: number;
}

/** 获取用户列表 */
export async function getUserListApi(params: {
  Approved?: number;
  currentPage?: number;
  OrgId?: number;
  pageSize?: number;
}) {
  return requestClient.get<UserListResponse>(
    '/v1/Satff/GetStaffByOrganizationstructure',
    { params },
  );
}

/** 审核用户 */
export async function approveUserApi(staffId: number, approved: number) {
  return requestClient.post('/v1/Satff/UpdateStaff', {
    sId: staffId,
    approved,
  });
}

/** 删除用户 */
export async function deleteUserApi(staffId: number) {
  return requestClient.get(`/v1/Satff/DeleteStaff?staffId=${staffId}`);
}

/** 编辑用户 */
export async function editUserApi(data: {
  email?: string;
  phoneNum?: string;
  realName?: string;
  sex?: number;
  sId: number;
}) {
  return requestClient.post('/v1/Satff/UpdateStaff', data);
}

/** 重置用户密码 */
export async function resetUserPasswordApi(
  staffId: number,
  newPassword: string,
) {
  return requestClient.post('/v1/Satff/UpdateStaff', {
    sId: staffId,
    passWord: newPassword,
  });
}
