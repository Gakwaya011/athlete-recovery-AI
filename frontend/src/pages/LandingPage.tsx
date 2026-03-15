import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Leaf, ShieldCheck, Sun, Moon } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

const features = [
  {
    icon: <MessageCircle size={24} className="text-amber-500" />,
    title: 'Smart AI Chat',
    desc: 'Chat directly with Nutri AI. Tell it how you trained, and it builds a recovery meal tailored to your exact sport and intensity.',
  },
  {
    icon: <ShieldCheck size={24} className="text-amber-500" />,
    title: 'Science-Backed',
    desc: 'No AI hallucinations. Every recommendation is strictly grounded in official sports science guidelines from ACSM, UEFA, and the IOC.',
  },
  {
    icon: <Leaf size={24} className="text-amber-500" />,
    title: 'Eat Local',
    desc: 'No more generic advice to eat salmon and quinoa. Get recovery plans built around Ugali, Isombe, and Sweet Potatoes.',
  },
];

const sports = ['Football', 'Basketball', 'Running', 'Rugby', 'Cycling', 'Gym', 'Swimming'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 selection:bg-amber-500/30">
      
      {/* 🧭 Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-6 py-2.5 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-sm active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* 🚀 Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-full px-4 py-1.5 text-xs text-amber-700 dark:text-amber-400 font-bold mb-6 uppercase tracking-wider">
              Made for East African Athletes
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-gray-900 dark:text-white">
              You trained hard.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">
                Now recover right.
              </span>
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl max-w-lg mx-auto md:mx-0 mb-10 leading-relaxed">
              Tell Nutri AI about your workout, and get a personalized recovery meal plan built entirely around the foods in your local market.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 text-white font-bold px-8 py-4 rounded-full hover:bg-amber-400 transition-all shadow-lg"
              >
                Start for free <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-3"
              >
                Already have an account?
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 w-full max-w-md md:max-w-none relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-orange-400 rounded-[2.5rem] blur-3xl opacity-20 dark:opacity-10 animate-pulse"></div>
            
            {/* 👇 PUT YOUR DOWNLOADED IMAGE HERE 👇 */}
            <img 
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" 
              alt="Athlete training" 
              className="relative z-10 rounded-[2.5rem] shadow-2xl border-4 border-white dark:border-gray-800 object-cover aspect-[4/5] md:aspect-square w-full"
            />
            {/* 👆 PUT YOUR DOWNLOADED IMAGE HERE 👆 */}
            
            {/* NOTE: I completely removed the floating calorie badge! */}
          </div>
        </div>
      </section>

      {/* 🎯 Features Section */}
      <section className="bg-white dark:bg-[#1a1a1a] py-24 border-y border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
              Everything you need to bounce back.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Powered by advanced RAG technology and local Rwandan agriculture data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-gray-50 dark:bg-[#222222] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="mb-6 w-14 h-14 bg-white dark:bg-gray-800 shadow-sm rounded-2xl flex items-center justify-center">
                  {f.icon}
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-xl mb-3 tracking-tight">{f.title}</h4>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏁 Bottom CTA Section */}
      <section className="bg-[#f8f9fa] dark:bg-[#121212] py-24 text-center px-6 transition-colors">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6 text-gray-900 dark:text-white">
            Ready to meet Nutri AI?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg">
            Join other athletes taking control of their recovery. Free to use.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-4 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all text-lg shadow-xl"
          >
            Create your account <ArrowRight size={20} />
          </button>
          
          {/* Sport tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-12">
            {sports.map((s, i) => (
              <span key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-colors">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 py-8 text-center text-gray-400 dark:text-gray-500 text-sm transition-colors">
        <p>© 2026 Nutri AI. Built for athletes.</p>
      </footer>
    </div>
  );
}