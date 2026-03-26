import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Moon, ChevronDown } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { useDarkMode } from '../hooks/useDarkMode';

const faqs = [
  {
    q: 'Do I need to know anything about nutrition?',
    a: 'Not at all. Just tell nutri_athlete what sport you played and for how long. The AI handles everything else.',
  },
  {
    q: 'What foods will it recommend?',
    a: 'Only foods you can actually find locally — Ugali, Matoke, Sweet Potato, Isambaza, Beans, and more. No imported superfoods.',
  },
  {
    q: 'Does it work for my sport?',
    a: 'Yes. Football, basketball, running, gym, rugby, cycling, volleyball, swimming, boxing, tennis and more.',
  },
  {
    q: 'Is it free?',
    a: 'Yes — completely free. Create an account and get your first recovery plan in under 2 minutes.',
  },
];

const testimonials = [
  {
    name: 'Brian K.',
    role: 'Football player, Kigali',
    text: 'I used to just eat whatever after training. Now I actually know what my body needs and I recover so much faster.',
    initials: 'BK',
  },
  {
    name: 'Amina N.',
    role: 'Runner, Nairobi',
    text: "Finally an app that tells me to eat Ugali instead of some protein shake I can't afford. This is built for us.",
    initials: 'AN',
  },
  {
    name: 'Joel M.',
    role: 'Gym athlete, Kampala',
    text: "The meal plans are simple, affordable, and actually work. I've recommended it to my whole training group.",
    initials: 'JM',
  },
];

const marqueeItems = [
  'Football', 'Basketball', 'Running', 'Rugby', 'Cycling',
  'Gym', 'Swimming', 'Tennis', 'Boxing', 'Volleyball',
  'Yoga', 'HIIT', 'CrossFit', 'Hiking', 'Athletics',
];

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Reveal({ children, className, delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDark } = useDarkMode();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f4f0] dark:bg-[#161616] text-gray-900 dark:text-white overflow-x-hidden transition-colors">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-[#f5f4f0]/95 dark:bg-[#161616]/95 backdrop-blur-sm border-b border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-5">
            <button onClick={toggleDark}
              className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block">
              Sign in
            </button>
            <button onClick={() => navigate('/register')}
              className="text-sm bg-gray-900 dark:bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-6xl sm:text-7xl font-black leading-[1.0] tracking-tight mb-6">
              Eat right.<br />
              Recover<br />
              <span className="text-amber-500">faster.</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
              Tell nutri_athlete what you played today — and get a personalized recovery meal made from foods you can actually buy at your local market.
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/register')}
                className="flex items-center gap-2 bg-gray-900 dark:bg-amber-500 text-white font-bold px-7 py-4 rounded-full hover:opacity-90 transition-all shadow-lg">
                Start for free <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate('/login')}
                className="text-sm font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Sign in →
              </button>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=700"
              alt="East African food"
              className="rounded-3xl w-full h-[420px] object-cover shadow-2xl"
            />
            {/* Floating chat card */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl p-4 max-w-[240px] border border-gray-100 dark:border-white/10">
              <p className="text-xs text-gray-400 mb-2 font-medium">nutri_athlete says</p>
              <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                "After 90 min of football you need <span className="font-bold text-amber-500">94g carbs</span> and <span className="font-bold text-green-500">84g protein</span>."
              </p>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <p className="text-xs font-bold text-gray-900 dark:text-white">🍚 Ugali + Isambaza</p>
                <p className="text-xs text-gray-400">Your recovery plate</p>
              </div>
            </div>
            {/* Badge */}
            <div className="absolute -top-4 -right-4 bg-gray-900 dark:bg-amber-500 text-white rounded-2xl px-4 py-2 shadow-lg">
              <p className="text-xs font-black">Ready in 2 min</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="border-y border-black/5 dark:border-white/5 py-4 overflow-hidden bg-white dark:bg-[#1e1e1e] my-12">
        <div className="flex whitespace-nowrap">
          <div className="flex items-center gap-12 shrink-0"
            style={{ animation: 'marquee 30s linear infinite' }}>
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest flex items-center gap-6">
                <span className="text-gray-300 dark:text-gray-700 font-light text-lg leading-none">/</span>
                {item}
              </span>
            ))}
          </div>
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }`}</style>
      </div>

      {/* ── How it works ── */}
      <section className="py-24 bg-[#f5f4f0] dark:bg-[#161616]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3">How it works</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Three steps. That's it.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-16 max-w-lg">
              No forms. No calorie counting. Just describe your workout and we handle the rest.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Describe your workout',
                desc: "Type \"I played football for 90 minutes\" — that's enough. No complicated forms.",
                img: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&q=80&w=500',
              },
              {
                n: '02',
                title: 'We do the math',
                desc: 'nutri_athlete figures out exactly what your body needs — carbs, protein, hydration.',
                img: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=500',
              },
              {
                n: '03',
                title: 'Eat and recover',
                desc: 'Your meal plan uses real local foods you can buy today. No excuses, no imports.',
                img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=500',
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 hover:shadow-xl transition-all group">
                  <div className="relative h-44 overflow-hidden">
                    <img src={step.img} alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-gray-900 dark:bg-amber-500 text-white text-xs font-black px-3 py-1.5 rounded-full">
                      {step.n}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chat preview ── */}
      <section className="py-24 bg-gray-900 dark:bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-4">See it in action</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
              Just chat.<br />Get your plan.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              No menus to navigate. No calories to count. Just have a conversation and walk away with a meal plan that works for your body.
            </p>
            <button onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-7 py-4 rounded-full transition-all w-fit shadow-lg shadow-amber-500/25">
              Try it now <ArrowRight size={16} />
            </button>
          </Reveal>

          <Reveal delay={100}>
            <div className="bg-[#1e1e1e] dark:bg-[#161616] rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-black">N</div>
                <div>
                  <p className="text-white text-sm font-bold">nutri_athlete</p>
                  <p className="text-green-400 text-xs">● Online</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-amber-500 text-white text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[220px]">
                    I just finished 90 min of football
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/10 text-gray-200 text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-[280px]">
                    Great! What's your body weight?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-amber-500 text-white text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[220px]">
                    72kg, male, 23 years old
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/10 text-gray-200 text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-[300px] leading-relaxed">
                    ✅ <span className="font-bold text-white">Your Recovery Plate</span><br />
                    🍚 <span className="text-amber-400 font-semibold">Ugali 320g</span><br />
                    🐟 <span className="text-green-400 font-semibold">Isambaza 150g</span><br />
                    💧 Water + electrolytes 500ml
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 flex gap-2">
                <div className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-gray-500 text-sm">
                  Ask a follow-up...
                </div>
                <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center">
                  <ArrowRight size={14} className="text-white" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Local food split ── */}
      <section className="py-24 bg-[#f5f4f0] dark:bg-[#161616]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=700"
              alt="Local food"
              className="rounded-3xl w-full h-96 object-cover shadow-2xl" />
          </Reveal>
          <Reveal delay={100}>
            <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-4">Local First</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              No quinoa.<br />No salmon.<br />
              <span className="text-amber-500">Just real food.</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8">
              Every meal plan is built around foods you can find and afford right now. Ugali. Matoke. Isambaza. Sweet Potato. Beans. That's what recovery looks like here.
            </p>
            <button onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-gray-900 dark:bg-amber-500 text-white font-bold px-7 py-4 rounded-full hover:opacity-90 transition-all w-fit">
              Get your plan <ArrowRight size={16} />
            </button>
          </Reveal>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-white dark:bg-[#1e1e1e]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3">Athletes love it</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-12">
              Don't take our word for it.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="bg-[#f5f4f0] dark:bg-[#161616] rounded-3xl p-7 border border-black/5 dark:border-white/5 h-full flex flex-col justify-between">
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                      <p className="text-gray-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats — dark, not amber ── */}
      <section className="py-16 bg-gray-900 dark:bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: '185+', l: 'Local foods in database' },
            { v: '10+',  l: 'Sports supported' },
            { v: '2min', l: 'To get your plan' },
            { v: '100%', l: 'Local ingredients' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <p className="text-4xl font-black text-white mb-1">{s.v}</p>
              <p className="text-gray-400 text-sm font-medium">{s.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Any sport split ── */}
      <section className="py-24 bg-[#f5f4f0] dark:bg-[#161616]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <Reveal delay={100} className="order-2 md:order-1">
            <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-4">Any Sport</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Your sport.<br />Your body.<br />
              <span className="text-amber-500">Your plan.</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8">
              A footballer and a swimmer need completely different meals after training. nutri_athlete knows the difference.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {['Football', 'Basketball', 'Running', 'Gym', 'Rugby', 'Cycling', 'Swimming', 'Boxing', 'Tennis', 'Volleyball'].map((s, i) => (
                <span key={i} className="text-xs font-bold bg-white dark:bg-[#1e1e1e] border border-black/5 dark:border-white/10 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
            <button onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-7 py-4 rounded-full transition-all w-fit shadow-lg shadow-amber-500/25">
              Get started free <ArrowRight size={16} />
            </button>
          </Reveal>
          <Reveal className="order-1 md:order-2">
            <img src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=700"
              alt="Athletes"
              className="rounded-3xl w-full h-96 object-cover shadow-2xl" />
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white dark:bg-[#1e1e1e]">
        <div className="max-w-2xl mx-auto px-6">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3">FAQ</p>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-12">
              Got questions?
            </h2>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className={`rounded-2xl border overflow-hidden transition-all ${
                  openFaq === i
                    ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-900/10'
                    : 'border-gray-100 dark:border-white/5 bg-[#f5f4f0] dark:bg-[#161616]'
                }`}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{faq.q}</span>
                    <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      openFaq === i ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  <div style={{ maxHeight: openFaq === i ? '200px' : '0', transition: 'max-height 0.35s ease' }}
                    className="overflow-hidden">
                    <p className="px-6 pb-5 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-[#f5f4f0] dark:bg-[#161616] px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="bg-gray-900 rounded-3xl px-10 py-16 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                  Your body worked hard.<br />Now feed it right.
                </h2>
                <p className="text-gray-400 mb-10 text-lg">
                  Free. Fast. Built for you.
                </p>
                <button onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black px-8 py-4 rounded-full transition-all text-base shadow-xl shadow-amber-500/25">
                  Create your free account <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-white dark:bg-[#0f0f0f] border-t border-gray-100 dark:border-white/5 py-8 text-center text-gray-400 dark:text-gray-600 text-sm">
        <p>© 2026 nutri_athlete · Built for athletes in East Africa</p>
      </footer>
    </div>
  );
}