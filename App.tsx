
import React, { useState, useEffect } from 'react';
import { onValue, get } from 'firebase/database';
import { signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';
import { dbRefs, auth } from './firebase.ts';
import { AcademyData, AccessControl, SubjectKey, SUBJECT_NAMES } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Gateway from './components/Gateway.tsx';
import LoginPopup from './components/LoginPopup.tsx';
import AIAssistant from './components/AIAssistant.tsx';

const CORE_ADMINS = [
  { u: "01866280090", p: "meherajwafi" },
  { u: "01874816789", p: "TANJIMRIACHAT@" },
  { u: "01847757205", p: "MFT28" }
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState<null | 'user' | 'admin'>(null);
  const [currentSubject, setCurrentSubject] = useState<SubjectKey>('p1');
  const [masterData, setMasterData] = useState<AcademyData>({});
  const [loading, setLoading] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const savedSession = localStorage.getItem('nexus_session');
        if (savedSession) {
          const { isAdmin: savedIsAdmin, isMainAdmin: savedIsMain } = JSON.parse(savedSession);
          setIsAdmin(savedIsAdmin);
          setIsMainAdmin(savedIsMain);
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('nexus_session');
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = onValue(dbRefs.academyData(), (snapshot) => {
        const data = snapshot.val() || {};
        setMasterData(data);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const handleLogin = async (u: string, p: string) => {
    setLoading(true);
    try {
      await signInAnonymously(auth);

      let finalIsAdmin = false;
      let finalIsMainAdmin = false;

      // 1. Check Core Admins
      const coreMatch = CORE_ADMINS.find(a => a.u === u && a.p === p);
      if (coreMatch) {
        finalIsAdmin = true;
        finalIsMainAdmin = true;
      } else {
        // 2. Check Database
        const snapshot = await get(dbRefs.access());
        const data: AccessControl = snapshot.val() || { admins: {}, students: {} };
        
        let foundAdmin = Object.values(data.admins || {}).find(a => a.u === u && a.p === p);
        if (foundAdmin) {
          finalIsAdmin = true;
          finalIsMainAdmin = false;
        } else {
          let foundStudent = Object.values(data.students || {}).find(s => s.u === u && s.p === p);
          if (foundStudent) {
            finalIsAdmin = false;
            finalIsMainAdmin = false;
          } else {
            await signOut(auth);
            alert("ভুল আইডি বা পাসওয়ার্ড!");
            setLoading(false);
            return;
          }
        }
      }

      // Success Logic
      setIsAdmin(finalIsAdmin);
      setIsMainAdmin(finalIsMainAdmin);
      setIsAuthenticated(true);
      setShowLogin(null);
      localStorage.setItem('nexus_session', JSON.stringify({
        isAdmin: finalIsAdmin,
        isMainAdmin: finalIsMainAdmin
      }));

    } catch (err) {
      console.error(err);
      alert("কানেকশন এরর! ইন্টারনেট চেক করুন।");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('nexus_session');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsMainAdmin(false);
    setShowLogin(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Gateway onOpenLogin={setShowLogin} />
        {showLogin && (
          <LoginPopup 
            type={showLogin} 
            onClose={() => setShowLogin(null)} 
            onLogin={handleLogin}
            loading={loading}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        currentSubject={currentSubject} 
        onSubjectChange={setCurrentSubject}
        isAdmin={isAdmin}
        isMainAdmin={isMainAdmin}
        onLogout={logout}
      />
      <main className="flex-1 relative overflow-y-auto p-4 md:p-8">
        <Dashboard 
          subjectKey={currentSubject}
          isAdmin={isAdmin}
          masterData={masterData}
        />
        <AIAssistant context={`Subject: ${SUBJECT_NAMES[currentSubject]}`} />
      </main>
    </div>
  );
};

export default App;
