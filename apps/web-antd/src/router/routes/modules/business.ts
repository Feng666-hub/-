import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 1,
      title: '概览',
    },
    name: 'Overview',
    path: '/overview',
    children: [
      {
        name: 'AnalyticsOverview',
        path: '/analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: '分析页',
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:bell',
      order: 2,
      title: '警报管理',
    },
    name: 'AlarmManagement',
    path: '/alarm',
    children: [
      {
        name: 'AlarmList',
        path: '/alarm/list',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'lucide:list',
          title: '警报列表',
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:settings',
      order: 3,
      title: '系统管理',
    },
    name: 'SystemManagement',
    path: '/system',
    children: [
      {
        name: 'SystemConfig',
        path: '/system/config',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'lucide:sliders',
          title: '系统配置',
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:users',
      order: 4,
      title: '用户管理',
    },
    name: 'UserManagement',
    path: '/user',
    children: [
      {
        name: 'UserList',
        path: '/user/list',
        component: () => import('#/views/user/list.vue'),
        meta: {
          icon: 'lucide:users',
          title: '用户列表',
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:monitor',
      order: 5,
      title: '设备管理',
    },
    name: 'DeviceManagement',
    path: '/device',
    children: [
      {
        name: 'DeviceList',
        path: '/device/list',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'lucide:monitor',
          title: '设备列表',
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      badgeType: 'dot',
      icon: 'lucide:globe',
      order: 6,
      title: '官方网站',
    },
    name: 'OfficialWebsite',
    path: '/website',
    children: [
      {
        name: 'WebsiteHome',
        path: '/website/home',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'lucide:home',
          title: '网站首页',
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:monitor',
      order: 7,
      title: '大屏可视化',
    },
    name: 'DataVisualization',
    path: '/visualization',
    children: [
      {
        name: 'VisualizationScreen',
        path: '/visualization/screen',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'lucide:bar-chart-3',
          title: '数据大屏',
        },
      },
    ],
  },
];

export default routes;
