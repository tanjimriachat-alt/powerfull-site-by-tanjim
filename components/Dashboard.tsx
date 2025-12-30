
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
  
  // Real-time listener for archive data specifically
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
      alert("সেভ করতে সমস্যা হয়েছে।");
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
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 font-bengali tracking-tight flex items-center gap-4">
            {isArchiveMode && <span className="text-amber-500 text-3xl">📦</span>}
            {isArchiveMode ? "Resource Archive" : SUBJECT_NAMES[subjectKey]}
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg font-bengali">
            {isArchiveMode ? `${SUBJECT_NAMES[archiveSubSubject]} এর পুরনো ক্লাস ও নোটসমূহ` : `${SUBJECT_NAMES[subjectKey]} এর লেটেস্ট ক্লাস ও নোটসমূহ`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all w-full sm:w-64 font-medium text-slate-700 shadow-sm"
            />
          </div>

          {isAdmin && (
            <div className="flex items-center gap-4 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 px-4 py-1 border-r border-slate-100">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Admin Mode</span>
                <button 
                  onClick={() => setEditMode(!editMode)}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center ${editMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform duration-300 ${editMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              {editMode && (
                <button 
                  onClick={() => setEditingChapter({ chapter: null, index: null })}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
                >
                  + Add Chapter
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Subject Sub-navigation for Archive Mode */}
      {isArchiveMode && (
        <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {Object.entries(SUBJECT_NAMES).map(([key, name]) => (
              key !== 'archive' && (
                <button
                  key={key}
                  onClick={() => setArchiveSubSubject(key as SubjectKey)}
                  className={`
                    px-5 py-2.5 rounded-2xl font-bold text-sm transition-all border
                    ${archiveSubSubject === key 
                      ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200' 
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-amber-50'}
                  `}
                >
                  {name}
                </button>
              )
            ))}
          </div>
        </div>
      )}

      {filteredChapters.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="text-8xl mb-8 opacity-20">📂</div>
          <h3 className="text-2xl font-bold text-slate-400 font-bengali">
            {searchQuery ? "খুঁজে পাওয়া যায়নি" : "এই সেকশনে কোনো কন্টেন্ট নেই"}
          </h3>
          {isAdmin && editMode && (
            <button 
              onClick={() => setEditingChapter({ chapter: null, index: null })}
              className="mt-6 text-indigo-600 font-bold hover:underline"
            >
              নতুন চ্যাপ্টার যোগ করতে এখানে ক্লিক করুন
            </button>
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
