# 全国高校生活评价空间信息数据库系统

全国高校生活评价空间信息数据库系统是一个集成了地理信息系统(GIS)和高校信息管理的综合性平台。该系统允许用户查看全国高校的地理位置信息、基本属性以及生活评价，并提供管理员审核功能。

## 项目结构

```
.
├── Server/                 # 后端服务
│   ├── agents/             # AI智能助手相关模块
│   ├── fast_api/           # FastAPI后端接口
│   │   ├── common/         # 通用模块
│   │   ├── model/          # 数据模型
│   │   ├── resources/      # API资源
│   │   └── services/       # 业务逻辑服务
│   └── ...
├── data/                   # 数据处理脚本
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   └── ui/             # UI组件
│   └── ...
└── ...
```

## 技术栈

### 后端技术栈
- Python 3.x
- FastAPI - 高性能Web框架
- SQLAlchemy - ORM框架
- MySQL - 数据库
- AutoGen - AI智能助手框架
- GeoPackage - 地理空间数据格式

### 前端技术栈
- React 18
- TypeScript
- Vite - 构建工具
- Leaflet - 地图展示
- CSS3 - 样式

## 功能特性

1. **高校信息管理**
   - 查看全国高校的地理位置信息
   - 按省份、城市、类别等条件筛选高校
   - 展示高校详细信息（985/211/双一流标识等）

2. **地图可视化**
   - 基于Leaflet的地图展示
   - 高校地理位置标记
   - 交互式地图操作

3. **生活评价系统**
   - 用户可以对高校的生活条件进行评价
   - 包括饮食、交通等方面的评价
   - 管理员审核评价内容

4. **智能助手**
   - 基于AI的智能对话系统
   - 提供高校相关信息咨询
   - 交通路线分析功能

5. **权限管理**
   - 用户和管理员角色区分
   - JWT认证机制
   - 管理员审核功能

## 环境要求

### 后端环境
- Python 3.8+
- MySQL 5.7+
- GDAL (用于地理数据处理)

### 前端环境
- Node.js 16+
- npm 或 yarn

## 安装与运行

### 数据库初始化

1. 创建MySQL数据库：
```sql
CREATE DATABASE college_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 导入地理数据：
```bash
cd data
chmod +x import_geo_data.sh
./import_geo_data.sh
```

### 后端服务

1. 安装依赖：
```bash
cd Server
pip install -r requirements.txt  # 假设有requirements.txt文件
```

2. 配置环境：
修改 [Server/config.json](file:///media/csudxy0219/ZL/jiang_workspace/CollegeServer_db/Server/config.json) 文件，设置API密钥等配置：
```json
{
    "model": {
        "name": "deepseek-chat",
        "API_KEY": "your_api_key",
        "base_url": "https://api.deepseek.com/v1"
    },
    "AMAP": {
        "AMAP_API_KEY": "your_amap_key",
        "AMAP_TRANSIT_ROUTE_URL": "https://restapi.amap.com/v5/direction/transit/integrated"
    },
    "ngrok": {
        "token": "your_ngrok_token"
    }
}
```

3. 启动服务：
```bash
cd Server
python start.py
```

### 前端应用

1. 安装依赖：
```bash
cd frontend
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

## API接口

主要API接口包括：

- `GET /colleges/` - 获取所有高校数据
- `POST /server` - 智能助手对话接口
- `POST /server/traffic/{college_id}` - 交通分析接口

详细接口文档请参考 [openapi.json](file:///media/csudxy0219/ZL/jiang_workspace/CollegeServer_db/openapi.json) 文件。

## 部署

建议使用以下方式进行生产部署：

1. 使用Gunicorn部署FastAPI后端服务
2. 使用Nginx作为反向代理和静态文件服务器
3. 配置域名和SSL证书
4. 设置数据库备份策略

## 开发指南

### 添加新功能

1. 后端API开发：
   - 在 [Server/fast_api/resources/](file:///media/csudxy0219/ZL/jiang_workspace/CollegeServer_db/Server/fast_api/resources/) 目录下创建新的资源文件
   - 在 [Server/fast_api/services/](file:///media/csudxy0219/ZL/jiang_workspace/CollegeServer_db/Server/fast_api/services/) 目录下实现业务逻辑
   - 在 [Server/fast_api/model/](file:///media/csudxy0219/ZL/jiang_workspace/CollegeServer_db/Server/fast_api/model/) 目录下定义数据模型

2. 前端组件开发：
   - 在 [frontend/src/ui/](file:///media/csudxy0219/ZL/jiang_workspace/CollegeServer_db/frontend/src/ui/) 目录下创建新的UI组件
   - 在 [frontend/src/pages/](file:///media/csudxy0219/ZL/jiang_workspace/CollegeServer_db/frontend/src/pages/) 目录下创建新页面

### 代码规范

- 后端代码遵循PEP8规范
- 前端代码使用TypeScript，遵循React最佳实践
- 提供充分的注释和文档

## 贡献

欢迎提交Issue和Pull Request来改进系统。

## 许可证

MIT License

Copyright (c) 2025 全国高校生活评价空间信息数据库系统

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
