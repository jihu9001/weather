/**
 * 工具函数模块
 */
var Utils = {
    // 格式化日期 (YYYY-MM-DD -> MM-DD)
    formatDate: function(dateString) {
        if (!dateString) return '--';
        var parts = dateString.split('-');
        return parts.length === 3 ? parts[1] + '-' + parts[2] : dateString;
    },

    // 获取星期几
    getWeekday: function(dateString) {
        if (!dateString) return '--';
        var date = new Date(dateString);
        if (isNaN(date.getTime())) {
            var parts = dateString.split('-');
            if (parts.length === 3) {
                date = new Date(parts[0], parts[1] - 1, parts[2]);
            }
        }
        var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weekdays[date.getDay()] || '--';
    },

    // 格式化时间
    formatTime: function(timeString) {
        if (!timeString) return '';
        try {
            var date = new Date(timeString);
            if (!isNaN(date.getTime())) {
                var hours = date.getHours().toString().padStart(2, '0');
                var minutes = date.getMinutes().toString().padStart(2, '0');
                return hours + ':' + minutes;
            }
        } catch (e) {}
        var parts = timeString.split(' ');
        return parts.length === 2 ? parts[1].substring(0, 5) : timeString;
    },

    // 显示错误信息
    showError: function(message) {
        document.getElementById('loading').classList.add('hidden');
        var errorEl = document.getElementById('error');
        document.getElementById('error-message').textContent = message;
        errorEl.classList.remove('hidden');
        setTimeout(function() {
            errorEl.classList.add('hidden');
        }, 3000);
    }
};
