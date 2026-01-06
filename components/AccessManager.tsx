
import React, { useState, useEffect } from 'react';
import { onValue, push, remove, ref, set } from 'firebase/database';
import { database, dbRefs } from '../firebase';
import { UserAccount, ActivityLog } from '../types';

interface AccessManagerProps {
  isOwner: boolean;
  isAdmin: boolean;
  onClose: () => void;
}

// Hardcoded System Admins that exist in App.tsx
const SYSTEM_ADMINS = [
  { u: "01874816789", role: "OWNER", name: "Tanjim" },
  { u: "01866280090", role: "SYSTEM", name: "Wafi" },
  { u: "01847757205", role: "SYSTEM", name: "MFT" }
];

const AccessManager: React.FC<AccessManagerProps> = ({ isOwner, isAdmin, onClose }) => {
  // Security Check: Allow if Access is Admin (Owner or General Admin)
  useEffect(() => {
    if (!isAdmin) onClose();
  }, [isAdmin, onClose]);

  const [activeTab, setActiveTab] = useState<'access' | 'activity'>('access');
  
  const [students, setStudents] = useState<{ [key: string]: UserAccount }>({});
  const [admins, setAdmins] = useState<{ [key: string]: UserAccount }>({});
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // Form State
  const [newU, setNewU] = useState('');
  const [newP, setNewP] = useState('');
  const [userType, setUserType] = useState<'student' | 'admin'>('student');

  useEffect(() => {
    const unsubStudents = onValue(dbRefs.students(), (s) => setStudents(s.val() || {}));
    const unsubAdmins = onValue(dbRefs.admins(), (s) => setAdmins(s.val() || {}));
    
    // Only fetch logs if Owner
    let unsubLogs = () => {};
    if (isOwner) {
      unsubLogs = onValue(dbRefs.logs(), (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list = Object.entries(val).map(([key, data]: [string, any]) => ({
            id: key,
            ...data
          }));
          setLogs(list.sort((a, b) => b.timestamp - a.timestamp));
        } else {
          setLogs([]);
        }
      }, (error) => {
        console.warn("Log Access Error:", error.message);
      });
    }

    return () => { unsubStudents(); unsubAdmins(); unsubLogs(); };
  }, [isOwner]);

  const handleAdd = async () => {
    if (!newU || !newP) return alert("সব ঘর পূরণ করুন");
    
    // Security: If not owner, force 'student' type even if UI is hacked
    const finalUserType = isOwner ? userType : 'student';
    const targetRef = finalUserType === 'admin' ? dbRefs.admins() : dbRefs.students();
    
    try {
      await push(targetRef, { u: newU, p: newP });
      setNewU(''); setNewP('');
      alert(`${finalUserType === 'admin' ? 'Admin' : 'Student'} সফলভাবে যোগ করা হয়েছে!`);
    } catch (err) {
      alert("Error adding user.");
    }
  };

  const handleDel = async (id: string, type: 'student' | 'admin') => {
    if (!confirm("আপনি কি নিশ্চিত?")) return;
    
    // Non-owners can only delete students
    if (!isOwner && type === 'admin') {
      alert("You do not have permission to delete admins.");
      return;
    }

    const path = type === 'admin' ? `access/admins/${id}` : `access/students/${id}`;
    try {
      await remove(ref(database, path));
    } catch (err) {
      alert("Error deleting user");
    }
  };

  const handleClearLogs = async () => {
    if (!isOwner) return;
    if(!confirm("Are you sure you want to clear ALL activity logs?")) return;
    try {
      await set(dbRefs.logs(), null);
    } catch(err) {
      alert("Failed to clear logs");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur">
          <div className="flex gap-4 items-center">
            <h2 className="text-2xl font-bold text-slate-800">Control Panel</h2>
            <div className="flex gap-2 bg-slate-200/60 p-1.5 rounded-xl">
              <button 
                onClick={() => setActiveTab('access')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'access' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
              >
                👥 Users Management
              </button>
              
              {/* Only Owner sees Activity Tab */}
              {isOwner && (
                <button 
                  onClick={() => setActiveTab('activity')}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'activity' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  <span>📡 Live Activity</span>
                  {logs.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px]">{logs.length}</span>}
                </button>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors font-bold">✕</button>
        </div>

        <div className="p-0 overflow-y-auto flex-1 bg-white">
          {activeTab === 'access' ? (
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Left Column: Register Form & Admins */}
              <div className="space-y-8">
                {/* Registration Form */}
                <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6 uppercase tracking-wider text-xs flex items-center gap-2">
                    <span className="bg-indigo-600 w-2 h-2 rounded-full"></span> Add New User
                  </h3>
                  
                  {/* Only Owner can toggle between Student/Admin. Others are forced to Student. */}
                  {isOwner && (
                    <div className="flex gap-2 mb-4 p-1 bg-white rounded-xl border border-indigo-100">
                      <button 
                        onClick={() => setUserType('student')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${userType === 'student' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:bg-slate-50'}`}
                      >
                        Student
                      </button>
                      <button 
                        onClick={() => setUserType('admin')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${userType === 'admin' ? 'bg-purple-100 text-purple-700' : 'text-slate-400 hover:bg-slate-50'}`}
                      >
                        Admin
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Phone Number / ID" 
                      value={newU}
                      onChange={e => setNewU(e.target.value)}
                      className="w-full p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-400 transition-all bg-white"
                    />
                    <input 
                      type="text" 
                      placeholder="Password" 
                      value={newP}
                      onChange={e => setNewP(e.target.value)}
                      className="w-full p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-400 transition-all bg-white"
                    />
                    <button 
                      onClick={handleAdd}
                      className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all text-white mt-2
                        ${(isOwner && userType === 'admin') ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}
                      `}
                    >
                      + Add {(isOwner && userType === 'admin') ? 'Admin' : 'Student'}
                    </button>
                  </div>
                </div>

                {/* Admins List - Only Visible to Owner */}
                {isOwner && (
                  <div>
                    <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                      🛡️ Admin Access List
                    </h4>
                    <div className="grid gap-3">
                      
                      {/* SYSTEM ADMINS (Hardcoded) */}
                      {SYSTEM_ADMINS.map((sys, idx) => (
                        <div key={`sys-${idx}`} className="p-4 bg-purple-100/50 border border-purple-200 rounded-xl flex justify-between items-center opacity-90">
                          <div className="flex flex-col">
                            <span className="font-bold text-purple-900 text-sm flex items-center gap-2">
                              {sys.u} 
                              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase text-white font-bold ${sys.role === 'OWNER' ? 'bg-indigo-600' : 'bg-purple-400'}`}>
                                {sys.name}
                              </span>
                            </span>
                            <span className="text-[10px] text-purple-500 font-bold tracking-wider mt-0.5">PERMANENT ACCESS</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                            🔒 System
                          </div>
                        </div>
                      ))}

                      {/* DATABASE ADMINS */}
                      {(Object.entries(admins) as [string, UserAccount][]).map(([id, s]) => (
                        <div key={id} className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex justify-between items-center group hover:shadow-md transition-all">
                          <div className="flex flex-col">
                            <span className="font-bold text-purple-900 text-sm">{s.u}</span>
                            <span className="text-[10px] text-purple-400 font-mono">{s.p}</span>
                          </div>
                          <button onClick={() => handleDel(id, 'admin')} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">🗑️</button>
                        </div>
                      ))}
                      
                      {Object.keys(admins).length === 0 && (
                        <p className="text-slate-400 text-xs italic p-2">No additional admins created yet.</p>
                      )}

                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Students List (Visible to All Admins) */}
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 h-full overflow-y-auto max-h-[600px]">
                <h4 className="font-bold text-slate-600 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide sticky top-0 bg-slate-50 py-2 z-10">
                  🎓 Registered Students ({Object.keys(students).length})
                </h4>
                <div className="space-y-3">
                  {(Object.entries(students) as [string, UserAccount][]).map(([id, s]) => (
                    <div key={id} className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-center group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs">👤</div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-sm">{s.u}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Pass: {s.p}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDel(id, 'student')} className="text-slate-300 hover:text-rose-500 transition-colors p-2">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            // Activity Tab content (Already protected by UI logic above, but safer to re-check)
            isOwner ? (
              <div className="p-8">
                 <div className="flex justify-between items-center mb-6">
                   <div>
                     <h3 className="font-bold text-slate-800 text-lg">Real-time Activity Log</h3>
                     <p className="text-slate-500 text-xs">Monitoring user logins and video views</p>
                   </div>
                   <button onClick={handleClearLogs} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 border border-rose-100">Clear History</button>
                 </div>
                 
                 <div className="bg-slate-900 rounded-[2rem] overflow-hidden text-slate-300 font-mono text-xs shadow-2xl border border-slate-800">
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <thead className="bg-slate-950 text-slate-500 uppercase tracking-wider text-[10px]">
                         <tr>
                           <th className="p-4">Timestamp</th>
                           <th className="p-4">User</th>
                           <th className="p-4">Type</th>
                           <th className="p-4">Details</th>
                           <th className="p-4">IP Address</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800/50">
                         {logs.map((log) => (
                           <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                             <td className="p-4 whitespace-nowrap text-slate-500">
                               <div className="text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</div>
                               <div className="text-[9px] opacity-50">{new Date(log.timestamp).toLocaleDateString()}</div>
                             </td>
                             <td className="p-4 font-bold text-emerald-400">{log.user}</td>
                             <td className="p-4">
                               <span className={`px-2 py-1 rounded-md text-[9px] font-bold border ${log.action === 'LOGIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                 {log.action}
                               </span>
                             </td>
                             <td className="p-4 text-white/80 max-w-xs truncate" title={log.details}>{log.details}</td>
                             <td className="p-4 text-slate-600">{log.ip}</td>
                           </tr>
                         ))}
                         {logs.length === 0 && (
                           <tr>
                             <td colSpan={5} className="p-20 text-center text-slate-600">
                               <div className="text-4xl mb-2">📡</div>
                               <p>No activity recorded yet...</p>
                             </td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                 </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessManager;
