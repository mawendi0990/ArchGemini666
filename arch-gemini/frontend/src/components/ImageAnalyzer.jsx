import React, { useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';

const ImageAnalyzer = ({ onAnalysisComplete }) => {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', "Analyze this architectural image. Describe the style, materials, lighting, and composition in detail to help recreate it.");

      const response = await fetch(`http://${window.location.hostname}:8000/api/analyze-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      onAnalysisComplete(data.description);
    } catch (err) {
      console.error(err);
      // Ideally show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const clearImage = (e) => {
      e.stopPropagation();
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="mb-4">
      <div 
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer min-h-[120px] flex items-center justify-center ${
          dragActive 
            ? 'border-apple-blue bg-apple-blue/5' 
            : 'border-apple-gray-200 dark:border-white/10 hover:border-apple-blue/50 dark:hover:border-white/30 bg-apple-gray-50 dark:bg-white/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
        />
        
        {loading ? (
             <div className="flex flex-col items-center justify-center py-2 text-apple-blue">
                <Loader2 className="w-5 h-5 animate-spin mb-1" />
                <span className="text-xs">Analyzing Architecture...</span>
             </div>
        ) : preview ? (
            <div className="relative h-24 w-full flex items-center justify-center rounded overflow-hidden group">
                <img src={preview} alt="Reference" className="h-full object-contain" />
                <button 
                    onClick={clearImage}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-2 text-apple-gray-400 dark:text-apple-gray-500">
                <Upload className="w-6 h-6 mb-2" />
                <p className="text-xs text-center">Drag reference image here<br/>to extract style & prompt</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalyzer;
