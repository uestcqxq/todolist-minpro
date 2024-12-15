// pages/evaluate/evaluate.js
const api = require('../../utils/api');
const http = require('../../utils/request');
const util = require('../../utils/util');

Page({
  data: {
    lastPeriod: '', // 上一期间
    currentPeriod: '', // 当前期间
    plan: {}, // 上期计划数据
    stats: {  // 统计信息
      total: 0,
      completed: 0,
      delayed: 0,
      pending: 0
    }
  },

  onLoad() {
    // 计算上一期间
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const lastPeriod = util.formatTime(date);
    const currentPeriod = util.formatTime(new Date());

    this.setData({
      lastPeriod,
      currentPeriod
    });

    this.loadLastPeriodPlan();
  },

  // 加载上期计划
  async loadLastPeriodPlan() {
    try {
      const res = await http.get(api.workPlan.list, {
        period: this.data.lastPeriod,
        type: 'month'
      });

      if (res.data && res.data.length > 0) {
        const plan = res.data[0];
        // 计算统计信息
        const stats = {
          total: plan.items.length,
          completed: plan.items.filter(i => i.status === 'completed').length,
          delayed: plan.items.filter(i => i.status === 'delayed').length,
          pending: plan.items.filter(i => i.status === 'pending').length
        };

        this.setData({ plan, stats });
      }
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  // 状态变更
  async handleStatusChange(e) {
    const { id } = e.currentTarget.dataset;
    const status = this.data.statusOptions[e.detail.value].value;
    
    try {
      await http.put(`${api.workPlan.items}/${id}`, { status });
      await this.loadLastPeriodPlan();
    } catch (err) {
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      });
    }
  },

  // 转入下期
  async handleTransfer(e) {
    const { item } = e.currentTarget.dataset;
    
    try {
      // 创建新的工作计划项
      await http.post(api.workPlan.create, {
        period: this.data.currentPeriod,
        type: 'month',
        items: [{
          content: item.content,
          status: 'pending'
        }]
      });

      wx.showToast({
        title: '已转入下期',
        icon: 'success'
      });
    } catch (err) {
      wx.showToast({
        title: '转移失败',
        icon: 'error'
      });
    }
  },

  // 提交评估
  async handleSubmit() {
    try {
      // 检查必填项
      const incompleteItems = this.data.plan.items.filter(item => {
        if (item.status === 'completed' && !item.evaluation) return true;
        if (item.status === 'delayed' && !item.delay_reason) return true;
        return false;
      });

      if (incompleteItems.length > 0) {
        wx.showToast({
          title: '请完善评估信息',
          icon: 'none'
        });
        return;
      }

      // 提交评估记录
      await http.post(api.evaluation.submit, {
        period: this.data.lastPeriod,
        items: this.data.plan.items
      });

      wx.showToast({
        title: '评估已提交',
        icon: 'success'
      });

      // 返回首页
      wx.navigateBack();
    } catch (err) {
      wx.showToast({
        title: '提交失败',
        icon: 'error'
      });
    }
  }
});