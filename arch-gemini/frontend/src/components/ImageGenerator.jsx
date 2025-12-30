import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Download, Save } from 'lucide-react';
import { addToHistory } from '../utils/historyDb';
import { API_BASE_URL } from '../config';

const ImageGenerator = ({ prompt, images = [], onGenerationSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [mimeType, setMimeType] = useState("image/png");
  const [error, setError] = useState(null);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1K");
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem('autoSave') === 'true');

  const toggleAutoSave = () => {
    const newVal = !autoSave;
    setAutoSave(newVal);
    localStorage.setItem('autoSave', newVal);
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
          images: images
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
      <div className="flex items-center gap-4">
        {/* Aspect Ratio Selector */}
        <select
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
          className="bg-apple-gray-100 dark:bg-apple-gray-800 border border-transparent dark:border-white/10 text-apple-gray-900 dark:text-white text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-apple-blue/50 w-28 transition-all"
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

        {/* Resolution Selector */}
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="bg-apple-gray-100 dark:bg-apple-gray-800 border border-transparent dark:border-white/10 text-apple-gray-900 dark:text-white text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-apple-blue/50 w-24 transition-all"
        >
          <option value="1K">1K 分辨率</option>
          <option value="2K">2K 分辨率</option>
          <option value="4K">4K 分辨率</option>
        </select>

        {/* Auto Save Toggle */}
        <button
          onClick={toggleAutoSave}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${autoSave
            ? 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400'
            : 'bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 border-transparent dark:border-white/10'
            }`}
          title="生成后自动下载到本地"
        >
          <Save className="w-3.5 h-3.5" />
          {autoSave ? "自动保存: 开" : "自动保存: 关"}
        </button>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="flex-1 flex items-center justify-center gap-2 bg-apple-blue hover:bg-blue-600 text-white py-2 rounded-lg font-medium text-sm disabled:opacity-50 transition-all shadow-sm active:scale-[0.98]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          生成效果图
        </button>
      </div>

      {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-200 text-xs rounded-lg border border-red-200 dark:border-red-800/50">{error}</div>}

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        <div className="flex-1 bg-apple-gray-100 dark:bg-black/40 border border-transparent dark:border-white/10 rounded-xl overflow-hidden relative flex items-center justify-center shadow-inner">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 z-10 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-apple-blue animate-spin mb-2" />
              <p className="text-apple-gray-500 dark:text-apple-gray-400 text-sm font-medium">Gemini 正在渲染中...</p>
            </div>
          )}

          {image ? (
            <div className="w-full h-full overflow-auto p-4 custom-scrollbar flex items-center justify-center bg-black/5 dark:bg-black/20">
                 <img
                  src={`data:${mimeType};base64,${image}`}
                  alt="Generated"
                  className="shadow-2xl rounded-lg transition-all duration-300"
                  style={{
                      maxWidth: '100%', 
                      height: 'auto',
                      objectFit: 'contain'
                  }}
                />
            </div>
          ) : (
            <div className="text-apple-gray-400 dark:text-apple-gray-600 flex flex-col items-center">
              <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm font-medium">输入提示词并点击生成</p>
            </div>
          )}
        </div>

        {/* Sidebar Actions (Always Visible) */}
        {image && (
             <div className="w-12 flex flex-col gap-3 shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
                <a
                  href={`data:${mimeType};base64,${image}`}
                  download={`arch-gemini-render.${mimeType === "image/png" ? "png" : "jpg"}`}
                  className="w-12 h-12 flex items-center justify-center bg-apple-blue text-white rounded-xl shadow-lg hover:bg-blue-600 transition-all hover:scale-105 active:scale-95"
                  title="下载图片"
                >
                  <Download className="w-5 h-5" />
                </a>
             </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
