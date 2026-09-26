# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20113>



## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`



## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Redux Toolkit + IndexedDB |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`

## 巡演换场（走场包导出 / 导入）

舞台预览页 `/preview` 支持把选中的演出方案打包带走、到别的机器贴回继续改：

- **导出**：选中方案后生成走场包 JSON（可复制或下载）。包内只留方案用到的灯具、场景和轨道，并带 `kind` 与格式版本号 `version`（当前 `v1`，见 `frontend/src/constants/transferFormat.ts`）。
- **导入**：粘贴走场包 JSON 后依次核对——
  1. 格式版本是否受支持；
  2. 方案 / 轨道 / 场景引用的灯具和场景在导入后的数据里是否都在；
  3. 是否有两盏灯占用同一段 DMX 地址（`dmx_address` 起连续 `channel_count` 个地址，段重叠即冲突）。

  任一不通过只点出**第一条冲突**，当前数据照旧；全部通过才按编号合并：同编号保留 `updated_at` 较新的一份，已归档（`ARCHIVED`）场景不参与合并。
- 涉及文件：`api/ShowTransfer.ts`（异步封装与日志）、`utils/showTransfer.ts`（校验与合并）、`utils/dmx.ts`（地址段冲突）、`constructors/ShowTransferConstructor.ts`（组包与引用解析）、`types/ShowTransfer.ts`、`hooks/useDmxAddressCheck.ts`、`pages/PreviewPage.tsx`。

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-stage-light}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FixtureType: constants/FixtureType、types/FixtureType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- CueStatus: constants/CueStatus、types/CueStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ChannelMode: constants/ChannelMode、types/ChannelMode、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
