/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import LoadingScreen from './components/LoadingScreen';
import ResultsView from './components/ResultsView';
import JobTargetModal from './components/JobTargetModal';
import Footer from './components/Footer';
import { extractTextFromFile } from './lib/CVParser';
import { analyzeCV } from './services/geminiService';
import { CVAnalysis } from './types';
import { motion, AnimatePresence } from 'motion/react';

type AppView = 'hero' | 'loading' | 'results' | 'job-target';

export default function App() {
  const [view, setView] = useState<AppView>('hero');
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [originalText, setOriginalText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setView('loading');
    setError(null);
    
    try {
      const text = await extractTextFromFile(file);
      setOriginalText(text);
      setView('job-target');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setView('hero');
    }
  };

  const handleJobTargetSubmit = async (targetJob: string) => {
    setView('loading');
    
    try {
      const result = await analyzeCV(originalText, targetJob);
      setAnalysis(result);
      setView('results');
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Analysis failed. Please try again.');
      setView('hero');
    }
  };

  const handleReset = () => {
    setView('hero');
    setAnalysis(null);
    setOriginalText('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onUploadClick={handleReset} />
      
      <main className="flex-1 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {view === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Hero onFileSelect={handleFileSelect} />
              
              {error && (
                <div className="mt-8 p-4 bg-error-container text-error rounded-xl border border-error/20 text-center font-bold">
                  {error}
                </div>
              )}

              {/* Process Section */}
              <section className="mb-32">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                  <div>
                    <span className="font-label text-primary font-bold tracking-widest uppercase text-xs mb-2 block">Process</span>
                    <h2 className="font-headline font-extrabold text-4xl">The Path to Precision</h2>
                  </div>
                  <div className="h-[2px] bg-surface-container-highest flex-grow mx-8 mb-4 hidden md:block"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-surface-container-low p-10 rounded-xl hover:translate-y-[-8px] transition-all duration-300">
                    <div className="text-primary font-headline font-black text-6xl mb-6 opacity-10">01</div>
                    <h3 className="font-headline text-2xl font-extrabold mb-4">Upload</h3>
                    <p className="text-on-surface-variant leading-relaxed">Upload your existing CV in PDF or DOCX format for a deep architectural analysis.</p>
                  </div>
                  <div className="bg-primary text-on-primary p-10 rounded-xl shadow-xl hover:translate-y-[-8px] transition-all duration-300">
                    <div className="text-on-primary-container font-headline font-black text-6xl mb-6 opacity-20">02</div>
                    <h3 className="font-headline text-2xl font-extrabold mb-4">Analyze</h3>
                    <p className="text-on-primary-container/80 leading-relaxed">Our AI engine structures your data into a high-performance, machine-readable professional narrative.</p>
                  </div>
                  <div className="bg-surface-container-low p-10 rounded-xl hover:translate-y-[-8px] transition-all duration-300">
                    <div className="text-primary font-headline font-black text-6xl mb-6 opacity-10">03</div>
                    <h3 className="font-headline text-2xl font-extrabold mb-4">Review</h3>
                    <p className="text-on-surface-variant leading-relaxed">Receive a polished, ready-to-deploy version of your CV with strategic insights.</p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {view === 'job-target' && (
            <JobTargetModal 
              onSubmit={handleJobTargetSubmit}
              onCancel={() => setView('hero')}
            />
          )}

          {view === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingScreen />
            </motion.div>
          )}

          {view === 'results' && analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ResultsView analysis={analysis} originalText={originalText} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
