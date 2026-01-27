# COSL Front Rebuild - Web 前端

## 项目概述
COSL 测试管理系统的 Web 前端，基于 v3-admin-vite 模板构建的中后台管理系统。

## 技术栈
- **框架**: Vue 3.4 + TypeScript 5.4
- **UI 组件**: Element Plus 2.8
- **状态管理**: Pinia 2.1
- **构建工具**: Vite 5.2
- **CSS 框架**: UnoCSS + SCSS
- **表格组件**: vxe-table
- **图表**: ECharts 5.5

## 项目结构
```
cosl-front-rebuild/
├── src/
│   ├── api/              # API 请求模块
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── config/           # 配置文件
│   ├── constants/        # 常量定义
│   ├── directives/       # 自定义指令
│   ├── hooks/            # 组合式函数
│   ├── icons/            # 图标资源
│   ├── layouts/          # 布局组件
│   ├── plugins/          # 插件配置
│   ├── router/           # 路由配置
│   ├── store/            # Pinia 状态
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   └── views/            # 页面视图
├── tests/                # 测试文件
└── types/                # 类型定义
```

## 启动命令
```bash
# 安装依赖
pnpm install

# 开发环境
pnpm dev

# 构建生产版本
pnpm build:prod

# 代码检查
pnpm lint
```

## 环境配置
- `.env.development` - 开发环境
- `.env.staging` - 测试环境
- `.env.production` - 生产环境

## 开发规范
- 使用中文注释
- 组件使用 `<script setup>` 语法
- 类型定义放在 `types/` 目录
- API 请求统一在 `api/` 目录定义
- 使用 Composition API

## 相关项目
- cnooc-backend: Django 后端服务
- cosl-operator-tauri: 桌面客户端
