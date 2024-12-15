// pages/add/add.js
const app = getApp();
const api = require('../../utils/api');
const http = require('../../utils/request');
const util = require('../../utils/util');

Page({
  data: {
    period: util.formatTime(new Date()),
    periodRange: '',
    periodType: '',
    items: [{ content: '' }],
    submitting: false
  },

  onLoad(options) {
    const periodType = options.type || 'month';
    this.setData({ periodType }, () => {
      this.updatePeriodRange();
    });

    this.onShowCallback = () => {
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage) {
        const newType = prevPage.data.periodTypeIndex === 0 ? 'month' : 'week';
        if (newType !== this.data.periodType) {
          this.setData({ periodType: newType }, () => {
            this.updatePeriodRange();
          });
        }
      }
    };
  },

  onShow() {
    if (this.onShowCallback) {
      this.onShowCallback();
    }
  },

  updatePeriodRange() {
    const { period, periodType } = this.data;
    let range = period;

    if (periodType === 'week') {
      const weekRange = util.getWeekRange(new Date(period));
      range = `${weekRange.start} ~ ${weekRange.end}`;
    }

    this.setData({ periodRange: range });
  },

  handlePeriodChange(e) {
    const period = e.detail.value;
    const now = new Date();
    const selectedDate = new Date(period);

    if (selectedDate > now) {
      wx.showToast({
        title: '不能超过当前日期',
        icon: 'none'
      });
      return;
    }

    this.setData({ period }, () => {
      this.updatePeriodRange();
    });
  },

  handleContentChange(e) {
    const { index } = e.currentTarget.dataset;
    const { items } = this.data;
    items[index].content = e.detail.value;
    this.setData({ items });
  },

  addItem() {
    const { items } = this.data;
    items.push({ content: '' });
    this.setData({ items });
  },

  removeItem(e) {
    const { index } = e.currentTarget.dataset;
    const { items } = this.data;
    items.splice(index, 1);
    this.setData({ items });
  },

  navigateBack() {
    wx.navigateBack();
  },

  async handleSubmit() {
    try {
      const { period, periodType, items } = this.data;

      // 验证表单
      if (!period) {
        throw new Error('请选择期间');
      }

      const validItems = items.filter(item => item.content.trim());
      if (validItems.length === 0) {
        throw new Error('请至少添加一个工作项');
      }

      // 根据类型处理日期格式
      let submitPeriod = period;
      if (periodType === 'week') {
        const weekRange = util.getWeekRange(new Date(period));
        submitPeriod = weekRange.start;
      }

      this.setData({ submitting: true });

      // 构造提交数据
      const submitData = {
        period: submitPeriod,
        type: periodType,
        items: validItems.map(item => ({
          content: item.content.trim()
        }))
      };

      console.log('提交数据:', submitData);

      const res = await http.post(api.workPlan.create, {
        ...submitData
      });

      if (res.success) {
        wx.showToast({ title: '创建成功' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(res.message || '创建失败');
      }
    } catch (err) {
      console.error('提交失败:', err);
      wx.showToast({
        title: typeof err === 'string' ? err : (err.message || '提交失败'),
        icon: 'error'
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});