<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Button, message, Popconfirm, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { approveUserApi, deleteUserApi, getUserListApi } from '#/api/core/user';

interface UserRow {
  addtime: string;
  approved: null | number;
  avatarUrl: null | string;
  email: string;
  orgName: string[];
  phoneNum: string;
  realName: number;
  roleNames: string;
  sex: null | number;
  staffId: number;
  userName: string;
}

const gridOptions: VxeGridProps<UserRow> = {
  columns: [
    { title: '序号', type: 'seq', width: 60 },
    { field: 'realName', title: '姓名', width: 120 },
    { field: 'userName', title: '用户名', width: 120 },
    { field: 'phoneNum', title: '手机号', width: 140 },
    { field: 'email', title: '邮箱', width: 180 },
    {
      field: 'sex',
      slots: { default: 'sex' },
      title: '性别',
      width: 80,
    },
    {
      field: 'approved',
      slots: { default: 'approved' },
      title: '审核状态',
      width: 120,
    },
    {
      field: 'orgName',
      slots: { default: 'orgName' },
      title: '所属组织',
      width: 200,
    },
    { field: 'roleNames', title: '角色', width: 100 },
    {
      field: 'addtime',
      formatter: 'formatDateTime',
      title: '注册时间',
      width: 180,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 200,
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await getUserListApi({
          currentPage: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/** 审核用户 */
async function handleApprove(row: UserRow, approved: number) {
  try {
    await approveUserApi(row.staffId, approved);
    message.success(approved === 1 ? '审核通过' : '已取消审核');
    gridApi.query();
  } catch {
    message.error('操作失败');
  }
}

/** 删除用户 */
async function handleDelete(row: UserRow) {
  try {
    await deleteUserApi(row.staffId);
    message.success('删除成功');
    gridApi.query();
  } catch {
    message.error('删除失败');
  }
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <!-- 性别 -->
      <template #sex="{ row }">
        <Tag :color="row.sex === 1 ? 'blue' : 'pink'">
          {{ row.sex === 1 ? '男' : row.sex === 0 ? '女' : '未知' }}
        </Tag>
      </template>

      <!-- 审核状态 -->
      <template #approved="{ row }">
        <Tag :color="row.approved === 1 ? 'green' : 'orange'">
          {{ row.approved === 1 ? '已审核' : '待审核' }}
        </Tag>
      </template>

      <!-- 所属组织 -->
      <template #orgName="{ row }">
        <span>{{ row.orgName?.join(', ') || '-' }}</span>
      </template>

      <!-- 操作按钮 -->
      <template #action="{ row }">
        <div class="flex gap-2">
          <!-- 审核通过按钮（仅待审核用户显示） -->
          <Popconfirm
            v-if="row.approved !== 1"
            title="确认审核通过该用户？"
            @confirm="handleApprove(row, 1)"
          >
            <Button size="small" style="color: #52c41a" type="link">
              审核通过
            </Button>
          </Popconfirm>

          <!-- 取消审核按钮（仅已审核用户显示） -->
          <Popconfirm
            v-if="row.approved === 1"
            title="确认取消审核？"
            @confirm="handleApprove(row, 0)"
          >
            <Button size="small" style="color: #faad14" type="link">
              取消审核
            </Button>
          </Popconfirm>

          <!-- 删除按钮 -->
          <Popconfirm title="确认删除该用户？" @confirm="handleDelete(row)">
            <Button danger size="small" type="link"> 删除 </Button>
          </Popconfirm>
        </div>
      </template>
    </Grid>
  </Page>
</template>
