import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, Flame, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';
import { Sidebar } from '../components/layout/Sidebar';
import { Logo } from '../components/ui/Logo';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface FormData {
  gender:     string;
  age:        string;
  height:     string;
  weight:     string;
  duration:   string;
  heart_rate: string;
  body_temp:  string;
}

interface PredictionResult {
  calories_burned: number;
  energy_needed:   number;
}

export default function CaloriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode]   = useState(true);
  const [form, setForm]               = useState<FormData>({
    gender: 'male', age: '', height: '', weight: '',
    duration: '', heart_rate: '', body_temp: '',
  });
  const [result, setResult] = useState<PredictionResult | null>(() => {
    try {
      const saved = localStorage.getItem('nutri_calories_result');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [chartData, setChartData]       = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const fetchHistory = () => {
    const token = localStorage.getItem('mwili_token');
    fetch(`${API_URL}/api/v1/calorie-history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const chart = (data.predictions || []).map((p: any) => ({
          date:              p.date,
          'Calories Burned': p.calories_burned,
          'Energy Needed':   p.energy_needed,
        }));
        setChartData(chart);
      })
      .catch(console.error)
      .finally(() => setChartLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePredict = async () => {
    const { gender, age, height, weight, duration, heart_rate, body_temp } = form;
    if (!age || !height || !weight || !duration || !heart_rate || !body_temp) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('mwili_token');
      const response = await fetch(`${API_URL}/api/v1/predict-calories`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          gender,
          age:        parseInt(age),
          height:     parseFloat(height),
          weight:     parseFloat(weight),
          duration:   parseFloat(duration),
          heart_rate: parseFloat(heart_rate),
          body_temp:  parseFloat(body_temp),
        }),
      });
      if (!response.ok) throw new Error('Prediction failed');
      const data = await response.json();
      setResult(data);
      localStorage.setItem('nutri_calories_result', JSON.stringify(data));
      fetchHistory();
    } catch (e) {
      setError('Prediction failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full bg-gray-50 dark:bg-[#1c1a17] border border-gray-200
    dark:border-[#3a3630] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white
    focus:outline-none focus:border-amber-500 transition-colors`;
  const labelClass = `block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5`;

  return (
    <div className="flex h-screen bg-[#f5f5f5] dark:bg-[#1c1a17] transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <div className="flex items-center justify-between px-5 py-3
                        border-b border-gray-200 dark:border-[#2e2b27]
                        bg-white dark:bg-[#1c1a17]">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
              <Menu size={20} />
            </button>
            <Logo size="sm" />
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-8 h-8 rounded-full flex items-center justify-center
                       bg-gray-100 dark:bg-[#2a2723] text-gray-500 dark:text-gray-400
                       hover:bg-gray-200 dark:hover:bg-[#333028] transition-colors"
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">

            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Calories <span className="text-amber-500">Tracker</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Enter your workout details to predict calories burned and energy needed for recovery.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-[#2a2723] border border-gray-200 dark:border-[#3a3630] rounded-2xl p-6">
                <h3 className="font-black text-gray-900 dark:text-white mb-5">Workout Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Age (years)</label>
                      <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="e.g. 23" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Height (cm)</label>
                      <input type="number" name="height" value={form.height} onChange={handleChange} placeholder="e.g. 175" className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Weight (kg)</label>
                      <input type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="e.g. 70" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Duration (minutes)</label>
                      <input type="number" name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 60" className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Heart Rate (bpm)</label>
                      <input type="number" name="heart_rate" value={form.heart_rate} onChange={handleChange} placeholder="e.g. 145" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Body Temp (°C)</label>
                      <input type="number" step="0.1" name="body_temp" value={form.body_temp} onChange={handleChange} placeholder="e.g. 39.5" className={inputClass} />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <button
                    onClick={handlePredict} disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50
                               text-white font-bold py-3 rounded-xl transition-colors
                               flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><Flame size={16} /> Predict Calories</>
                    }
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {result ? (
                  <div className="bg-white dark:bg-[#2a2723] border border-gray-200 dark:border-[#3a3630] rounded-2xl p-6">
                    <h3 className="font-black text-gray-900 dark:text-white mb-5">Prediction Result</h3>
                    <div className="space-y-4">
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                          <Flame size={22} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Calories Burned</p>
                          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
                            {result.calories_burned?.toFixed(1) ?? '—'}
                            <span className="text-sm font-normal ml-1">kcal</span>
                          </p>
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                          <Zap size={22} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 dark:text-green-400 font-semibold">Energy Needed for Recovery</p>
                          <p className="text-3xl font-black text-green-600 dark:text-green-400">
                            {result.energy_needed?.toFixed(1) ?? '—'}
                            <span className="text-sm font-normal ml-1">kcal</span>
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                            This is how much you need to eat to fully recover
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#2a2723] border border-gray-200 dark:border-[#3a3630]
                                  rounded-2xl p-6 flex flex-col items-center justify-center h-full text-center">
                    <Flame size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Fill in your workout details and click Predict to see your results.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#2a2723] border border-gray-200 dark:border-[#3a3630] rounded-2xl p-6">
              <div className="mb-5">
                <h3 className="font-black text-gray-900 dark:text-white text-lg">Your Workout History</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Calories burned and energy needed across your past workouts
                </p>
              </div>
              {chartLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center">
                  <Flame size={28} className="text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-400 dark:text-gray-500 text-sm">No predictions yet.</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Fill in your workout details above and click Predict.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 25, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit=" kcal" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#2a2723', border: '1px solid #3a3630', borderRadius: '12px', fontSize: '12px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ color: '#d1d5db' }}
                      formatter={(value: any) => [`${Number(value).toFixed(1)} kcal`]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Calories Burned" fill="#f59e0b" radius={[6,6,0,0]} maxBarSize={48}>
                      <LabelList
                        dataKey="Calories Burned"
                        position="top"
                        style={{ fontSize: '11px', fill: '#f59e0b', fontWeight: 'bold' }}
                        formatter={(v: any) => `${Number(v).toFixed(0)}`}
                      />
                    </Bar>
                    <Bar dataKey="Energy Needed" fill="#10b981" radius={[6,6,0,0]} maxBarSize={48}>
                      <LabelList
                        dataKey="Energy Needed"
                        position="top"
                        style={{ fontSize: '11px', fill: '#10b981', fontWeight: 'bold' }}
                        formatter={(v: any) => `${Number(v).toFixed(0)}`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}