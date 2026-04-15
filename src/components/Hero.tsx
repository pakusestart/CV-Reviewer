import { useDropzone } from 'react-dropzone';
import { CloudUpload, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onFileSelect: (file: File) => void;
}

export default function Hero({ onFileSelect }: HeroProps) {
  const dropzoneOptions: any = {
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-32">
      <div className="lg:col-span-7">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline font-extrabold text-5xl md:text-7xl text-primary leading-[1.1] mb-6 tracking-tighter"
        >
          Editorial Intelligence <br/><span className="text-on-surface-variant font-light">for your Career.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-secondary max-w-xl mb-10 leading-relaxed"
        >
          More than a parser. We use deep architectural analysis to curate your professional narrative into a compelling masterpiece.
        </motion.p>

        {/* Upload Zone */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative group mb-12"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-tertiary-fixed opacity-10 blur-xl group-hover:opacity-20 transition duration-1000"></div>
          <div 
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
              ${isDragActive ? 'border-primary bg-surface-container-lowest' : 'border-outline-variant bg-surface-container-low hover:bg-surface-container-lowest hover:border-primary/30'}`}
          >
            <input {...getInputProps()} />
            <CloudUpload className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-headline text-2xl font-bold mb-2">Drop your CV here</h3>
            <p className="text-secondary mb-8 font-label tracking-wide uppercase text-[10px]">PDF, DOCX up to 10MB</p>
            <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-extrabold text-lg shadow-xl hover:shadow-primary/20 transition-all flex items-center mx-auto space-x-3">
              <span>Upload CV</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Hotlinked Images Showcase */}
        <div className="grid grid-cols-3 gap-4">
          <img 
            src="https://picsum.photos/seed/office1/400/300" 
            alt="Professional Workspace" 
            referrerPolicy="no-referrer"
            className="rounded-lg grayscale hover:grayscale-0 transition-all duration-500 shadow-lg"
          />
          <img 
            src="https://picsum.photos/seed/office2/400/300" 
            alt="Collaborative Environment" 
            referrerPolicy="no-referrer"
            className="rounded-lg grayscale hover:grayscale-0 transition-all duration-500 shadow-lg"
          />
          <img 
            src="https://picsum.photos/seed/office3/400/300" 
            alt="Modern Architecture" 
            referrerPolicy="no-referrer"
            className="rounded-lg grayscale hover:grayscale-0 transition-all duration-500 shadow-lg"
          />
        </div>
      </div>

      <div className="lg:col-span-5 hidden lg:block">
        <motion.div 
          initial={{ opacity: 0, x: 20, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 2 }}
          className="bg-surface-container-high rounded-xl p-8 shadow-2xl relative"
        >
          <div className="absolute -top-6 -right-6 bg-tertiary-fixed text-on-tertiary-fixed px-4 py-2 rounded-lg font-headline font-black text-sm shadow-lg z-10">
            AI SCORE: 88
          </div>
          <div className="space-y-4 opacity-40">
            <div className="h-4 bg-primary/20 rounded-full w-3/4"></div>
            <div className="h-4 bg-primary/10 rounded-full w-full"></div>
            <div className="h-32 bg-primary/5 rounded-xl w-full"></div>
            <div className="h-4 bg-primary/10 rounded-full w-5/6"></div>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-tertiary-fixed-dim" />
              <div className="h-3 bg-tertiary-fixed/30 rounded-full w-1/2"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-error" />
              <div className="h-3 bg-error-container rounded-full w-2/3"></div>
            </div>
          </div>
          
          <div className="absolute -bottom-10 -left-10 glass-panel p-6 rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] w-64 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-headline font-bold text-sm">Editorial Insight</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              "Strengthen action verbs in the Experience section to emphasize leadership impact."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Brain(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.105 4 4 0 0 0 7.327 1.245 4 4 0 0 0 7.327-1.245 4 4 0 0 0 .52-8.105 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5Z" />
      <path d="M9 13a4.5 4.5 0 0 0 3-4" />
      <path d="M12 13a4.5 4.5 0 0 1 3-4" />
      <path d="M12 13v4" />
      <path d="M12 13a4.5 4.5 0 0 1-3 4" />
      <path d="M12 13a4.5 4.5 0 0 0 3 4" />
    </svg>
  );
}
