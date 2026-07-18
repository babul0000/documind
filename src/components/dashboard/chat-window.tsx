'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, RefreshCw } from 'lucide-react';
import { useChat } from '../../hooks/use-chat';
import { useAuth } from '../../hooks/use-auth';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';

interface ChatWindowProps {
  documentId: string;
  className?: string;
}

export function ChatWindow({ documentId, className }: ChatWindowProps) {
  const { user } = useAuth();
  const { 
    messages, 
    sendMessage, 
    isSending, 
    streamingText,
    suggestedFollowUps,
    clearHistory,
    isClearing,
    loadingMessages 
  } = useChat(documentId);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Trigger scroll to bottom on message list update or live stream ticks
  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, streamingText]);

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

  const handleSuggestionClick = async (prompt: string) => {
    if (isSending) return;
    try {
      await sendMessage(prompt);
    } catch (error) {
      console.error('Failed to send suggestion prompt:', error);
    }
  };

  const initialSuggestions = [
    'Can you summarize this document for me?',
    'What are the key takeaways or action items?',
    'Explain the main topics covered here.',
  ];

  return (
    <div className={cn('flex flex-col h-full bg-card-bg rounded-2xl border border-border overflow-hidden', className)}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-foreground">DocuMind AI Assistant</h4>
            <span className="text-[10px] text-muted font-semibold tracking-wider uppercase">Context Aware QA</span>
          </div>
        </div>

        {/* Clear History Button */}
        {messages.length > 0 && (
          <button
            onClick={() => clearHistory()}
            disabled={isClearing}
            className="h-8 px-3 rounded-lg border border-border bg-background text-xs font-bold text-muted hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Clear Chat History"
          >
            {isClearing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Messages Feed Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <svg className="animate-spin h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs text-muted font-medium">Fetching history...</span>
          </div>
        ) : messages.length === 0 && !isSending ? (
          /* Empty Initial Suggestions State */
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted-bg border border-border text-muted mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h5 className="text-sm font-bold text-foreground">Start the conversation</h5>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Ask questions about contracts, structures, tasks, or request an explanation of the document text.
            </p>
            
            <div className="mt-6 w-full space-y-2 text-left">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">Suggested prompts:</span>
              {initialSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="w-full text-xs text-muted bg-muted-bg/40 border border-border rounded-xl px-4 py-2.5 hover:border-indigo-500/20 hover:bg-muted-bg/80 transition-all text-left truncate font-semibold cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
                      : 'bg-muted-bg border-border text-indigo-400'
                  )}>
                    {isUser ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                  </div>

                  {/* Bubble content */}
                  <div className="space-y-1">
                    <div className={cn(
                      'rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm font-medium whitespace-pre-wrap',
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-muted-bg border border-border text-foreground rounded-tl-none'
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

            {/* SSE Accumulated Streaming Bubble */}
            {isSending && streamingText && (
              <div className="flex items-start gap-3.5 max-w-[85%]">
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-muted-bg border border-border text-indigo-400">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <div className="rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm font-medium whitespace-pre-wrap bg-muted-bg border border-border text-foreground rounded-tl-none">
                    {streamingText}
                  </div>
                </div>
              </div>
            )}
            
            {/* Bouncing Typing Dot Indicator while fetching first chunk */}
            {isSending && !streamingText && (
              <div className="flex items-start gap-3.5 max-w-[85%] animate-pulse">
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-muted-bg border border-border text-indigo-400">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <div className="bg-muted-bg border border-border rounded-2xl rounded-tl-none px-4 py-3 text-muted text-sm flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Follow-up Prompt Buttons */}
            {!isSending && suggestedFollowUps.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border/60 mt-4">
                <span className="text-[9px] text-muted font-extrabold uppercase tracking-wider block">Suggested Questions:</span>
                <div className="flex flex-col gap-1.5">
                  {suggestedFollowUps.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSuggestionClick(prompt)}
                      className="w-full text-xs text-muted bg-muted-bg/40 border border-border rounded-xl px-4 py-2.5 hover:border-indigo-500/20 hover:bg-muted-bg/80 transition-all text-left truncate font-semibold cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input field */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-border bg-background/40 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about the document..."
          className="flex-1 bg-muted-bg border border-border text-white rounded-xl px-4 py-3 text-xs focus:border-indigo-500 focus:outline-none placeholder-zinc-550 transition-colors"
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
