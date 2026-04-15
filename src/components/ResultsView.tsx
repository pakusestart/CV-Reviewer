import React, { useState, useRef, useEffect } from 'react';
import { CVAnalysis } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, TrendingUp, Target, FileText, ChevronRight, Lightbulb, Zap, ArrowRight, User, Mail, GraduationCap, Briefcase, Code } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResultsViewProps {
  analysis: CVAnalysis;
  originalText: string;
}

export default function ResultsView({ analysis, originalText }: ResultsViewProps) {
  const [viewMode, setViewMode] = useState<'diff' | 'side'>('diff');
  const [activeTab, setActiveTab] = useState<'insights' | 'gaps' | 'formatting'>('insights');
  const [displayScore, setDisplayScore] = useState(0);
  const [showProbabilities, setShowProbabilities] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{ title: string, content: string, type: 'strength' | 'weakness' | 'tip' | 'level' } | null>(null);
  
  const gapsRef = useRef<HTMLDivElement>(null);
  const formattingRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);

  const isIndo = analysis.language === 'id';

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = analysis.score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= analysis.score) {
        setDisplayScore(analysis.score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [analysis.score]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, tab: 'insights' | 'gaps' | 'formatting') => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const ProbabilityItem = ({ label, value, color, levelKey }: { label: string, value: number, color: string, levelKey: 'junior' | 'senior' | 'manager' }) => {
    const recommendation = analysis.levelRecommendations[levelKey];
    const isHighest = value === Math.max(analysis.probabilities.junior, analysis.probabilities.senior, analysis.probabilities.manager);
    
    // Logic: If highest is higher level, skip lower level tips
    const shouldShowTips = levelKey === 'junior' 
      ? (isHighest || (analysis.probabilities.senior < 40 && analysis.probabilities.manager < 40))
      : true;

    return (
      <motion.div 
        whileHover={{ x: 4, backgroundColor: shouldShowTips ? "rgba(248, 250, 252, 1)" : "transparent" }}
        whileTap={{ scale: shouldShowTips ? 0.98 : 1 }}
        onClick={() => {
          if (shouldShowTips && recommendation) {
            setSelectedDetail({
              title: `${label} - ${isIndo ? 'Rekomendasi' : 'Recommendation'}`,
              content: recommendation,
              type: 'level'
            });
          }
        }}
        className={cn(
          "space-y-2 p-4 rounded-2xl transition-all border border-transparent",
          shouldShowTips ? "cursor-pointer hover:border-slate-100 hover:shadow-sm" : "opacity-40 grayscale cursor-not-allowed"
        )}
      >
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">{label}</span>
            {shouldShowTips && (
              <div className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[8px] font-black text-primary uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                  {isIndo ? 'Klik untuk Tips' : 'Click for Tips'}
                </span>
              </div>
            )}
          </div>
          <span className="text-sm font-black text-slate-900">{value}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]", color)}
          />
        </div>
      </motion.div>
    );
  };

  // Simple highlighter for the original text
  const renderHighlightedText = () => {
    let text = originalText;
    // Sort improvements by length descending to avoid nested replacement issues
    const sortedImprovements = [...analysis.improvements].sort((a, b) => b.original.length - a.original.length);
    
    return (
      <div className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-on-surface-variant/80">
        {text.split('\n').map((line, i) => {
          let elements: React.ReactNode[] = [line];
          let keyCounter = 0;
          
          for (const imp of sortedImprovements) {
            const nextElements: React.ReactNode[] = [];
            for (const el of elements) {
              if (typeof el === 'string' && el.includes(imp.original)) {
                const parts = el.split(imp.original);
                // Interleave parts with highlighted spans
                for (let j = 0; j < parts.length; j++) {
                  nextElements.push(parts[j]);
                  if (j < parts.length - 1) {
                    nextElements.push(
                      <span key={`${i}-${keyCounter++}`} className="relative inline-block group mx-1">
                        <span className="bg-error/30 text-error px-1 rounded line-through decoration-error/50 font-bold">
                          {imp.original}
                        </span>
                        <span className="bg-tertiary-fixed-dim/20 text-tertiary-fixed-dim px-1 rounded font-bold ml-1">
                          {imp.revised}
                        </span>
                        {/* Tooltip for reasoning */}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10">
                          <span className="block font-black uppercase tracking-widest text-tertiary-fixed-dim mb-1">
                            {isIndo ? 'Alasan AI' : 'AI Reasoning'}
                          </span>
                          {imp.reason}
                        </span>
                      </span>
                    );
                  }
                }
              } else {
                nextElements.push(el);
              }
            }
            elements = nextElements;
          }
          return <div key={i} className="min-h-[1.5em]">{elements}</div>;
        })}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-20 relative"
    >
      {/* Detail Popup Modal */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetail(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className={cn(
                "h-2 w-full",
                selectedDetail.type === 'strength' ? "bg-tertiary-fixed" : 
                selectedDetail.type === 'weakness' ? "bg-error" : 
                selectedDetail.type === 'level' ? "bg-slate-900" : "bg-primary"
              )} />
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      selectedDetail.type === 'strength' ? "bg-tertiary-container text-tertiary-fixed" : 
                      selectedDetail.type === 'weakness' ? "bg-error-container text-error" : 
                      selectedDetail.type === 'level' ? "bg-slate-900 text-white" : "bg-primary-container text-primary"
                    )}>
                      {selectedDetail.type === 'strength' ? <CheckCircle2 className="w-6 h-6" /> : 
                       selectedDetail.type === 'weakness' ? <AlertCircle className="w-6 h-6" /> : 
                       selectedDetail.type === 'level' ? <TrendingUp className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                    </div>
                    <h3 className="text-2xl font-black font-headline text-slate-900">{selectedDetail.title}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedDetail(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <AlertCircle className="w-5 h-5 rotate-45 text-slate-400" />
                  </button>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {selectedDetail.content}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedDetail(null)}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                  >
                    {isIndo ? 'Tutup' : 'Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Probability Popup Trigger */}
      <div className="fixed bottom-8 right-8 z-40 no-print">
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowProbabilities(!showProbabilities)}
          className="group relative flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-2xl font-black shadow-2xl border border-white/10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <TrendingUp className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
          <span className="tracking-tight">{isIndo ? 'Peluang Diterima' : 'Acceptance Odds'}</span>
          <div className="ml-2 p-1 bg-white/10 rounded-lg group-hover:bg-primary transition-colors">
            <ChevronRight className={cn("w-4 h-4 transition-transform", showProbabilities ? "rotate-90" : "")} />
          </div>
        </motion.button>
        
        <AnimatePresence>
          {showProbabilities && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 right-0 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary-fixed"></div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                {isIndo ? 'Probabilitas Kerja' : 'Hire Probability'}
              </h4>
              <div className="space-y-2">
                <ProbabilityItem label={isIndo ? 'Level Junior' : 'Junior Level'} value={analysis.probabilities.junior} color="bg-primary" levelKey="junior" />
                <ProbabilityItem label={isIndo ? 'Level Senior' : 'Senior Level'} value={analysis.probabilities.senior} color="bg-tertiary-fixed-dim" levelKey="senior" />
                <ProbabilityItem label={isIndo ? 'Level Manager' : 'Manager Level'} value={analysis.probabilities.manager} color="bg-slate-900" levelKey="manager" />
              </div>
              <p className="mt-6 text-[10px] text-slate-400 font-medium leading-relaxed italic">
                {isIndo 
                  ? `*Estimasi berdasarkan keselarasan semantik dengan standar industri untuk posisi "${analysis.targetJob}".`
                  : `*Estimates based on semantic alignment with industry standards for "${analysis.targetJob}".`
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header Section with Score */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-6"
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-tertiary-fixed opacity-20 blur-lg rounded-full"></div>
            <img 
              src="https://picsum.photos/seed/architect/200/200" 
              alt="AI Architect" 
              referrerPolicy="no-referrer"
              className="relative w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
            />
          </div>
          <div>
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <span className="inline-flex px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-black rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm">
                {isIndo ? 'Analisis Selesai' : 'Analysis Complete'}
              </span>
              <span className="inline-flex px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest items-center gap-1.5 shadow-sm max-w-[200px] sm:max-w-[300px]">
                <Target className="w-3 h-3 shrink-0 text-primary" /> 
                <span className="truncate">{analysis.targetJob}</span>
              </span>
            </div>
            <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface tracking-tight">
              {isIndo ? 'Review CV Profesional' : 'Professional CV Review'}
            </h1>
            <p className="font-body text-on-surface-variant mt-2 max-w-lg">{analysis.summary}</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-tertiary-fixed to-primary-container rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-surface-container-lowest p-8 rounded-full flex flex-col items-center justify-center w-48 h-48 border border-outline-variant/10 shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
            <span className="text-6xl font-black font-headline text-primary tracking-tighter">{displayScore}%</span>
            <div className="w-12 h-1 bg-tertiary-fixed-dim my-2 rounded-full"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Semantic Pulse</span>
          </div>
        </motion.div>
      </header>

      {/* Job Alignment Section */}
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", damping: 20 }}
        className="relative group overflow-hidden rounded-[2.5rem] p-1"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-tertiary-fixed to-slate-900 animate-gradient-xy"></div>
        <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-[2.4rem] p-8 md:p-12 border border-white/10">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -mr-48 -mt-48 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary-fixed/10 blur-[80px] rounded-full -ml-32 -mb-32"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <div className="flex items-center gap-4">
                <motion.div 
                  initial={{ rotate: -20, scale: 0.8 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  className="p-4 bg-primary/20 rounded-2xl border border-primary/30"
                >
                  <Target className="w-8 h-8 text-primary" />
                </motion.div>
                <div>
                  <h3 className="font-headline font-black text-3xl md:text-4xl text-white tracking-tight">
                    {isIndo ? 'Kesesuaian Pekerjaan' : 'Job Alignment'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                    <p className="text-primary font-bold text-sm uppercase tracking-widest">
                      Target: {analysis.targetJob}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-slate-300 text-xl leading-relaxed font-medium italic border-l-4 border-primary/50 pl-6 py-2">
                  "{analysis.jobAlignment.analysis}"
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Semantic Match</span>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-tertiary-fixed" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Industry Standard</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative shrink-0">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="112"
                    cy="112"
                    r="100"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <motion.circle
                    cx="112"
                    cy="112"
                    r="100"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray="628"
                    initial={{ strokeDashoffset: 628 }}
                    whileInView={{ strokeDashoffset: 628 - (628 * analysis.jobAlignment.score) / 100 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="text-6xl font-black text-white tracking-tighter"
                  >
                    {analysis.jobAlignment.score}%
                  </motion.span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Alignment</span>
                </div>
              </div>
              {/* Decorative rings */}
              <div className="absolute inset-0 border border-white/5 rounded-full scale-110"></div>
              <div className="absolute inset-0 border border-white/5 rounded-full scale-125"></div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Profile Snapshot Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-xl">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-headline font-extrabold text-xl">
            {isIndo ? 'Ringkasan Profil' : 'Profile Snapshot'}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                {isIndo ? 'Identitas' : 'Identity'}
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{analysis.extractedInfo.name || 'Not Found'}</p>
                  <p className="text-xs text-on-surface-variant">{analysis.extractedInfo.contact || 'No Contact Info'}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                {isIndo ? 'Keahlian Utama' : 'Core Skills'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.extractedInfo.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-white text-[10px] font-bold rounded-lg border border-outline-variant/10 text-on-surface-variant">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                {isIndo ? 'Pekerjaan Rekomendasi' : 'Recommended Jobs'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.recommendedJobs.map((job, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-xl shadow-sm border border-white/10">
                    <Briefcase className="w-3 h-3 text-primary" />
                    <span>{job}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <GraduationCap className="w-3 h-3" />
                {isIndo ? 'Pendidikan' : 'Education'}
              </h4>
              <ul className="space-y-4">
                {analysis.extractedInfo.education.map((edu, i) => (
                  <li key={i} className="relative pl-4 border-l-2 border-primary/20">
                    <p className="text-sm font-bold text-on-surface leading-tight">{edu}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Briefcase className="w-3 h-3" />
                {isIndo ? 'Pengalaman' : 'Experience'}
              </h4>
              <ul className="space-y-4">
                {analysis.extractedInfo.experience.map((exp, i) => (
                  <li key={i} className="relative pl-4 border-l-2 border-tertiary-fixed-dim/20">
                    <p className="text-sm font-bold text-on-surface leading-tight">{exp}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CV Preview Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-3xl p-10 shadow-2xl border border-outline-variant/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-error/40"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isIndo ? 'Identifikasi AI' : 'AI Identified Gaps'}
            </span>
          </div>
        </div>
        <h3 className="font-headline font-black text-xs uppercase tracking-[0.3em] text-slate-300 mb-10">
          {isIndo ? 'Pratinjau Dokumen' : 'Document Preview'}
        </h3>
        <div className="max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
          {renderHighlightedText()}
        </div>
      </motion.section>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-3"
        >
          <div className="flex flex-row lg:flex-col gap-2 bg-surface-container-low p-2 rounded-xl sticky top-24">
            <button 
              onClick={() => scrollToSection(insightsRef, 'insights')}
              className={cn(
                "flex-1 flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-all",
                activeTab === 'insights' ? "bg-surface-container-lowest shadow-sm text-primary font-bold" : "text-slate-500 hover:bg-white/50"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{isIndo ? 'Wawasan Utama' : 'Key Insights'}</span>
            </button>
            <button 
              onClick={() => scrollToSection(gapsRef, 'gaps')}
              className={cn(
                "flex-1 flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-all",
                activeTab === 'gaps' ? "bg-surface-container-lowest shadow-sm text-error font-bold" : "text-slate-500 hover:bg-white/50"
              )}
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{isIndo ? 'Kesenjangan Kritis' : 'Critical Gaps'}</span>
            </button>
            <button 
              onClick={() => scrollToSection(formattingRef, 'formatting')}
              className={cn(
                "flex-1 flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-all",
                activeTab === 'formatting' ? "bg-surface-container-lowest shadow-sm text-primary font-bold" : "text-slate-500 hover:bg-white/50"
              )}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">{isIndo ? 'Format' : 'Formatting'}</span>
            </button>
          </div>
        </motion.div>

        {/* Insights Section */}
        <div className="lg:col-span-9 space-y-8">
          <div ref={insightsRef} className="scroll-mt-24">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {analysis.strengths.slice(0, 2).map((strength, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => setSelectedDetail({
                    title: isIndo ? 'Kekuatan Utama' : 'Core Strength',
                    content: strength,
                    type: 'strength'
                  })}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-surface-container-lowest p-8 rounded-3xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] border border-outline-variant/15 flex flex-col cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-tertiary-container rounded-xl group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-tertiary-fixed" />
                      </div>
                      <h3 className="font-headline font-bold text-lg">{isIndo ? 'Kekuatan' : 'Strength'}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-5">{strength}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-tertiary-container/30 text-[10px] font-bold rounded-full text-tertiary-fixed uppercase tracking-wider">
                        {isIndo ? 'NADA EKSEKUTIF' : 'EXECUTIVE TONE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black uppercase tracking-tighter">{isIndo ? 'Detail' : 'Details'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Strategic Optimization Advice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 bg-gradient-to-br from-primary-container/30 to-tertiary-container/30 p-8 rounded-3xl border border-primary/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-headline font-extrabold text-2xl text-on-surface">
                    {isIndo ? 'Perspektif Manajer Perekrutan' : "Hiring Manager's Perspective"}
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    {isIndo ? 'Perubahan nyata agar dilirik perusahaan top' : 'Actionable changes to get noticed by top-tier companies'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-primary">
                    {isIndo ? 'Rekomendasi Utama' : 'Key Recommendations'}
                  </h4>
                  <ul className="space-y-3">
                    {analysis.hiringTips.slice(0, Math.ceil(analysis.hiringTips.length / 2)).map((tip, i) => (
                      <motion.li 
                        key={i} 
                        whileHover={{ x: 5 }}
                        onClick={() => setSelectedDetail({
                          title: isIndo ? 'Tips Perekrutan' : 'Hiring Tip',
                          content: tip,
                          type: 'tip'
                        })}
                        className="flex items-start gap-3 text-sm text-on-surface-variant cursor-pointer group p-2 rounded-xl hover:bg-white/50 transition-colors"
                      >
                        <div className="mt-1 p-1 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                        <span>{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-tertiary-fixed-dim">
                    {isIndo ? 'Keunggulan Strategis' : 'Strategic Edge'}
                  </h4>
                  <ul className="space-y-3">
                    {analysis.hiringTips.slice(Math.ceil(analysis.hiringTips.length / 2)).map((tip, i) => (
                      <motion.li 
                        key={i} 
                        whileHover={{ x: 5 }}
                        onClick={() => setSelectedDetail({
                          title: isIndo ? 'Keunggulan Strategis' : 'Strategic Edge',
                          content: tip,
                          type: 'tip'
                        })}
                        className="flex items-start gap-3 text-sm text-on-surface-variant cursor-pointer group p-2 rounded-xl hover:bg-white/50 transition-colors"
                      >
                        <div className="mt-1 p-1 bg-tertiary-fixed-dim/10 rounded-lg group-hover:bg-tertiary-fixed-dim group-hover:text-white transition-colors">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                        <span>{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Critical Gaps & Formatting Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.section 
              ref={gapsRef}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-error-container/20 rounded-2xl p-8 border border-error/10 shadow-inner scroll-mt-24"
            >
              <h3 className="font-headline font-extrabold text-xl mb-6 flex items-center gap-2 text-error">
                <AlertCircle className="w-5 h-5" />
                {isIndo ? 'Kesenjangan Kritis' : 'Critical Gaps'}
              </h3>
              <div className="space-y-4">
                {analysis.weaknesses.filter(w => w.category !== 'formatting').map((weakness, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 5, scale: 1.02 }}
                    onClick={() => setSelectedDetail({
                      title: weakness.title,
                      content: weakness.description,
                      type: 'weakness'
                    })}
                    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-error/10 shadow-sm cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-on-surface group-hover:text-error transition-colors">{weakness.title}</h4>
                      <div className="flex items-center gap-1 text-error opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black uppercase tracking-tighter">{isIndo ? 'Lihat' : 'View'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed line-clamp-2">{weakness.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-error/10 text-[9px] font-black uppercase text-error rounded tracking-tighter">
                        {isIndo ? 'Risiko Dampak' : 'Impact Risk'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section 
              ref={formattingRef}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10 scroll-mt-24"
            >
              <h3 className="font-headline font-extrabold text-xl mb-6 flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" />
                {isIndo ? 'Review Format' : 'Formatting Review'}
              </h3>
              <div className="space-y-4">
                {analysis.atsMatch.formattingIssues.map((issue, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-3 bg-white/60 p-4 rounded-xl border border-white"
                  >
                    <div className="mt-1 p-1 bg-primary/10 rounded-full">
                      <Target className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{issue}</p>
                  </motion.div>
                ))}
                {analysis.weaknesses.filter(w => w.category === 'formatting').map((weakness, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-3 bg-white/60 p-4 rounded-xl border border-white"
                  >
                    <div className="mt-1 p-1 bg-error/10 rounded-full">
                      <AlertCircle className="w-3 h-3 text-error" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xs text-on-surface">{weakness.title}</h4>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">{weakness.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* AI Editorial Rewrite */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-headline font-extrabold text-2xl">
                  {isIndo ? 'Revisi Editorial AI' : 'AI Editorial Rewrite'}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {isIndo ? 'Revisi berdampak tinggi fokus pada kedalaman semantik.' : 'High-impact revisions focused on semantic depth and metric density.'}
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-surface-container-high p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('diff')}
                  className={cn(
                    "px-3 py-1 rounded shadow-sm text-[10px] font-bold uppercase transition-all",
                    viewMode === 'diff' ? "bg-white text-on-surface" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Diff View
                </button>
                <button 
                  onClick={() => setViewMode('side')}
                  className={cn(
                    "px-3 py-1 rounded shadow-sm text-[10px] font-bold uppercase transition-all",
                    viewMode === 'side' ? "bg-white text-on-surface" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Side-by-Side
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {analysis.improvements.map((improvement, i) => (
                  <motion.div 
                    key={`${viewMode}-${i}`} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 overflow-hidden transition-all hover:shadow-[0_40px_80px_rgba(0,49,120,0.08)]"
                  >
                    <div className={cn(
                      "grid grid-cols-1",
                      viewMode === 'side' ? "md:grid-cols-2" : "md:grid-cols-1"
                    )}>
                      <div className={cn(
                        "p-10 border-outline-variant/10 bg-error-container/[0.02]",
                        viewMode === 'side' ? "border-b md:border-b-0 md:border-r" : "border-b"
                      )}>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-error"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-error">
                              {isIndo ? 'Draf Asli' : 'Original Draft'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Weak Impact</span>
                        </div>
                        <p className={cn(
                          "text-lg leading-relaxed font-medium",
                          viewMode === 'side' ? "text-on-surface-variant/70 italic" : "text-on-surface-variant/70 italic line-through decoration-error/30"
                        )}>
                          "{improvement.original}"
                        </p>
                      </div>

                      <div className="p-10 bg-tertiary-container/[0.02]">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary-fixed-dim">
                              {isIndo ? 'Rekomendasi AI' : 'AI Recommended'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-tertiary-fixed-dim" />
                            <span className="text-[10px] font-bold text-tertiary-fixed-dim uppercase tracking-widest">Optimized</span>
                          </div>
                        </div>
                        <p className="text-xl text-on-surface font-black leading-relaxed text-tertiary-fixed-dim">
                          "{improvement.revised}"
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 flex items-start gap-6 border-t border-outline-variant/10">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0 border border-slate-100">
                        <Lightbulb className="w-6 h-6 text-tertiary-fixed-dim" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                          {isIndo ? 'Alasan AI' : 'Architectural Reasoning'}
                        </h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                          {improvement.reason}
                        </p>
                        <div className="flex gap-4 mt-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Keyword Density</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Metric Focus</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
