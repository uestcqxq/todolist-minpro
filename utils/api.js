const app = getApp();
const BASE_URL = 'https://minpro.mrseven.site/api';

const api = {
  // 工作计划相关接口
  workPlan: {
    list: `${BASE_URL}/work-plans`,
    create: `${BASE_URL}/work-plans`,
    items: `${BASE_URL}/work-plans/items`,
    history: `${BASE_URL}/work-plans/history`,
    detail: id => `${BASE_URL}/work-plans/${id}`
  },
  // 评估相关接口
  evaluation: {
    submit: `${BASE_URL}/evaluations`,
    history: `${BASE_URL}/evaluations/history/`
  },
  // 用户相关接口
  auth: {
    login: `${BASE_URL}/auth/login`,
    info: `${BASE_URL}/auth/info`
  }
};

module.exports = api; 