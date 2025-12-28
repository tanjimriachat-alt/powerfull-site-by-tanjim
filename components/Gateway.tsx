
import React from 'react';

interface GatewayProps {
  onOpenLogin: (type: 'user' | 'admin') => void;
}

const Gateway: React.FC<GatewayProps> = ({ onOpenLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-6">
      <div className="bg-white p-12 rounded-[3rem] text-center max-w-md w-full shadow-2xl relative overflow-hidden group">
        {/* Decorative background circle */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-50 transition-transform group-hover:scale-150" />
        
        <h1 className="font-cursive text-7xl text-indigo-600 mb-4 drop-shadow-sm">Tanjim</h1>
        <p className="text-slate-500 font-bold mb-10 tracking-wide uppercase text-sm">Academic Nexus</p>
        
        <div className="space-y-4 relative z-10">
          <button 
            onClick={() => onOpenLogin('user')}
            className="w-full py-5 px-8 bg-slate-100 hover:bg-slate-200 text-indigo-600 font-bold rounded-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg"
          >
            <span className="text-2xl">📖</span> Student Login
          </button>
          <button 
            onClick={() => onOpenLogin('admin')}
            className="w-full py-5 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl transition-all transform hover:-translate-y-1 shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3 text-lg"
          >
            <span className="text-2xl">⚙️</span> Admin Control
          </button>
        </div>
        
        <p className="mt-12 text-slate-400 text-sm font-medium">Empowering HSC Learners Everywhere</p>
      </div>
    </div>
  );
};

export default Gateway;
