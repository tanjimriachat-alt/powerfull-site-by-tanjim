
import React, { useState, useEffect } from 'react';
import { onValue, get, push } from 'firebase/database';
import { signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';
import { dbRefs, auth } from './firebase.ts';
import { AcademyData, AccessControl, SubjectKey, SUBJECT_NAMES } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Gateway from './components/Gateway.tsx';
import LoginPopup from './components/LoginPopup.tsx';
import AIAssistant from './components/AIAssistant.tsx';

/**
 * SUPER ADMIN CONFIGURATION
 * Only this phone number gets Admin Access (Owner).
 */
const SUPER_ADMIN_PHONE = "01874816789";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  
  // Roles
  const [isAdmin, setIsAdmin] = useState(false); // Controls Edit UI (For Super Admin AND Sub Admins)
  const [isOwner, setIsOwner] = useState(false); // Controls Access Manager / Logs (ONLY Super Admin)

  const [showLogin, setShowLogin] = useState<null | 'user' | 'admin'>(null);
  const [currentSubject, setCurrentSubject] = useState<SubjectKey>('p1');
  const [masterData, setMasterData] = useState<AcademyData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const savedSession = localStorage.getItem('nexus_session');
        if (savedSession) {
          try {
            const session = JSON.parse(savedSession);
            setIsAdmin(session.isAdmin);
            setIsOwner(session.isOwner);
            setCurrentUser(session.user);
            setIsAuthenticated(true);
          } catch (e) {
            console.error("Session parse error", e);
          }
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser('');
        localStorage.removeItem('nexus_session');
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = onValue(dbRefs.academyData(), (snapshot) => {
        setMasterData(snapshot.val() || {});
      }, (error) => {
        console.error("Data Load Error:", error);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // --- TRACKING SYSTEM ---
  const logAction = async (userPhone: string, action: string, details: string) => {
    try {
      // Ensure we are authenticated before writing logs
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch(authErr) {
          console.warn("Log Auth Failed", authErr);
          return;
        }
      }

      // Fetch IP Address
      let ip = 'unknown';
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ip = data.ip;
      } catch (e) { /* ignore ip error */ }

      await push(dbRefs.logs(), {
        user: userPhone,
        action,
        details,
        timestamp: Date.now(),
        ip
      });
    } catch (err: any) {
      // Swallow permission errors to prevent app disruption
      if (err.code === 'PERMISSION_DENIED' || err.message?.includes('PERMISSION_DENIED')) {
        console.warn("Activity Logging Skipped: Permission denied (Check Firebase Rules).");
      } else {
        console.error("Logging failed", err);
      }
    }
  };

  const handleLogin = async (u: string, p: string) => {
    setLoading(true);
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      // 1. Verify Credentials against Database
      const snapshot = await get(dbRefs.access());
      const data: AccessControl = snapshot.val() || { admins: {}, students: {} };
      
      let isValidUser = false;
      let isDbAdmin = false; // Is this user in the 'admins' list?
      
      // Check admins list
      const foundAdmin = Object.values(data.admins || {}).find(a => a.u === u && a.p === p);
      if (foundAdmin) {
        isValidUser = true;
        isDbAdmin = true;
      }

      // Check students list
      const foundStudent = Object.values(data.students || {}).find(s => s.u === u && s.p === p);
      if (foundStudent) isValidUser = true;

      // Hardcoded backdoors (legacy support converted to Admins)
      if ((u === "01866280090" && p === "meherajwafi") || (u === "01847757205" && p === "MFT28")) {
         isValidUser = true;
         isDbAdmin = true;
      }
      
      // Super Admin Hardcoded Check
      const isSuperAdmin = (u === SUPER_ADMIN_PHONE && p === "TANJIMRIACHAT@");
      if (isSuperAdmin) {
        isValidUser = true;
        isDbAdmin = true; // Super admin is also an admin
      }

      if (!isValidUser) {
        alert("ভুল আইডি বা পাসওয়ার্ড!");
        setLoading(false);
        return;
      }

      // 2. Assign Roles
      // Super Admin: Can do EVERYTHING (Access Manager, Logs, Edit Content)
      // Admin (Db): Can Edit Content
      // Student: View Content Only

      setIsOwner(isSuperAdmin); 
      setIsAdmin(isSuperAdmin || isDbAdmin);
      
      setCurrentUser(u);
      setIsAuthenticated(true);
      setShowLogin(null);
      
      localStorage.setItem('nexus_session', JSON.stringify({
        isAdmin: (isSuperAdmin || isDbAdmin),
        isOwner: isSuperAdmin,
        user: u
      }));

      // 3. LOG THE LOGIN
      logAction(u, 'LOGIN', 'User logged into portal');

    } catch (err: any) {
      console.error("Login Exception:", err);
      alert("সিস্টেমে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('nexus_session');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsOwner(false);
    setCurrentUser('');
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
        isOwner={isOwner}
        onLogout={logout}
      />
      <main className="flex-1 relative overflow-y-auto p-4 md:p-8">
        <Dashboard 
          subjectKey={currentSubject}
          isAdmin={isAdmin} // Controls Edit Mode UI
          masterData={masterData}
          currentUser={currentUser}
          onLogAction={logAction}
        />
        <AIAssistant context={`Subject: ${SUBJECT_NAMES[currentSubject]}`} />
      </main>
    </div>
  );
};

export default App;
