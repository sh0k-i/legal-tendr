'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
// Import types directly from the source
import type { Conversation as ConversationType, LawyerProfile as LawyerProfileType, Message } from '@/types';

export default function MessagesPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { conversations, userMatches, lawyerProfiles, isLoading } = useApp();
  // Type-assert the imported objects to match our expected types
  const typedConversations = conversations as ConversationType[];
  const typedLawyerProfiles = lawyerProfiles as LawyerProfileType[];
  
  // We don't need to manage matched lawyers from localStorage anymore
  // The conversations data will come directly from the database via AppContext
  
  // Function to get lawyer profile by ID with proper type assertion
  const getLawyerProfile = (lawyerId: string): LawyerProfileType | undefined => {
    const lawyer = typedLawyerProfiles.find(lawyer => lawyer.lawyer_id === lawyerId);
    return lawyer ? lawyer as LawyerProfileType : undefined;
  };
  
  // Function to get messages for a conversation
  const getConversationMessages = (conversationId: string): Message[] => {
    const conversation = typedConversations.find(c => c.conversation_id === conversationId);
    return conversation?.messages || [];
  };
  
  // Filter conversations relevant to the current user
  const userConversations = userProfile ? 
    typedConversations.filter(conv => {
      if (userProfile.profileType === 'client') {
        return conv.client_id === userProfile.client_id;
      } else if (userProfile.profileType === 'lawyer') {
        return conv.lawyer_id === userProfile.lawyer_id;
      }
      return false;
    }) : [];
  
  // We only need to use the actual conversations from the database
  // When a user swipes right, a conversation is automatically created in the database
  const allConversations = [...userConversations];
  
  // No need to create placeholder conversations anymore as they're created in real-time
  // when the user swipes right on a lawyer
  
  // Sort conversations by last message date (most recent first)
  const sortedConversations = [...allConversations].sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  }) as ConversationType[];

  // Show loading state while data is being fetched
  if (isLoading.conversations || isLoading.lawyers) {
    return (
      <div className="flex flex-col h-full p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-gray-500">Your conversations</p>
        </header>
        
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="flex items-center">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0 mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-36 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 scrollbar-container">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-gray-500">
          {userProfile?.profileType === 'client' 
            ? 'Your conversations with lawyers' 
            : 'Your conversations with clients'}
        </p>
      </header>
      
      {sortedConversations.length > 0 ? (
        <div className="space-y-3">
          {sortedConversations.map(conversation => {
            // Determine the other party in the conversation
            const isClient = userProfile?.profileType === 'lawyer';
            const otherPartyId = isClient ? conversation.client_id : conversation.lawyer_id;
            
            // Get lawyer profile or client profile
            // Get the lawyer profile
            const lawyerProfile = isClient ? undefined : getLawyerProfile(conversation.lawyer_id);
            // Get messages, ensuring it's always an array
            const messages = getConversationMessages(conversation.conversation_id);
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            
            return (
              <Link 
                key={conversation.conversation_id} 
                href={`/app/messages/${conversation.conversation_id}`}
              >
                <Card className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 mr-3">
                      {lawyerProfile?.profile_picture_url ? (
                        <div 
                          className="w-12 h-12 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${lawyerProfile.profile_picture_url})` }}
                        ></div>
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200">
                          <span className="text-lg font-bold text-gray-400">
                            {lawyerProfile?.first_name?.[0]}{lawyerProfile?.last_name?.[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium truncate">
                          {lawyerProfile 
                            ? `${lawyerProfile.first_name} ${lawyerProfile.last_name}` 
                            : isClient ? 'Client' : 'Lawyer'}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {lastMessage?.timestamp ? new Date(lastMessage.timestamp).toLocaleDateString() : 
                           conversation.updated_at ? new Date(conversation.updated_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage ? lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                    
                    {/* Unread indicator if there are unread messages */}
                    {messages && messages.some((m: Message) => !m.is_read && m.sender_id !== userProfile?.user_id) && (
                      <div className="w-3 h-3 rounded-full bg-blue-500 ml-2"></div>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="mb-4 p-4 rounded-full bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Messages Yet</h3>
          {userProfile?.profileType === 'client' ? (
            <>
              <p className="text-gray-500 mb-6">Start matching with lawyers to begin conversations</p>
              <Link 
                href="/app/discover"
                className="text-primary hover:underline"
              >
                Discover Lawyers
              </Link>
            </>
          ) : (
            <p className="text-gray-500 mb-6">You'll see messages from clients here once they contact you</p>
          )}
        </div>
      )}
    </div>
  );
}
