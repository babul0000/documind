import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Conversation, Message } from '../types';

/**
 * Custom hook to manage chatting contextually over documents.
 */
export function useChat(documentId?: string) {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

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

  // Fallback to activeConversationId or the first conversation in the list
  const currentConversationId = activeConversationId || (conversations.length > 0 ? conversations[0]?.id : null) || null;

  // Sync activeConversationId if a new list comes in and nothing was selected
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

  // 3. Send message mutation
  const sendMsgMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!documentId) throw new Error('Document ID is required to chat.');
      return api.post<{ conversationId: string; userMessage: Message; aiMessage: Message }>('/chats/message', {
        documentId,
        text,
        conversationId: currentConversationId,
      });
    },
    onSuccess: (data) => {
      if (!activeConversationId) {
        setActiveConversationId(data.conversationId);
      }
      queryClient.invalidateQueries({ queryKey: ['conversations', documentId] });
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
    },
  });

  return {
    conversations,
    loadingConversations,
    activeConversationId: currentConversationId,
    setActiveConversationId,
    messages,
    loadingMessages,
    sendMessage: sendMsgMutation.mutateAsync,
    isSending: sendMsgMutation.isPending,
  };
}
export default useChat;
