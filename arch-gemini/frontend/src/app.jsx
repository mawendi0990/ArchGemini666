import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import PromptOptimizer from './components/PromptOptimizer';
import ImageGenerator from './components/ImageGenerator';
import ImageUploader from './components/ImageUploader';
import HistorySidebar from './components/HistorySidebar';
import TemplateGallery from './pages/TemplateGallery';
import { Layout, PenTool, Image as ImageIcon, Layers, Sun, Moon, Sparkles, X } from 'lucide-react';

function App() {
    const [mode, setMode] = useState("text"); // text | sketch | composition
    const [theme, setTheme] = useState("dark"); // dark | light
    const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
    const [showTemplateGallery, setShowTemplateGallery] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

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

    // Handle template application
    const handleApplyTemplate = (template) => {
        setSelectedTemplate(template);
        // Set prompt from template
        const basePrompt = template.promptTemplate.replace('{prompt}', '').trim();
        setPrompt(basePrompt);
        setShowTemplateGallery(false);
    };

    // Close template gallery and clear selection
    const handleCloseTemplateGallery = () => {
        setShowTemplateGallery(false);
    };

    return (
        <div className="flex h-screen w-screen bg-gradient-mesh text-apple-gray-900 dark:text-apple-gray-100 overflow-hidden font-sans selection:bg-apple-blue/30 transition-colors duration-300">

            {/* Sidebar */}
            <div className="w-80 flex flex-col border-r border-black/5 dark:border-white/10 glass-strong p-6 overflow-y-auto relative z-10 transition-colors duration-300">
                {/* Decorative gradient line at top */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-apple-blue via-aurora-purple to-aurora-pink"></div>

                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-apple-blue to-aurora-purple rounded-xl shadow-lg animate-pulse-glow">
                            <Layout className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-base font-semibold tracking-tight text-apple-gray-900 dark:text-white leading-tight">
                            <span className="text-gradient-blue">建筑创作中心</span><br />
                            <span className="text-[10px] font-medium text-apple-gray-500 dark:text-apple-gray-400 font-normal">AI 渲染图生成工具</span>
                        </h1>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gradient-to-br from-apple-gray-100 to-apple-gray-200 dark:from-white/10 dark:to-white/5 text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white transition-all hover:scale-110 btn-press"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>

                <div className="space-y-10">
                    {/* Mode Selector */}
                    <div className="flex bg-black/5 dark:bg-white/10 p-1.5 rounded-2xl shadow-inner">
                        <button
                            onClick={() => setMode('text')}
                            className={`flex-1 flex flex-col items-center py-3 text-[10px] font-medium rounded-xl transition-all duration-300 ${mode === 'text' ? 'bg-gradient-to-br from-white to-apple-gray-50 dark:from-apple-gray-600 dark:to-apple-gray-700 text-gradient-blue shadow-lg scale-[1.02]' : 'text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'}`}
                        >
                            <PenTool className={`w-4 h-4 mb-1.5 ${mode === 'text' ? 'text-apple-blue' : ''}`} />
                            文生图
                        </button>
                        <button
                            onClick={() => setMode('sketch')}
                            className={`flex-1 flex flex-col items-center py-3 text-[10px] font-medium rounded-xl transition-all duration-300 ${mode === 'sketch' ? 'bg-gradient-to-br from-white to-apple-gray-50 dark:from-apple-gray-600 dark:to-apple-gray-700 text-gradient-blue shadow-lg scale-[1.02]' : 'text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'}`}
                        >
                            <ImageIcon className={`w-4 h-4 mb-1.5 ${mode === 'sketch' ? 'text-apple-blue' : ''}`} />
                            草图渲染
                        </button>
                        <button
                            onClick={() => setMode('composition')}
                            className={`flex-1 flex flex-col items-center py-3 text-[10px] font-medium rounded-xl transition-all duration-300 ${mode === 'composition' ? 'bg-gradient-to-br from-white to-apple-gray-50 dark:from-apple-gray-600 dark:to-apple-gray-700 text-gradient-blue shadow-lg scale-[1.02]' : 'text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'}`}
                        >
                            <Layers className={`w-4 h-4 mb-1.5 ${mode === 'composition' ? 'text-apple-blue' : ''}`} />
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
                                    showImageNumbers={true}
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
                            <h2 className="text-xs uppercase bg-gradient-to-r from-apple-blue to-aurora-purple bg-clip-text text-transparent font-bold tracking-widest pl-1">提示词工程</h2>
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
                        <div className="flex items-center justify-between mb-2">
                            <p>当前模式</p>
                            <span className="text-gradient-blue font-mono bg-apple-blue/10 dark:bg-apple-blue/20 px-2.5 py-1 rounded-full text-[10px] border border-apple-blue/20">{getModeLabel()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="opacity-60">Powered by</p>
                            <p className="text-gradient font-mono text-[10px]">Gemini 3.1 Flash</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative overflow-hidden transition-colors duration-300">
                {/* Background Ambient Lights */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-apple-blue/10 dark:bg-apple-blue/5 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-aurora-purple/10 dark:bg-aurora-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-aurora-cyan/5 dark:bg-aurora-cyan/3 rounded-full blur-3xl"></div>
                </div>

                <header className="px-8 py-6 flex justify-between items-center z-10 border-b border-apple-gray-200/50 dark:border-white/5 glass-strong shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-apple-gray-900 dark:text-white flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-emerald opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-aurora-emerald shadow-lg shadow-aurora-emerald/50"></span>
                            </span>
                            <span className="text-gradient-blue">渲染画布</span>
                        </h2>
                        {selectedTemplate && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-apple-blue/10 to-aurora-purple/10 text-gradient-blue rounded-full text-xs border border-apple-blue/20 animate-scale-in">
                                <Sparkles className="w-3 h-3" />
                                <span>{selectedTemplate.name}</span>
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="hover:text-apple-blue/70 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowTemplateGallery(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-apple-blue to-aurora-cyan text-white rounded-xl text-sm font-medium shadow-lg shadow-apple-blue/25 hover:shadow-apple-blue/40 hover:scale-105 transition-all btn-press"
                        >
                            <Sparkles className="w-4 h-4" />
                            模板画廊
                        </button>
                        <div className="text-xs font-mono bg-gradient-to-r from-apple-blue/10 to-aurora-purple/10 text-gradient-blue px-3 py-1.5 rounded-full border border-apple-blue/20">v0.3.1</div>
                    </div>
                </header>

                <div className="flex-1 p-8 z-10 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full max-w-5xl glass-strong rounded-3xl border border-apple-gray-200/50 dark:border-white/10 shadow-2xl dark:shadow-black/50 backdrop-blur-xl overflow-hidden flex flex-col transition-colors duration-300">
                        <div className="flex-1 p-1 overflow-hidden flex flex-col">
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

            {/* Template Gallery Modal */}
            {showTemplateGallery && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
                    <div className="h-full w-full max-w-6xl mx-auto">
                        <TemplateGallery
                            onApplyTemplate={handleApplyTemplate}
                            onClose={handleCloseTemplateGallery}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
