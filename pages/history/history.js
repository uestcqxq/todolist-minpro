// pages/history/history.js
const api = require('../../utils/api');
const http = require('../../utils/request');

Page({
  data: {
    plans: [],
    currentPage: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    showDetail: false,
    currentPlan: null,
    statusMap: {
      'pending': '进行中',
      'completed': '已完成',
      'delayed': '已延期'
    }
  },

  onLoad() {
    this.loadPlans();
  },

  // 加载计划列表
  async loadPlans() {
    if (this.data.loading || !this.data.hasMore) return;

    try {
      this.setData({ loading: true });
      const res = await http.get(api.workPlan.history, {
        page: this.data.currentPage,
        pageSize: this.data.pageSize
      });

      const plans = res.data;
      this.setData({
        plans: [...this.data.plans, ...plans],
        currentPage: this.data.currentPage + 1,
        hasMore: plans.length === this.data.pageSize
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载更多
  loadMore() {
    this.loadPlans();
  },

  // 显示详情
  async showDetail(e) {
    const { id } = e.currentTarget.dataset;
    
    try {
      wx.showLoading({ title: '加载中' });
      const res = await http.get(`${api.workPlan.list}/${id}`);
      
      this.setData({
        currentPlan: res.data,
        showDetail: true
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 隐藏详情
  hideDetail() {
    this.setData({
      showDetail: false,
      currentPlan: null
    });
  },

  // 阻止冒泡
  stopPropagation() {
    return;
  }
});