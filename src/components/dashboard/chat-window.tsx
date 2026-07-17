'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Terminal } from 'lucide-react';
import { useChat } from '../../hooks/use-chat';
import { useAuth } from '../../hooks/use-auth';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';

interface ChatWindowProps {
  documentId: string;
  className?: string;
}

/**
 * Intelligent Document Assistant Chat Interface.
 * Implements real-time conversation lists, user/AI message alignment,
 * typing indicators, auto-scroll, and quick-prompt suggestions.
 */
export function ChatWindow({ documentId, className }: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, sendMessage, isSending, loadingMessages } = useChat(documentId);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const query = inputText.trim();
    setInputText('');
    
    try {
      await sendMessage(query);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputText(prompt);
  };

  const suggestions = [
    'Can you summarize this document for me?',
    'What are the key takeaways or action items?',
    'Explain the main topics covered here.',
  ];

  return (
    <div className={cn('flex flex-col h-full bg-zinc-950/20 rounded-2xl border border-zinc-900 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-900 bg-zinc-950/40">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-bold text-white">DocuMind AI Assistant</h4>
          <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Context Aware QA</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <svg className="animate-spin h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs text-zinc-500 font-medium">Fetching history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h5 className="text-sm font-bold text-zinc-300">Start the conversation</h5>
            <p className="text-xs text-zinc-500 mt-1">
              Ask questions about contracts, structures, tasks, or request an explanation of the document text.
            </p>
            
            {/* suggestions */}
            <div className="mt-6 w-full space-y-2 text-left">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Suggested prompts:</span>
              {suggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="w-full text-xs text-zinc-400 bg-zinc-900/40 border border-zinc-850 rounded-xl px-4 py-2.5 hover:border-indigo-500/20 hover:bg-zinc-900/80 transition-all text-left truncate font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={cn('flex items-start gap-3.5 max-w-[85%]', {
                    'ml-auto flex-row-reverse': isUser,
                  })}
                >
                  {/* Avatar */}
                  <div className={cn(
                    'flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl text-xs font-bold border',
                    isUser
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-zinc-900 border-zinc-850 text-indigo-400'
                  )}>
                    {isUser ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                  </div>

                  {/* Bubble */}
                  <div className="space-y-1">
                    <div className={cn(
                      'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm font-medium whitespace-pre-wrap',
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-tl-none'
                    )}>
                      {msg.text}
                    </div>
                    {/* Timestamp */}
                    <p className={cn('text-[9px] text-zinc-600 font-semibold px-1', {
                      'text-right': isUser,
                    })}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {/* Typing status */}
            {isSending && (
              <div className="flex items-start gap-3.5 max-w-[85%] animate-pulse">
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 text-indigo-400">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <div className="bg-zinc-900 border border-zinc-850 rounded-2xl rounded-tl-none px-4 py-3 text-zinc-400 text-sm flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-zinc-900 bg-zinc-950/40 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about the document..."
          className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none placeholder-zinc-500"
          disabled={isSending}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="px-4 py-3 shrink-0 rounded-xl h-11"
          disabled={!inputText.trim() || isSending}
        >
          <Send className="h-4.5 w-4.5" />
        </Button>
      </form>
    </div>
  );
}
export default ChatWindow;
