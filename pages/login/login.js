const api = require('../../utils/api');
const http = require('../../utils/request');

Page({
  data: {
    loading: false
  },

  async handleLogin(e) {
    // 如果用户拒绝授权
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '需要授权才能使用',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ loading: true });

      // 获取微信登录凭证
      const { code } = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });

      console.log('获取到登录凭证:', code);

      // 获取用户信息
      const userInfo = e.detail.userInfo;
      console.log('获取到用户信息:', userInfo);

      // 调用后端登录接口
      const res = await http.post(api.auth.login, {
        code,
        userInfo
      });

      if (!res.success) {
        throw new Error(res.message || '登录失败');
      }

      // 保存登录信息
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('userInfo', res.data.user);

      // 跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      });
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ loading: false });
    }
  }
}); 