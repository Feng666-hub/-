import { requestClient } from '#/api/request';

/** 组织架构项 */
export interface OrganizationItem {
  code?: string;
  createTime?: string;
  id: number;
  isDel?: boolean;
  isLeaf?: boolean;
  level?: number;
  name: string;
  parentId?: number;
  path?: string;
  updateTime?: string;
}

/** 组织架构树节点 */
export interface OrganizationTreeNode {
  children?: OrganizationTreeNode[];
  id: number;
  title: string;
}

/** 获取所有组织架构列表 */
export async function getAllOrganizationApi() {
  return requestClient.get<OrganizationItem[]>(
    '/v1/Organizationstructure/GetAllOrganizationstructure',
  );
}

/** 获取组织架构树 */
export async function getOrganizationTreeApi(orgId: number = 0) {
  return requestClient.get<OrganizationTreeNode[]>(
    `/v1/Organizationstructure/GetOrganizationstructureTree?orgId=${orgId}`,
  );
}

/** 根据Token获取当前用户所属组织架构树 */
export async function getOrganizationTreeByTokenApi() {
  return requestClient.get<OrganizationTreeNode[]>(
    '/v1/Organizationstructure/GetOrganizationstructureTreeByToken',
  );
}

/** 添加组织架构 */
export async function addOrganizationApi(
  data: Pick<OrganizationItem, 'name' | 'parentId'>,
) {
  return requestClient.post(
    '/v1/Organizationstructure/AddOrganizationstructure',
    data,
  );
}

/** 修改组织架构 */
export async function updateOrganizationApi(
  data: Pick<OrganizationItem, 'id' | 'name' | 'parentId'>,
) {
  return requestClient.post(
    '/v1/Organizationstructure/UpdateOrganizationstructure',
    data,
  );
}

/** 删除组织架构 */
export async function deleteOrganizationApi(orgId: number) {
  return requestClient.get(
    `/v1/Organizationstructure/DeleteOrganizationstructure?orgId=${orgId}`,
  );
}

/** 判断组织机构是否存在 */
export async function checkOrganizationNameApi(name: string) {
  return requestClient.post(
    '/v1/Organizationstructure/GetOrganizationstructureByName',
    undefined,
    { params: { name } },
  );
}
