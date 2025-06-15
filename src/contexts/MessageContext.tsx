'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';
import { Message, Conversation } from '@/types';

interface MessageContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  sendMessage: (conversationId: string, content: string) => Promise<boolean>;
  createConversation: (lawyerId: string, initialMessage: string, matchId?: string) => Promise<string | null>;
  refreshConversations: () => Promise<void>;
  getMessages: (conversationId: string) => Promise<Message[]>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  isLoading: boolean;
}

const MessageContext = createContext<MessageContextType>({
  conversations: [],
  messages: {},
  sendMessage: async () => false,
  createConversation: async () => null,
  refreshConversations: async () => {},
  getMessages: async () => [],
  markAsRead: async () => {},
  isLoading: false,
});

export const useMessages = () => useContext(MessageContext);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all conversations for the current user
  const refreshConversations = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          lawyer:lawyer_id (
            lawyer_id,
            bio,
            hourly_rate,
            years_of_experience,
            user:lawyer_id (
              first_name,
              last_name,
              email,
              profile_picture_url
            )
          ),
          latest_message:latest_message_id (
            content,
            timestamp,
            is_read
          )
        `)
        .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Transform data to match our Conversation type
      const transformedData = data.map((conv: any) => ({
        conversation_id: conv.conversation_id,
        client_id: conv.client_id,
        lawyer_id: conv.lawyer_id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        lawyer: conv.lawyer ? {
          lawyer_id: conv.lawyer.lawyer_id,
          first_name: conv.lawyer.user.first_name,
          last_name: conv.lawyer.user.last_name,
          email: conv.lawyer.user.email,
          profile_picture_url: conv.lawyer.user.profile_picture_url,
          bio: conv.lawyer.bio,
          hourly_rate: conv.lawyer.hourly_rate,
          years_of_experience: conv.lawyer.years_of_experience,
          matches_count: 0, // Default values
          rating: 0,
          reviews: 0,
          // Add the missing properties required by LawyerProfile type
          city: '',  // Using empty string as default
          province: '',  // Using empty string as default
        } : undefined,
        latest_message: conv.latest_message ? {
          content: conv.latest_message.content,
          timestamp: conv.latest_message.timestamp,
          is_read: conv.latest_message.is_read,
        } : undefined,
      }));

      setConversations(transformedData);
    } catch (error) {
      console.error('Error in refreshConversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch messages for a specific conversation
  const getMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    if (!user) return [];
    
    try {
      // Check if we already have messages for this conversation
      if (messages[conversationId]) {
        return messages[conversationId];
      }
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      // Update messages state
      setMessages(prev => ({
        ...prev,
        [conversationId]: data,
      }));

      return data;
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  }, [user, messages]);

  // Send a new message in a conversation
  const sendMessage = useCallback(async (conversationId: string, content: string): Promise<boolean> => {
    if (!user || !content.trim()) return false;
    
    try {
      const timestamp = new Date().toISOString();
      
      // Create message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          timestamp,
          is_read: false,
        }])
        .select();

      if (messageError) {
        console.error('Error sending message:', messageError);
        return false;
      }

      // Update conversation's latest message
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          latest_message_id: messageData[0].message_id,
          updated_at: timestamp,
        })
        .eq('conversation_id', conversationId);

      if (updateError) {
        console.error('Error updating conversation:', updateError);
      }

      // Update local state
      const newMessage = messageData[0];
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage],
      }));

      // Refresh conversations to get updated latest_message
      await refreshConversations();
      
      return true;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return false;
    }
  }, [user, refreshConversations]);

  // Create a new conversation with a lawyer
  const createConversation = useCallback(async (lawyerId: string, initialMessage: string, matchId?: string): Promise<string | null> => {
    if (!user || !initialMessage.trim()) return null;
    
    try {
      const timestamp = new Date().toISOString();
      
      // Create conversation
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .insert([{
          client_id: user.id,
          lawyer_id: lawyerId,
          created_at: timestamp,
          updated_at: timestamp,
          match_id: matchId // Include the match ID if provided
        }])
        .select();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return null;
      }

      const conversationId = convData[0].conversation_id;
      
      // Send initial message
      const success = await sendMessage(conversationId, initialMessage);
      if (!success) {
        console.error('Failed to send initial message');
        return null;
      }
      
      // Refresh conversations
      await refreshConversations();
      
      return conversationId;
    } catch (error) {
      console.error('Error in createConversation:', error);
      return null;
    }
  }, [user, sendMessage, refreshConversations]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]): Promise<void> => {
    if (!user || messageIds.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('message_id', messageIds);

      if (error) {
        console.error('Error marking messages as read:', error);
        return;
      }

      // Update local state
      setMessages(prev => {
        const newMessages = { ...prev };
        
        Object.keys(newMessages).forEach(convId => {
          newMessages[convId] = newMessages[convId].map(msg => 
            messageIds.includes(msg.message_id) ? { ...msg, is_read: true } : msg
          );
        });
        
        return newMessages;
      });
      
      // Refresh conversations to update unread counts
      await refreshConversations();
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  }, [user, refreshConversations]);

  // Initial load of conversations
  useEffect(() => {
    if (user) {
      refreshConversations();
    } else {
      setConversations([]);
      setMessages({});
    }
  }, [user, refreshConversations]);

  // Set up real-time subscriptions for new messages
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to messages for all conversations the user is part of
    const subscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=neq.${user.id}`, // Only listen for messages not sent by current user
      }, async (payload) => {
        const newMessage = payload.new as Message;
        
        // Update local messages state
        setMessages(prev => ({
          ...prev,
          [newMessage.conversation_id]: [
            ...(prev[newMessage.conversation_id] || []),
            newMessage
          ],
        }));
        
        // Refresh conversations to get the updated latest_message
        await refreshConversations();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user, refreshConversations]);

  const value = {
    conversations,
    messages,
    sendMessage,
    createConversation,
    refreshConversations,
    getMessages,
    markAsRead,
    isLoading,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};
