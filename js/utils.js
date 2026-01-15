// 工具函数模块
const Utils = {
    // 格式化日期 (YYYY-MM-DD -> MM-DD)
    formatDate: function(dateString) {
        if (!dateString) return '--';
        // dateString 格式: 2024-05-20
        var parts = dateString.split('-');
        if (parts.length === 3) {
            var month = parts[1];
            var day = parts[2];
            return month + '-' + day;
        }
        return dateString;
    },

    // 获取星期几
    getWeekday: function(dateString) {
        if (!dateString) return '--';
        var date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // 如果直接解析失败，尝试手动解析
            var parts = dateString.split('-');
            if (parts.length === 3) {
                date = new Date(parts[0], parts[1] - 1, parts[2]);
            }
        }
        var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weekdays[date.getDay()];
    },

    // 获取天气图标
    getWeatherIcon: function(weather) {
        if (!weather) return '🌤️';
        return CONFIG.weatherIcons[weather] || '🌤️';
    },

    // 格式化时间
    formatTime: function(timeString) {
        if (!timeString) return '';
        // 格式: 2024-05-15 14:38:25
        var parts = timeString.split(' ');
        if (parts.length === 2) {
            return parts[1].substring(0, 5); // 只显示时:分
        }
        return timeString;
    },

    // 显示加载状态
    showLoading: function() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('error').classList.add('hidden');
    },

    // 隐藏加载状态
    hideLoading: function() {
        document.getElementById('loading').classList.add('hidden');
    },

    // 显示错误信息
    showError: function(message) {
        document.getElementById('loading').classList.add('hidden');
        var errorEl = document.getElementById('error');
        document.getElementById('error-message').textContent = message;
        errorEl.classList.remove('hidden');

        // 3秒后自动隐藏
        setTimeout(function() {
            errorEl.classList.add('hidden');
        }, 3000);
    }
};
