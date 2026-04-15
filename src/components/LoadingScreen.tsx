import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, CheckCircle2, Database, Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 8000; // Expected average time for AI analysis
    const interval = 50;
    const totalSteps = duration / interval;
    const increment = 100 / totalSteps;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return prev; // Stay at 99 until finished
        return Math.min(99, prev + increment);
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-2xl w-full text-center space-y-12">
        {/* Analysis Core Visual */}
        <div className="relative flex justify-center items-center h-80">
          {/* Glassmorphism Ring */}
          <div className="absolute w-72 h-72 rounded-full border border-outline-variant/20 bg-surface-container-low/30 backdrop-blur-md" />
          
          {/* DNA Style Animation Representation */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-dashed border-tertiary-fixed/30 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 border-2 border-primary/10 rounded-full"
            />
            
            {/* Central Intelligence Pulse */}
            <div className="relative z-10 w-48 h-48 bg-surface-container-lowest rounded-full shadow-[0_30px_60px_rgba(0,49,120,0.12)] flex flex-col items-center justify-center border border-surface-container">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-12 h-12 text-tertiary-fixed-dim fill-tertiary-fixed-dim" />
              </motion.div>
              <div className="mt-4 flex flex-col items-center">
                <span className="text-4xl font-headline font-black text-primary tracking-tighter">
                  {Math.floor(progress)}%
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Semantic Pulse</span>
              </div>
            </div>

            {/* Scanning Radial Beam */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-t from-tertiary-fixed/40 to-transparent w-1 h-32 left-1/2 -ml-0.5 origin-bottom"
            />
          </div>
        </div>

        {/* Status Messages Area */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight">Editorial Engine Active</h1>
            <p className="text-slate-500 font-medium">Refining your professional narrative with precision AI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-container-lowest p-5 rounded-xl border-l-4 border-tertiary-fixed shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-tertiary-fixed-dim" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 1</span>
              </div>
              <p className="font-headline font-bold text-primary">Parsing resume structure...</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-5 rounded-xl border-l-4 border-tertiary-fixed shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-tertiary-fixed-dim" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 2</span>
              </div>
              <p className="font-headline font-bold text-primary">Identifying key skills...</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="bg-surface-container-low p-5 rounded-xl border-l-4 border-primary/20 col-span-1 md:col-span-2 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">In Progress</span>
                </div>
                <p className="font-headline font-bold text-primary text-lg">Analyzing industry fit & vocabulary...</p>
              </div>
              <Database className="w-10 h-10 text-primary/10 hidden sm:block" />
            </motion.div>
          </div>
        </div>

        {/* Sleek Blade Loader */}
        <div className="w-full max-w-md mx-auto h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary to-tertiary-fixed"
          />
        </div>
      </div>
    </div>
  );
}
