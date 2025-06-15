'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ArrowLeft, Send, Briefcase, PlusCircle, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useMessages } from '@/contexts/MessageContext';
import { Message, Case } from '@/types';

interface LoadingState {
  conversations: boolean;
  messages: boolean;
}

interface MessagesLoadingState {
  conversations: boolean;
  messages: boolean;
  [key: string]: boolean;
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const conversationId = params.conversationId as string;
  const { user } = useAuth();
  const { clientCases, refreshClientCases } = useApp();
  const { conversations, messages, getMessages, sendMessage, isLoading: messagesLoading } = useMessages();
  
  const [newMessage, setNewMessage] = useState('');
  const [isSendCaseOpen, setIsSendCaseOpen] = useState(false);
  const [isBuildCaseOpen, setIsBuildCaseOpen] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get the current conversation
  const conversation = conversations && Array.isArray(conversations) ? 
    conversations.find(c => c.conversation_id === conversationId) : null;
  
  // Load messages for this conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) return;
      
      setIsLoadingConversation(true);
      try {
        const fetchedMessages = await getMessages(conversationId);
        setConversationMessages(fetchedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingConversation(false);
      }
    };
    
    loadMessages();
  }, [conversationId, getMessages, toast]);
  
  // Update conversationMessages when messages state changes
  useEffect(() => {
    if (messages[conversationId]) {
      setConversationMessages(messages[conversationId]);
    }
  }, [messages, conversationId]);
  
  // No need for an additional useEffect to update loading state
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);
  
  // Load client cases
  useEffect(() => {
    if (user?.user_metadata?.user_type === 'client') {
      refreshClientCases();
    }
  }, [user, refreshClientCases]);
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;
    
    try {
      const success = await sendMessage(conversationId, newMessage);
      if (success) {
        setNewMessage('');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle sharing a case
  const handleShareCase = async (caseItem: Case) => {
    if (!conversationId) return;
    
    try {
      const caseMessage = `I'd like to discuss my case: "${caseItem.title}" - ${caseItem.description}`;
      const success = await sendMessage(conversationId, caseMessage);
      
      if (success) {
        setIsSendCaseOpen(false);
        toast({
          title: 'Success',
          description: 'Case shared successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to share case. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sharing case:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Determine if we're chatting with a lawyer or client
  const chatPartner = conversation?.lawyer;
  const isUserLawyer = user?.user_metadata?.user_type === 'lawyer';
  const isUserClient = user?.user_metadata?.user_type === 'client';
  
  if (!conversation && !messagesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-center text-gray-500">This conversation doesn't exist or you don't have access.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push('/app/messages')}
        >
          Back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-3 border-b flex items-center gap-3 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1">
          {!messagesLoading && conversation && chatPartner ? (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {chatPartner.profile_picture_url ? (
                  <Image 
                    src={chatPartner.profile_picture_url} 
                    alt={`${chatPartner.first_name} ${chatPartner.last_name}`}
                    width={40}
                    height={40}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <h2 className="font-semibold">{chatPartner.first_name} {chatPartner.last_name}</h2>
                <p className="text-xs text-gray-500">{isUserClient ? 'Lawyer' : 'Client'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          )}
        </div>
        
        {isUserClient && (
          <Button variant="ghost" size="icon" onClick={() => setIsSendCaseOpen(true)}>
            <Briefcase className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingConversation ? (
          // Loading skeleton
          <div className="space-y-4">
            <div className="flex justify-start">
              <Skeleton className="h-10 w-3/4 max-w-[80%] rounded-lg" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-2/4 max-w-[80%] rounded-lg" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-16 w-3/4 max-w-[80%] rounded-lg" />
            </div>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
            <Briefcase className="h-12 w-12 mb-4 opacity-50" />
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message below.</p>
          </div>
        ) : (
          conversationMessages.map((message) => {
            const isFromCurrentUser = message.sender_id === user?.id;
            return (
              <div 
                key={message.message_id}
                className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${isFromCurrentUser 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-700 shadow-sm rounded-bl-none'}`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${isFromCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t bg-white dark:bg-gray-800 shadow-inner">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input 
            type="text" 
            placeholder="Type a message..." 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-gray-700"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || messagesLoading}
            className="bg-blue-500 hover:bg-blue-600 legal-gradient-bg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
      
      {/* Send Case Dialog */}
      <Dialog open={isSendCaseOpen} onOpenChange={setIsSendCaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share a Case</DialogTitle>
            <DialogDescription>
              Share one of your cases with this lawyer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 my-4 max-h-[60vh] overflow-y-auto">
            {clientCases.length > 0 ? (
              clientCases.map((caseItem) => (
                <Card 
                  key={caseItem.case_id} 
                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleShareCase(caseItem)}
                >
                  <h3 className="font-medium">{caseItem.title}</h3>
                  <div className="flex items-center mb-1">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full mr-2 ${
                      caseItem.status === 'open' 
                        ? 'bg-blue-100 text-blue-800' 
                        : caseItem.status === 'in_progress' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {caseItem.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      Created: {new Date(caseItem.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{caseItem.description}</p>
                </Card>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">You don't have any cases yet.</p>
                <Button onClick={() => {
                  setIsSendCaseOpen(false);
                  router.push('/app/my-cases');
                }}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create a Case
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendCaseOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Build Case Dialog */}
      <Dialog open={isBuildCaseOpen} onOpenChange={setIsBuildCaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Case</DialogTitle>
            <DialogDescription>
              Create a new legal case to share with this lawyer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Case Title</label>
              <Input placeholder="e.g., Divorce Settlement" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[100px]"
                placeholder="Describe your legal situation in detail..."
              ></textarea>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsBuildCaseOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setIsBuildCaseOpen(false);
                setIsSendCaseOpen(false);
                // Create case functionality would go here
                refreshClientCases();
              }}
            >
              Create & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
