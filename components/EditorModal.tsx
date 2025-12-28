
import React, { useState, useEffect } from 'react';
import { Chapter, Resource } from '../types';

interface EditorModalProps {
  chapter: Chapter | null;
  index: number | null;
  onClose: () => void;
  onSave: (chapter: Chapter, index: number | null) => void;
}

const EditorModal: React.FC<EditorModalProps> = ({ chapter, index, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [newRes, setNewRes] = useState<Resource>({ label: '', vid: '', pdf: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (chapter) {
      setName(chapter.name);
      setResources(chapter.resources || []);
    }
  }, [chapter]);

  const addResourceRow = () => {
    if (!newRes.label) return alert("Content title is required!");
    setResources([...resources, newRes]);
    setNewRes({ label: '', vid: '', pdf: '' });
  };

  const removeResource = (i: number) => {
    setResources(resources.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("Chapter name is required!");
    
    setIsSaving(true);
    try {
      await onSave({ name, resources }, index);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {index !== null ? 'Edit Chapter' : 'Add New Chapter'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Chapter Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Newton's Mechanics"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-semibold"
            />
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 space-y-4">
            <h3 className="font-bold text-indigo-900 text-sm uppercase tracking-wide">Add Resource Item</h3>
            <input 
              type="text" 
              placeholder="Label (e.g. Lecture 01)"
              value={newRes.label}
              onChange={e => setNewRes({...newRes, label: e.target.value})}
              className="w-full p-3 bg-white border border-indigo-200 rounded-xl outline-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Video Link"
                value={newRes.vid}
                onChange={e => setNewRes({...newRes, vid: e.target.value})}
                className="w-full p-3 bg-white border border-indigo-200 rounded-xl outline-none text-xs"
              />
              <input 
                type="text" 
                placeholder="PDF Link"
                value={newRes.pdf}
                onChange={e => setNewRes({...newRes, pdf: e.target.value})}
                className="w-full p-3 bg-white border border-indigo-200 rounded-xl outline-none text-xs"
              />
            </div>
            <button 
              type="button"
              onClick={addResourceRow}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              + Add to List
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Resource List</label>
            {resources.length === 0 ? (
              <p className="text-slate-400 text-center italic py-4">No resources added yet.</p>
            ) : (
              resources.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <span className="font-bold text-slate-700 text-sm">{r.label}</span>
                  <button onClick={() => removeResource(i)} className="text-rose-500 hover:text-rose-700 font-bold p-2 text-xl">✕</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className={`
              flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-200
              ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold rounded-2xl transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorModal;
