import { Bell, Settings, User } from 'lucide-react';

export default function Header({ onUploadClick }: { onUploadClick?: () => void }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] flex justify-between items-center px-8 h-20">
      <div className="text-2xl font-black tracking-tighter text-primary font-headline">The Precision Architect</div>
      
      <div className="hidden md:flex items-center space-x-8">
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <button 
          onClick={onUploadClick}
          className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-full font-headline font-bold transition-transform active:scale-95"
        >
          Upload CV
        </button>
        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center">
          <User className="w-6 h-6 text-slate-400" />
        </div>
      </div>
    </nav>
  );
}
