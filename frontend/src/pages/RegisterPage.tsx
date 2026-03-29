import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { registerUser, loginUser } from '../api/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep]         = useState<'agreement' | 'form'>('agreement');
  const [checked, setChecked]   = useState(false);
  const [form, setForm]         = useState({ full_name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(form);
      const data = await loginUser({ email: form.email, password: form.password });
      login(data.access_token, data.user);
      navigate('/chat');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1: Agreement ──
  if (step === 'agreement') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Logo size="lg" />
            <p className="text-gray-500 text-sm mt-2">Before you get started</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

            {/* Icon + title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={18} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">Terms of Use & Privacy Policy</h2>
                <p className="text-gray-500 text-xs">Please read carefully before creating an account</p>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="bg-[#111111] rounded-xl p-4 max-h-64 overflow-y-auto mb-5 border border-gray-800 space-y-4 text-sm text-gray-400 leading-relaxed">

              <div>
                <p className="font-semibold text-white mb-1">1. Purpose & Limitations</p>
                <p>The nutri_athlete AI system provides sports nutrition guidance based on user-provided inputs. All recommendations are for informational purposes only and do not constitute medical or professional advice. This system does not replace consultation with qualified nutritionists, coaches, or healthcare professionals.</p>
              </div>

              <div>
                <p className="font-semibold text-white mb-1">2. Data Collection</p>
                <p>The system collects limited user input including training-related information and general physical characteristics solely to generate personalized recommendations. No unnecessary personally identifiable information is collected, and the system minimizes data storage wherever possible.</p>
              </div>

              <div>
                <p className="font-semibold text-white mb-1">3. Privacy & Security</p>
                <p>User data is handled with a focus on security and confidentiality. Secure authentication mechanisms are implemented to prevent unauthorized access. Your data is not shared with third parties and all processing is limited to generating recommendations within this platform.</p>
              </div>

              <div>
                <p className="font-semibold text-white mb-1">4. User Responsibility</p>
                <p>You are responsible for ensuring that the information you provide is accurate, as incorrect inputs may result in inaccurate recommendations. The system does not guarantee the accuracy or completeness of outputs and should be used with an understanding of its limitations.</p>
              </div>

              <div>
                <p className="font-semibold text-white mb-1">5. Agreement</p>
                <p>By continuing to use nutri_athlete AI, you agree to these terms and acknowledge the system's intended scope, limitations, and responsibilities.</p>
              </div>

            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 mb-5 cursor-pointer group">
              <div
                onClick={() => setChecked(!checked)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  checked
                    ? 'bg-amber-500 border-amber-500'
                    : 'border-gray-600 group-hover:border-amber-400'
                }`}
              >
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-400 leading-relaxed">
                I have read and agree to the{' '}
                <span className="text-white font-semibold">Terms of Use</span> and{' '}
                <span className="text-white font-semibold">Privacy Policy</span> of nutri_athlete AI.
              </span>
            </label>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-500 text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { if (checked) setStep('form'); }}
                disabled={!checked}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  checked
                    ? 'bg-amber-500 hover:bg-amber-400 text-white'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                I Agree & Continue
              </button>
            </div>
          </div>

          <p className="text-center text-gray-600 text-xs mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Step 2: Registration Form ──
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-gray-500 text-sm mt-2">Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Full name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              required
              placeholder="Eric Keza"
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3
                         text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@example.com"
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3
                         text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Min. 8 characters"
                className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3
                           pr-11 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl text-sm
                       hover:bg-amber-400 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}