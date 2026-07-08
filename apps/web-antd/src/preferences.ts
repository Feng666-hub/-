import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
  },
  copyright: {
    companyName: '天门欣尚商用设备制造有限公司',
    companySiteLink: '',
    date: '2026',
    icp: '鄂ICP备2026027252号-1',
    icpLink: '',
  },
});
