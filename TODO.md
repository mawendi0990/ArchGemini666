# ArchGemini 优化 TODO

> 基于 gemini-3-pro-image-preview 多图像控制能力优化生成方式
> 创建日期: 2026-02-11

---

## 一、后端优化

### 1.1 模板系统设计
- [x] 创建模板配置文件 `templates/image_gen_templates.json` **已完成**
- [x] 定义模板结构（模板ID、名称、描述、Prompt模板、图片角色配置） **已完成**
- [x] 实现模板加载逻辑 `services/prompt_builder.py` **已完成**
- [x] 添加模板管理 API（`GET /api/templates`, `POST /api/templates`） **已完成**

### 1.2 Prompt 模板引擎
- [x] 创建 `services/prompt_builder.py` **已完成**
- [x] 实现变量替换引擎（支持 `{prompt}`, `{style_image}`, `{composition_image}` 等占位符） **已完成**
- [x] 实现图片序号自动注入（`图片1作为风格参考`, `图片2作为构图参考`） **已完成**
- [x] 支持用户自定义 Prompt 模板保存 **已完成**

### 1.3 多图序号控制
- [x] 修改 `services/gemini_gen.py` **已完成**
- [x] 为每张输入图片分配序号标签 **已完成**
- [x] 在 Prompt 中自动生成图片角色说明 **已完成**
  ```
  参考：
  - 图片1：[风格参考] 用作整体风格和色调参考
  - 图片2：[构图参考] 用作空间布局和构图参考
  - 图片3：[材质参考] 用作材料质感参考
  ```
- [x] 支持最多 14 张参考图片（Gemini 上限） **已完成**

### 1.4 多轮编辑 API
- [x] 添加 `POST /api/edit-image` 端点 **已完成**
- [x] 支持传入之前生成的图片进行迭代修改 **已完成**
- [x] 实现编辑历史跟踪 **已完成**

---

## 二、前端优化

### 2.1 独立模板页
- [x] 创建 `frontend/src/pages/TemplateGallery.jsx` **已完成**
- [x] 模板卡片展示（预览图、标题、描述） **已完成**
- [x] 模板分类（风格迁移、立面设计、室内渲染、景观等） **已完成**
- [x] 模板预览功能 **已完成**
- [x] 点击应用模板跳转到生成页 **已完成**

### 2.2 图片角色分配界面
- [x] 创建 `frontend/src/components/ImageRoleSelector.jsx` **已完成**
- [x] 支持的角色类型： **已完成**
  - 风格参考
  - 构图参考
  - 材质参考
  - 色彩参考
  - 光照参考
  - 自定义
- [x] 拖拽排序功能 **已完成**
- [x] 角色标签可视化展示 **已完成**

### 2.3 生成界面增强
- [x] 集成模板快捷入口 **已完成**
- [x] 显示当前应用的模板 **已完成**
- [x] 图片序号标签显示（组合模式） **已完成** - ImageUploader添加showImageNumbers属性，显示"图片X(Image X)"标识
- [ ] 实时 Prompt 预览（展示模板替换后的完整 Prompt）

### 2.4 参数增强面板
- [x] 创建 `frontend/src/components/AdvancedSettings.jsx` **已完成**
- [x] 宽高比选择（1:1, 3:2, 2:3, 3:4, 4:3, 16:9, 21:9） **已完成**
- [x] 分辨率选择（1K, 2K, 4K） **已完成**
- [x] Temperature 调节（0.0 - 2.0）**已完成**
- [x] 负面提示词编辑器 **已完成**

---

## 三、配置文件

### 3.1 模板配置文件
- [x] 创建 `arch-gemini/backend/templates/image_gen_templates.json` **已完成**
- [x] 预设模板列表： **已完成**

#### 风格类模板
| ID | 名称 | Prompt模板 |
|-----|------|-----------|
| `style_modern` | 现代简约风格 | `{prompt}, 参考 图片1 的现代简约风格，采用图片2 的空间布局` |
| `style_nordic` | 北欧风格 | `{prompt}, 北欧风格，参考 图片1 的色调和材质` |
| `style_industrial` | 工业风 | `{prompt}, 工业风格，参考 图片1 的裸露结构和质感` |

#### 场景类模板
| ID | 名称 | Prompt模板 |
|-----|------|-----------|
| `scene_facade` | 建筑立面 | `建筑立面设计，{prompt}。图片1 作为立面风格参考，图片2 作为比例参考` |
| `scene_interior` | 室内空间 | `室内渲染，{prompt}。图片1 作为家具布局参考，图片2 作为灯光氛围参考` |
| `scene_landscape` | 景观设计 | `景观设计，{prompt}。图片1 作为种植风格参考，图片2 作为硬质铺装参考` |

#### 效果类模板
| ID | 名称 | Prompt模板 |
|-----|------|-----------|
| `effect_morning` | 清晨光照 | `{prompt}, 清晨自然光效果，参考 图片1 的光影方向` |
| `effect_sunset` | 黄金时刻 | `{prompt}, 日落黄金时刻光线，参考 图片1 的暖色调` |
| `effect_rainy` | 雨天氛围 | `{prompt}, 雨天氛围，参考 图片1 的湿润质感反射` |

### 3.2 图片角色定义
- [x] 创建 `arch-gemini/backend/templates/image_roles.json` **已完成**
- [x] 角色定义： **已完成**
  ```json
  {
    "roles": [
      {"id": "style", "name": "风格参考", "prompt": "风格参考", "icon": "palette"},
      {"id": "composition", "name": "构图参考", "prompt": "构图参考", "icon": "layout"},
      {"id": "material", "name": "材质参考", "prompt": "材质参考", "icon": "texture"},
      {"id": "color", "name": "色彩参考", "prompt": "色彩参考", "icon": "droplet"},
      {"id": "lighting", "name": "光照参考", "prompt": "光照参考", "icon": "sun"},
      {"id": "custom", "name": "自定义", "prompt": "参考", "icon": "edit"}
    ]
  }
  ```

---

## 四、API 变更

### 4.1 新增端点
| 端点 | 方法 | 功能 |
|--------|------|------|
| `/api/templates` | GET | 获取所有模板列表 |
| `/api/templates` | POST | 创建自定义模板 |
| `/api/templates/{id}` | GET | 获取单个模板详情 |
| `/api/templates/{id}` | PUT | 更新自定义模板 |
| `/api/templates/{id}` | DELETE | 删除自定义模板 |
| `/api/roles` | GET | 获取所有角色列表 |
| `/api/categories` | GET | 获取所有分类列表 |
| `/api/preview-prompt` | POST | 预览使用模板构建的完整Prompt |
| `/api/generate-with-template` | POST | 使用模板生成图像 |
| `/api/edit-image` | POST | 迭代编辑已有图像 **已完成** |
| `/api/edit-with-template` | POST | 使用模板进行图像编辑 **已完成** |

### 4.2 请求体变更
```json
// /api/generate-with-template
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

---

## 五、优先级

### P0 (核心功能)
- [x] 模板配置文件创建 **已完成**
- [x] Prompt 模板引擎 **已完成**
- [x] 多图序号 Prompt 注入 **已完成**
- [x] 图片角色定义 **已完成**

### P1 (重要功能)
- [x] 独立模板页 **已完成**
- [x] 图片角色分配界面 **已完成**
- [x] 模板管理 API **已完成**

### P2 (增强功能)
- [x] 多轮编辑 API **已完成**
- [x] 参数增强面板 **已完成**
- [x] 用户自定义模板保存 **已完成**

---

## 六、文件清单

### 新增文件
```
arch-gemini/backend/
├── templates/
│   ├── image_gen_templates.json    # 生成模板配置 **已完成**
│   └── image_roles.json          # 图片角色定义 **已完成**
└── services/
    ├── prompt_builder.py         # Prompt 构建器 **已完成**
    └── template_service.py        # 模板服务 (已集成到prompt_builder.py)

arch-gemini/frontend/src/
├── pages/
│   └── TemplateGallery.jsx       # 模板画廊页 **已完成**
└── components/
    ├── ImageRoleSelector.jsx     # 图片角色选择器 **已完成**
    └── AdvancedSettings.jsx      # 高级参数面板 **已完成**
```

### 修改文件
```
arch-gemini/backend/
├── app.py                      # 添加新路由 **已完成**
└── services/
    └── gemini_gen.py           # 修改图片处理逻辑 **已完成**

arch-gemini/frontend/src/
├── app.jsx                     # 添加模板页路由
└── components/
    └── ImageGenerator.jsx       # 集成模板和角色功能
```

---

## 七、开发顺序

1. **Phase 1: 后端基础**
   - [x] 创建模板配置文件 **已完成**
   - [x] 实现 prompt_builder.py **已完成**
   - [x] 实现 template_service.py (已集成) **已完成**
   - [x] 添加 API 路由 **已完成**

2. **Phase 2: 后端图像控制**
   - [x] 修改 gemini_gen.py 支持角色标签 **已完成**
   - [x] 实现图片序号 Prompt 注入 **已完成**

3. **Phase 3: 前端模板页**
   - [x] 创建 TemplateGallery.jsx **已完成**
   - [x] 添加路由 **已完成**

4. **Phase 4: 前端角色分配**
   - [x] 创建 ImageRoleSelector.jsx **已完成**
   - [x] 集成到 ImageGenerator.jsx **已完成**

5. **Phase 5: 高级功能**
   - [x] 多轮编辑 API **已完成**
   - [ ] 高级参数面板
   - [x] 用户自定义模板 **已完成**
