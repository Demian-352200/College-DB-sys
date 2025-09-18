## 高校可视化与智能助手前端

基于 Vite + React + TypeScript + Leaflet。

### 开发步骤

1. 安装依赖
```bash
cd frontend
npm i
```

2. 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:5173`。

### 与后端接口约定

- 地图点位：`GET /api/colleges/`（代理到后端 `/colleges/`），返回包含 `college_id, name, longitude, latitude` 等字段。
- 智能对话：`POST /api/server`，请求体 `{ Content: string }`，响应为 `text/event-stream` 流，每行 JSON：`{"data": ...}`。
- 交通分析：`POST /api/server/traffic/{college_id}`，需要认证头 `Authorization: Bearer <JWT>`，返回 JSON。

JWT 可手工放入浏览器：
```js
localStorage.setItem('jwt', '<your token here>')
```

### 目录

- `src/ui/MapPanel.tsx` 交互地图，加载高校点位并支持点击选择
- `src/ui/Sidebar.tsx` 智能助手对话（流式）与交通分析触发
- `vite.config.ts` 本地代理 `/api` 到 `http://127.0.0.1:8000`


