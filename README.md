# 知天气 - 天气查询网站

一个美观实用的天气查询网站，基于高德地图API开发。

## ✨ 功能特性

- 🌤️ **实时天气查询** - 输入城市名称，快速获取当前天气状况
- 📅 **未来天气预报** - 显示未来4天的天气预报
- 🏙️ **热门城市天气** - 首页展示热门城市的实时天气
- 🚀 **快捷城市入口** - 常用城市一键点击，快速查询
- 📱 **响应式设计** - 完美适配手机、平板、电脑

## 🚀 快速开始

### 1. 配置API Key

编辑 `js/config.js`，替换你的高德地图API Key：

```javascript
const CONFIG = {
    apiKey: '你的高德地图API Key',
    // ...
};
```

**申请API Key：**
1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册/登录账号
3. 进入「控制台」→「应用管理」→「创建新应用」
4. 添加「Web服务」类型的Key

### 2. 本地测试

直接用浏览器打开 `index.html`，或使用本地服务器：

```bash
# Python
python -m http.server 8080

# Node.js
npx http-server -p 8080

# PHP
php -S localhost:8080
```

访问 `http://localhost:8080`

## 📤 部署到GitHub Pages

### 方法一：直接推送（推荐）

1. 创建GitHub仓库
2. 推送整个 `weather-app` 文件夹内容
3. 进入仓库 **Settings** → **Pages**
4. Source选择 **Deploy from a branch**
5. Branch选择 **main** (或master)，文件夹 **/(root)**
6. 点击 **Save**

### 方法二：使用 gh-cli

```bash
cd weather-app
gh repo create weather-app --public --source=. --push
# 启用 Pages
gh api repos/{owner}/{repo}/pages -X PUT -f source={branch: "main"} 
```

## 📁 项目结构

```
weather-app/
├── index.html          # 主页面
├── js/
│   ├── config.js       # API配置（需填写Key）
│   ├── api.js          # API调用封装
│   ├── utils.js        # 工具函数
│   └── app.js          # 主逻辑
├── css/
│   └── style.css       # 样式文件
└── README.md           # 说明文档
```

## ⚠️ 注意事项

- API Key会暴露在前端代码中，建议在GitHub Pages设置中启用域名前缀检查
- 高德API免费版有每日调用限制
- 不要将项目部署在公开仓库中包含敏感信息的分支

## 🎨 界面预览

首页展示热门城市天气，支持搜索和快捷城市点击。

---

**made with ❤️**
