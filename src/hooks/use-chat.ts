import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Conversation, Message } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (typeof window !== 'undefined') {
    const token = getCookie("better-auth.session_token");
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

/**
 * Custom hook to manage streaming chat contextually over documents.
 * Includes typing indicators, suggested followups, and clear history triggers.
 */
export function useChat(documentId?: string) {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);

  // 1. Fetch conversations for a specific document
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const res = await api.get<{ conversations: Conversation[] }>(`/chats/conversations?documentId=${documentId}`);
      return res.conversations;
    },
    enabled: !!documentId,
  });

  const currentConversationId = activeConversationId || (conversations.length > 0 ? conversations[0]?.id : null) || null;

  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0]?.id || null);
    }
  }, [conversations, activeConversationId]);

  // 2. Fetch messages in the active conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];
      const res = await api.get<{ messages: Message[] }>(`/chats/conversations/${currentConversationId}/messages`);
      return res.messages;
    },
    enabled: !!currentConversationId,
  });

  // 3. Custom message sender with SSE streaming reader
  const sendMessageStream = async (text: string) => {
    if (!documentId) throw new Error('Document ID is required to chat.');
    
    setIsStreaming(true);
    setStreamingText('');
    setSuggestedFollowUps([]);

    // Optimistically update UI by appending user message in UI state or cache
    const tempUserMsg: Message = {
      id: `temp-user-${Date.now()}`,
      sender: 'user',
      text,
      createdAt: new Date().toISOString()
    };

    // Temporarily add user message to list to show instant feedback
    queryClient.setQueryData<Message[]>(['messages', currentConversationId], (old = []) => [
      ...old,
      tempUserMsg
    ]);

    try {
      const response = await fetch(`${BASE_URL}/chats/message/stream`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          documentId,
          text,
          conversationId: currentConversationId,
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Streaming failed to initiate.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No body stream reader available.');

      let accumulated = '';
      let partialLine = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split('\n');
        partialLine = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'chunk') {
                accumulated += parsed.text;
                setStreamingText(accumulated);
              } else if (parsed.type === 'done') {
                setIsStreaming(false);
                setStreamingText('');
                
                if (parsed.suggestedFollowUp) {
                  setSuggestedFollowUps(parsed.suggestedFollowUp);
                }

                if (!activeConversationId) {
                  setActiveConversationId(parsed.conversationId);
                }

                // Invalidate query caches to load final synced messages list from MongoDB
                queryClient.invalidateQueries({ queryKey: ['conversations', documentId] });
                queryClient.invalidateQueries({ queryKey: ['messages', parsed.conversationId] });
              }
            } catch (e) {
              console.error('Error parsing SSE event stream chunk:', e);
            }
          }
        }
      }

    } catch (err: any) {
      setIsStreaming(false);
      setStreamingText('');
      alert(err.message || 'Streaming transaction failed.');
    }
  };

  // 4. Clear conversation history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!currentConversationId) return;
      return api.delete<{ message: string }>(`/chats/conversations/${currentConversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', currentConversationId] });
      setSuggestedFollowUps([]);
      setStreamingText('');
    }
  });

  return {
    conversations,
    loadingConversations,
    activeConversationId: currentConversationId,
    setActiveConversationId,
    messages,
    loadingMessages,
    sendMessage: sendMessageStream,
    isSending: isStreaming,
    streamingText,
    suggestedFollowUps,
    clearHistory: clearHistoryMutation.mutateAsync,
    isClearing: clearHistoryMutation.isPending,
  };
}
export default useChat;
