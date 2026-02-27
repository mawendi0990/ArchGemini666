import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';

const ImageUploader = ({
  images = [],
  onImagesChange,
  maxImages = 1,
  allowAnalysis = false,
  onAnalyze,
  label = "Reference Images",
  showImageNumbers = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      // Add new image to list
      if (images.length < maxImages) {
        onImagesChange([...images, e.target.result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const handleAnalyzeClick = async (imgData, type) => {
    if (!onAnalyze) return;
    setAnalyzing(true);
    try {
        // Convert base64 to blob for API
        const res = await fetch(imgData);
        const blob = await res.blob();
        const file = new File([blob], "analysis.png", { type: "image/png" });
        await onAnalyze(file, type);
    } catch (e) {
        console.error(e);
    } finally {
        setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-apple-blue to-aurora-purple bg-clip-text text-transparent">{label}</label>}

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2.5">
            {images.map((img, idx) => (
            <div key={idx} className="relative group flex gap-2">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-apple-gray-200 dark:border-white/10 bg-gradient-to-br from-apple-gray-50 to-apple-gray-100 dark:from-white/5 dark:to-white/10 shadow-sm group-hover:shadow-lg group-hover:shadow-apple-blue/10 transition-all duration-300">
                    <img src={img} alt="upload" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 backdrop-blur-md z-10"
                    >
                    <X className="w-3 h-3" />
                    </button>
                    {/* Image Number Badge - shows when showImageNumbers is true */}
                    {showImageNumbers && (
                        <div className="absolute top-1.5 left-1.5 bg-gradient-to-br from-apple-blue to-aurora-cyan text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-10">
                            {idx + 1}
                        </div>
                    )}
                    {/* Image Number Label at bottom */}
                    {showImageNumbers && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/60 text-white text-[9px] text-center py-1 backdrop-blur-sm">
                            图片{idx + 1}
                        </div>
                    )}
                </div>
            </div>
            ))}

            {images.length < maxImages && (
            <div
                className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    dragActive
                        ? 'border-apple-blue bg-apple-blue/10 shadow-lg shadow-apple-blue/20 scale-105'
                        : 'border-apple-gray-300 dark:border-white/10 hover:border-apple-blue/50 dark:hover:border-white/30 bg-gradient-to-br from-apple-gray-50 to-apple-gray-100 dark:from-white/5 dark:to-white/10 hover:from-apple-blue/5 hover:to-aurora-cyan/5'
                }`}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => {
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                        fileInputRef.current.click();
                    }
                }}
            >
                <div className={`p-2 rounded-full mb-1.5 transition-all ${dragActive ? 'bg-apple-blue/20' : 'bg-apple-gray-200 dark:bg-white/10'}`}>
                    <Upload className={`w-5 h-5 ${dragActive ? 'text-apple-blue' : 'text-apple-gray-400 dark:text-apple-gray-500'} pointer-events-none`} />
                </div>
                <span className="text-[10px] font-medium text-apple-gray-500 dark:text-apple-gray-400 text-center px-2 pointer-events-none">点击或拖拽上传</span>
                <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                />
            </div>
            )}
        </div>

        {/* Analysis Buttons - Show only if there is at least one image and analysis is allowed */}
        {allowAnalysis && images.length > 0 && (
            <div className="flex flex-col gap-2 pl-1 border-l-2 border-gradient-to-b from-apple-blue to-aurora-purple">
                <button
                    onClick={() => handleAnalyzeClick(images[images.length - 1], 'scene')}
                    disabled={analyzing}
                    className="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 rounded-xl text-[10px] font-medium text-apple-gray-700 dark:text-apple-gray-200 hover:bg-apple-blue/5 hover:border-apple-blue/30 dark:hover:bg-white/10 hover:shadow-lg hover:shadow-apple-blue/10 transition-all text-left"
                >
                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin text-apple-blue"/> : <div className="p-1.5 bg-apple-blue/10 rounded-lg"><ImagePlus className="w-4 h-4 text-apple-blue"/></div>}
                    <div className="flex-1">
                        <div className="font-bold text-apple-gray-900 dark:text-white">一键参考场景</div>
                        <div className="text-[9px] opacity-60 font-normal mt-0.5">提取时间/光影/氛围</div>
                    </div>
                </button>

                <button
                    onClick={() => handleAnalyzeClick(images[images.length - 1], 'facade')}
                    disabled={analyzing}
                    className="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 rounded-xl text-[10px] font-medium text-apple-gray-700 dark:text-apple-gray-200 hover:bg-aurora-purple/5 hover:border-aurora-purple/30 dark:hover:bg-white/10 hover:shadow-lg hover:shadow-aurora-purple/10 transition-all text-left"
                >
                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin text-aurora-purple"/> : <div className="p-1.5 bg-aurora-purple/10 rounded-lg"><ImagePlus className="w-4 h-4 text-aurora-purple"/></div>}
                    <div className="flex-1">
                        <div className="font-bold text-apple-gray-900 dark:text-white">一键参考立面</div>
                        <div className="text-[9px] opacity-60 font-normal mt-0.5">提取风格/材质/构成</div>
                    </div>
                </button>
            </div>
        )}

        {/* Image Number Legend - shows when showImageNumbers is true */}
        {showImageNumbers && images.length > 0 && (
            <div className="bg-gradient-to-r from-apple-blue/10 to-aurora-cyan/10 dark:from-apple-blue/20 dark:to-aurora-cyan/20 rounded-xl p-3 text-[10px] text-apple-blue dark:text-apple-blue/80 border border-apple-blue/20">
                <div className="font-semibold mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    图片序号说明
                </div>
                图片按上传顺序自动编号为"图片1"、"图片2"等，对应 Gemini API 的 "Image 1"、"Image 2" 引用。
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
