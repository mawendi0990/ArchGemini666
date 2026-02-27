import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Download, Save, Sparkles, Zap, Gem } from 'lucide-react';
import { addToHistory } from '../utils/historyDb';
import { API_BASE_URL } from '../config';

const MODEL_OPTIONS = {
  flash: {
    id: 'gemini-3.1-flash-image-preview',
    name: 'Flash',
    icon: Zap,
    color: 'from-apple-blue to-aurora-cyan',
    desc: '快速生成'
  },
  pro: {
    id: 'gemini-3-pro-image-preview',
    name: 'Pro',
    icon: Gem,
    color: 'from-aurora-purple to-aurora-pink',
    desc: '高质量'
  }
};

const ImageGenerator = ({ prompt, images = [], onGenerationSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [mimeType, setMimeType] = useState("image/png");
  const [error, setError] = useState(null);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1K");
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem('autoSave') === 'true');
  const [modelMode, setModelMode] = useState(() => localStorage.getItem('modelMode') || 'flash');

  const toggleAutoSave = () => {
    const newVal = !autoSave;
    setAutoSave(newVal);
    localStorage.setItem('autoSave', newVal);
  };

  const toggleModelMode = () => {
    const newMode = modelMode === 'flash' ? 'pro' : 'flash';
    setModelMode(newMode);
    localStorage.setItem('modelMode', newMode);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setImage(null);
    setMimeType("image/png");
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio,
          resolution: resolution,
          images: images,
          model: MODEL_OPTIONS[modelMode].id
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Generation failed');
      }
      const data = await response.json();
      const newImage = data.image_base64;
      const newMime = data.mime_type || "image/png";

      setImage(newImage);
      setMimeType(newMime);

      // Save to History
      try {
        await addToHistory({
          prompt,
          image: newImage,
          mimeType: newMime,
          aspectRatio,
          resolution
        });
        if (onGenerationSuccess) onGenerationSuccess();
      } catch (e) {
        console.error("Failed to save history", e);
      }

      // Auto Save to Disk
      if (autoSave) {
        const link = document.createElement('a');
        link.href = `data:${newMime};base64,${newImage}`;
        link.download = `arch-gemini-${Date.now()}.${newMime === "image/png" ? "png" : "jpg"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center gap-3">
        {/* Model Mode Toggle */}
        <button
          onClick={toggleModelMode}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            modelMode === 'flash'
              ? 'bg-gradient-to-r from-apple-blue/10 to-aurora-cyan/10 text-apple-blue border-apple-blue/30 shadow-inner'
              : 'bg-gradient-to-r from-aurora-purple/10 to-aurora-pink/10 text-aurora-purple border-aurora-purple/30 shadow-inner'
          }`}
          title="点击切换模型模式"
        >
          {modelMode === 'flash' ? <Zap className="w-4 h-4" /> : <Gem className="w-4 h-4" />}
          <span>{MODEL_OPTIONS[modelMode].name}</span>
        </button>

        {/* Aspect Ratio Selector */}
        <div className="relative">
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="appearance-none bg-white/80 dark:bg-white/10 border border-apple-gray-200 dark:border-white/10 text-apple-gray-900 dark:text-white text-xs rounded-xl px-4 py-2.5 pr-8 outline-none focus:ring-2 focus:ring-apple-blue/50 w-28 transition-all cursor-pointer hover:border-apple-blue/30"
          >
            <option value="1:1">1:1 (正方)</option>
            <option value="2:3">2:3 (纵向)</option>
            <option value="3:2">3:2 (横向)</option>
            <option value="3:4">3:4 (纵向)</option>
            <option value="4:3">4:3 (标准)</option>
            <option value="4:5">4:5 (社交)</option>
            <option value="5:4">5:4 (打印)</option>
            <option value="9:16">9:16 (手机)</option>
            <option value="16:9">16:9 (宽屏)</option>
            <option value="21:9">21:9 (影院)</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-apple-gray-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* Resolution Selector */}
        <div className="relative">
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="appearance-none bg-white/80 dark:bg-white/10 border border-apple-gray-200 dark:border-white/10 text-apple-gray-900 dark:text-white text-xs rounded-xl px-4 py-2.5 pr-8 outline-none focus:ring-2 focus:ring-apple-blue/50 w-24 transition-all cursor-pointer hover:border-apple-blue/30"
          >
            <option value="1K">1K 分辨率</option>
            <option value="2K">2K 分辨率</option>
            <option value="4K">4K 分辨率</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-apple-gray-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* Auto Save Toggle */}
        <button
          onClick={toggleAutoSave}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${autoSave
            ? 'bg-aurora-emerald/10 text-aurora-emerald border-aurora-emerald/20 shadow-inner'
            : 'bg-white/80 dark:bg-white/10 text-apple-gray-500 dark:text-apple-gray-400 border-apple-gray-200 dark:border-white/10'
            }`}
          title="生成后自动下载到本地"
        >
          <Save className="w-3.5 h-3.5" />
          {autoSave ? "自动保存: 开" : "自动保存: 关"}
        </button>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r bg-[length:200%_100%] text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 transition-all shadow-lg btn-press animate-shimmer ${
            modelMode === 'flash'
              ? 'from-apple-blue via-aurora-cyan to-apple-blue shadow-apple-blue/25 hover:shadow-apple-blue/40'
              : 'from-aurora-purple via-aurora-pink to-aurora-purple shadow-aurora-purple/25 hover:shadow-aurora-purple/40'
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span className="font-semibold">生成效果图</span>
        </button>
      </div>

      {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-200 text-xs rounded-xl border border-red-200 dark:border-red-800/50 animate-slide-up">{error}</div>}

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        <div className="flex-1 bg-gradient-to-br from-apple-gray-50 to-apple-gray-100 dark:from-black/40 dark:to-black/60 border border-apple-gray-200 dark:border-white/10 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-inner">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-black/70 z-10 backdrop-blur-md">
              <div className="relative">
                <div className={`w-16 h-16 border-4 rounded-full ${modelMode === 'flash' ? 'border-apple-blue/20' : 'border-aurora-purple/20'}`}></div>
                <div className={`absolute top-0 left-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin ${modelMode === 'flash' ? 'border-t-apple-blue' : 'border-t-aurora-purple'}`}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {modelMode === 'flash' ? <Zap className="w-6 h-6 text-apple-blue animate-pulse" /> : <Gem className="w-6 h-6 text-aurora-purple animate-pulse" />}
                </div>
              </div>
              <p className="mt-4 text-apple-gray-600 dark:text-apple-gray-300 text-sm font-medium">Gemini 正在渲染中...</p>
              <p className={`text-xs mt-1 font-medium ${modelMode === 'flash' ? 'text-apple-blue' : 'text-aurora-purple'}`}>
                {MODEL_OPTIONS[modelMode].desc}模式
              </p>
            </div>
          )}

          {image ? (
            <div className="w-full h-full overflow-auto p-4 custom-scrollbar flex items-center justify-center bg-black/5 dark:bg-black/20">
                 <img
                  src={`data:${mimeType};base64,${image}`}
                  alt="Generated"
                  className="shadow-2xl rounded-2xl transition-all duration-500 animate-scale-in"
                  style={{
                      maxWidth: '100%',
                      height: 'auto',
                      objectFit: 'contain'
                  }}
                />
            </div>
          ) : (
            <div className="text-apple-gray-400 dark:text-apple-gray-600 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-apple-blue to-aurora-purple opacity-20 blur-2xl rounded-full"></div>
                <ImageIcon className="w-20 h-20 relative opacity-30" />
              </div>
              <p className="text-sm font-medium">输入提示词并点击生成</p>
              <p className="text-xs text-apple-gray-400 dark:text-apple-gray-500 mt-2">支持 1K/2K/4K 多种分辨率</p>
            </div>
          )}
        </div>

        {/* Sidebar Actions (Always Visible) */}
        {image && (
             <div className="w-14 flex flex-col gap-3 shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
                <a
                  href={`data:${mimeType};base64,${image}`}
                  download={`arch-gemini-render.${mimeType === "image/png" ? "png" : "jpg"}`}
                  className="group w-12 h-12 flex items-center justify-center bg-gradient-to-br from-apple-blue to-aurora-cyan text-white rounded-xl shadow-lg shadow-apple-blue/30 hover:shadow-apple-blue/50 transition-all hover:scale-110 active:scale-95 btn-press"
                  title="下载图片"
                >
                  <Download className="w-5 h-5 group-hover:animate-bounce" />
                </a>
             </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
