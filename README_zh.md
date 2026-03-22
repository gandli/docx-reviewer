# DOCX Reviewer
基于本地 LLM 的 DOCX 文档智能审阅工具 - 完全在浏览器中运行

## 技术栈
- 框架: Next.js 14 + TypeScript
- LLM 推理: @mlc-ai/web-llm (WebGPU)
- 向量嵌入: @xenova/transformers (Transformers.js)
- 向量搜索: voy-search
- Python 运行时: Pyodide (WASM)
- 状态管理: Zustand
- UI: Tailwind CSS + Framer Motion + Radix UI
- 存储: IndexedDB

## 功能特性

### AI 智能审阅
- 本地 LLM 推理 (WebGPU 加速)
- 自动语法检查和修改建议
- 风格改进和表达优化
- 完全离线运行,隐私安全

### 语义搜索
- 向量嵌入搜索
- 快速定位相关内容
- 支持自然语言查询

### 修订追踪
- 完整的修订历史
- 可视化对比视图
- 一键接受/拒绝修改

### 本地存储
- IndexedDB 持久化
- 离线可用
- 自动保存

## 快速开始

### 安装依赖
```bash
bun install
```

### 开发
```bash
bun dev
```

访问 http://localhost:3000

### 构建
```bash
bun run build
```

### 生产运行
```bash
bun run start
```

## 使用说明
1. **上传文档**: 拖拽或选择 .docx 文件
2. **AI 审阅**: 点击 AI 审阅助手,输入审阅指令
3. **查看修订**: 在修订面板查看 AI 建议
4. **语义搜索**: 使用自然语言搜索文档内容
5. **管理修订**: 接受或拒绝每条修改建议

## 支持的模型
默认使用 `Qwen2.5-1.5B-Instruct-q4f32_1-MLC`,可在 `LLMPanel.tsx` 中修改.

其他可用模型:
- `Llama-3-8B-Instruct-q4f32_1-MLC`
- `Mistral-7B-Instruct-v0.3-q4f32_1-MLC`
- `Phi-3.5-mini-instruct-q4f32_1-MLC`

## 系统要求
- 支持 WebGPU 的现代浏览器 (Chrome 113+, Edge 113+)
- 至少 4GB RAM (推荐 8GB+)
- 支持 WASM

## 项目结构
```
docx-reviewer/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # 主页面
│   │   ├── layout.tsx    # 根布局
│   │   └── globals.css   # 全局样式
│   ├── components/
│   │   ├── editor/       # 编辑器组件
│   │   ├── llm/          # LLM 相关组件
│   │   └── search/       # 搜索组件
│   ├── lib/              # 核心库
│   │   ├── webLLM.ts     # WebLLM 封装
│   │   ├── vectorSearch.ts # 向量搜索
│   │   ├── docxParser.ts # DOCX 解析
│   │   └── storage.ts    # IndexedDB 存储
│   ├── stores/           # Zustand 状态
│   │   └── editorStore.ts
│   └── types/            # TypeScript 类型
│       └── index.ts
└── public/
    └── models/           # 本地模型缓存
```

## 开发说明

### WebGPU 要求
确保浏览器启用了 WebGPU 支持:
- Chrome: `chrome://flags/#enable-unsafe-webgpu`

### 模型下载
首次使用会自动下载模型(约 1-2GB),后续会使用缓存.

### Pyodide 限制
DOCX 解析使用 Pyodide,首次加载需要下载 Python 运行时(约 6MB).

## License
MIT
