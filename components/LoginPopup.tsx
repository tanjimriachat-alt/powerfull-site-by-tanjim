
import React, { useState } from 'react';

interface LoginPopupProps {
  type: 'user' | 'admin';
  onClose: () => void;
  onLogin: (u: string, p: string) => void;
  loading: boolean;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ type, onClose, onLogin, loading }) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (u && p) onLogin(u, p);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm p-10 rounded-[2.5rem] shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-2xl">✕</button>
        
        <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">
          {type === 'admin' ? 'Admin Access' : 'Student Portal'}
        </h2>
        <p className="text-slate-500 text-center mb-8 font-medium">Please enter your credentials</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Phone or Email</label>
            <input 
              type="text" 
              value={u}
              onChange={(e) => setU(e.target.value)}
              placeholder="01xxxxxxxxx"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Password</label>
            <input 
              type="password" 
              value={p}
              onChange={(e) => setP(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className={`
              w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl 
              transition-all shadow-lg shadow-indigo-200 active:scale-95 mt-6
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}
            `}
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPopup;
