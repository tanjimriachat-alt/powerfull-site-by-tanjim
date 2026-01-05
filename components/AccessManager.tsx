
import React, { useState, useEffect } from 'react';
import { onValue, push, remove, ref, set } from 'firebase/database';
import { database, dbRefs } from '../firebase';
import { UserAccount, ActivityLog } from '../types';

interface AccessManagerProps {
  isOwner: boolean;
  onClose: () => void;
}

const AccessManager: React.FC<AccessManagerProps> = ({ isOwner, onClose }) => {
  // If not Owner (Super Admin), immediately close - Security Check
  useEffect(() => {
    if (!isOwner) onClose();
  }, [isOwner, onClose]);

  const [activeTab, setActiveTab] = useState<'access' | 'activity'>('access');
  const [students, setStudents] = useState<{ [key: string]: UserAccount }>({});
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  const [newU, setNewU] = useState('');
  const [newP, setNewP] = useState('');
  const [type, setType] = useState<'student'>('student');

  useEffect(() => {
    const unsubStudents = onValue(dbRefs.students(), (s) => setStudents(s.val() || {}));
    
    // Fetch Logs
    const unsubLogs = onValue(dbRefs.logs(), (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const list = Object.entries(val).map(([key, data]: [string, any]) => ({
          id: key,
          ...data
        }));
        // Sort by timestamp descending
        setLogs(list.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setLogs([]);
      }
    }, (error) => {
      console.warn("Could not fetch logs (Permission Denied):", error.message);
    });

    return () => { unsubStudents(); unsubLogs(); };
  }, []);

  const handleAdd = async () => {
    if (!newU || !newP) return alert("সব ঘর পূরণ করুন");
    try {
      await push(dbRefs.students(), { u: newU, p: newP });
      setNewU(''); setNewP('');
      alert("সফলভাবে যোগ করা হয়েছে!");
    } catch (err) {
      alert("Error adding user.");
    }
  };

  const handleDel = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত?")) return;
    try {
      await remove(ref(database, `access/students/${id}`));
    } catch (err) {
      alert("Error deleting user");
    }
  };

  const handleClearLogs = async () => {
    if(!confirm("Are you sure you want to clear ALL activity logs?")) return;
    try {
      await set(dbRefs.logs(), null);
    } catch(err) {
      alert("Failed to clear logs (Permission Denied)");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex gap-4 items-center">
            <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
            <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('access')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'access' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                Access Control
              </button>
              <button 
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'activity' ? 'bg-rose-500 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                Live Activity
                <span className="ml-2 bg-white/20 px-1.5 rounded-full text-[10px]">{logs.length}</span>
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl">✕</button>
        </div>

        <div className="p-0 overflow-y-auto flex-1">
          {activeTab === 'access' ? (
            <div className="p-8 space-y-10">
              <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100">
                <h3 className="font-bold text-slate-800 mb-6 uppercase tracking-wider text-xs">Register New Student</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="User ID (Phone/Email)" 
                    value={newU}
                    onChange={e => setNewU(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-indigo-200 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="User Password" 
                    value={newP}
                    onChange={e => setNewP(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-indigo-200 outline-none"
                  />
                </div>
                <button 
                  onClick={handleAdd}
                  className="w-full mt-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Confirm Registration
                </button>
              </div>

              <div>
                <h4 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Registered Students
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.entries(students) as [string, UserAccount][]).map(([id, s]) => (
                    <div key={id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm">{s.u}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">PASS: {s.p}</span>
                      </div>
                      <button onClick={() => handleDel(id)} className="text-rose-400 hover:text-rose-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Real-time User Activity</h3>
                 <button onClick={handleClearLogs} className="text-rose-500 text-xs font-bold hover:underline">Clear History</button>
               </div>
               
               <div className="bg-slate-900 rounded-[2rem] overflow-hidden text-slate-300 font-mono text-xs shadow-2xl">
                 <table className="w-full text-left">
                   <thead className="bg-slate-800 text-slate-400">
                     <tr>
                       <th className="p-4">Time</th>
                       <th className="p-4">User</th>
                       <th className="p-4">Action</th>
                       <th className="p-4">Details</th>
                       <th className="p-4">IP</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                     {logs.map((log) => (
                       <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                         <td className="p-4 whitespace-nowrap opacity-60">
                           {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                           <br/>
                           <span className="text-[10px]">{new Date(log.timestamp).toLocaleDateString()}</span>
                         </td>
                         <td className="p-4 font-bold text-emerald-400">{log.user}</td>
                         <td className="p-4">
                           <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${log.action === 'LOGIN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                             {log.action}
                           </span>
                         </td>
                         <td className="p-4 text-white/80 max-w-xs truncate" title={log.details}>{log.details}</td>
                         <td className="p-4 opacity-50">{log.ip}</td>
                       </tr>
                     ))}
                     {logs.length === 0 && (
                       <tr>
                         <td colSpan={5} className="p-12 text-center text-slate-600 italic">No activity recorded yet...</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessManager;
