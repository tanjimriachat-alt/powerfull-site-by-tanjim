
import React, { useState, useEffect } from 'react';
import { onValue, push, remove, ref } from 'firebase/database';
import { database, dbRefs } from '../firebase';
import { UserAccount } from '../types';

interface AccessManagerProps {
  isMainAdmin: boolean;
  onClose: () => void;
}

const AccessManager: React.FC<AccessManagerProps> = ({ isMainAdmin, onClose }) => {
  const [students, setStudents] = useState<{ [key: string]: UserAccount }>({});
  const [admins, setAdmins] = useState<{ [key: string]: UserAccount }>({});
  
  const [newU, setNewU] = useState('');
  const [newP, setNewP] = useState('');
  const [type, setType] = useState<'student' | 'admin'>('student');

  useEffect(() => {
    const unsubStudents = onValue(dbRefs.students(), (s) => setStudents(s.val() || {}));
    const unsubAdmins = onValue(dbRefs.admins(), (s) => setAdmins(s.val() || {}));
    return () => { unsubStudents(); unsubAdmins(); };
  }, []);

  const handleAdd = async () => {
    if (!newU || !newP) return alert("Fill all fields");
    try {
      await push(type === 'student' ? dbRefs.students() : dbRefs.admins(), { u: newU, p: newP });
      setNewU(''); setNewP('');
    } catch (err) {
      alert("Error adding user");
    }
  };

  const handleDel = async (id: string, userType: 'student' | 'admin') => {
    if (!confirm("Are you sure?")) return;
    try {
      await remove(ref(database, `access/${userType}s/${id}`));
    } catch (err) {
      alert("Error deleting user");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-800">Access Manager</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl">✕</button>
        </div>

        <div className="p-8 overflow-y-auto space-y-10">
          <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100">
            <h3 className="font-bold text-slate-800 mb-6 uppercase tracking-wider text-xs">Register New Access</h3>
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setType('student')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${type === 'student' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 border border-indigo-200'}`}
              >
                Student
              </button>
              {isMainAdmin && (
                <button 
                  onClick={() => setType('admin')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${type === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 border border-indigo-200'}`}
                >
                  Admin
                </button>
              )}
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Registered Students
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {/* Fix: Explicitly cast Object.entries to resolve 'unknown' type errors for s.u and s.p */}
                {(Object.entries(students) as [string, UserAccount][]).map(([id, s]) => (
                  <div key={id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center group">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm">{s.u}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">PASS: {s.p}</span>
                    </div>
                    <button onClick={() => handleDel(id, 'student')} className="text-rose-400 hover:text-rose-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {isMainAdmin && (
              <div>
                <h4 className="font-bold text-indigo-600 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> System Admins
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {/* Fix: Explicitly cast Object.entries to resolve 'unknown' type errors for a.u and a.p */}
                  {(Object.entries(admins) as [string, UserAccount][]).map(([id, a]) => (
                    <div key={id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm">{a.u}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">PASS: {a.p}</span>
                      </div>
                      <button onClick={() => handleDel(id, 'admin')} className="text-rose-400 hover:text-rose-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessManager;
