
import React from 'react';
import { Chapter } from '../types';

interface ChapterCardProps {
  chapter: Chapter;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {isAdmin && (
        <div className="absolute top-6 right-6 flex gap-2">
          <button 
            onClick={onEdit}
            className="p-2 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-200 transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button 
            onClick={onDelete}
            className="p-2 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      )}

      <h3 className="text-2xl font-bold text-slate-800 mb-6 font-bengali border-l-4 border-indigo-600 pl-4">
        {chapter.name}
      </h3>

      <div className="space-y-3">
        {chapter.resources && chapter.resources.map((res, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group-hover:bg-slate-100 transition-colors border border-slate-100">
            <span className="font-semibold text-slate-700 font-bengali">{res.label}</span>
            <div className="flex gap-2">
              {res.vid && (
                <a 
                  href={res.vid} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  Class
                </a>
              )}
              {res.pdf && (
                <a 
                  href={res.pdf} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                >
                  Notes
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterCard;
