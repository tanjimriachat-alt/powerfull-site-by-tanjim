
import React, { useState, useMemo, useEffect } from 'react';
import { SubjectKey, AcademyData, SUBJECT_NAMES, Chapter } from '../types';
import ChapterCard from './ChapterCard';
import EditorModal from './EditorModal';
import { set, ref, onValue } from 'firebase/database';
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
  
  // Sub-subject for archive mode
  const [archiveSubSubject, setArchiveSubSubject] = useState<SubjectKey>('p1');
  const [archiveData, setArchiveData] = useState<Chapter[]>([]);

  const isArchiveMode = subjectKey === 'archive';
  
  // Real-time listener for archive data specifically when in archive mode
  useEffect(() => {
    if (isArchiveMode) {
      const archiveRef = ref(database, `archiveData/${archiveSubSubject}`);
      const unsub = onValue(archiveRef, (snapshot) => {
        setArchiveData(snapshot.val() || []);
      });
      return () => unsub();
    }
  }, [isArchiveMode, archiveSubSubject]);

  const chapters = isArchiveMode ? archiveData : (masterData[subjectKey] || []);

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
      const path = isArchiveMode ? `archiveData/${archiveSubSubject}` : `academyData/${subjectKey}`;
      const dataRef = ref(database, path);
      await set(dataRef, subjectChapters);
      setEditingChapter(null);
    } catch (err: any) {
      console.error("Save error:", err);
      alert("সেভ করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন বা পারমিশন চেক করুন।");
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই চ্যাপ্টারটি ডিলিট করতে চান?")) return;
    
    const subjectChapters = [...chapters];
    subjectChapters.splice(index, 1);
    
    try {
      const path = isArchiveMode ? `archiveData/${archiveSubSubject}` : `academyData/${subjectKey}`;
      const dataRef = ref(database, path);
      await set(dataRef, subjectChapters);
    } catch (err: any) {
      alert("ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 font-bengali tracking-tight">
            {isArchiveMode ? "Resource Archive" : SUBJECT_NAMES[subjectKey]}
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            {isArchiveMode ? `Old Resources for ${SUBJECT_NAMES[archiveSubSubject]}` : "HSC Comprehensive Resource Hub"}
          </p>
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
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${editMode ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
              </div>
              {editMode && (
                <button 
                  onClick={() => setEditingChapter({ chapter: null, index: null })}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  <span className="text-lg">+</span> Chapter
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Archive Sub-Subject Selector */}
      {isArchiveMode && (
        <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {Object.entries(SUBJECT_NAMES).map(([key, name]) => (
              key !== 'archive' && (
                <button
                  key={key}
                  onClick={() => setArchiveSubSubject(key as SubjectKey)}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${archiveSubSubject === key ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                >
                  {name}
                </button>
              )
            ))}
          </div>
        </div>
      )}

      {isAdmin && !editMode && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-semibold flex items-center gap-3 animate-pulse">
          <span>⚠️</span> চ্যাপ্টার অ্যাড বা ডিলিট করতে উপরে ডান পাশের <b>Admin Control</b> সুইচটি অন করুন।
        </div>
      )}

      {filteredChapters.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="text-7xl mb-6 opacity-30">📚</div>
          <h3 className="text-2xl font-bold text-slate-400 font-bengali">
            {searchQuery ? "No matching chapters found." : "No resources available here."}
          </h3>
          {isAdmin && editMode && (
            <p className="text-indigo-500 mt-4 font-bold cursor-pointer hover:underline" onClick={() => setEditingChapter({ chapter: null, index: null })}>
              {isArchiveMode ? `${SUBJECT_NAMES[archiveSubSubject]} এর আর্কাইভে প্রথম চ্যাপ্টারটি যোগ করুন!` : "প্রথম চ্যাপ্টারটি যোগ করতে এখানে ক্লিক করুন!"}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredChapters.map((ch) => {
            const originalIndex = chapters.indexOf(ch);
            return (
              <ChapterCard 
                key={`${subjectKey}-${archiveSubSubject}-${originalIndex}`}
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
