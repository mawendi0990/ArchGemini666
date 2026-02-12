"""
ArchGemini Prompt Builder Service
实现Prompt模板引擎，支持变量替换和图片序号自动注入
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from copy import deepcopy


class PromptBuilder:
    """Prompt模板构建器"""

    # 模板文件路径
    TEMPLATES_FILE = Path(__file__).parent.parent / "templates" / "image_gen_templates.json"
    ROLES_FILE = Path(__file__).parent.parent / "templates" / "image_roles.json"

    # 自定义模板存储路径
    CUSTOM_TEMPLATES_FILE = Path(__file__).parent.parent / "templates" / "custom_templates.json"

    def __init__(self):
        self._templates: Dict[str, Any] = {}
        self._roles: Dict[str, Any] = {}
        self._custom_templates: Dict[str, Any] = {}
        self._load_templates()
        self._load_roles()
        self._load_custom_templates()

    def _load_templates(self):
        """加载内置模板配置"""
        try:
            if self.TEMPLATES_FILE.exists():
                with open(self.TEMPLATES_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # 将模板列表转换为字典便于快速查找
                    self._templates = {
                        t["id"]: t for t in data.get("templates", [])
                    }
                    self._categories = data.get("categories", {})
        except Exception as e:
            print(f"Error loading templates: {e}")
            self._templates = {}
            self._categories = {}

    def _load_roles(self):
        """加载图片角色配置"""
        try:
            if self.ROLES_FILE.exists():
                with open(self.ROLES_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # 将角色列表转换为字典
                    self._roles = {
                        r["id"]: r for r in data.get("roles", [])
                    }
        except Exception as e:
            print(f"Error loading roles: {e}")
            self._roles = {}

    def _load_custom_templates(self):
        """加载用户自定义模板"""
        try:
            if self.CUSTOM_TEMPLATES_FILE.exists():
                with open(self.CUSTOM_TEMPLATES_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self._custom_templates = {
                        t["id"]: t for t in data.get("templates", [])
                    }
        except Exception as e:
            print(f"Error loading custom templates: {e}")
            self._custom_templates = {}

    def _save_custom_templates(self):
        """保存用户自定义模板"""
        try:
            self.CUSTOM_TEMPLATES_FILE.parent.mkdir(parents=True, exist_ok=True)
            with open(self.CUSTOM_TEMPLATES_FILE, 'w', encoding='utf-8') as f:
                json.dump({
                    "version": "1.0.0",
                    "description": "用户自定义模板",
                    "templates": list(self._custom_templates.values())
                }, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving custom templates: {e}")

    # ========== 模板查询 ==========

    def get_all_templates(self) -> List[Dict[str, Any]]:
        """获取所有模板（包括内置和自定义）"""
        all_templates = []
        for t in self._templates.values():
            all_templates.append({**t, "is_custom": False})
        for t in self._custom_templates.values():
            all_templates.append({**t, "is_custom": True})
        return all_templates

    def get_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """获取单个模板"""
        if template_id in self._templates:
            return {**self._templates[template_id], "is_custom": False}
        if template_id in self._custom_templates:
            return {**self._custom_templates[template_id], "is_custom": True}
        return None

    def get_templates_by_category(self, category_id: str) -> List[Dict[str, Any]]:
        """按分类获取模板"""
        all_templates = self.get_all_templates()
        return [t for t in all_templates if t.get("categoryId") == category_id]

    def get_categories(self) -> Dict[str, Any]:
        """获取所有分类"""
        return self._categories

    # ========== 角色查询 ==========

    def get_all_roles(self) -> List[Dict[str, Any]]:
        """获取所有角色"""
        return list(self._roles.values())

    def get_role(self, role_id: str) -> Optional[Dict[str, Any]]:
        """获取单个角色"""
        return self._roles.get(role_id)

    # ========== Prompt 构建 ==========

    def build_prompt(
        self,
        template_id: str,
        user_prompt: str,
        images: Optional[List[Dict[str, Any]]] = None,
        custom_template: Optional[str] = None
    ) -> str:
        """
        构建最终Prompt

        Args:
            template_id: 模板ID
            user_prompt: 用户输入的提示词
            images: 图片列表，每项包含 {"data": base64, "role": "style"}
            custom_template: 自定义模板字符串（如果提供则覆盖模板ID）

        Returns:
            构建好的完整Prompt
        """
        # 获取模板
        template_str = custom_template
        if not template_str:
            template = self.get_template(template_id)
            if template:
                template_str = template.get("promptTemplate", "")
            else:
                # 如果没有模板，直接返回用户提示词
                template_str = "{prompt}"

        # 替换 {prompt} 变量
        result = template_str.replace("{prompt}", user_prompt)

        # 构建图片序号引用
        if images:
            result = self._inject_image_references(result, images)

        return result

    def _inject_image_references(self, template: str, images: List[Dict[str, Any]]) -> str:
        """
        在模板中注入图片序号引用

        根据Gemini API文档，图片按照在contents数组中的顺序自动被引用为"Image 1"、"Image 2"等。
        在prompt中使用中文"图片1"、"图片2"等来引用，API会自动理解。

        生成格式示例：
        参考：
        - 图片1（Image 1）：[风格参考] 用作整体风格和色调参考
        - 图片2（Image 2）：[构图参考] 用作空间布局和构图参考
        """
        if not images:
            return template

        # 获取角色名称映射
        role_names = {rid: r.get("name", rid) for rid, r in self._roles.items()}

        # 为每张图片生成引用说明（按照图片顺序，与API的Image N对应）
        image_references = []
        for idx, img in enumerate(images, start=1):
            role = img.get("role", "custom")
            role_name = role_names.get(role, role)

            # 同时显示中文和英文序号，确保与API一致
            # Gemini API按照contents数组顺序将图片标记为Image 1, Image 2, etc.
            image_references.append(
                f"- 图片{idx}（Image {idx}）：[{role_name}] 用作{role_name}"
            )

        # 替换模板中的 {图片N} 占位符
        for idx in range(1, len(images) + 1):
            template = template.replace(f"{{图片{idx}}}", f"图片{idx}")

        # 检查是否需要添加参考说明
        if "参考：" not in template and "参考 " not in template:
            # 在prompt后添加参考图说明
            ref_text = "\n\n参考：\n" + "\n".join(image_references)
            template = template + ref_text
        else:
            # 如果已有参考说明，检查是否需要追加
            lines = template.split("\n")
            result_lines = []
            added = False
            for line in lines:
                result_lines.append(line)
                if ("参考：" in line or "参考\n" in line) and not added:
                    result_lines.extend(image_references)
                    added = True
            if added:
                template = "\n".join(result_lines)

        return template

    def build_prompt_with_preview(
        self,
        template_id: str,
        user_prompt: str,
        images: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        构建Prompt并返回预览信息

        Returns:
            (完整Prompt, 预览信息)
        """
        template = self.get_template(template_id)

        if not template:
            # 无模板情况
            final_prompt = user_prompt
            if images:
                final_prompt = self._inject_image_references(final_prompt, images)
            preview = {
                "template_id": None,
                "template_name": "无模板",
                "variables_replaced": {"prompt": user_prompt},
                "image_count": len(images) if images else 0
            }
            return final_prompt, preview

        # 构建Prompt
        final_prompt = self.build_prompt(template_id, user_prompt, images)

        # 生成预览信息
        variables_replaced = {
            "prompt": user_prompt
        }
        if images:
            for idx, img in enumerate(images):
                role = img.get("role", "custom")
                role_info = self._roles.get(role, {})
                variables_replaced[f"image_{idx+1}"] = f"图片{idx+1} ({role_info.get('name', role)})"

        preview = {
            "template_id": template_id,
            "template_name": template.get("name", ""),
            "template_description": template.get("description", ""),
            "category_id": template.get("categoryId", ""),
            "variables_replaced": variables_replaced,
            "image_count": len(images) if images else 0,
            "estimated_length": len(final_prompt)
        }

        return final_prompt, preview

    # ========== 自定义模板管理 ==========

    def create_custom_template(
        self,
        template_id: str,
        name: str,
        description: str,
        prompt_template: str,
        category_id: str = "custom",
        default_roles: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        创建自定义模板

        Returns:
            创建的模板
        """
        if template_id in self._custom_templates:
            raise ValueError(f"模板ID '{template_id}' 已存在")

        template = {
            "id": template_id,
            "categoryId": category_id,
            "name": name,
            "description": description,
            "promptTemplate": prompt_template,
            "minImages": 0,
            "maxImages": 14,
            "defaultRoles": default_roles or [],
            "is_custom": True
        }

        self._custom_templates[template_id] = template
        self._save_custom_templates()

        return template

    def update_custom_template(
        self,
        template_id: str,
        **updates
    ) -> Optional[Dict[str, Any]]:
        """更新自定义模板"""
        if template_id not in self._custom_templates:
            return None

        template = self._custom_templates[template_id]
        template.update(updates)
        self._save_custom_templates()

        return template

    def delete_custom_template(self, template_id: str) -> bool:
        """删除自定义模板"""
        if template_id in self._custom_templates:
            del self._custom_templates[template_id]
            self._save_custom_templates()
            return True
        return False

    # ========== 辅助方法 ==========

    def validate_template(self, prompt_template: str) -> Dict[str, Any]:
        """
        验证模板格式

        Returns:
            {"valid": bool, "errors": List[str], "warnings": List[str]}
        """
        errors = []
        warnings = []

        # 检查是否包含 {prompt} 占位符
        if "{prompt}" not in prompt_template:
            warnings.append("模板未包含 {prompt} 占位符，用户提示词将不会被插入")

        # 检查图片序号占位符格式
        image_ref_pattern = r'\{图片\d+\}'
        if re.search(image_ref_pattern, prompt_template):
            # 提取序号
            matches = re.findall(image_ref_pattern, prompt_template)
            numbers = [int(m.replace("{图片", "").replace("}", "")) for m in matches]
            if numbers and max(numbers) > 14:
                errors.append("Gemini最多支持14张图片，模板中引用序号超出限制")

        # 检查模板长度
        if len(prompt_template) > 2000:
            warnings.append("模板较长，建议精简以避免超出Token限制")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }

    def get_template_for_request(self, template_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """
        获取用于API请求的模板信息
        如果模板不存在，返回None（不抛出异常）
        """
        if not template_id:
            return None
        return self.get_template(template_id)


# 全局实例
_prompt_builder: Optional[PromptBuilder] = None


def get_prompt_builder() -> PromptBuilder:
    """获取PromptBuilder单例"""
    global _prompt_builder
    if _prompt_builder is None:
        _prompt_builder = PromptBuilder()
    return _prompt_builder


def reload_templates():
    """重新加载模板配置"""
    global _prompt_builder
    _prompt_builder = None
    return get_prompt_builder()
