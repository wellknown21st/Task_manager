import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Home() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 selection:bg-accent/30 flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-lg shadow-accent/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TeamFlow</span>
        </div>
        <div className="flex items-center gap-4">
          {auth.status === "authed" ? (
            <Link
              to="/projects"
              className="px-5 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-md border border-white/5"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 text-sm font-semibold text-white bg-accent hover:bg-blue-500 rounded-full shadow-lg shadow-accent/25 transition-all hover:scale-105 active:scale-95"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto mt-12 mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium text-slate-300">v2.0 is now live — experience the future of task management</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Manage your team's work <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">at the speed of thought</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          TeamFlow unites your entire organization under one powerful, incredibly fast project management platform. Say goodbye to scattered tools and hello to true productivity.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {auth.status === "authed" ? (
            <Link
              to="/projects"
              className="px-8 py-4 text-base font-bold text-white bg-accent hover:bg-blue-500 rounded-full shadow-xl shadow-accent/20 transition-all hover:-translate-y-1"
            >
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-4 text-base font-bold text-white bg-accent hover:bg-blue-500 rounded-full shadow-xl shadow-accent/20 transition-all hover:-translate-y-1"
              >
                Start for free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 text-base font-bold text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all backdrop-blur-md"
              >
                Login to account
              </Link>
            </>
          )}
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-20 w-full max-w-5xl relative animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent z-10 bottom-[-2px]" />
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-surface/50 backdrop-blur-sm shadow-2xl shadow-black/50 ring-1 ring-white/5">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-black/40">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <img src="/dashboard_mockup.png" alt="Dashboard Mockup" className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-black/20 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-accent/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span>© 2026 TeamFlow Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
