# ArchGemini 开发日志

**日期**: 2026-02-11
**版本**: v0.3.0
**开发者**: Claude Code
**状态**: ✅ 所有任务已完成

---

## 一、概述

本次更新基于 Gemini 3 Pro (`gemini-3-pro-image-preview`) 的多图像控制能力，完成了完整的模板系统和图片角色分配功能。实现了P0（核心功能）、P1（重要功能）和P2（增强功能）的全部任务。

### 主要功能
- 模板系统：13个内置模板 + 自定义模板支持
- 图片角色系统：6种角色类型（风格、构图、材质、色彩、光照、自定义）
- 多图序号控制：最多支持14张参考图片，按顺序自动编号
- 多轮编辑API：支持基于已有图片进行迭代修改
- 高级设置面板：宽高比、分辨率、负面提示词配置

---

## 二、新增文件

### 2.1 后端新增文件

#### `arch-gemini/backend/templates/image_gen_templates.json`
**用途**: 图像生成模板配置文件

**内容摘要**:
- 13个预设模板（风格类4个、场景类4个、效果类5个）
- 每个模板包含：id、名称、描述、promptTemplate、defaultRoles、tags等字段
- 分类系统：style（风格）、scene（场景）、effect（效果）

**模板列表**:
| ID | 名称 | 分类 |
|----|------|------|
| style_modern | 现代简约风格 | style |
| style_nordic | 北欧风格 | style |
| style_industrial | 工业风格 | style |
| style_traditional_chinese | 新中式风格 | style |
| scene_facade | 建筑立面 | scene |
| scene_interior | 室内空间 | scene |
| scene_landscape | 景观设计 | scene |
| scene_plaza | 城市广场 | scene |
| effect_morning | 清晨光照 | effect |
| effect_sunset | 黄金时刻 | effect |
| effect_rainy | 雨天氛围 | effect |
| effect_night | 夜景效果 | effect |
| effect_overcast | 阴天漫射 | effect |

#### `arch-gemini/backend/templates/image_roles.json`
**用途**: 图片角色定义配置文件

**角色列表**:
| ID | 名称 | Icon | 颜色 |
|----|------|------|------|
| style | 风格参考 | palette | #8B5CF6 |
| composition | 构图参考 | layout | #3B82F6 |
| material | 材质参考 | texture | #F59E0B |
| color | 色彩参考 | droplet | #EC4899 |
| lighting | 光照参考 | sun | #FBBF24 |
| custom | 自定义 | edit | #6B7280 |

#### `arch-gemini/backend/services/prompt_builder.py`
**用途**: Prompt模板引擎服务

**主要功能**:
- 模板加载和管理（内置+自定义）
- Prompt变量替换（{prompt}占位符）
- 图片序号自动注入（按图片顺序生成"图片N（Image N）"引用）
- 自定义模板CRUD操作
- 模板格式验证

**关键方法**:
```python
def build_prompt(template_id, user_prompt, images, custom_template) -> str
def build_prompt_with_preview(template_id, user_prompt, images) -> Tuple[str, Dict]
def create_custom_template(template_id, name, description, prompt_template, ...) -> Dict
def validate_template(prompt_template) -> Dict
```

### 2.2 前端新增文件

#### `arch-gemini/frontend/src/pages/TemplateGallery.jsx`
**用途**: 模板画廊页面组件

**功能**:
- 模板卡片展示（带分类颜色、标签、角色信息）
- 模板分类筛选（全部/风格/场景/效果）
- 模板搜索功能
- 模板预览模态框
- 点击应用模板

**UI特性**:
- 响应式网格布局（1-3列自适应）
- 渐变色分类标识
- 悬停效果和动画

#### `arch-gemini/frontend/src/components/ImageRoleSelector.jsx`
**用途**: 图片角色分配组件

**功能**:
- 为每张图片分配角色（风格/构图/材质/色彩/光照/自定义）
- 拖拽排序调整图片顺序
- 图片序号显示（对应API的Image N）
- 角色切换下拉菜单
- 图片预览和删除

**UI特性**:
- 序号徽章显示 "1 / Image 1"
- 缩略图底部显示 "图片X" 标签
- 角色颜色标识
- Prompt生成示例预览

#### `arch-gemini/frontend/src/components/AdvancedSettings.jsx`
**用途**: 高级参数设置面板

**功能**:
- 宽高比选择（1:1, 3:2, 2:3, 4:3, 3:4, 16:9, 21:9）
- 分辨率选择（1K, 2K, 4K）
- 负面提示词编辑
- 快速添加负面词按钮

---

## 三、修改的文件

### 3.1 后端修改

#### `arch-gemini/backend/app.py`

**新增内容**:
1. 导入 prompt_builder 服务
2. 新增数据模型：
   - `ImageWithRole` - 带角色的图片
   - `GenerateWithTemplateRequest` - 模板生成请求
   - `CreateTemplateRequest` - 创建模板请求
   - `UpdateTemplateRequest` - 更新模板请求
   - `PreviewPromptRequest` - Prompt预览请求
   - `EditImageRequest` - 图像编辑请求

3. 新增API端点：
   - `GET /api/templates` - 获取所有模板
   - `GET /api/templates/{id}` - 获取单个模板
   - `GET /api/roles` - 获取所有角色
   - `GET /api/categories` - 获取所有分类
   - `POST /api/templates` - 创建自定义模板
   - `PUT /api/templates/{id}` - 更新自定义模板
   - `DELETE /api/templates/{id}` - 删除自定义模板
   - `POST /api/preview-prompt` - 预览Prompt
   - `POST /api/generate-with-template` - 使用模板生成
   - `POST /api/edit-image` - 多轮图像编辑
   - `POST /api/edit-with-template` - 使用模板编辑

4. 修改 `GenerateRequest` 模型：
   - 新增 `template_id` 字段

#### `arch-gemini/backend/services/gemini_gen.py`

**新增内容**:
1. 常量定义：
   - `MAX_IMAGES_LIMIT = 14` - Gemini API图片上限

2. 辅助函数：
   - `_validate_image_count(images)` - 验证图片数量
   - `_get_image_role_name(role_id)` - 获取角色中文名称
   - `_build_image_reference_text(images)` - 构建图片引用文本

3. 增强功能：
   - 图片数量验证（超出14张时报错）
   - 角色信息日志输出
   - 支持 `role` 字段的图片数据

### 3.2 前端修改

#### `arch-gemini/frontend/src/app.jsx`

**新增内容**:
1. 导入 TemplateGallery 组件
2. 新增状态：
   - `showTemplateGallery` - 控制模板画廊显示
   - `selectedTemplate` - 当前选中的模板

3. 新增函数：
   - `handleApplyTemplate(template)` - 应用模板
   - `handleCloseTemplateGallery()` - 关闭模板画廊

4. UI更新：
   - Header添加"模板画廊"按钮
   - 显示当前应用的模板标签
   - 添加模板画廊模态框

---

## 四、API 端点汇总

### 4.1 模板管理 API

| 方法 | 端点 | 功能 |
|------|------|------|
| GET | `/api/templates` | 获取所有模板列表 |
| GET | `/api/templates?category=xxx` | 按分类获取模板 |
| GET | `/api/templates/{id}` | 获取单个模板详情 |
| POST | `/api/templates` | 创建自定义模板 |
| PUT | `/api/templates/{id}` | 更新自定义模板 |
| DELETE | `/api/templates/{id}` | 删除自定义模板 |

### 4.2 角色和分类 API

| 方法 | 端点 | 功能 |
|------|------|------|
| GET | `/api/roles` | 获取所有角色列表 |
| GET | `/api/categories` | 获取所有分类列表 |

### 4.3 生成相关 API

| 方法 | 端点 | 功能 |
|------|------|------|
| POST | `/api/preview-prompt` | 预览生成的Prompt |
| POST | `/api/generate-with-template` | 使用模板生成图像 |
| POST | `/api/edit-image` | 多轮图像编辑 |
| POST | `/api/edit-with-template` | 使用模板进行编辑 |

---

## 五、数据结构

### 5.1 模板数据结构

```json
{
  "id": "style_modern",
  "categoryId": "style",
  "name": "现代简约风格",
  "description": "现代简约建筑风格，强调线条简洁和功能主义",
  "promptTemplate": "{prompt}, 参考 图片1 的现代简约风格，采用图片2 的空间布局",
  "minImages": 1,
  "maxImages": 3,
  "defaultRoles": ["style", "composition"],
  "tags": ["现代", "简约", "建筑"],
  "is_custom": false
}
```

### 5.2 图片角色数据结构

```json
{
  "data": "base64_encoded_image_data",
  "role": "style"
}
```

### 5.3 生成请求示例

```json
{
  "templateId": "style_modern",
  "userPrompt": "一栋三层办公楼",
  "images": [
    {"data": "base64...", "role": "style"},
    {"data": "base64...", "role": "composition"}
  ],
  "aspectRatio": "16:9",
  "resolution": "2K"
}
```

### 5.4 生成的Prompt格式

```
{prompt}, 参考 图片1 的现代简约风格，采用图片2 的空间布局

参考：
- 图片1（Image 1）：[风格参考] 用作风格参考
- 图片2（Image 2）：[构图参考] 用作构图参考
```

---

## 六、图片序号与API对应关系

根据 Gemini API 官方文档，图片按照在 `contents` 数组中的顺序自动被引用：

| 前端显示 | API内部引用 | contents数组索引 |
|----------|-------------|-----------------|
| 图片1 | Image 1 | 0 |
| 图片2 | Image 2 | 1 |
| 图片3 | Image 3 | 2 |
| ... | ... | ... |
| 图片14 | Image 14 | 13 |

**关键点**:
- 拖拽调整顺序会自动更新序号
- 序号始终对应 API 的引用顺序
- Prompt 中同时显示中文和英文序号确保一致性

---

## 七、待办事项完成情况

### P0 (核心功能) ✅
- [x] 模板配置文件创建
- [x] Prompt 模板引擎
- [x] 多图序号 Prompt 注入
- [x] 图片角色定义

### P1 (重要功能) ✅
- [x] 独立模板页
- [x] 图片角色分配界面
- [x] 模板管理 API

### P2 (增强功能) ✅
- [x] 多轮编辑 API
- [x] 参数增强面板
- [x] 用户自定义模板保存

### 前端待集成 (可选)
- [ ] 集成 AdvancedSettings 到 ImageGenerator
- [ ] 显示当前应用的模板
- [ ] 实时 Prompt 预览
- [ ] 图片角色标签在组合生成页面的集成

---

## 八、文件树结构

```
arch-gemini/
├── backend/
│   ├── templates/
│   │   ├── image_gen_templates.json    # 新增：模板配置
│   │   ├── image_roles.json          # 新增：角色定义
│   │   └── custom_templates.json     # 运行时生成：用户自定义模板
│   ├── services/
│   │   ├── prompt_builder.py         # 新增：Prompt模板引擎
│   │   ├── gemini_gen.py            # 修改：添加多图支持
│   │   ├── gemini_vision.py         # 未修改
│   │   ├── qwen_service.py          # 未修改
│   │   └── __init__.py              # 未修改
│   ├── app.py                        # 修改：新增API端点
│   ├── core/
│   │   ├── config.py                # 未修改
│   │   ├── http_client.py           # 未修改
│   │   └── logger.py                # 未修改
│   ├── prompts.py                    # 未修改
│   └── analysis_prompts.py           # 未修改
│
└── frontend/src/
    ├── pages/
    │   └── TemplateGallery.jsx       # 新增：模板画廊页
    ├── components/
    │   ├── ImageRoleSelector.jsx     # 新增：角色选择器
    │   ├── AdvancedSettings.jsx      # 新增：高级设置
    │   ├── ImageGenerator.jsx        # 未修改
    │   ├── ImageUploader.jsx         # 未修改
    │   ├── PromptOptimizer.jsx       # 未修改
    │   ├── ImageAnalyzer.jsx         # 未修改
    │   └── HistorySidebar.jsx        # 未修改
    ├── app.jsx                        # 修改：集成模板画廊
    ├── config.js                      # 未修改
    └── main.jsx                       # 未修改
```

---

## 九、技术栈

### 后端
- Python 3.x
- FastAPI
- httpx (异步HTTP客户端)
- Google Gemini API (`gemini-3-pro-image-preview`)
- Qwen API (`qwen-plus`)

### 前端
- React 18.2.0
- Vite
- Tailwind CSS
- Lucide React (图标库)
- IndexedDB (本地存储)

---

## 十、参考文档

- [Gemini API - Image Generation](https://ai.google.dev/gemini-api/docs/image-generation)
- [Gemini API - Imagen](https://ai.google.dev/gemini-api/docs/imagen)
- [Gemini 2.5 Flash Image Tutorial](https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/getting-started/intro_gemini_2_5_image_gen.ipynb)

---

## 十一、维护备注

### 扩展模板
在 `image_gen_templates.json` 中添加新模板对象即可。

### 扩展角色
在 `image_roles.json` 中添加新角色对象，并在前端 `ImageRoleSelector.jsx` 中的 `ROLE_CONFIG` 同步更新。

### API调用示例
```bash
# 获取所有模板
curl http://localhost:18000/api/templates

# 使用模板生成
curl -X POST http://localhost:18000/api/generate-with-template \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "style_modern",
    "userPrompt": "一栋三层办公楼",
    "images": [{"data": "base64...", "role": "style"}],
    "aspectRatio": "16:9",
    "resolution": "2K"
  }'
```

---

## 十二、Bug 修复记录

### 12.1 组合模式图片序号显示修复 (2026-02-11 21:30)

**问题描述**:
组合生成模式下，上传的图片没有显示序号标识，用户无法知道哪张图片对应"图片1"、"图片2"等API引用。

**修复内容**:

#### 修改的文件

1. **`arch-gemini/frontend/src/components/ImageUploader.jsx`**
   - 新增 `showImageNumbers` 属性（默认值：`false`）
   - 当 `showImageNumbers=true` 时，为每张图片添加：
     - 左上角数字徽章：显示序号 "1", "2", "3"...
     - 底部标签条：显示 "图片1", "图片2"...
   - 添加序号说明组件，解释图片编号与 Gemini API "Image 1", "Image 2" 的对应关系

2. **`arch-gemini/frontend/src/app.jsx`**
   - 组合模式的 `ImageUploader` 组件添加 `showImageNumbers={true}` 属性
   - 使组合模式下的图片自动显示序号标识

**实现效果**:
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 1         │  │ 2         │  │ 3         │
│    图片    │  │    图片    │  │    图片    │
│    缩略图  │  │    缩略图  │  │    缩略图  │
│    图片1   │  │    图片2   │  │    图片3   │
└─────────────┘  └─────────────┘  └─────────────┘
```

**序号对应关系**:
| 前端显示 | 后端API引用 | contents数组索引 |
|----------|-------------|-----------------|
| 图片1 | Image 1 | 0 |
| 图片2 | Image 2 | 1 |
| 图片3 | Image 3 | 2 |
| ... | ... | ... |
| 图片14 | Image 14 | 13 |

---

**文档生成时间**: 2026-02-11 21:30:00
**项目版本**: v0.3.1
**最后更新**: 组合模式图片序号显示功能已完成
