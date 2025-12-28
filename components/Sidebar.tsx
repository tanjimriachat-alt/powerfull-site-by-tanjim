
import React, { useState, useEffect, useRef } from 'react';
import { SubjectKey, SUBJECT_NAMES, DeveloperInfo } from '../types';
import AccessManager from './AccessManager';
import { onValue, set } from 'firebase/database';
import { dbRefs } from '../firebase';

interface SidebarProps {
  currentSubject: SubjectKey;
  onSubjectChange: (key: SubjectKey) => void;
  isAdmin: boolean;
  isMainAdmin: boolean;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentSubject, 
  onSubjectChange, 
  isAdmin, 
  isMainAdmin, 
  onLogout 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [devInfo, setDevInfo] = useState<DeveloperInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const unsubscribe = onValue(dbRefs.developerInfo(), (snapshot) => {
      setDevInfo(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // SECURITY: Only allow main admin to perform database write
    if (!isMainAdmin) {
      alert("Only the owner (Tanjim) can change this photo.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // Limit to 1MB for Realtime DB storage
      alert("Image is too large. Please select an image under 1MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await set(dbRefs.developerInfo(), {
          ...devInfo,
          photoURL: base64String,
          name: "Riachat Tanjim Omar",
          subtitle: "HSC 26 | LGC"
        });
      } catch (err) {
        console.error("Upload error:", err);
        alert("Failed to save image. Check your Firebase permissions.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    // Only trigger if the user is the Main Admin
    if (isMainAdmin && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      {/* Hidden File Input - Only accessible via ref by Main Admin */}
      {isMainAdmin && (
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handlePhotoUpload}
        />
      )}

      {/* Mobile Menu Button */}
      <button 
        onClick={toggle}
        className="md:hidden fixed top-4 left-4 z-[60] bg-indigo-600 text-white p-3 rounded-2xl shadow-xl active:scale-95 transition-all"
      >
        {isOpen ? '✕' : '☰ Menu'}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={toggle}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 w-80 bg-slate-900 text-slate-100 flex flex-col z-50
        transition-all duration-500 ease-in-out transform md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-8 pb-4 text-center">
          <div className="inline-block p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] border border-white/10 mb-6 group hover:scale-105 transition-transform">
            <h2 className="font-cursive text-6xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-md leading-tight">Tanjim</h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-300/60 font-black mt-1">wafi & mishkat</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="h-0.5 w-6 bg-indigo-500/50 rounded-full"></span>
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold">Academic Nexus</p>
            <span className="h-0.5 w-6 bg-indigo-500/50 rounded-full"></span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto mt-6 px-6 space-y-2 scrollbar-hide">
          {Object.entries(SUBJECT_NAMES).map(([key, name]) => (
            <button
              key={key}
              onClick={() => {
                onSubjectChange(key as SubjectKey);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-5 py-3.5 rounded-2xl transition-all font-bengali font-bold text-sm
                flex items-center gap-4 relative overflow-hidden group
                ${currentSubject === key 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-900/20 scale-[1.02]' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'}
              `}
            >
              <span className={`w-2 h-2 rounded-full ${currentSubject === key ? 'bg-white animate-pulse' : 'bg-slate-700'}`}></span>
              {name}
              {currentSubject === key && (
                <div className="absolute right-[-10px] top-[-10px] w-12 h-12 bg-white/10 rounded-full blur-xl" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-6 space-y-4">
          <div className="relative">
            {showInfo && (
              <div className="absolute bottom-full left-0 w-full mb-4 bg-white text-slate-900 p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-300 border border-slate-100">
                <div className="text-center mb-4">
                  {/* Profile Picture Container */}
                  <div 
                    onClick={triggerFileUpload}
                    className={`
                      w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border-4 border-white shadow-lg overflow-hidden relative group/avatar
                      ${isMainAdmin ? 'cursor-pointer hover:border-indigo-400 transition-all' : ''}
                      ${isUploading ? 'animate-pulse' : ''}
                    `}
                  >
                    {devInfo?.photoURL ? (
                      <img 
                        src={devInfo.photoURL} 
                        alt="Developer" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-indigo-400">👤</span>
                    )}
                    
                    {/* ONLY SHOW EDIT OVERLAY FOR MAIN ADMIN */}
                    {isMainAdmin && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                        <span className="text-white text-lg">📷</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{devInfo?.name || "Riachat Tanjim Omar"}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{devInfo?.subtitle || "HSC 26 | LGC"}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <a href="https://wa.me/qr/LCKHEWYQZPCUD1" target="_blank" className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors">WhatsApp</a>
                  <a href="https://facebook.com/riachattanjim" target="_blank" className="flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">Facebook</a>
                </div>
              </div>
            )}
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="w-full py-4 px-6 bg-slate-800/50 hover:bg-slate-800 text-indigo-400 rounded-2xl font-bold text-xs transition-all border border-indigo-500/10 flex items-center justify-center gap-3"
            >
              <span>{showInfo ? '✕ Hide Info' : '💬 Developer Info'}</span>
            </button>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800/50">
            {isAdmin && (
              <button 
                onClick={() => setShowManager(true)}
                className="w-full py-4 px-6 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-2xl font-bold text-xs transition-all border border-indigo-500/20 flex items-center justify-center gap-3"
              >
                <span className="text-lg">⚙️</span> Manage Access
              </button>
            )}
            <button 
              onClick={onLogout}
              className="w-full py-4 px-6 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl font-bold text-xs transition-all border border-rose-500/20 flex items-center justify-center gap-3"
            >
              Logout Account
            </button>
          </div>
        </div>
      </aside>

      {showManager && <AccessManager isMainAdmin={isMainAdmin} onClose={() => setShowManager(false)} />}
    </>
  );
};

export default Sidebar;
