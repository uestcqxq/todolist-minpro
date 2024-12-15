// 添加计划数据缓存
const CACHE_KEY = {
  PLANS: 'work_plans_cache_',
  USER: 'user_info'
};

const cachePlan = (period, type, data) => {
  const key = `${CACHE_KEY.PLANS}${period}_${type}`;
  wx.setStorageSync(key, {
    data,
    timestamp: Date.now()
  });
};

const getCachedPlan = (period, type) => {
  const key = `${CACHE_KEY.PLANS}${period}_${type}`;
  const cache = wx.getStorageSync(key);
  
  if (!cache) return null;
  
  // 缓存1小时有效
  if (Date.now() - cache.timestamp > 3600000) {
    wx.removeStorageSync(key);
    return null;
  }
  
  return cache.data;
};

module.exports = {
  CACHE_KEY,
  cachePlan,
  getCachedPlan
}; 