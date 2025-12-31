
import React, { useState, useEffect, useRef } from 'react';
import { ArticleContent } from './components/ArticleContent.tsx';
import { EDITOR_INSIGHTS, NOTE_ARTICLE_TEXT } from './constants.tsx';
import { getEditorAdvice } from './services/geminiService.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'read' | 'editor'>('read');
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'editor') setActiveTab('editor');
    
    // 現在のURLをデフォルト値として設定
    const baseUrl = window.location.origin + window.location.pathname;
    setCustomUrl(baseUrl);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopyForNote = () => {
    navigator.clipboard.writeText(NOTE_ARTICLE_TEXT).then(() => {
      triggerToast('📋 記事本文をコピーしました！');
    });
  };

  const generateFinalUrl = () => {
    let base = customUrl.trim();
    if (!base) return '';
    base = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${base}?tab=editor`;
  };

  const handleConfirmCopyLink = () => {
    const finalUrl = generateFinalUrl();
    navigator.clipboard.writeText(finalUrl).then(() => {
      triggerToast('🔗 診断URLをコピーしました！');
      setShowUrlModal(false);
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMsg = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await getEditorAdvice(userProfile || "一般的な検討者", userInput);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "エラーが発生しました。" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce text-sm font-bold">
          {toastMessage}
        </div>
      )}

      {/* URL Confirmation Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">診断リンクの生成</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              GitHub Pagesなどで公開した後のURLをここに入力してください。noteの読者を「診断タブ」へ直接誘導できます。
            </p>
            <input 
              type="text" 
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm mb-4"
              placeholder="https://[ユーザー名].github.io/[リポジトリ名]"
            />
            <div className="bg-slate-50 p-3 rounded-xl mb-6">
              <p className="text-[10px] text-slate-400 font-bold mb-1">コピーされるリンク:</p>
              <code className="text-xs text-blue-600 break-all">{generateFinalUrl()}</code>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowUrlModal(false)} className="flex-1 py-3 font-bold text-slate-500">閉じる</button>
              <button onClick={handleConfirmCopyLink} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">URLをコピー</button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">E</div>
            Editor Pro 2026
          </div>
          <nav className="flex gap-2">
            <button onClick={() => setActiveTab('read')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeTab === 'read' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}>記事を読む</button>
            <button onClick={() => setActiveTab('editor')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeTab === 'editor' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}>編集者に相談</button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {activeTab === 'read' ? (
          <div>
            <div className="flex justify-end gap-2 mb-8 sticky top-24 z-40">
              <button onClick={handleCopyForNote} className="bg-white border border-slate-200 px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-slate-50">本文コピー</button>
              <button onClick={() => setShowUrlModal(true)} className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-full text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-100">診断URL生成</button>
            </div>
            <ArticleContent />
            <div className="mt-16 p-8 bg-slate-900 rounded-3xl text-white text-center">
              <h3 className="text-xl font-bold mb-4">あなたの適性を診断しませんか？</h3>
              <button onClick={() => setActiveTab('editor')} className="bg-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">診断をはじめる</button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto h-[600px] flex flex-col bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
            <div className="p-4 bg-white border-b border-slate-200">
              <h2 className="font-bold text-slate-800">AI副業・伴走メンター</h2>
              <p className="text-xs text-slate-500">あなたの現在の状況に合わせてアドバイスします</p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <p className="mb-4">まずはあなたのプロフィールを教えてください</p>
                  <input 
                    type="text" 
                    value={userProfile}
                    onChange={(e) => setUserProfile(e.target.value)}
                    placeholder="例：30代・営業職・副業未経験"
                    className="w-full max-w-sm p-3 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-slate-400 text-xs animate-pulse">編集者が入力中...</div>}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2">
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="メッセージを入力..."
                className="flex-1 p-2 border border-slate-200 rounded-lg"
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">送信</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
