import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import {
    Palette,
    Layout,
    Texture,
    Droplet,
    Sun,
    Edit,
    GripVertical,
    X,
    Plus,
    ChevronDown
} from 'lucide-react';

// Role configuration with icons and colors
const ROLE_CONFIG = {
    style: {
        id: 'style',
        name: '风格参考',
        description: '用作整体建筑风格、设计语言和美学参考',
        icon: Palette,
        color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        dot: 'bg-purple-500'
    },
    composition: {
        id: 'composition',
        name: '构图参考',
        description: '用作空间布局、形体组织和构图方式参考',
        icon: Layout,
        color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500'
    },
    material: {
        id: 'material',
        name: '材质参考',
        description: '用作建筑材料、质感和细节处理参考',
        icon: Texture,
        color: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500'
    },
    color: {
        id: 'color',
        name: '色彩参考',
        description: '用作配色方案和色彩氛围参考',
        icon: Droplet,
        color: 'bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400',
        border: 'border-pink-200 dark:border-pink-800',
        dot: 'bg-pink-500'
    },
    lighting: {
        id: 'lighting',
        name: '光照参考',
        description: '用作光线方向、强度和氛围参考',
        icon: Sun,
        color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
        dot: 'bg-yellow-500'
    },
    custom: {
        id: 'custom',
        name: '自定义',
        description: '自定义参考，由用户指定具体用途',
        icon: Edit,
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
        dot: 'bg-gray-500'
    }
};

function ImageRoleSelector({ images, onImagesChange, maxImages = 14 }) {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [expandedImageIndex, setExpandedImageIndex] = useState(null);

    // Fetch roles from API
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/roles`);
                if (res.ok) {
                    const data = await res.json();
                    setRoles(data.roles || []);
                }
            } catch (err) {
                console.error('Error fetching roles:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, []);

    // Get role config
    const getRoleConfig = (roleId) => {
        return ROLE_CONFIG[roleId] || ROLE_CONFIG.custom;
    };

    // Handle role change for an image
    const handleRoleChange = (index, newRole) => {
        const updatedImages = [...images];
        updatedImages[index] = { ...updatedImages[index], role: newRole };
        onImagesChange(updatedImages);
    };

    // Handle image remove
    const handleRemoveImage = (index) => {
        const updatedImages = images.filter((_, i) => i !== index);
        onImagesChange(updatedImages);
        if (expandedImageIndex === index) {
            setExpandedImageIndex(null);
        }
    };

    // Drag and drop handlers
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const updatedImages = [...images];
        const [draggedItem] = updatedImages.splice(draggedIndex, 1);
        updatedImages.splice(dropIndex, 0, draggedItem);

        onImagesChange(updatedImages);
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Get available roles (not yet assigned to max capacity)
    const getAvailableRoles = () => {
        return Object.values(ROLE_CONFIG);
    };

    // Get image preview URL
    const getImageUrl = (image) => {
        if (typeof image === 'string') {
            return image;
        }
        if (image.data) {
            // Handle base64 data
            if (image.data.startsWith('data:')) {
                return image.data;
            }
            return `data:image/jpeg;base64,${image.data}`;
        }
        return '';
    };

    if (!images || images.length === 0) {
        return (
            <div className="text-center py-8 text-apple-gray-400 dark:text-apple-gray-600">
                <Palette className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">上传图片后可以分配角色</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wider">
                    图片角色分配 ({images.length}/{maxImages})
                </h4>
                <button
                    onClick={() => {
                        // Auto-assign roles based on index
                        const roleKeys = Object.keys(ROLE_CONFIG);
                        const updatedImages = images.map((img, idx) => ({
                            ...img,
                            role: img.role || roleKeys[idx % roleKeys.length]
                        }));
                        onImagesChange(updatedImages);
                    }}
                    className="text-xs text-apple-blue hover:text-apple-blue/70 transition-colors"
                >
                    自动分配
                </button>
            </div>

            <div className="space-y-2">
                {images.map((image, index) => {
                    const currentRole = image.role || 'custom';
                    const roleConfig = getRoleConfig(currentRole);
                    const RoleIcon = roleConfig.icon;
                    const isExpanded = expandedImageIndex === index;
                    const imageUrl = getImageUrl(image);

                    return (
                        <div
                            key={index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`group relative bg-white dark:bg-apple-gray-900 rounded-xl border-2 transition-all duration-200 ${
                                draggedIndex === index
                                    ? 'border-apple-blue opacity-50'
                                    : roleConfig.border
                            } ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
                        >
                            <div className="flex items-center gap-3 p-3">
                                {/* Drag Handle */}
                                <div className="cursor-grab active:cursor-grabbing text-apple-gray-400 hover:text-apple-gray-600 dark:hover:text-apple-gray-300">
                                    <GripVertical className="w-4 h-4" />
                                </div>

                                {/* Image Index Badge - 显示 "图片X" 格式，对应 API 的 Image X */}
                                <div className={`flex flex-col items-center ${roleConfig.color} px-2 py-1 rounded-lg shrink-0`}>
                                    <span className="text-xs font-bold">{index + 1}</span>
                                    <span className="text-[8px] opacity-70">Image {index + 1}</span>
                                </div>

                                {/* Thumbnail */}
                                <div
                                    className="w-12 h-12 rounded-lg bg-apple-gray-100 dark:bg-white/5 overflow-hidden shrink-0 cursor-pointer relative"
                                    onClick={() => setExpandedImageIndex(isExpanded ? null : index)}
                                >
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={`图片${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Palette className="w-5 h-5 text-apple-gray-400" />
                                        </div>
                                    )}
                                    {/* 图片序号标签在缩略图下方 */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] text-center py-0.5">
                                        图片{index + 1}
                                    </div>
                                </div>

                                {/* Role Selector */}
                                <div className="flex-1 min-w-0">
                                    <div className="relative">
                                        <button
                                            onClick={() => setExpandedImageIndex(isExpanded ? null : index)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                                                isExpanded
                                                    ? roleConfig.color
                                                    : 'bg-apple-gray-100 dark:bg-white/5 hover:bg-apple-gray-200 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            <RoleIcon className="w-4 h-4 shrink-0" />
                                            <span className="text-sm font-medium truncate">{roleConfig.name}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 shrink-0 ml-auto transition-transform ${
                                                    isExpanded ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>

                                        {/* Expanded Role Options */}
                                        {isExpanded && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-apple-gray-900 rounded-xl shadow-xl border border-apple-gray-200 dark:border-white/10 z-20 overflow-hidden">
                                                <div className="max-h-48 overflow-y-auto">
                                                    {getAvailableRoles().map((role) => {
                                                        const Icon = role.icon;
                                                        return (
                                                            <button
                                                                key={role.id}
                                                                onClick={() => {
                                                                    handleRoleChange(index, role.id);
                                                                    setExpandedImageIndex(null);
                                                                }}
                                                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                                                    currentRole === role.id
                                                                        ? role.color
                                                                        : 'hover:bg-apple-gray-100 dark:hover:bg-white/5'
                                                                }`}
                                                            >
                                                                <Icon className="w-4 h-4 shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-medium">{role.name}</div>
                                                                    <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400 truncate">
                                                                        {role.description}
                                                                    </div>
                                                                </div>
                                                                {currentRole === role.id && (
                                                                    <div className={`w-2 h-2 rounded-full ${role.dot}`} />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemoveImage(index)}
                                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-apple-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Expanded Preview */}
                            {isExpanded && imageUrl && (
                                <div className="px-3 pb-3">
                                    <div className="rounded-lg overflow-hidden border border-apple-gray-200 dark:border-white/10">
                                        <img
                                            src={imageUrl}
                                            alt={`图片${index + 1} 预览`}
                                            className="w-full h-32 object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Role Legend */}
            <div className="pt-3 border-t border-apple-gray-200 dark:border-white/10">
                <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mb-2">
                    <strong>图片序号说明：</strong>图片按上传顺序自动编号为"图片1(Image 1)"、"图片2(Image 2)"等，
                    对应 Gemini API 的图片引用。拖拽可调整顺序。
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                    {Object.values(ROLE_CONFIG).map((role) => {
                        const Icon = role.icon;
                        return (
                            <div
                                key={role.id}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${role.color}`}
                            >
                                <Icon className="w-3 h-3" />
                                <span>图片N = {role.name}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Prompt 示例 */}
                <div className="bg-apple-gray-100 dark:bg-white/5 rounded-lg p-2 text-xs text-apple-gray-600 dark:text-apple-gray-400 font-mono">
                    <div className="opacity-50 mb-1"># 生成的 Prompt 中会自动包含：</div>
                    <div>参考：</div>
                    <div>- 图片1（Image 1）：[风格参考] 用作风格参考</div>
                    <div>- 图片2（Image 2）：[构图参考] 用作构图参考</div>
                </div>
            </div>
        </div>
    );
}

export default ImageRoleSelector;
