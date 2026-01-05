
import React, { useState, useEffect, useRef } from 'react';
import { SubjectKey, SUBJECT_NAMES, DeveloperInfo } from '../types';
import AccessManager from './AccessManager';
import { onValue, set } from 'firebase/database';
import { dbRefs } from '../firebase';

interface SidebarProps {
  currentSubject: SubjectKey;
  onSubjectChange: (key: SubjectKey) => void;
  isAdmin: boolean; 
  isOwner: boolean; // This is the SUPER ADMIN flag
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentSubject, 
  onSubjectChange, 
  isAdmin, 
  isOwner,
  onLogout 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [devInfo, setDevInfo] = useState<DeveloperInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logCount, setLogCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const unsubscribe = onValue(dbRefs.developerInfo(), (snapshot) => {
      setDevInfo(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  // Live Notification Badge for Super Admin
  useEffect(() => {
    if (isOwner) {
      const unsub = onValue(dbRefs.logs(), (snapshot) => {
        if (snapshot.exists()) {
          setLogCount(Object.keys(snapshot.val()).length);
        }
      });
      return () => unsub();
    }
  }, [isOwner]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("ফাইল সাইজ ১.৫ মেগাবাইটের বেশি হতে পারবে না।");
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
        alert("ডেভেলপার ইনফো সফলভাবে আপডেট হয়েছে!");
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    if (isOwner && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      {isOwner && (
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handlePhotoUpload}
        />
      )}

      <button 
        onClick={toggle}
        className="md:hidden fixed top-4 left-4 z-[60] bg-indigo-600 text-white p-3 rounded-2xl shadow-xl active:scale-95 transition-all"
      >
        {isOpen ? '✕' : '☰ Menu'}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={toggle}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 w-80 bg-slate-900 text-slate-100 flex flex-col z-50
        transition-all duration-500 ease-in-out transform md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
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

        <nav className="flex-1 overflow-y-auto mt-6 px-6 space-y-2 scrollbar-hide">
          {Object.entries(SUBJECT_NAMES).map(([key, name]) => (
            <React.Fragment key={key}>
              {key === 'archive' && <div className="pt-4 pb-2 border-t border-slate-800/50 mt-4 mx-2" />}
              <button
                onClick={() => {
                  onSubjectChange(key as SubjectKey);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-5 py-3.5 rounded-2xl transition-all font-bengali font-bold text-sm
                  flex items-center gap-4 relative overflow-hidden group
                  ${currentSubject === key 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-900/20 scale-[1.02]' 
                    : (key === 'archive' ? 'bg-slate-800/40 text-slate-400 hover:text-amber-400 hover:bg-slate-800' : 'hover:bg-slate-800 text-slate-400 hover:text-white')}
                `}
              >
                <span className={`w-2 h-2 rounded-full ${currentSubject === key ? 'bg-white animate-pulse' : (key === 'archive' ? 'bg-amber-500/40' : 'bg-slate-700')}`}></span>
                {name}
                {key === 'archive' && <span className="ml-auto text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">OLD</span>}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div className="p-6 space-y-4">
          <div className="relative">
            {showInfo && (
              <div className="absolute bottom-full left-0 w-full mb-4 bg-white text-slate-900 p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-300 border border-slate-100">
                <div className="text-center mb-4">
                  <div 
                    onClick={triggerFileUpload}
                    className={`
                      w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border-4 border-white shadow-lg overflow-hidden relative group/avatar
                      ${isOwner ? 'cursor-pointer hover:border-indigo-400 transition-all ring-4 ring-indigo-50' : ''}
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
                    {isOwner && (
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
            {isOwner && (
              <button 
                onClick={() => setShowManager(true)}
                className="w-full py-4 px-6 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-2xl font-bold text-xs transition-all border border-indigo-500/20 flex items-center justify-center gap-3 relative"
              >
                <span className="text-lg">⚙️</span> Admin Dashboard
                {logCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[8px] text-white items-center justify-center">{logCount > 99 ? '99+' : logCount}</span>
                  </span>
                )}
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

      {showManager && <AccessManager isOwner={isOwner} onClose={() => setShowManager(false)} />}
    </>
  );
};

export default Sidebar;
