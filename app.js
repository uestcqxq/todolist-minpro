// app.js
App({
  onLaunch() {
    // 获取系统信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.statusBarHeight = e.statusBarHeight;
        this.globalData.screenHeight = e.screenHeight;
        this.globalData.windowHeight = e.windowHeight;
      }
    });

    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }

    // 检查服务器连接
    wx.request({
      url: `${this.globalData.baseUrl}/health`,
      success: () => {
        console.log('服务器连接正常');
      },
      fail: (err) => {
        console.error('服务器连接失败:', err);
        wx.showToast({
          title: '服务器连接失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  globalData: {
    baseUrl: 'http://127.0.0.1:3000/api', // 开发环境API地址
    statusBarHeight: 0,
    screenHeight: 0,
    windowHeight: 0,
    userInfo: null
  }
});
