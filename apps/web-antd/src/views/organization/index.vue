<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
} from 'ant-design-vue';

import {
  addOrganizationApi,
  deleteOrganizationApi,
  getAllOrganizationApi,
  updateOrganizationApi,
} from '#/api/core/organization';

interface OrgRow {
  code?: string;
  createTime?: string;
  id: number;
  isLeaf?: boolean;
  key?: number;
  name: string;
  operator?: string;
  parentId?: number;
  title?: string;
  updateTime?: string;
}

const loading = ref(false);
const orgList = ref<OrgRow[]>([]);

const searchName = ref('');

const filteredOrgList = computed(() => {
  let list = orgList.value;
  if (searchName.value) {
    const keyword = searchName.value.toLowerCase();
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        (item.code && item.code.toLowerCase().includes(keyword)),
    );
  }
  return list;
});

const modalVisible = ref(false);
const modalTitle = ref('添加组织');
const editingOrg = ref<null | OrgRow>(null);
const parentOrgId = ref<number | undefined>(undefined);
const formName = ref('');

async function loadData() {
  loading.value = true;
  try {
    const data = await getAllOrganizationApi();
    orgList.value = (data || []).map((item: any) => ({
      ...item,
      key: item.id,
      title: item.name,
    }));
  } catch {
    message.error('加载组织数据失败');
  } finally {
    loading.value = false;
  }
}

function handleAdd(parentId?: number) {
  editingOrg.value = null;
  parentOrgId.value = parentId;
  formName.value = '';
  modalTitle.value = '添加组织';
  modalVisible.value = true;
}

function handleEdit(record: OrgRow) {
  editingOrg.value = record;
  parentOrgId.value = record.parentId;
  formName.value = record.name;
  modalTitle.value = '编辑组织';
  modalVisible.value = true;
}

async function handleDelete(id: number) {
  try {
    await deleteOrganizationApi(id);
    message.success('删除成功');
    await loadData();
  } catch {
    message.error('删除失败');
  }
}

async function handleModalOk() {
  if (!formName.value.trim()) {
    message.warning('请输入组织名称');
    return;
  }
  try {
    if (editingOrg.value) {
      await updateOrganizationApi({
        id: editingOrg.value.id,
        name: formName.value.trim(),
        parentId: parentOrgId.value,
      });
      message.success('修改成功');
    } else {
      await addOrganizationApi({
        name: formName.value.trim(),
        parentId: parentOrgId.value,
      });
      message.success('添加成功');
    }
    modalVisible.value = false;
    await loadData();
  } catch {
    message.error(editingOrg.value ? '修改失败' : '添加失败');
  }
}

function getParentName(parentId?: number): string {
  if (!parentId) return '顶级组织';
  const parent = orgList.value.find((item) => item.id === parentId);
  return parent?.name || '未知';
}

function handleReset() {
  searchName.value = '';
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page auto-content-height title="组织管理">
    <div class="rounded-lg border border-gray-200 bg-white p-4">
      <div class="mb-4 flex items-center justify-between">
        <span class="text-base font-medium">组织列表</span>
        <div class="flex shrink-0 items-center gap-2">
          <Input
            v-model:value="searchName"
            allow-clear
            placeholder="搜索组织名称"
            style="width: 200px"
          />
          <Button @click="handleReset">重置</Button>
          <Button type="primary" @click="handleAdd()">添加组织</Button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="whitespace-nowrap px-4 py-3 text-left">序号</th>
              <th class="whitespace-nowrap px-4 py-3 text-left">组织名称</th>
              <th class="whitespace-nowrap px-4 py-3 text-left">上级组织</th>
              <th class="whitespace-nowrap px-4 py-3 text-left">创建时间</th>
              <th class="whitespace-nowrap px-4 py-3 text-left">更新时间</th>
              <th class="whitespace-nowrap px-4 py-3 text-left">操作人</th>
              <th class="whitespace-nowrap px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, index) in filteredOrgList" :key="item.id">
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="whitespace-nowrap px-4 py-3">{{ index + 1 }}</td>
                <td class="whitespace-nowrap px-4 py-3 font-medium">
                  {{ item.name }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-500">
                  {{ getParentName(item.parentId) }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-500">
                  {{ item.createTime || '-' }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-500">
                  {{ item.updateTime || '-' }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-500">
                  {{ item.operator || '-' }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  <Space>
                    <Button
                      size="small"
                      type="link"
                      @click="handleAdd(item.id)"
                    >
                      添加子组织
                    </Button>
                    <Button size="small" type="link" @click="handleEdit(item)">
                      编辑
                    </Button>
                    <Popconfirm
                      title="确认删除该组织？"
                      @confirm="handleDelete(item.id)"
                    >
                      <Button danger size="small" type="link">删除</Button>
                    </Popconfirm>
                  </Space>
                </td>
              </tr>
            </template>
            <tr v-if="filteredOrgList.length === 0">
              <td class="px-4 py-8 text-center text-gray-400" colspan="7">
                {{ loading ? '加载中...' : '暂无数据' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @cancel="modalVisible = false"
      @ok="handleModalOk"
    >
      <Form class="mt-4" layout="vertical">
        <FormItem label="组织名称" required>
          <Input
            v-model:value="formName"
            placeholder="请输入组织名称"
            @press-enter="handleModalOk"
          />
        </FormItem>
        <FormItem v-if="parentOrgId" label="上级组织">
          <Input :value="getParentName(parentOrgId)" disabled />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>
