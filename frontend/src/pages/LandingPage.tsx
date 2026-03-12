import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Dumbbell, Apple, Zap } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

const features = [
  {
    icon: <Dumbbell size={20} className="text-amber-500" />,
    title: 'Made for your sport',
    desc: 'Football, basketball, running, gym — every plan is built around what you actually did, not a generic template.',
  },
  {
    icon: <Apple size={20} className="text-amber-500" />,
    title: 'Food you recognize',
    desc: 'Ugali, Isambaza, Matoke, Ikivuguto — real food from your region, not foreign supplements you can\'t find.',
  },
  {
    icon: <Zap size={20} className="text-amber-500" />,
    title: 'Your body, your plan',
    desc: 'Your weight, your intensity, your goal. No two athletes are the same — your plan shouldn\'t be either.',
  },
];

const sports = ['Football', 'Basketball', 'Running', 'Rugby', 'Cycling', 'Gym', 'Swimming'];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 font-sans">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-4 py-2"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="text-sm bg-gray-900 text-white font-semibold px-5 py-2.5
                       rounded-full hover:bg-gray-700 transition-colors"
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200
                          rounded-full px-4 py-1.5 text-xs text-amber-700 font-medium mb-7">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            AI nutrition coach for African athletes
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
            You trained hard.<br />
            Now eat <span className="text-amber-500">right.</span>
          </h1>
          <p className="text-gray-500 text-xl max-w-xl mb-10 leading-relaxed">
            Tell nutri_athlete what you just trained. Get a personal recovery meal built around local foods — in seconds.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-gray-900 text-white font-bold
                         px-6 py-3.5 rounded-full hover:bg-gray-700 transition-colors text-sm"
            >
              Start for free <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-4 py-3.5"
            >
              Already have an account →
            </button>
          </div>
        </div>

        {/* Sport tags */}
        <div className="flex flex-wrap gap-2 mt-12">
          {sports.map((s, i) => (
            <span key={i} className="bg-white border border-gray-200 text-gray-600
                                     text-xs font-medium px-3 py-1.5 rounded-full">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black tracking-tight mb-3">
            Your coach. Your food. Your body.
          </h2>
          <p className="text-gray-500 mb-12 text-lg">
            Everything personalised. Nothing generic.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-[#f5f5f5] rounded-2xl p-6 border border-gray-100">
                <div className="mb-4 w-10 h-10 bg-amber-50 rounded-xl
                                flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-black tracking-tight mb-4">
          Ready to recover smarter?
        </h2>
        <p className="text-gray-500 mb-8 text-lg">Free to use. No credit card needed.</p>
        <button
          onClick={() => navigate('/register')}
          className="inline-flex items-center gap-2 bg-amber-500 text-white font-bold
                     px-8 py-4 rounded-full hover:bg-amber-400 transition-colors text-base"
        >
          Create your free account <ArrowRight size={18} />
        </button>
      </section>

      <footer className="border-t border-gray-200 py-6 text-center text-gray-400 text-xs">
        © 2026 nutri_athlete AI
      </footer>
    </div>
  );
}