## 多智能体应急救援系统

这是一个专为灾害应急响应设计的多智能体协同救援系统。该系统通过协调多个自主代理来高效执行搜索和救援任务。

### 系统架构

系统主要由以下组件构成：
- **指挥官（Commander）**：中心协调代理
- **地理分析员（GeoAnalyst）**：地理信息系统分析代理
- **无人机飞控员（UAVController）**：无人飞行器控制模块

### 核心功能

- 多个救援代理的实时协同
- 地理空间分析能力
- 无人机控制与监控
- 应急响应管理

### 安装指南
新建虚拟环境并安装依赖包：
```bash
pip install -r requirements.txt
```
### 系统配置
修改config.json文件进行相关配置。qgis环境配置请参考：https://gcn56mhheuis.feishu.cn/wiki/YIPgwgYWhixsczkp4WfcN0sKnsg?from=from_copylink
- **系统大模型配置**：修改name，API_KEY，base_url
- **QGIS_MCP路径**：修改dir为qgis_mcp/src/qgis_mcp的绝对路径

### 使用方法

启动系统：

```bash
python start.py
```