import React, { useState } from 'react';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config';

const PromptOptimizer = ({ onPromptChange, currentPrompt }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    if (!currentPrompt) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/optimize-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentPrompt }),
      });
      if (!response.ok) throw new Error('Failed to optimize prompt');
      const data = await response.json();
      onPromptChange(data.optimized_prompt);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-apple-blue to-aurora-purple bg-clip-text text-transparent">建筑提示词</label>
        <button
          onClick={handleOptimize}
          disabled={loading || !currentPrompt}
          className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold bg-gradient-to-r from-apple-blue to-aurora-purple hover:from-apple-blue/90 hover:to-aurora-purple/90 text-white rounded-full transition-all shadow-lg shadow-apple-blue/25 hover:shadow-apple-blue/40 disabled:opacity-50 btn-press"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          AI 优化
        </button>
      </div>
      <div className="relative">
        <textarea
          value={currentPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="w-full h-32 bg-white/80 dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 rounded-2xl p-4 text-sm text-apple-gray-900 dark:text-white placeholder-apple-gray-400 focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue/50 outline-none resize-none transition-all shadow-inner backdrop-blur-sm"
          placeholder="描述您的建筑构想 (例如: '湖边日落时的现代玻璃别墅')..."
        />
        {/* Character count indicator */}
        <div className="absolute bottom-3 right-3 text-[9px] text-apple-gray-400 dark:text-apple-gray-500 font-mono">
          {currentPrompt.length} 字符
        </div>
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{error}</p>}
    </div>
  );
};

export default PromptOptimizer;
