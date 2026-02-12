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
      <label className="text-xs font-bold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wider">{label}</label>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
            {images.map((img, idx) => (
            <div key={idx} className="relative group flex gap-2">
                <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-apple-gray-200 dark:border-white/10 bg-apple-gray-50 dark:bg-white/5">
                    <img src={img} alt="upload" className="w-full h-full object-cover" />
                    <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-500 backdrop-blur-sm z-10"
                    >
                    <X className="w-3 h-3" />
                    </button>
                    {/* Image Number Badge - shows when showImageNumbers is true */}
                    {showImageNumbers && (
                        <div className="absolute top-1 left-1 bg-apple-blue/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm z-10">
                            {idx + 1}
                        </div>
                    )}
                    {/* Image Number Label at bottom */}
                    {showImageNumbers && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                            图片{idx + 1}
                        </div>
                    )}
                </div>
            </div>
            ))}

            {images.length < maxImages && (
            <div
                className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    dragActive
                        ? 'border-apple-blue bg-apple-blue/5'
                        : 'border-apple-gray-200 dark:border-white/10 hover:border-apple-blue/50 dark:hover:border-white/30 bg-apple-gray-50 dark:bg-white/5 hover:bg-apple-gray-100 dark:hover:bg-white/10'
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
                <Upload className="w-5 h-5 text-apple-gray-400 dark:text-apple-gray-500 mb-1 pointer-events-none" />
                <span className="text-[10px] text-apple-gray-500 dark:text-apple-gray-400 text-center px-2 pointer-events-none">点击上传</span>
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
            <div className="flex flex-col gap-2 pl-1 border-l-2 border-apple-gray-100 dark:border-white/5">
                <button
                    onClick={() => handleAnalyzeClick(images[images.length - 1], 'scene')}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 rounded-lg text-[10px] font-medium text-apple-gray-700 dark:text-apple-gray-200 hover:bg-apple-gray-50 dark:hover:bg-white/10 transition-colors text-left"
                >
                    {analyzing ? <Loader2 className="w-3 h-3 animate-spin text-apple-blue"/> : <ImagePlus className="w-3 h-3 text-apple-blue"/>}
                    <div>
                        <div className="font-bold">一键参考场景</div>
                        <div className="text-[9px] opacity-60 font-normal">提取时间/光影/氛围</div>
                    </div>
                </button>

                <button
                    onClick={() => handleAnalyzeClick(images[images.length - 1], 'facade')}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 rounded-lg text-[10px] font-medium text-apple-gray-700 dark:text-apple-gray-200 hover:bg-apple-gray-50 dark:hover:bg-white/10 transition-colors text-left"
                >
                    {analyzing ? <Loader2 className="w-3 h-3 animate-spin text-purple-500"/> : <ImagePlus className="w-3 h-3 text-purple-500"/>}
                    <div>
                        <div className="font-bold">一键参考立面</div>
                        <div className="text-[9px] opacity-60 font-normal">提取风格/材质/构成</div>
                    </div>
                </button>
            </div>
        )}

        {/* Image Number Legend - shows when showImageNumbers is true */}
        {showImageNumbers && images.length > 0 && (
            <div className="bg-apple-blue/5 dark:bg-apple-blue/10 rounded-lg p-2 text-[10px] text-apple-blue dark:text-apple-blue/80">
                <div className="opacity-70 mb-1">图片序号说明：</div>
                图片按上传顺序自动编号为"图片1"、"图片2"等，对应 Gemini API 的 "Image 1"、"Image 2" 引用。
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
