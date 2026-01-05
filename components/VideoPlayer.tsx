
import React, { useEffect } from 'react';
import { Resource } from '../types';

interface VideoPlayerProps {
  chapterName: string;
  videoUrl: string;
  resources: Resource[];
  onBack: () => void;
  currentUser: string;
  onLogAction: (user: string, action: string, details: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  chapterName, 
  videoUrl, 
  resources, 
  onBack,
  currentUser,
  onLogAction
}) => {
  // Helper to extract YouTube ID
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const cleanUrl = url.trim();

    // Handle raw video IDs (11 chars)
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      return cleanUrl;
    }

    // Robust regex for all YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    
    // Return the ID if found (removed strict length check to catch potential edge cases, relying on regex capture)
    return (match && match[2]) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  // LOG VIEWING ACTIVITY
  useEffect(() => {
    if (chapterName && currentUser) {
      onLogAction(currentUser, 'WATCH_VIDEO', `Started watching: ${chapterName}`);
    }
  }, [chapterName, currentUser]);

  const handleMCQ = () => {
    alert("Practice MCQ Feature is coming soon! (AI Quiz Generation Integration pending)");
  };

  // Construct embed URL with origin to prevent CORS/embedding blocks
  const embedUrl = videoId 
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`
    : '';

  return (
    <div className="animate-in slide-in-from-right duration-300 pb-20">
      {/* Top Navigation Bar with Back Button */}
      <div className="flex items-center mb-6 pt-2">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 rounded-xl hover:bg-slate-50 hover:text-indigo-600 font-bold transition-all shadow-sm border border-slate-200 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> 
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-200">
        {/* Video Section */}
        <div className="aspect-video w-full bg-black relative">
          {videoId ? (
            <iframe
              key={videoId} // Force re-render on ID change
              src={embedUrl}
              title={chapterName}
              className="w-full h-full absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white bg-slate-900">
              <div className="text-center">
                <p className="text-xl mb-2">⚠️</p>
                <p>Invalid Video URL</p>
                <p className="text-xs text-slate-500 mt-2 font-mono max-w-xs truncate px-4">{videoUrl}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-6 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 font-bengali leading-tight">{chapterName}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                  One Shot Class
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={handleMCQ}
                className="flex-1 sm:flex-none justify-center px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              >
                <span>📝</span> Practice MCQ
              </button>
              
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none justify-center px-6 py-3.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold hover:bg-rose-100 transition-all flex items-center gap-2"
              >
                <span>▶</span> Watch on YouTube
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Lecture Notes & Resources
              </h3>
              <div className="space-y-3">
                {resources.filter(r => r.pdf).length > 0 ? (
                  resources.filter(r => r.pdf).map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm border border-slate-100">
                          📄
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 font-bengali text-sm md:text-base">{res.label}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PDF Resource</p>
                        </div>
                      </div>
                      <a 
                        href={res.pdf} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="shrink-0 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        Download
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400 italic text-sm">No PDF notes uploaded for this chapter.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                  <span>💡</span> Study Tip
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  ভিডিও দেখার সময় নোট নিন। কোনো কনসেপ্ট না বুঝলে পজ করুন এবং আমাদের <span className="text-indigo-600 font-bold">AI Assistant</span> কে প্রশ্ন করুন।
                </p>
              </div>
              
              <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                 <h3 className="font-bold text-rose-900 mb-2 flex items-center gap-2">
                  <span>⚠️</span> Notice
                </h3>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  ভিডিও প্লে না হলে 'Watch on YouTube' বাটনে ক্লিক করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
