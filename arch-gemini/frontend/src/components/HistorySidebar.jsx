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
            <div className="w-80 flex flex-col border-l border-apple-gray-200/50 dark:border-white/10 glass-strong h-full shadow-xl dark:shadow-2xl transition-colors duration-300 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-apple-gray-200/50 dark:border-white/10 shrink-0">
                    <div className="flex items-center gap-2 text-apple-gray-900 dark:text-white font-medium">
                        <div className="p-1.5 bg-gradient-to-br from-apple-blue to-aurora-cyan rounded-lg">
                            <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gradient-blue font-semibold">生成记录</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {history.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="p-2 text-apple-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="清空历史"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-apple-gray-400 dark:text-apple-gray-600 text-sm">
                            <div className="relative mb-3">
                                <div className="absolute inset-0 bg-gradient-to-r from-apple-blue to-aurora-purple opacity-10 blur-xl rounded-full"></div>
                                <Clock className="w-12 h-12 relative opacity-30" />
                            </div>
                            <p>暂无生成记录</p>
                            <p className="text-[10px] mt-1 opacity-60">生成的图片将保存在这里</p>
                        </div>
                    ) : (
                        history.map((item) => (
                            <div
                                key={item.id}
                                className="group relative bg-white/80 dark:bg-white/5 rounded-2xl border border-apple-gray-200 dark:border-white/5 overflow-hidden hover:border-apple-blue/30 hover:shadow-lg hover:shadow-apple-blue/10 transition-all cursor-pointer animate-slide-up"
                                onClick={() => setSelectedImage(item)}
                            >
                                <div className="aspect-video w-full bg-gradient-to-br from-apple-gray-100 to-apple-gray-200 dark:from-black/50 dark:to-black/70 relative">
                                    <img
                                        src={`data:${item.mimeType};base64,${item.image}`}
                                        alt="History"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    {/* Resolution Badge */}
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[9px] text-white font-medium">
                                        {item.resolution}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-[10px] text-apple-gray-400 dark:text-apple-gray-500 mb-1.5 flex justify-between items-center">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" />
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                        </span>
                                    </p>
                                    <p className="text-xs text-apple-gray-700 dark:text-apple-gray-300 line-clamp-2 leading-relaxed">
                                        {item.prompt}
                                    </p>
                                </div>

                                {/* Quick Actions */}
                                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                    <button
                                        onClick={(e) => handleCopyPrompt(e, item.prompt)}
                                        className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-apple-gray-700 dark:text-white hover:text-apple-blue hover:scale-110 shadow-lg transition-all"
                                        title="复制提示词"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            downloadImage(item.image, item.mimeType, `arch-history-${item.id}.png`);
                                        }}
                                        className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-apple-gray-700 dark:text-white hover:text-apple-blue hover:scale-110 shadow-lg transition-all"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-apple-gray-700 dark:text-white hover:text-red-500 hover:scale-110 shadow-lg transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-200">
                    <div className="relative max-w-6xl max-h-[90vh] bg-transparent flex flex-col items-center animate-scale-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-apple-blue via-aurora-purple to-aurora-pink opacity-20 blur-3xl rounded-3xl"></div>
                            <img
                                src={`data:${selectedImage.mimeType};base64,${selectedImage.image}`}
                                alt="Preview"
                                className="relative max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
                            />
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => downloadImage(selectedImage.image, selectedImage.mimeType, `arch-history-${selectedImage.id}.png`)}
                                className="px-6 py-3 bg-gradient-to-r from-apple-blue to-aurora-cyan text-white rounded-full text-sm font-medium shadow-lg shadow-apple-blue/30 hover:shadow-apple-blue/50 transition-all hover:scale-105 btn-press flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                下载原图
                            </button>
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-full text-sm font-medium hover:bg-white/20 transition-all hover:scale-105 btn-press"
                            >
                                关闭预览
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 btn-press"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            )}
        </>
    );
};

export default HistorySidebar;
