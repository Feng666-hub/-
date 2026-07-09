<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
  RadioGroup,
  Select,
  SelectOption,
  Tag,
  Tree,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getAllOrganizationApi } from '#/api/core/organization';
import {
  approveUserApi,
  deleteUserApi,
  editUserApi,
  getUserListApi,
  resetUserPasswordApi,
} from '#/api/core/user';

interface UserRow {
  addtime: string;
  approved: null | number;
  avatarUrl: null | string;
  email: string;
  orgName: string[];
  phoneNum: string;
  realName: string;
  roleNames: string;
  sex: null | number;
  staffId: number;
  userName: string;
}

interface OrgRow {
  id: number;
  name: string;
  parentId?: null | number;
}

const searchApproved = ref<number | undefined>(undefined);
const searchUserName = ref('');
const selectedOrgId = ref<number | undefined>(undefined);

const orgList = ref<OrgRow[]>([]);
const treeData = ref<any[]>([]);

function buildTreeData(list: OrgRow[], parentId?: null | number): any[] {
  return list
    .filter((item) => {
      if (parentId === undefined || parentId === null) {
        return !item.parentId;
      }
      return item.parentId === parentId;
    })
    .map((item) => ({
      key: item.id,
      title: item.name,
      children: buildTreeData(list, item.id),
    }));
}

async function loadOrgData() {
  try {
    const data = await getAllOrganizationApi();
    orgList.value = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      parentId: item.parentId,
    }));
    treeData.value = buildTreeData(orgList.value);
  } catch {
    message.error('加载组织数据失败');
  }
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
      width: 220,
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  toolbarConfig: {
    search: false,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await getUserListApi({
          Approved: searchApproved.value,
          currentPage: page.currentPage,
          OrgId: selectedOrgId.value,
          pageSize: page.pageSize,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function handleTreeNodeClick(keys: any[]) {
  selectedOrgId.value = keys.length > 0 ? keys[0] : undefined;
  gridApi.query();
}

function handleClearOrgFilter() {
  selectedOrgId.value = undefined;
  gridApi.query();
}

function handleSearch() {
  gridApi.query();
}

function handleReset() {
  searchApproved.value = undefined;
  searchUserName.value = '';
  selectedOrgId.value = undefined;
  gridApi.query();
}

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

/** 编辑弹窗 */
const editModalVisible = ref(false);
const editForm = ref<{
  email: string;
  phoneNum: string;
  realName: string;
  sex: null | number;
  staffId: number;
}>({
  staffId: 0,
  realName: '',
  phoneNum: '',
  email: '',
  sex: null,
});

function handleEdit(row: UserRow) {
  editForm.value = {
    staffId: row.staffId,
    realName: row.realName,
    phoneNum: row.phoneNum,
    email: row.email,
    sex: row.sex,
  };
  editModalVisible.value = true;
}

async function handleEditOk() {
  if (!editForm.value.realName.trim()) {
    message.warning('请输入姓名');
    return;
  }
  try {
    await editUserApi({
      sId: editForm.value.staffId,
      realName: editForm.value.realName.trim(),
      phoneNum: editForm.value.phoneNum,
      email: editForm.value.email,
      sex: editForm.value.sex ?? undefined,
    });
    message.success('修改成功');
    editModalVisible.value = false;
    gridApi.query();
  } catch {
    message.error('修改失败');
  }
}

/** 重置密码弹窗 */
const resetPwdModalVisible = ref(false);
const resetPwdForm = ref<{
  newPassword: string;
  staffId: number;
  userName: string;
}>({
  staffId: 0,
  userName: '',
  newPassword: '',
});

function handleResetPassword(row: UserRow) {
  resetPwdForm.value = {
    staffId: row.staffId,
    userName: row.userName,
    newPassword: '',
  };
  resetPwdModalVisible.value = true;
}

async function handleResetPwdOk() {
  if (!resetPwdForm.value.newPassword.trim()) {
    message.warning('请输入新密码');
    return;
  }
  if (resetPwdForm.value.newPassword.length < 6) {
    message.warning('密码长度不能少于6位');
    return;
  }
  try {
    await resetUserPasswordApi(
      resetPwdForm.value.staffId,
      resetPwdForm.value.newPassword.trim(),
    );
    message.success('密码重置成功');
    resetPwdModalVisible.value = false;
  } catch {
    message.error('密码重置失败');
  }
}

/** 获取当前选中组织名称 */
function getSelectedOrgName(): string {
  if (!selectedOrgId.value) return '';
  const org = orgList.value.find((o) => o.id === selectedOrgId.value);
  return org?.name || '';
}

onMounted(() => {
  loadOrgData();
});
</script>

<template>
  <Page auto-content-height>
    <div class="flex gap-4" style="height: calc(100vh - 120px)">
      <!-- 左侧：组织树 -->
      <div
        class="w-64 shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4"
      >
        <div class="mb-4 flex items-center justify-between">
          <span class="whitespace-nowrap text-base font-medium">组织结构</span>
        </div>
        <Tree
          v-if="treeData.length > 0"
          :default-expand-all="true"
          :selected-keys="selectedOrgId !== undefined ? [selectedOrgId] : []"
          :tree-data="treeData"
          block-node
          show-line
          @select="handleTreeNodeClick"
        />
        <div v-else class="py-8 text-center text-gray-400">暂无组织数据</div>
      </div>

      <!-- 右侧：用户列表 -->
      <div class="min-w-0 flex-1 overflow-hidden">
        <Grid>
          <!-- 搜索区域 -->
          <template #toolbar-tools>
            <div class="flex items-center gap-2">
              <span v-if="selectedOrgId" class="text-sm text-blue-500">
                当前筛选：{{ getSelectedOrgName() }}
                <Button size="small" type="link" @click="handleClearOrgFilter">
                  清除
                </Button>
              </span>
              <span class="text-sm">审核状态</span>
              <Select
                v-model:value="searchApproved"
                allow-clear
                placeholder="请选择用户状态"
                style="width: 160px"
              >
                <SelectOption :value="1">已审核</SelectOption>
                <SelectOption :value="0">待审核</SelectOption>
              </Select>
              <span class="text-sm">用户名</span>
              <Input
                v-model:value="searchUserName"
                allow-clear
                placeholder="请输入用户名"
                style="width: 200px"
                @press-enter="handleSearch"
              />
              <Button @click="handleReset">重置</Button>
              <Button type="primary" @click="handleSearch">搜索</Button>
            </div>
          </template>

          <!-- 性别 -->
          <template #sex="{ row }">
            <Tag
              :color="
                row.sex === 1 ? 'blue' : row.sex === 0 ? 'pink' : 'default'
              "
            >
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
              <Button size="small" type="link" @click="handleEdit(row)">
                编辑
              </Button>

              <Button
                size="small"
                type="link"
                @click="handleResetPassword(row)"
              >
                重置密码
              </Button>

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
      </div>
    </div>

    <!-- 编辑用户弹窗 -->
    <Modal
      v-model:open="editModalVisible"
      title="编辑用户"
      @cancel="editModalVisible = false"
      @ok="handleEditOk"
    >
      <Form class="mt-4" layout="vertical">
        <FormItem label="姓名" required>
          <Input v-model:value="editForm.realName" placeholder="请输入姓名" />
        </FormItem>
        <FormItem label="手机号">
          <Input v-model:value="editForm.phoneNum" placeholder="请输入手机号" />
        </FormItem>
        <FormItem label="邮箱">
          <Input v-model:value="editForm.email" placeholder="请输入邮箱" />
        </FormItem>
        <FormItem label="性别">
          <RadioGroup v-model:value="editForm.sex">
            <Radio :value="1">男</Radio>
            <Radio :value="0">女</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
    </Modal>

    <!-- 重置密码弹窗 -->
    <Modal
      v-model:open="resetPwdModalVisible"
      title="重置密码"
      @cancel="resetPwdModalVisible = false"
      @ok="handleResetPwdOk"
    >
      <Form class="mt-4" layout="vertical">
        <FormItem label="用户名">
          <Input :value="resetPwdForm.userName" disabled />
        </FormItem>
        <FormItem label="新密码" required>
          <Input
            v-model:value="resetPwdForm.newPassword"
            placeholder="请输入新密码（至少6位）"
            type="password"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>
