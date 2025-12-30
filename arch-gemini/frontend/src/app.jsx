import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import PromptOptimizer from './components/PromptOptimizer';
import ImageGenerator from './components/ImageGenerator';
import ImageUploader from './components/ImageUploader';
import HistorySidebar from './components/HistorySidebar';
import { Layout, PenTool, Image as ImageIcon, Layers, Sun, Moon } from 'lucide-react';

function App() {
    const [mode, setMode] = useState("text"); // text | sketch | composition
    const [theme, setTheme] = useState("dark"); // dark | light
    const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark');
    };

    // State management for each mode
    const [textState, setTextState] = useState({ prompt: "", refImage: [] });
    const [sketchState, setSketchState] = useState({ prompt: "", sketchImage: [] });
    const [compState, setCompState] = useState({ prompt: "", compImages: [] });

    // Helper to get/set current state based on mode
    const currentPrompt = mode === 'text' ? textState.prompt : (mode === 'sketch' ? sketchState.prompt : compState.prompt);
    const currentImages = mode === 'text' ? textState.refImage : (mode === 'sketch' ? sketchState.sketchImage : compState.compImages);

    const setPrompt = (newPrompt) => {
        if (mode === 'text') setTextState(s => ({ ...s, prompt: newPrompt }));
        else if (mode === 'sketch') setSketchState(s => ({ ...s, prompt: newPrompt }));
        else setCompState(s => ({ ...s, prompt: newPrompt }));
    };

    const setImages = (newImages) => {
        if (mode === 'text') setTextState(s => ({ ...s, refImage: newImages }));
        else if (mode === 'sketch') setSketchState(s => ({ ...s, sketchImage: newImages }));
        else setCompState(s => ({ ...s, compImages: newImages }));
    };

    const handleAnalysis = async (file, analysisType = "general") => {
        // This is for extracting prompt from reference
        const formData = new FormData();
        formData.append('file', file);
        formData.append('analysis_type', analysisType);
        // Prompt is now handled by backend based on analysis_type, but we can pass a dummy or specific one if needed
        // For now, we rely on backend defaults for scene/facade

        const response = await fetch(`${API_BASE_URL}/api/analyze-image`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Analysis failed');
        const data = await response.json();

        // Append to current prompt with a label
        const label = analysisType === 'scene' ? "【环境参考】" : (analysisType === 'facade' ? "【立面参考】" : "【参考分析】");
        setPrompt(currentPrompt ? currentPrompt + "\n\n" + label + ": " + data.description : label + ": " + data.description);
    };

    const getModeLabel = () => {
        switch (mode) {
            case 'text': return "文生图模式";
            case 'sketch': return "草图/模型渲染模式";
            case 'composition': return "创意组合模式";
            default: return "渲染模式";
        }
    };

    return (
        <div className="flex h-screen bg-apple-gray-50 dark:bg-black text-apple-gray-900 dark:text-apple-gray-100 overflow-hidden font-sans selection:bg-apple-blue/30 transition-colors duration-300">

            {/* Sidebar */}
            {/* Sidebar - Cleaner Look */}
            <div className="w-80 flex flex-col border-r border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-2xl p-6 overflow-y-auto relative z-10 transition-colors duration-300">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3 text-apple-blue">
                        <div className="p-2 bg-apple-blue/10 rounded-xl">
                            <Layout className="w-5 h-5" />
                        </div>
                        <h1 className="text-base font-semibold tracking-tight text-apple-gray-900 dark:text-white leading-tight">
                            建筑创作中心<br />
                            <span className="text-[10px] font-medium text-apple-gray-500 dark:text-apple-gray-400 font-normal">渲染图生成工具</span>
                        </h1>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-apple-gray-100 dark:bg-white/10 text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>

                <div className="space-y-10">
                    {/* Mode Selector */}
                    <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-xl">
                        <button
                            onClick={() => setMode('text')}
                            className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-medium rounded-lg transition-all duration-300 ${mode === 'text' ? 'bg-white dark:bg-apple-gray-600 text-apple-blue dark:text-white shadow-sm scale-[1.02]' : 'text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white'}`}
                        >
                            <PenTool className="w-4 h-4 mb-1" />
                            文生图
                        </button>
                        <button
                            onClick={() => setMode('sketch')}
                            className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-medium rounded-lg transition-all duration-300 ${mode === 'sketch' ? 'bg-white dark:bg-apple-gray-600 text-apple-blue dark:text-white shadow-sm scale-[1.02]' : 'text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white'}`}
                        >
                            <ImageIcon className="w-4 h-4 mb-1" />
                            草图渲染
                        </button>
                        <button
                            onClick={() => setMode('composition')}
                            className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-medium rounded-lg transition-all duration-300 ${mode === 'composition' ? 'bg-white dark:bg-apple-gray-600 text-apple-blue dark:text-white shadow-sm scale-[1.02]' : 'text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white'}`}
                        >
                            <Layers className="w-4 h-4 mb-1" />
                            组合生成
                        </button>
                    </div>

                    {/* Context Images (Dynamic based on Mode) */}
                    {mode !== 'text' && (
                        <section className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-6">
                            {/* Sketch Mode: Dual Uploaders */}
                            {mode === 'sketch' ? (
                                <>
                                    {/* 1. Style Reference (Prompt Generation) */}
                                    <ImageUploader
                                        images={textState.refImage} // Reuse textState refImage for style reference
                                        onImagesChange={(imgs) => setTextState(s => ({ ...s, refImage: imgs }))}
                                        maxImages={1}
                                        label="1. 风格参考图 (生成提示词)"
                                        allowAnalysis={true}
                                        onAnalyze={handleAnalysis}
                                    />

                                    {/* 2. Sketch Input (Visual Structure) */}
                                    <ImageUploader
                                        images={sketchState.sketchImage}
                                        onImagesChange={(imgs) => setSketchState(s => ({ ...s, sketchImage: imgs }))}
                                        maxImages={1}
                                        label="2. 草图/模型输入 (保持结构)"
                                        allowAnalysis={false} // No prompt analysis needed for the sketch itself usually
                                    />
                                </>
                            ) : (
                                /* Composition Mode */
                                <ImageUploader
                                    images={compState.compImages}
                                    onImagesChange={(imgs) => setCompState(s => ({ ...s, compImages: imgs }))}
                                    maxImages={14}
                                    label="上传组合素材 (风格/材质)"
                                    allowAnalysis={true}
                                    onAnalyze={handleAnalysis}
                                />
                            )}

                            <p className="text-[10px] text-apple-gray-500 dark:text-apple-gray-400 mt-3 leading-relaxed px-1">
                                {mode === 'sketch'
                                    ? "请先上传参考图提取风格提示词，再上传草图进行渲染。"
                                    : "上传多张参考图（如风格、材质、布局）。AI 将融合它们生成新方案。"}
                            </p>
                        </section>
                    )}

                    {/* Prompt Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xs uppercase text-apple-gray-400 dark:text-apple-gray-500 font-bold tracking-widest pl-1">提示词工程</h2>
                            {mode === 'text' && (
                                <ImageUploader
                                    label=""
                                    maxImages={1}
                                    allowAnalysis={true}
                                    onAnalyze={handleAnalysis}
                                    images={textState.refImage}
                                    onImagesChange={(imgs) => setTextState(s => ({ ...s, refImage: imgs }))}
                                />
                            )}
                        </div>
                        <PromptOptimizer currentPrompt={currentPrompt} onPromptChange={setPrompt} />
                    </section>

                    <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-auto pt-8 border-t border-apple-gray-200 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <p>当前模式</p>
                            <span className="text-apple-blue font-mono bg-apple-blue/5 px-2 py-0.5 rounded text-[10px]">{getModeLabel()}</span>
                        </div>
                        <p className="mt-2 opacity-50">Powered by Gemini 3 Pro & Qwen</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-apple-gray-50 dark:bg-black relative overflow-hidden transition-colors duration-300">
                {/* Background Ambient Light */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-apple-blue/5 via-transparent to-transparent pointer-events-none"></div>

                <header className="px-8 py-6 flex justify-between items-center z-10 border-b border-apple-gray-200 dark:border-white/5 bg-white/50 dark:bg-neutral-900/30 backdrop-blur-xl shrink-0">
                    <h2 className="text-lg font-medium text-apple-gray-900 dark:text-white flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        渲染画布
                    </h2>
                    <div className="text-xs font-mono text-apple-gray-500 dark:text-apple-gray-400 bg-apple-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">v0.2.2 Beta</div>
                </header>

                <div className="flex-1 p-8 z-10 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full max-w-5xl bg-white dark:bg-apple-gray-900/40 rounded-2xl border border-apple-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl backdrop-blur-sm overflow-hidden flex flex-col transition-colors duration-300">
                        <div className="flex-1 p-1">
                            <ImageGenerator
                                prompt={currentPrompt}
                                images={currentImages}
                                mode={mode}
                                onGenerationSuccess={() => setHistoryRefreshTrigger(prev => prev + 1)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* History Sidebar */}
            <HistorySidebar refreshTrigger={historyRefreshTrigger} />
        </div>
    );
}

export default App;
