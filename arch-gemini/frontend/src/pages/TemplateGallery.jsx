import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import {
    Palette,
    Layout,
    TreePine,
    Sun,
    Cloud,
    Building2,
    Home,
    Sparkles,
    ArrowRight,
    Check,
    X,
    Search,
    Filter
} from 'lucide-react';

// Category icons mapping
const CATEGORY_ICONS = {
    style: Palette,
    scene: Layout,
    effect: Sun
};

// Category colors mapping
const CATEGORY_COLORS = {
    style: 'from-purple-500 to-indigo-500',
    scene: 'from-blue-500 to-cyan-500',
    effect: 'from-orange-500 to-amber-500'
};

// Category names in Chinese
const CATEGORY_NAMES = {
    style: '风格类',
    scene: '场景类',
    effect: '效果类'
};

function TemplateGallery({ onApplyTemplate, onClose }) {
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Fetch templates and categories
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch templates
                const templatesRes = await fetch(`${API_BASE_URL}/api/templates`);
                if (!templatesRes.ok) throw new Error('Failed to fetch templates');
                const templatesData = await templatesRes.json();

                // Fetch categories
                const categoriesRes = await fetch(`${API_BASE_URL}/api/categories`);
                if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
                const categoriesData = await categoriesRes.json();

                setTemplates(templatesData.templates || []);
                setCategories(categoriesData.categories || {});
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter templates based on category and search query
    const filteredTemplates = templates.filter(template => {
        const matchesCategory = !selectedCategory || template.categoryId === selectedCategory;
        const matchesSearch = !searchQuery ||
            template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Get role badges for a template
    const getRoleBadges = (template) => {
        const roleNames = {
            style: '风格',
            composition: '构图',
            material: '材质',
            color: '色彩',
            lighting: '光照',
            custom: '自定义'
        };

        return (template.defaultRoles || []).map(roleId => ({
            id: roleId,
            name: roleNames[roleId] || roleId
        }));
    };

    // Handle template apply
    const handleApplyTemplate = (template) => {
        if (onApplyTemplate) {
            onApplyTemplate(template);
        }
        if (onClose) {
            onClose();
        }
    };

    // Handle template preview
    const handlePreviewTemplate = (template) => {
        setSelectedTemplate(template);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-apple-gray-200 border-t-apple-blue"></div>
                    <p className="mt-4 text-sm text-apple-gray-500 dark:text-apple-gray-400">加载模板中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400">加载失败: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-apple-blue text-white rounded-lg text-sm hover:bg-apple-blue/90 transition-colors"
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-apple-gray-50 dark:bg-black">
            {/* Header */}
            <div className="shrink-0 border-b border-apple-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-apple-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-apple-blue" />
                            模板画廊
                        </h2>
                        <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400 mt-1">
                            选择预设模板快速开始创作
                        </p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-apple-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-apple-gray-500" />
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray-400" />
                    <input
                        type="text"
                        placeholder="搜索模板..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-apple-gray-100 dark:bg-white/5 border border-transparent rounded-xl text-sm focus:outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 transition-all dark:text-white"
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div className="shrink-0 px-6 py-4 border-b border-apple-gray-200 dark:border-white/10 bg-white/30 dark:bg-black/30">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            selectedCategory === null
                                ? 'bg-apple-blue text-white shadow-md'
                                : 'bg-apple-gray-100 dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-200 dark:hover:bg-white/20'
                        }`}
                    >
                        全部 ({templates.length})
                    </button>
                    {Object.entries(categories).map(([catId, cat]) => (
                        <button
                            key={catId}
                            onClick={() => setSelectedCategory(catId)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                selectedCategory === catId
                                    ? 'bg-gradient-to-r text-white shadow-md'
                                    : 'bg-apple-gray-100 dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-200 dark:hover:bg-white/20'
                            } ${selectedCategory === catId ? CATEGORY_COLORS[catId] || 'from-gray-500 to-gray-600' : ''}`}
                        >
                            {React.createElement(CATEGORY_ICONS[catId] || Layout, { className: 'w-3.5 h-3.5' })}
                            {cat.name} ({templates.filter(t => t.categoryId === catId).length})
                        </button>
                    ))}
                </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {filteredTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Search className="w-12 h-12 text-apple-gray-300 dark:text-apple-gray-700 mb-4" />
                        <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400">
                            {searchQuery ? '没有找到匹配的模板' : '暂无模板'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map(template => (
                            <div
                                key={template.id}
                                className="group relative bg-white dark:bg-apple-gray-900 rounded-2xl border border-apple-gray-200 dark:border-white/10 overflow-hidden hover:shadow-xl hover:border-apple-blue/30 transition-all duration-300 cursor-pointer"
                                onClick={() => handlePreviewTemplate(template)}
                            >
                                {/* Category Badge */}
                                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium text-white bg-gradient-to-r ${
                                    CATEGORY_COLORS[template.categoryId] || 'from-gray-500 to-gray-600'
                                } z-10`}>
                                    {CATEGORY_NAMES[template.categoryId] || template.categoryId}
                                </div>

                                {/* Custom Badge */}
                                {template.is_custom && (
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 z-10">
                                        自定义
                                    </div>
                                )}

                                {/* Preview Area */}
                                <div className={`h-40 bg-gradient-to-br ${
                                    CATEGORY_COLORS[template.categoryId] || 'from-gray-400 to-gray-600'
                                } relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/20"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {template.categoryId === 'style' && <Palette className="w-12 h-12 text-white/80" />}
                                        {template.categoryId === 'scene' && <Building2 className="w-12 h-12 text-white/80" />}
                                        {template.categoryId === 'effect' && <Sun className="w-12 h-12 text-white/80" />}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-apple-gray-900 dark:text-white mb-1">
                                        {template.name}
                                    </h3>
                                    <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 line-clamp-2 mb-3">
                                        {template.description}
                                    </p>

                                    {/* Role Badges */}
                                    {template.defaultRoles && template.defaultRoles.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {getRoleBadges(template).map(role => (
                                                <span
                                                    key={role.id}
                                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-apple-gray-100 dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400"
                                                >
                                                    {role.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {template.tags && template.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {template.tags.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 rounded text-[10px] bg-apple-blue/10 text-apple-blue"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleApplyTemplate(template);
                                        }}
                                        className="w-full py-2 rounded-lg bg-apple-blue text-white text-sm font-medium hover:bg-apple-blue/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        应用模板
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {selectedTemplate && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                                            onClick={() => setSelectedTemplate(null)}
                                        >
                    <div
                        className="bg-white dark:bg-apple-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                        {/* Preview Header */}
                        <div className={`h-32 bg-gradient-to-br ${
                            CATEGORY_COLORS[selectedTemplate.categoryId] || 'from-gray-400 to-gray-600'
                        } relative flex items-center justify-center`}>
                            {selectedTemplate.categoryId === 'style' && <Palette className="w-16 h-16 text-white/80" />}
                            {selectedTemplate.categoryId === 'scene' && <Building2 className="w-16 h-16 text-white/80" />}
                            {selectedTemplate.categoryId === 'effect' && <Sun className="w-16 h-16 text-white/80" />}
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Preview Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-apple-gray-900 dark:text-white">
                                        {selectedTemplate.name}
                                    </h3>
                                    <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400 mt-1">
                                        {categories[selectedTemplate.categoryId]?.name || selectedTemplate.categoryId}
                                    </p>
                                </div>
                                {selectedTemplate.is_custom && (
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                                        自定义
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-apple-gray-600 dark:text-apple-gray-300 mb-6">
                                {selectedTemplate.description}
                            </p>

                            {/* Prompt Preview */}
                            <div className="mb-6">
                                <h4 className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wider mb-2">
                                    Prompt 模板
                                </h4>
                                <div className="bg-apple-gray-100 dark:bg-white/5 rounded-lg p-3 text-sm text-apple-gray-700 dark:text-apple-gray-300 font-mono">
                                    {selectedTemplate.promptTemplate}
                                </div>
                            </div>

                            {/* Required Roles */}
                            {selectedTemplate.defaultRoles && selectedTemplate.defaultRoles.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wider mb-2">
                                        推荐图片角色
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {getRoleBadges(selectedTemplate).map(role => (
                                            <span
                                                key={role.id}
                                                className="px-3 py-1.5 rounded-lg text-sm bg-apple-blue/10 text-apple-blue font-medium"
                                            >
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Image Requirements */}
                            <div className="mb-6">
                                <h4 className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wider mb-2">
                                    图片数量要求
                                </h4>
                                <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
                                    {selectedTemplate.minImages || 0} - {selectedTemplate.maxImages || 14} 张
                                </p>
                            </div>

                            {/* Tags */}
                            {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wider mb-2">
                                        标签
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTemplate.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 rounded-md text-xs bg-apple-gray-100 dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Preview Actions */}
                        <div className="p-6 border-t border-apple-gray-200 dark:border-white/10 flex gap-3">
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="flex-1 py-2.5 rounded-lg border border-apple-gray-200 dark:border-white/10 text-apple-gray-700 dark:text-apple-gray-300 text-sm font-medium hover:bg-apple-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => handleApplyTemplate(selectedTemplate)}
                                className="flex-1 py-2.5 rounded-lg bg-apple-blue text-white text-sm font-medium hover:bg-apple-blue/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                应用此模板
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TemplateGallery;
