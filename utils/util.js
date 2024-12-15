const formatTime = date => {
  if (!(date instanceof Date)) {
    date = new Date();
  }
  return date.toISOString().slice(0, 7);
};

const formatDate = date => {
  if (!(date instanceof Date)) {
    date = new Date();
  }
  return date.toISOString().slice(0, 10);
};

const getWeekRange = date => {
  const curr = new Date(date);
  const day = curr.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const sundayOffset = day === 0 ? 0 : 7 - day;
  
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + mondayOffset);
  
  const sunday = new Date(curr);
  sunday.setDate(curr.getDate() + sundayOffset);
  
  const formatDate = date => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}-${day}`;
  };
  
  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
};

const formatWeek = date => {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

const getWeekNumber = date => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const showToast = (title, type = 'none') => {
  wx.showToast({
    title,
    icon: type,
    duration: 2000
  });
};

const showLoading = (title = '加载中') => {
  wx.showLoading({
    title,
    mask: true
  });
};

const hideLoading = () => {
  wx.hideLoading();
};

const showModal = (content, title = '提示') => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success: res => {
        if (res.confirm) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail: reject
    });
  });
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  const start = startDate.split('-').slice(1).join('-');
  const end = endDate.split('-').slice(1).join('-');
  return `${start} ~ ${end}`;
};

const formatMonthDisplay = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}年${month}月`;
};

const formatWeekDisplay = (startDate, endDate) => {
  const start = startDate.split('-').slice(1).join('-');
  const end = endDate.split('-').slice(1).join('-');
  return `${start} ~ ${end}`;
};

module.exports = {
  formatTime,
  formatDate,
  getWeekRange,
  formatWeek,
  getWeekNumber,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  formatDateRange,
  formatMonthDisplay,
  formatWeekDisplay
}; 