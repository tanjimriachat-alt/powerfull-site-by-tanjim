
import React, { useState, useRef, useEffect } from 'react';
import { getStudyHelp, StudyHelpResponse } from '../geminiService';

interface Message {
  role: 'user' | 'ai';
  text: string;
  citations?: { title: string; uri: string }[];
}

interface AIAssistantProps {
  context: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleAsk = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const result: StudyHelpResponse = await getStudyHelp(userMsg, context);
    setMessages(prev => [...prev, { 
      role: 'ai', 
      text: result.text, 
      citations: result.citations 
    }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {isOpen ? (
        <div className="bg-white w-[90vw] md:w-96 rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col max-h-[36rem] animate-in fade-in slide-in-from-bottom-6 duration-300 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-2xl text-white backdrop-blur-sm">✨</div>
              <div>
                <h3 className="text-white font-bold leading-none">Nexus Tutor by TJ</h3>
                <p className="text-indigo-100 text-[10px] mt-1 font-bold uppercase tracking-widest">AI Study Guide</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4">💡</div>
                <p className="text-slate-500 font-semibold text-sm font-bengali leading-relaxed">
                  আসসালামু আলাইকুম! কোনো প্রশ্ন থাকলে এখানে লিখতে পারেন। আমি আপনার পড়াশোনায় সাহায্য করার জন্য প্রস্তুত।
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`
                  max-w-[90%] p-5 rounded-[1.5rem] text-sm font-bengali leading-relaxed shadow-sm
                  ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}
                `}>
                  {m.text}
                </div>
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.citations.map((cite, idx) => (
                      <a 
                        key={idx} 
                        href={cite.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1 border border-indigo-100"
                      >
                        🔗 {cite.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-5 rounded-[1.5rem] rounded-tl-none flex gap-1.5 shadow-sm">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="Ask your query..."
              className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bengali text-sm shadow-inner"
            />
            <button 
              onClick={handleAsk}
              disabled={loading}
              className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              🚀
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-2xl shadow-indigo-300 hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all animate-bounce-slow"
        >
          💡
        </button>
      )}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
    