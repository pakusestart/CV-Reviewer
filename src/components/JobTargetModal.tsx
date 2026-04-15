import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Target, ArrowRight, Briefcase } from 'lucide-react';

interface JobTargetModalProps {
  onSubmit: (jobTitle: string) => void;
  onCancel: () => void;
}

export default function JobTargetModal({ onSubmit, onCancel }: JobTargetModalProps) {
  const [jobTitle, setJobTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobTitle.trim()) {
      onSubmit(jobTitle.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-headline font-black text-slate-900">Target Your Career</h2>
              <p className="text-slate-500 font-medium">What role are you aiming for today?</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                Target Job Title
              </label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  autoFocus
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-medium text-lg"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2 ml-1">
                AI will tailor the analysis specifically for this role
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
              >
                Analyze CV <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
