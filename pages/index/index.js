// index.js
const api = require('../../utils/api')
const http = require('../../utils/request')
const util = require('../../utils/util')
const cache = require('../../utils/cache')

Page({
  data: {
    currentPeriod: util.formatTime(new Date()),
    currentDate: util.formatDate(new Date()),
    periodRange: '',
    periodTypes: ['按月', '按周'],
    periodTypeIndex: 0,
    statusMap: {
      'pending': '进行中',
      'completed': '已完成',
      'delayed': '已延期'
    },
    statusOptions: [
      { value: 'pending', label: '进行中' },
      { value: 'completed', label: '已完成' },
      { value: 'delayed', label: '已延期' }
    ],
    plans: [],
    loadError: false,
    loading: true,
    skeleton: {
      rows: 3,
      loading: true
    },
    statistics: {
      total: 0,
      completed: 0,
      pending: 0,
      delayed: 0,
      completionRate: '0%'
    }
  },

  onShow() {
    if (!this.data.currentPeriod) {
      this.setData({
        currentPeriod: util.formatTime(new Date())
      });
    }
    this.updatePeriodRange();
    this.loadPlans();
  },

  async loadPlans() {
    try {
      this.setData({ 
        loadError: false,
        loading: true 
      });
      wx.showLoading({ title: '加载中' });
      
      const period = this.data.periodTypeIndex === 0 
        ? this.data.currentPeriod 
        : this.data.currentDate;
      const type = this.data.periodTypeIndex === 0 ? 'month' : 'week';

      console.log('请求参数:', { period, type });

      const res = await http.get(api.workPlan.list, {
        data: { period, type }
      });

      console.log('加载结果:', res);

      if (res.success) {
        this.setData({ 
          plans: res.data,
          loadError: false
        }, () => {
          console.log('当前计划数据:', this.data.plans);
          if (res.data && res.data.length > 0) {
            this.calculateStatistics(res.data);
          }
        });
      } else {
        throw new Error(res.message || '加载失败');
      }
    } catch (err) {
      console.error('加载失败:', err);
      this.setData({ 
        loadError: true,
        plans: [] 
      });
    } finally {
      wx.hideLoading();
      this.setData({ loading: false });
    }
  },

  // 更新周期范围显示
  updatePeriodRange() {
    if (this.data.periodTypeIndex === 1) { // 按周显示
      const date = new Date(this.data.currentDate);
      const weekRange = util.getWeekRange(date);
      this.setData({
        periodRange: `${weekRange.start} ~ ${weekRange.end}`
      });
    } else { // 按月显示
      this.setData({
        periodRange: this.data.currentPeriod
      });
    }
  },

  // 期间选择改变
  handlePeriodChange(e) {
    if (this.data.periodTypeIndex === 0) {
      // 按月选择
      this.setData({
        currentPeriod: e.detail.value
      }, () => {
        this.updatePeriodRange();
        this.loadPlans();
      });
    } else {
      // 按周选择
      this.setData({
        currentDate: e.detail.value
      }, () => {
        this.updatePeriodRange();
        this.loadPlans();
      });
    }
  },

  // 类型选择改变
  handleTypeChange(e) {
    const newTypeIndex = parseInt(e.detail.value);
    this.setData({
      periodTypeIndex: newTypeIndex
    }, () => {
      this.updatePeriodRange();
      this.loadPlans();
    });
  },

  // 页面跳转方法
  goToAdd() {
    const type = this.data.periodTypeIndex === 0 ? 'month' : 'week';
    wx.navigateTo({
      url: `/pages/add/add?type=${type}`
    });
  },

  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  goToEvaluate() {
    wx.navigateTo({
      url: '/pages/evaluate/evaluate'
    });
  },

  // 上一月/周
  prevMonth() {
    const date = new Date(this.data.periodTypeIndex === 0 
      ? this.data.currentPeriod 
      : this.data.currentDate);
    
    if (this.data.periodTypeIndex === 0) {
      date.setMonth(date.getMonth() - 1);
      this.setData({
        currentPeriod: util.formatTime(date)
      });
    } else {
      date.setDate(date.getDate() - 7);
      this.setData({
        currentDate: util.formatDate(date)
      });
    }
    this.setData({}, () => {
      this.updatePeriodRange();
      this.loadPlans();
    });
  },

  // 下一月/周
  nextMonth() {
    const date = new Date(this.data.periodTypeIndex === 0 
      ? this.data.currentPeriod 
      : this.data.currentDate);
    
    if (this.data.periodTypeIndex === 0) {
      date.setMonth(date.getMonth() + 1);
      this.setData({
        currentPeriod: util.formatTime(date)
      });
    } else {
      date.setDate(date.getDate() + 7);
      this.setData({
        currentDate: util.formatDate(date)
      });
    }
    
    // 不允许超过前日期
    if (date > new Date()) {
      wx.showToast({
        title: '不能超过当前日期',
        icon: 'none'
      });
      return;
    }
    
    this.setData({}, () => {
      this.updatePeriodRange();
      this.loadPlans();
    });
  },

  // 处理工作项编辑
  async handleEditWork(e) {
    const work = e.currentTarget.dataset.work;
    const that = this;

    wx.showActionSheet({
      itemList: ['修改状态', '添加备注'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 修改状态
          wx.showActionSheet({
            itemList: that.data.statusOptions.map(s => s.label),
            success: async (result) => {
              const newStatus = that.data.statusOptions[result.tapIndex].value;
              if (newStatus === work.status) return;

              try {
                wx.showLoading({ title: '更新中' });
                const res = await http.put(`${api.workPlan.items}/${work.id}`, {
                  status: newStatus
                });
                if (!res.success) {
                  throw new Error(res.message || '更新失败');
                }
                await that.loadPlans();
                wx.showToast({ title: '更新成功' });
              } catch (err) {
                console.error('更新状态失败:', err);
                wx.showToast({ 
                  title: err.message || '更新失败', 
                  icon: 'error' 
                });
              } finally {
                wx.hideLoading();
              }
            }
          });
        } else if (res.tapIndex === 1) {
          // 添加备���
          wx.showModal({
            title: '添加备注',
            content: work.evaluation || '',
            editable: true,
            placeholderText: '请输入备注内容',
            success: async (result) => {
              if (result.confirm) {
                try {
                  wx.showLoading({ title: '更新中' });
                  const res = await http.put(`${api.workPlan.items}/${work.id}`, {
                    evaluation: result.content
                  });
                  if (!res.success) {
                    throw new Error(res.message || '更新失败');
                  }
                  await that.loadPlans();
                  wx.showToast({ title: '更新成功' });
                } catch (err) {
                  console.error('更新备注失败:', err);
                  wx.showToast({ 
                    title: err.message || '更新失败', 
                    icon: 'error' 
                  });
                } finally {
                  wx.hideLoading();
                }
              }
            }
          });
        }
      }
    });
  },

  // 计算统计信息
  calculateStatistics(plans) {
    const stats = {
      total: 0,
      completed: 0,
      pending: 0,
      delayed: 0,
      completionRate: '0%'
    };

    if (plans && plans.length > 0 && plans[0].items) {
      plans[0].items.forEach(item => {
        stats.total++;
        stats[item.status]++;
      });

      // 计算完成率
      if (stats.total > 0) {
        const rate = (stats.completed / stats.total * 100).toFixed(1);
        stats.completionRate = `${rate}%`;
      }
    }

    this.setData({ statistics: stats });
  },

  // 添加下拉刷新和加载动画
  onPullDownRefresh() {
    this.loadPlans().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
});
