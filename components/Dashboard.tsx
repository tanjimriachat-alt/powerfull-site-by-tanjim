
import React, { useState, useMemo } from 'react';
import { SubjectKey, AcademyData, SUBJECT_NAMES, Chapter } from '../types';
import ChapterCard from './ChapterCard';
import EditorModal from './EditorModal';
import { set, ref } from 'firebase/database';
import { database } from '../firebase';

interface DashboardProps {
  subjectKey: SubjectKey;
  isAdmin: boolean;
  masterData: AcademyData;
}

const Dashboard: React.FC<DashboardProps> = ({ subjectKey, isAdmin, masterData }) => {
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChapter, setEditingChapter] = useState<{ chapter: Chapter | null, index: number | null } | null>(null);

  const chapters = masterData[subjectKey] || [];

  const filteredChapters = useMemo(() => {
    return chapters.filter(ch => 
      ch.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chapters, searchQuery]);

  const handleSave = async (updatedChapter: Chapter, index: number | null) => {
    const subjectChapters = [...chapters];
    
    if (index !== null) {
      subjectChapters[index] = updatedChapter;
    } else {
      subjectChapters.push(updatedChapter);
    }

    try {
      const subjectRef = ref(database, `academyData/${subjectKey}`);
      await set(subjectRef, subjectChapters);
      setEditingChapter(null);
    } catch (err: any) {
      console.error("Save error:", err);
      if (err.message.includes("PERMISSION_DENIED")) {
        alert("ভুল (Error): ডেটাবেসে অনুমতি নেই (Permission Denied)!\n\nআপনাকে Firebase Console-এ গিয়ে Realtime Database-এর Rules ট্যাবে \".write\": true করে দিতে হবে। তা না হলে সেভ হবে না।");
      } else {
        alert("সেভ করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন।");
      }
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই চ্যাপ্টারটি ডিলিট করতে চান?")) return;
    
    const subjectChapters = [...chapters];
    subjectChapters.splice(index, 1);
    
    try {
      const subjectRef = ref(database, `academyData/${subjectKey}`);
      await set(subjectRef, subjectChapters);
    } catch (err: any) {
      if (err.message.includes("PERMISSION_DENIED")) {
        alert("ভুল (Error): ডিলিট করার অনুমতি নেই। Firebase Rules চেক করুন।");
      } else {
        alert("ডিলিট করতে সমস্যা হয়েছে।");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 font-bengali tracking-tight">
            {SUBJECT_NAMES[subjectKey]}
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">HSC Comprehensive Resource Hub</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
            <input 
              type="text"
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all w-full sm:w-64 font-medium text-slate-700 shadow-sm"
            />
          </div>

          {isAdmin && (
            <div className="flex items-center gap-4 bg-white p-2.5 rounded-2xl border-2 border-indigo-100 shadow-xl shadow-indigo-50">
              <div className="flex items-center gap-3 px-4 py-1 border-r border-slate-100">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Admin Control</span>
                <button 
                  onClick={() => setEditMode(!editMode)}
                  className={`
                    w-14 h-7 rounded-full transition-all relative flex items-center
                    ${editMode ? 'bg-indigo-600' : 'bg-slate-300'}
                  `}
                  aria-label="Toggle edit mode"
                >
                  <div className={`
                    absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out
                    ${editMode ? 'translate-x-8' : 'translate-x-1'}
                  `} />
                </button>
              </div>
              {editMode && (
                <button 
                  onClick={() => setEditingChapter({ chapter: null, index: null })}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  <span className="text-lg">+</span> Chapter
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {isAdmin && !editMode && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-semibold flex items-center gap-3 animate-pulse">
          <span>⚠️</span> চ্যাপ্টার অ্যাড বা ডিলিট করতে উপরে ডান পাশের <b>Admin Control</b> সুইচটি অন করুন।
        </div>
      )}

      {filteredChapters.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="text-7xl mb-6 animate-pulse">📖</div>
          <h3 className="text-2xl font-bold text-slate-400 font-bengali">
            {searchQuery ? "No matching chapters found." : "No resources available for this subject."}
          </h3>
          {isAdmin && editMode && (
            <p className="text-indigo-500 mt-4 font-bold cursor-pointer hover:underline" onClick={() => setEditingChapter({ chapter: null, index: null })}>
              প্রথম চ্যাপ্টারটি যোগ করতে এখানে ক্লিক করুন!
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredChapters.map((ch) => {
            const originalIndex = chapters.indexOf(ch);
            return (
              <ChapterCard 
                key={`${subjectKey}-${originalIndex}`}
                chapter={ch}
                isAdmin={isAdmin && editMode}
                onEdit={() => setEditingChapter({ chapter: ch, index: originalIndex })}
                onDelete={() => handleDelete(originalIndex)}
              />
            );
          })}
        </div>
      )}

      {editingChapter && (
        <EditorModal 
          chapter={editingChapter.chapter} 
          index={editingChapter.index}
          onClose={() => setEditingChapter(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Dashboard;
