# 知天气 - 天气查询网站

🌤️ 基于高德地图API的天气查询网站

## ✨ 功能特性

- 实时天气查询
- 未来天气预报
- 热门城市天气展示
- 快捷城市入口
- 响应式设计

## 🚀 快速开始

### 本地开发

```bash
cd weather-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 配置API Key

**方式1：GitHub Secrets（推荐用于部署）**

1. 进入GitHub仓库 → Settings → Secrets and variables → Actions
2. 添加 Secret:
   - Name: `VITE_AMAP_API_KEY`
   - Value: 你的高德地图API Key

**方式2：本地环境变量**

```bash
export VITE_AMAP_API_KEY=你的API Key
npm run dev
```

**方式3：手动填写（仅本地测试）**

编辑 `js/config.js`:
```javascript
apiKey: '你的API Key',
```

## 📤 部署到GitHub Pages

1. 创建GitHub仓库
2. 推送代码（确保js/config.js在.gitignore中）
3. 进入仓库 → Settings → Pages
4. Source选择 **GitHub Actions**
5. 推送代码到main分支自动部署

或手动配置：
```bash
# Settings → Secrets 添加 VITE_AMAP_API_KEY
# Settings → Pages → Source: GitHub Actions
```

## 📁 项目结构

```
weather-app/
├── index.html
├── package.json
├── vite.config.js
├── .github/workflows/deploy.yml
├── .gitignore
├── css/
│   └── style.css
└── js/
    ├── config.example.js    # 配置模板
    ├── api.js
    ├── utils.js
    └── app.js
```

## ⚠️ 注意事项

- API Key通过GitHub Secrets管理，不暴露在代码中
- js/config.js 被.gitignore保护，不会提交到GitHub
- 高德API免费版有每日调用限制

## 申请API Key

https://lbs.amap.com/
