import React, { useState } from 'react';
import {
    Settings,
    Sliders,
    Image as ImageIcon,
    Thermometer,
    FileText,
    X,
    Check,
    ChevronDown,
    Info
} from 'lucide-react';

// Aspect ratio options
const ASPECT_RATIOS = [
    { id: '1:1', label: '1:1', description: '正方形', width: 1, height: 1 },
    { id: '3:2', label: '3:2', description: '横向矩形', width: 3, height: 2 },
    { id: '2:3', label: '2:3', description: '纵向矩形', width: 2, height: 3 },
    { id: '4:3', label: '4:3', description: '标准横向', width: 4, height: 3 },
    { id: '3:4', label: '3:4', description: '标准纵向', width: 3, height: 4 },
    { id: '16:9', label: '16:9', description: '宽屏', width: 16, height: 9 },
    { id: '21:9', label: '21:9', description: '超宽屏', width: 21, height: 9 },
];

// Resolution options
const RESOLUTIONS = [
    { id: '1K', label: '1K', description: '快速生成', dimensions: '~1024px' },
    { id: '2K', label: '2K', description: '平衡质量', dimensions: '~2048px' },
    { id: '4K', label: '4K', description: '最高质量', dimensions: '~4096px' },
];

// Default negative prompt
const DEFAULT_NEGATIVE_PROMPT = `low quality, bad anatomy, worst quality, text, watermark, signature, logo, username, nsfw, nude, people, crowded, ugly, deformed, blurry, pixelated, artifacts, noise, glitch, cartoon, anime, illustration, painting, drawing, sketch, out of frame, cut off, bad composition, weird colors`;

function AdvancedSettings({
    aspectRatio,
    onAspectRatioChange,
    resolution,
    onResolutionChange,
    negativePrompt,
    onNegativePromptChange,
    onClose
}) {
    const [activeTab, setActiveTab] = useState('aspect'); // aspect | resolution | negative
    const [showInfo, setShowInfo] = useState(null);

    const handleAspectRatioSelect = (ratio) => {
        if (onAspectRatioChange) {
            onAspectRatioChange(ratio.id);
        }
    };

    const handleResolutionSelect = (res) => {
        if (onResolutionChange) {
            onResolutionChange(res.id);
        }
    };

    const handleNegativePromptChange = (value) => {
        if (onNegativePromptChange) {
            onNegativePromptChange(value);
        }
    };

    const resetNegativePrompt = () => {
        handleNegativePromptChange(DEFAULT_NEGATIVE_PROMPT);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-apple-gray-900">
            {/* Header */}
            <div className="shrink-0 border-b border-apple-gray-200 dark:border-white/10 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-apple-blue/10 rounded-xl">
                            <Sliders className="w-5 h-5 text-apple-blue" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
                                高级设置
                            </h2>
                            <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400">
                                调整生成参数
                            </p>
                        </div>
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

                {/* Tabs */}
                <div className="flex gap-2 mt-6">
                    <button
                        onClick={() => setActiveTab('aspect')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'aspect'
                                ? 'bg-apple-blue text-white'
                                : 'bg-apple-gray-100 dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-200 dark:hover:bg-white/20'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        宽高比
                    </button>
                    <button
                        onClick={() => setActiveTab('resolution')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'resolution'
                                ? 'bg-apple-blue text-white'
                                : 'bg-apple-gray-100 dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-200 dark:hover:bg-white/20'
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                        分辨率
                    </button>
                    <button
                        onClick={() => setActiveTab('negative')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'negative'
                                ? 'bg-apple-blue text-white'
                                : 'bg-apple-gray-100 dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-200 dark:hover:bg-white/20'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        负面提示词
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Aspect Ratio Tab */}
                {activeTab === 'aspect' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
                                选择宽高比
                            </h3>
                            <button
                                onClick={() => setShowInfo(showInfo === 'aspect' ? null : 'aspect')}
                                className="p-1 rounded hover:bg-apple-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <Info className="w-4 h-4 text-apple-gray-400" />
                            </button>
                        </div>

                        {showInfo === 'aspect' && (
                            <div className="bg-apple-blue/10 text-apple-blue text-sm p-3 rounded-lg">
                                宽高比决定生成图像的形状。横向比例适合景观建筑，纵向比例适合立面设计。
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {ASPECT_RATIOS.map((ratio) => {
                                const isSelected = aspectRatio === ratio.id;
                                return (
                                    <button
                                        key={ratio.id}
                                        onClick={() => handleAspectRatioSelect(ratio)}
                                        className={`relative p-4 rounded-xl border-2 transition-all ${
                                            isSelected
                                                ? 'border-apple-blue bg-apple-blue/10'
                                                : 'border-apple-gray-200 dark:border-white/10 hover:border-apple-blue/50'
                                        }`}
                                    >
                                        {/* Preview Box */}
                                        <div className="aspect-[w/h] mb-3" style={{ aspectRatio: `${ratio.width}/${ratio.height}` }}>
                                            <div className={`w-full h-full rounded-lg ${
                                                isSelected
                                                    ? 'bg-apple-blue/30'
                                                    : 'bg-apple-gray-200 dark:bg-white/10'
                                            }`}></div>
                                        </div>
                                        <div className="text-sm font-medium text-apple-gray-900 dark:text-white">
                                            {ratio.label}
                                        </div>
                                        <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                                            {ratio.description}
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-apple-blue rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Resolution Tab */}
                {activeTab === 'resolution' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
                                选择分辨率
                            </h3>
                            <button
                                onClick={() => setShowInfo(showInfo === 'resolution' ? null : 'resolution')}
                                className="p-1 rounded hover:bg-apple-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <Info className="w-4 h-4 text-apple-gray-400" />
                            </button>
                        </div>

                        {showInfo === 'resolution' && (
                            <div className="bg-apple-blue/10 text-apple-blue text-sm p-3 rounded-lg">
                                分辨率越高，图像越清晰，但生成时间也会更长。1K适合快速预览，2K适合一般使用，4K适合最终输出。
                            </div>
                        )}

                        <div className="space-y-3">
                            {RESOLUTIONS.map((res) => {
                                const isSelected = resolution === res.id;
                                return (
                                    <button
                                        key={res.id}
                                        onClick={() => handleResolutionSelect(res)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                                            isSelected
                                                ? 'border-apple-blue bg-apple-blue/10'
                                                : 'border-apple-gray-200 dark:border-white/10 hover:border-apple-blue/50'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${
                                            isSelected
                                                ? 'bg-apple-blue text-white'
                                                : 'bg-apple-gray-200 dark:bg-white/10 text-apple-gray-600 dark:text-apple-gray-400'
                                        }`}>
                                            {res.label}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-sm font-medium text-apple-gray-900 dark:text-white">
                                                {res.description}
                                            </div>
                                            <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                                                {res.dimensions}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-5 h-5 text-apple-blue" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Negative Prompt Tab */}
                {activeTab === 'negative' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
                                负面提示词
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowInfo(showInfo === 'negative' ? null : 'negative')}
                                    className="p-1 rounded hover:bg-apple-gray-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    <Info className="w-4 h-4 text-apple-gray-400" />
                                </button>
                                <button
                                    onClick={resetNegativePrompt}
                                    className="text-xs text-apple-blue hover:text-apple-blue/70 transition-colors"
                                >
                                    重置默认
                                </button>
                            </div>
                        </div>

                        {showInfo === 'negative' && (
                            <div className="bg-apple-blue/10 text-apple-blue text-sm p-3 rounded-lg">
                                负面提示词告诉AI生成时避免什么内容。用逗号分隔多个关键词，可以帮助提高生成质量。
                            </div>
                        )}

                        <div>
                            <textarea
                                value={negativePrompt || DEFAULT_NEGATIVE_PROMPT}
                                onChange={(e) => handleNegativePromptChange(e.target.value)}
                                placeholder="输入负面提示词..."
                                className="w-full h-48 px-4 py-3 bg-apple-gray-100 dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 rounded-xl text-sm resize-none focus:outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 transition-all dark:text-white"
                            />
                        </div>

                        {/* Quick Add Suggestions */}
                        <div>
                            <h4 className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wider mb-2">
                                快速添加
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: '模糊', value: 'blurry, out of focus' },
                                    { label: '低质量', value: 'low quality, worst quality' },
                                    { label: '变形', value: 'deformed, distorted' },
                                    { label: '水印', value: 'watermark, signature, logo' },
                                    { label: '人物', value: 'people, person, human' },
                                    { label: '文字', value: 'text, words, letters' },
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion.label}
                                        onClick={() => {
                                            const current = negativePrompt || DEFAULT_NEGATIVE_PROMPT;
                                            handleNegativePromptChange(
                                                current ? `${current}, ${suggestion.value}` : suggestion.value
                                            );
                                        }}
                                        className="px-3 py-1.5 bg-apple-gray-100 dark:bg-white/10 hover:bg-apple-gray-200 dark:hover:bg-white/20 text-xs text-apple-gray-600 dark:text-apple-gray-400 rounded-lg transition-colors"
                                    >
                                        + {suggestion.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-apple-gray-200 dark:border-white/10 p-4">
                <div className="flex items-center justify-between text-xs text-apple-gray-500 dark:text-apple-gray-400">
                    <div>
                        当前设置: {aspectRatio} / {resolution}
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-apple-blue text-white rounded-lg hover:bg-apple-blue/90 transition-colors"
                        >
                            确定
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdvancedSettings;
