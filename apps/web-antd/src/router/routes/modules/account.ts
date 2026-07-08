import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      hideInMenu: true,
      icon: 'lucide:user',
      title: '个人中心',
    },
    name: 'Account',
    path: '/account',
    children: [
      {
        name: 'AccountProfile',
        path: '/account/profile',
        component: () => import('#/views/account/index.vue'),
        meta: {
          activeMenu: '/workspace',
          title: '账号信息',
        },
      },
    ],
  },
];

export default routes;
