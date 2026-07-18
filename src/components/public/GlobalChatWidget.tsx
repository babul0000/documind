'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, X, Bot, Sparkles, HelpCircle, Copy, RotateCcw, Trash2 
} from 'lucide-react';
import { Spinner } from '../ui/spinner';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [lastUserQuestion, setLastUserQuestion] = useState<string>('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'How do I upload a document?',
    'What features does DocuMind offer?',
    'Can you summarize text files?'
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isSendingChat]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSendingChat) return;

    setLastUserQuestion(textToSend);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: Math.random().toString(), sender: 'user', text: textToSend, timestamp };
    
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const apiHistory = chatHistory.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text
      }));

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/documents/public/general/chat-stream`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ text: textToSend, history: apiHistory })
      });

      if (!response.body) {
        throw new Error('Streaming response body missing.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseAccumulated = '';

      const aiMsgId = Math.random().toString();
      setChatHistory((prev) => [...prev, { id: aiMsgId, sender: 'ai', text: '', timestamp }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const rawText = decoder.decode(value);
        const lines = rawText.split('\n');

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const cleanLine = line.trim().slice(5).trim();
              const dataObj = JSON.parse(cleanLine);
              if (dataObj.type === 'chunk') {
                aiResponseAccumulated += dataObj.text;
                setChatHistory((prev) => {
                  const updated = [...prev];
                  const target = updated.find((m) => m.id === aiMsgId);
                  if (target) {
                    target.text = aiResponseAccumulated;
                  }
                  return updated;
                });
              } else if (dataObj.type === 'done') {
                if (dataObj.suggestedFollowUp) {
                  setSuggestedQuestions(dataObj.suggestedFollowUp);
                }
              }
            } catch (err) {
              // Ignore line parse discrepancies
            }
          }
        }
      }

    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { id: Math.random().toString(), sender: 'ai', text: 'Connection error. Unable to contact DocuMind Assistant.', timestamp }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Response copied to clipboard!');
  };

  const regenerateLastMessage = () => {
    if (lastUserQuestion) {
      handleSendMessage(lastUserQuestion);
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer animate-in zoom-in"
        aria-label="Toggle Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Floating Chat Container overlay */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-[360px] sm:w-[380px] h-[520px] rounded-2xl border border-border bg-card-bg shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="border-b border-border p-4.5 bg-muted-bg/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0">
                <Bot className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-foreground">DocuMind Assistant</h3>
                <p className="text-[9px] text-zinc-550 leading-tight">Virtual Assistant - Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-550 hover:text-white transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Chat log body */}
          <div className="flex-1 overflow-y-auto p-4.5 space-y-4 bg-zinc-950/20 text-xs">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted space-y-3.5 py-12">
                <Sparkles className="h-10 w-10 text-indigo-500/25 animate-bounce" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-xs">DocuMind General Agent</h4>
                  <p className="text-[10px] text-zinc-500 max-w-[220px] mx-auto leading-relaxed">
                    Ask me how to upload files, verify guidelines compliance, or extract insights.
                  </p>
                </div>
              </div>
            ) : (
              chatHistory.map((msg) => (
                <div key={msg.id} className={`space-y-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[85%] rounded-xl p-3.5 text-[11px] leading-relaxed text-left ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-muted-bg border border-border text-zinc-350 rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-2 justify-end px-1 pt-0.5 text-[8px] text-zinc-650 font-extrabold uppercase tracking-wider">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'ai' && msg.text.length > 0 && (
                      <button 
                        onClick={() => copyToClipboard(msg.text)}
                        className="hover:text-white transition-colors cursor-pointer"
                        title="Copy response"
                      >
                        <Copy className="h-3 w-3 inline" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {isSendingChat && (
              <div className="flex max-w-[85%] mr-auto rounded-xl p-3.5 bg-muted-bg border border-border text-zinc-400 rounded-bl-none items-center gap-2">
                <Spinner size="sm" />
                <span className="text-[10px] font-semibold animate-pulse text-zinc-500">Consulting memory database...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions */}
          {chatHistory.length === 0 ? (
            <div className="p-4 border-t border-border bg-background/50 space-y-2.5">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted">
                <span>Suggested Prompts</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {suggestedQuestions.slice(0, 3).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={isSendingChat}
                    className="w-full text-left p-2 rounded-xl border border-border bg-card-bg text-[10px] text-zinc-450 hover:text-white hover:bg-muted-bg transition-all cursor-pointer font-semibold truncate leading-normal"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 border-t border-border bg-background/30 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted">
              <span>Chat Session Active</span>
              <div className="flex gap-2.5">
                <button onClick={regenerateLastMessage} className="hover:text-white flex items-center gap-1 cursor-pointer">
                  <RotateCcw className="h-2.5 w-2.5" /> <span>Regenerate</span>
                </button>
                <button onClick={clearChatHistory} className="hover:text-rose-450 flex items-center gap-1 cursor-pointer text-zinc-650">
                  <Trash2 className="h-2.5 w-2.5" /> <span>Clear Chat</span>
                </button>
              </div>
            </div>
          )}

          {/* Input control */}
          <div className="p-4 border-t border-border bg-card-bg">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(chatInput);
                }}
                placeholder={isSendingChat ? 'Consulting core...' : 'Ask the DocuMind assistant...'}
                disabled={isSendingChat}
                className="flex-1 h-10.5 bg-background border border-border rounded-xl px-4 text-xs text-foreground placeholder-muted focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <button
                onClick={() => handleSendMessage(chatInput)}
                disabled={isSendingChat || !chatInput.trim()}
                className="h-10.5 w-10.5 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
