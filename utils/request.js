// 基础请求函数
const makeRequest = (url, options = {}) => {
  // 获取 token
  const token = wx.getStorageSync('token');
  
  // 设置请求头
  const header = {
    'Content-Type': 'application/json',
    ...options.header
  };
  
  // 如果有 token，添加到请求头
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      ...options,
      header,
      timeout: 10000, // 设置超时时间
      success: (res) => {
        if (res.statusCode === 401) {
          // token 失效，跳转到登录页
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.redirectTo({
            url: '/pages/login/login'
          });
          reject(new Error('未登录'));
          return;
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data?.message || '请求失败'));
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        if (err.errMsg.includes('request:fail')) {
          reject(new Error('服务器连接失败，请检查网络'));
        } else {
          reject(new Error('网络请求失败'));
        }
      }
    });
  });
};

// 带重试的请求函数
const request = async (url, options = {}, retries = 3) => {
  try {
    return await makeRequest(url, options);
  } catch (err) {
    if (retries > 0 && err.message.includes('网络请求失败')) {
      console.log(`请求失败，剩余重试次数: ${retries - 1}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return request(url, options, retries - 1);
    }
    throw err;
  }
};

module.exports = {
  get: (url, options = {}) => {
    return request(url, { 
      method: 'GET', 
      ...options 
    });
  },
  post: (url, data, options = {}) => {
    return request(url, { 
      method: 'POST', 
      data,
      ...options 
    });
  },
  put: (url, data, options = {}) => {
    return request(url, { 
      method: 'PUT', 
      data,
      ...options 
    });
  },
  delete: (url, options = {}) => {
    return request(url, { 
      method: 'DELETE', 
      ...options 
    });
  }
}; 