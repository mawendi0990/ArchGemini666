import React, { useEffect, useState } from 'react';
import { Clock, Download, Trash2, X, ChevronRight, ChevronLeft, Image as ImageIcon, Copy } from 'lucide-react';
import { getHistory, clearHistory, deleteHistoryItem } from '../utils/historyDb';

const HistorySidebar = ({ refreshTrigger }) => {
    const [history, setHistory] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    const loadHistory = async () => {
        try {
            const data = await getHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to load history", error);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [refreshTrigger]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await deleteHistoryItem(id);
        loadHistory();
        if (selectedImage && selectedImage.id === id) setSelectedImage(null);
    };

    const handleClearAll = async () => {
        if (window.confirm("确定要清空所有历史记录吗？")) {
            await clearHistory();
            loadHistory();
        }
    };
    const handleCopyPrompt = (e, prompt) => {
        e.stopPropagation();
        navigator.clipboard.writeText(prompt);
    };

    const downloadImage = (base64, mimeType, filename) => {
        const link = document.createElement('a');
        link.href = `data:${mimeType};base64,${base64}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="w-80 flex flex-col border-l border-apple-gray-200 dark:border-white/10 bg-white/80 dark:bg-apple-gray-900/80 backdrop-blur-xl h-full shadow-sm dark:shadow-2xl transition-colors duration-300 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-apple-gray-200 dark:border-white/10 shrink-0">
                    <div className="flex items-center gap-2 text-apple-gray-900 dark:text-white font-medium">
                        <Clock className="w-4 h-4 text-apple-blue" />
                        <span>生成记录</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {history.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="p-1.5 text-apple-gray-500 hover:text-red-500 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="清空历史"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-apple-gray-400 dark:text-apple-gray-600 text-sm">
                            <Clock className="w-8 h-8 mb-2 opacity-20" />
                            <p>暂无生成记录</p>
                        </div>
                    ) : (
                        history.map((item) => (
                            <div
                                key={item.id}
                                className="group relative bg-apple-gray-50 dark:bg-white/5 rounded-xl border border-apple-gray-200 dark:border-white/5 overflow-hidden hover:border-apple-blue/50 transition-all cursor-pointer"
                                onClick={() => setSelectedImage(item)}
                            >
                                <div className="aspect-video w-full bg-apple-gray-100 dark:bg-black/50 relative">
                                    <img
                                        src={`data:${item.mimeType};base64,${item.image}`}
                                        alt="History"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                                <div className="p-3">
                                    <p className="text-[10px] text-apple-gray-400 dark:text-apple-gray-500 mb-1 flex justify-between">
                                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                                        <span>{item.resolution}</span>
                                    </p>
                                    <p className="text-xs text-apple-gray-700 dark:text-apple-gray-300 line-clamp-2 leading-relaxed">
                                        {item.prompt}
                                    </p>
                                </div>

                                {/* Quick Actions */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleCopyPrompt(e, item.prompt)}
                                        className="p-1.5 bg-white/90 dark:bg-black/60 backdrop-blur rounded-full text-apple-gray-700 dark:text-white hover:text-apple-blue shadow-sm"
                                        title="复制提示词"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            downloadImage(item.image, item.mimeType, `arch-history-${item.id}.png`);
                                        }}
                                        className="p-1.5 bg-white/90 dark:bg-black/60 backdrop-blur rounded-full text-apple-gray-700 dark:text-white hover:text-apple-blue shadow-sm"
                                    >
                                        <Download className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        className="p-1.5 bg-white/90 dark:bg-black/60 backdrop-blur rounded-full text-apple-gray-700 dark:text-white hover:text-red-500 shadow-sm"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="relative max-w-5xl max-h-[90vh] bg-transparent flex flex-col items-center">
                        <img
                            src={`data:${selectedImage.mimeType};base64,${selectedImage.image}`}
                            alt="Preview"
                            className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                        />
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => downloadImage(selectedImage.image, selectedImage.mimeType, `arch-history-${selectedImage.id}.png`)}
                                className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                下载原图
                            </button>
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            )}
        </>
    );
};

export default HistorySidebar;
