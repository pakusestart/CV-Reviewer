export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center px-12 space-y-4 md:space-y-0">
      <div className="font-body text-xs font-light text-slate-500">
        © 2024 The Precision Architect. All rights reserved.
      </div>
      <div className="flex space-x-8">
        <a className="text-slate-500 hover:text-primary font-body text-xs font-light transition-opacity duration-200" href="#">Terms of Service</a>
        <a className="text-slate-500 hover:text-primary font-body text-xs font-light transition-opacity duration-200" href="#">Privacy Policy</a>
        <a className="text-slate-500 hover:text-primary font-body text-xs font-light transition-opacity duration-200" href="#">Contact Support</a>
        <a className="text-slate-500 hover:text-primary font-body text-xs font-light transition-opacity duration-200" href="#">API Documentation</a>
      </div>
    </footer>
  );
}
