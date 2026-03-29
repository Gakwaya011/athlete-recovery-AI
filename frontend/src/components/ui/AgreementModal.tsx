import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

interface AgreementModalProps {
  onAgree: () => void;
}

export const AgreementModal: React.FC<AgreementModalProps> = ({ onAgree }) => {
  const [checked, setChecked] = useState(false);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl max-w-xl w-full p-8 border border-gray-100 dark:border-white/10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">
              Terms of Use & Privacy
            </h2>
            <p className="text-xs text-gray-400">Please read and agree before continuing</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-50 dark:bg-[#161616] rounded-2xl p-5 max-h-64 overflow-y-auto mb-6 border border-gray-100 dark:border-white/5">
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">

            <div>
              <p className="font-bold text-gray-900 dark:text-white mb-1">1. Purpose & Limitations</p>
              <p>The nutri_athlete AI system provides sports nutrition guidance based on user-provided inputs. All recommendations are for informational purposes only and do not constitute medical or professional advice. This system does not replace consultation with qualified nutritionists, coaches, or healthcare professionals.</p>
            </div>

            <div>
              <p className="font-bold text-gray-900 dark:text-white mb-1">2. Data Collection</p>
              <p>The system collects limited user input including training-related information and general physical characteristics solely to generate personalized recommendations. No unnecessary personally identifiable information is collected, and the system minimizes data storage wherever possible.</p>
            </div>

            <div>
              <p className="font-bold text-gray-900 dark:text-white mb-1">3. Privacy & Security</p>
              <p>User data is handled with a focus on security and confidentiality. Secure authentication mechanisms are implemented to prevent unauthorized access. Your data is not shared with third parties and all processing is limited to generating recommendations within this platform.</p>
            </div>

            <div>
              <p className="font-bold text-gray-900 dark:text-white mb-1">4. User Responsibility</p>
              <p>You are responsible for ensuring that the information you provide is accurate, as incorrect inputs may result in inaccurate recommendations. The system does not guarantee the accuracy or completeness of outputs and should be used with an understanding of its limitations.</p>
            </div>

            <div>
              <p className="font-bold text-gray-900 dark:text-white mb-1">5. Agreement</p>
              <p>By continuing to use nutri_athlete AI, you agree to these terms and acknowledge the system's intended scope, limitations, and responsibilities.</p>
            </div>

          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
          <div
            onClick={() => setChecked(!checked)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              checked
                ? 'bg-amber-500 border-amber-500'
                : 'border-gray-300 dark:border-gray-600 group-hover:border-amber-400'
            }`}
          >
            {checked && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            I have read and agree to the <span className="font-semibold text-gray-900 dark:text-white">Terms of Use</span> and <span className="font-semibold text-gray-900 dark:text-white">Privacy Policy</span> of nutri_athlete AI.
          </span>
        </label>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = 'https://www.google.com'}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            I Disagree
          </button>
          <button
            onClick={() => {
              if (checked) {
                localStorage.setItem('nutri_agreed', 'true');
                onAgree();
              }
            }}
            disabled={!checked}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              checked
                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/25'
                : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            I Agree & Continue
          </button>
        </div>

      </div>
    </div>
  );
};