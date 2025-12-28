
import React, { useState, useEffect, useCallback } from 'react';
import { onValue, get } from 'firebase/database';
import { dbRefs } from './firebase';
import { AcademyData, AccessControl, SubjectKey, SUBJECT_NAMES } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Gateway from './components/Gateway';
import LoginPopup from './components/LoginPopup';
import AIAssistant from './components/AIAssistant';

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

  useEffect(() => {
    const unsubscribe = onValue(dbRefs.academyData(), (snapshot) => {
      const data = snapshot.val() || {};
      setMasterData(data);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (u: string, p: string) => {
    setLoading(true);
    try {
      // 1. Check Core Admins
      const coreMatch = CORE_ADMINS.find(a => a.u === u && a.p === p);
      if (coreMatch) {
        setIsAdmin(true);
        if (u === "01874816789") setIsMainAdmin(true);
        setIsAuthenticated(true);
        setShowLogin(null);
        return;
      }

      // 2. Check Database
      const snapshot = await get(dbRefs.access());
      const data: AccessControl = snapshot.val() || { admins: {}, students: {} };
      
      let foundAdmin = Object.values(data.admins || {}).find(a => a.u === u && a.p === p);
      if (foundAdmin) {
        setIsAdmin(true);
        setIsAuthenticated(true);
        setShowLogin(null);
        return;
      }

      let foundStudent = Object.values(data.students || {}).find(s => s.u === u && s.p === p);
      if (foundStudent) {
        setIsAdmin(false);
        setIsAuthenticated(true);
        setShowLogin(null);
        return;
      }

      alert("Incorrect credentials!");
    } catch (err) {
      console.error(err);
      alert("Error authenticating. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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
