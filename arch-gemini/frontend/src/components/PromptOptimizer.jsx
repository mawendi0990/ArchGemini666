import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';

const PromptOptimizer = ({ onPromptChange, currentPrompt }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    if (!currentPrompt) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/optimize-prompt`, {
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
        <label className="text-xs font-semibold uppercase tracking-wider text-apple-gray-500 dark:text-apple-gray-400">建筑提示词</label>
        <button
          onClick={handleOptimize}
          disabled={loading || !currentPrompt}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium bg-apple-blue hover:bg-blue-600 text-white rounded-full transition-all shadow-sm disabled:opacity-50 active:scale-95"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
          AI 优化
        </button>
      </div>
      <textarea
        value={currentPrompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className="w-full h-32 bg-apple-gray-50 dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-apple-gray-900 dark:text-white placeholder-apple-gray-400 focus:ring-2 focus:ring-apple-blue/50 focus:border-transparent outline-none resize-none transition-all shadow-inner"
        placeholder="描述您的建筑构想 (例如: '湖边日落时的现代玻璃别墅')..."
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default PromptOptimizer;
