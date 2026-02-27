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
    style: 'from-aurora-purple to-indigo-500',
    scene: 'from-apple-blue to-aurora-cyan',
    effect: 'from-orange-500 to-aurora-pink'
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
            <div className="flex items-center justify-center h-full bg-gradient-mesh">
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="w-16 h-16 border-4 border-apple-blue/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-apple-blue rounded-full animate-spin"></div>
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-apple-blue animate-pulse" />
                    </div>
                    <p className="mt-4 text-sm text-apple-gray-600 dark:text-apple-gray-400 font-medium">加载模板中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-gradient-mesh">
                <div className="text-center">
                    <div className="inline-flex p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
                        <X className="w-10 h-10 text-red-500" />
                    </div>
                    <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-4">加载失败: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-gradient-to-r from-apple-blue to-aurora-cyan text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-apple-blue/30 transition-all btn-press"
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gradient-mesh">
            {/* Header */}
            <div className="shrink-0 border-b border-apple-gray-200/50 dark:border-white/10 glass-strong p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-apple-gray-900 dark:text-white flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-apple-blue to-aurora-purple rounded-xl shadow-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-gradient-blue">模板画廊</span>
                        </h2>
                        <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400 mt-1 ml-11">
                            选择预设模板快速开始创作
                        </p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl bg-apple-gray-100 dark:bg-white/10 hover:bg-apple-gray-200 dark:hover:bg-white/20 transition-all btn-press"
                        >
                            <X className="w-5 h-5 text-apple-gray-500" />
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray-400" />
                    <input
                        type="text"
                        placeholder="搜索模板..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:border-apple-blue/50 focus:ring-2 focus:ring-apple-blue/20 transition-all dark:text-white shadow-inner"
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div className="shrink-0 px-6 py-4 border-b border-apple-gray-200/50 dark:border-white/10 glass">
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === null
                                ? 'bg-gradient-to-r from-apple-blue to-aurora-cyan text-white shadow-lg shadow-apple-blue/30'
                                : 'bg-white dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-100 dark:hover:bg-white/20 border border-apple-gray-200 dark:border-white/10'
                            }`}
                    >
                        全部 ({templates.length})
                    </button>
                    {Object.entries(categories).map(([catId, cat]) => (
                        <button
                            key={catId}
                            onClick={() => setSelectedCategory(catId)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${selectedCategory === catId
                                    ? 'bg-gradient-to-r text-white shadow-lg'
                                    : 'bg-white dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-100 dark:hover:bg-white/20 border border-apple-gray-200 dark:border-white/10'
                                } ${selectedCategory === catId ? CATEGORY_COLORS[catId] || 'from-gray-500 to-gray-600' : ''}`}
                        >
                            {React.createElement(CATEGORY_ICONS[catId] || Layout, { className: 'w-3.5 h-3.5' })}
                            {cat.name} ({templates.filter(t => t.categoryId === catId).length})
                        </button>
                    ))}
                </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {filteredTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-apple-blue to-aurora-purple opacity-10 blur-2xl rounded-full"></div>
                            <Search className="w-16 h-16 relative text-apple-gray-300 dark:text-apple-gray-700" />
                        </div>
                        <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400">
                            {searchQuery ? '没有找到匹配的模板' : '暂无模板'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredTemplates.map(template => (
                            <div
                                key={template.id}
                                className="group relative bg-white dark:bg-white/5 rounded-3xl border border-apple-gray-200 dark:border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-apple-blue/10 hover:border-apple-blue/30 transition-all duration-500 cursor-pointer animate-scale-in"
                                onClick={() => handlePreviewTemplate(template)}
                            >
                                {/* Category Badge */}
                                <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r shadow-lg ${
                                    CATEGORY_COLORS[template.categoryId] || 'from-gray-500 to-gray-600'
                                } z-10`}>
                                    {CATEGORY_NAMES[template.categoryId] || template.categoryId}
                                </div>

                                {/* Custom Badge */}
                                {template.is_custom && (
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-aurora-purple/20 text-aurora-purple border border-aurora-purple/30 z-10">
                                        自定义
                                    </div>
                                )}

                                {/* Preview Area */}
                                <div className={`h-44 bg-gradient-to-br relative overflow-hidden ${
                                    CATEGORY_COLORS[template.categoryId] || 'from-gray-400 to-gray-600'
                                }`}>
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full"></div>
                                            {template.categoryId === 'style' && <Palette className="relative w-14 h-14 text-white/90" />}
                                            {template.categoryId === 'scene' && <Building2 className="relative w-14 h-14 text-white/90" />}
                                            {template.categoryId === 'effect' && <Sun className="relative w-14 h-14 text-white/90" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-apple-gray-900 dark:text-white mb-2">
                                        {template.name}
                                    </h3>
                                    <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 line-clamp-2 mb-4 leading-relaxed">
                                        {template.description}
                                    </p>

                                    {/* Role Badges */}
                                    {template.defaultRoles && template.defaultRoles.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {getRoleBadges(template).map(role => (
                                                <span
                                                    key={role.id}
                                                    className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-apple-blue/10 text-apple-blue border border-apple-blue/20"
                                                >
                                                    {role.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {template.tags && template.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {template.tags.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-1 rounded-full text-[10px] bg-apple-gray-100 dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400"
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
                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-apple-blue to-aurora-cyan text-white text-sm font-bold shadow-lg shadow-apple-blue/25 hover:shadow-apple-blue/40 hover:scale-[1.02] transition-all btn-press flex items-center justify-center gap-2"
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
                    className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-200"
                                            onClick={() => setSelectedTemplate(null)}
                                        >
                    <div
                        className="bg-white dark:bg-apple-gray-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl border border-apple-gray-200 dark:border-white/10 animate-scale-in"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                        {/* Preview Header */}
                        <div className={`h-36 bg-gradient-to-br relative overflow-hidden ${
                            CATEGORY_COLORS[selectedTemplate.categoryId] || 'from-gray-400 to-gray-600'
                        }`}>
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full"></div>
                                    {selectedTemplate.categoryId === 'style' && <Palette className="relative w-20 h-20 text-white/90" />}
                                    {selectedTemplate.categoryId === 'scene' && <Building2 className="relative w-20 h-20 text-white/90" />}
                                    {selectedTemplate.categoryId === 'effect' && <Sun className="relative w-20 h-20 text-white/90" />}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all btn-press"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Preview Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-apple-gray-900 dark:text-white">
                                        {selectedTemplate.name}
                                    </h3>
                                    <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400 mt-1">
                                        {categories[selectedTemplate.categoryId]?.name || selectedTemplate.categoryId}
                                    </p>
                                </div>
                                {selectedTemplate.is_custom && (
                                    <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-aurora-purple/20 text-aurora-purple border border-aurora-purple/30">
                                        自定义
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-apple-gray-600 dark:text-apple-gray-300 mb-6 leading-relaxed">
                                {selectedTemplate.description}
                            </p>

                            {/* Prompt Preview */}
                            <div className="mb-6">
                                <h4 className="text-xs font-bold bg-gradient-to-r from-apple-blue to-aurora-purple bg-clip-text text-transparent uppercase tracking-wider mb-2">
                                    Prompt 模板
                                </h4>
                                <div className="bg-apple-gray-100 dark:bg-white/5 rounded-xl p-4 text-sm text-apple-gray-700 dark:text-apple-gray-300 font-mono border border-apple-gray-200 dark:border-white/10">
                                    {selectedTemplate.promptTemplate}
                                </div>
                            </div>

                            {/* Required Roles */}
                            {selectedTemplate.defaultRoles && selectedTemplate.defaultRoles.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold bg-gradient-to-r from-apple-blue to-aurora-purple bg-clip-text text-transparent uppercase tracking-wider mb-3">
                                        推荐图片角色
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {getRoleBadges(selectedTemplate).map(role => (
                                            <span
                                                key={role.id}
                                                className="px-4 py-2 rounded-xl text-sm bg-apple-blue/10 text-apple-blue font-medium border border-apple-blue/20"
                                            >
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Image Requirements */}
                            <div className="mb-6">
                                <h4 className="text-xs font-bold bg-gradient-to-r from-apple-blue to-aurora-purple bg-clip-text text-transparent uppercase tracking-wider mb-2">
                                    图片数量要求
                                </h4>
                                <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
                                    {selectedTemplate.minImages || 0} - {selectedTemplate.maxImages || 14} 张
                                </p>
                            </div>

                            {/* Tags */}
                            {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold bg-gradient-to-r from-apple-blue to-aurora-purple bg-clip-text text-transparent uppercase tracking-wider mb-3">
                                        标签
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTemplate.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 rounded-xl text-xs bg-apple-gray-100 dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400 border border-apple-gray-200 dark:border-white/10"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Preview Actions */}
                        <div className="p-6 border-t border-apple-gray-200 dark:border-white/10 flex gap-3 bg-apple-gray-50/50 dark:bg-black/20">
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="flex-1 py-3 rounded-xl border border-apple-gray-200 dark:border-white/10 text-apple-gray-700 dark:text-apple-gray-300 text-sm font-medium hover:bg-apple-gray-100 dark:hover:bg-white/5 transition-all btn-press"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => handleApplyTemplate(selectedTemplate)}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-apple-blue to-aurora-cyan text-white text-sm font-bold shadow-lg shadow-apple-blue/30 hover:shadow-apple-blue/50 transition-all btn-press flex items-center justify-center gap-2"
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
