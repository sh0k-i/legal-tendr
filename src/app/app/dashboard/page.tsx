'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Skeleton } from '@/components/ui/skeleton';

// Import types from AppContext
import type { Case, Conversation, LawyerProfile } from '@/types';

export default function DashboardPage() {
  const { user, userProfile, isLoading: authLoading } = useAuth();
  const { clientCases, conversations, lawyerProfiles, isLoading } = useApp();
  
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  
  useEffect(() => {
    if (user && clientCases) {
      // Filter cases by the current user's ID and take the 3 most recent ones
      const userCases = clientCases
        .filter((caseItem: Case) => caseItem.client_id === user.id)
        .sort((a: Case, b: Case) => {
          const dateA = a.updated_at ? new Date(a.updated_at) : new Date(a.created_at);
          const dateB = b.updated_at ? new Date(b.updated_at) : new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 3);
      
      setRecentCases(userCases);
    }
    
    if (user && conversations) {
      // Filter conversations by the current user's ID and take the 3 most recent ones
      const userConversations = (conversations as any[])
        .filter((convo) => convo.client_id === user.id)
        .sort((a: Conversation, b: Conversation) => {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        })
        .slice(0, 3);
      
      setRecentConversations(userConversations);
    }
  }, [user, clientCases, conversations]);
  
  return (
    <div className="p-4 md:p-6 scrollbar-container">
      <header className="mb-6 md:mb-8">
        {authLoading ? (
          <Skeleton className="h-10 w-64 mb-2" />
        ) : (
          <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userProfile?.first_name || 'User'}!</h1>
        )}
        <p className="text-gray-500 md:text-lg">Here's what's happening with your legal matters</p>
      </header>
      
      {/* Desktop layout grid */}
      <div className="md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      
      {/* Recent Cases Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Recent Cases</CardTitle>
          <CardDescription>Your active legal cases</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading.cases ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : recentCases.length > 0 ? (
            <div className="space-y-4">
              {recentCases.map(caseItem => (
                <div key={caseItem.case_id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{caseItem.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      caseItem.status === 'open' 
                        ? 'bg-blue-100 text-blue-800' 
                        : caseItem.status === 'in_progress' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {caseItem.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{caseItem.description}</p>
                  <Link 
                    href={`/app/cases/${caseItem.case_id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You don't have any cases yet.</p>
          )}
        </CardContent>
        <CardFooter>
          <Link 
            href="/app/my-cases"
            className="w-full text-center legal-gradient-text font-medium py-2 hover:underline"
          >
            View All Cases
          </Link>
        </CardFooter>
      </Card>
      
      {/* Recent Messages Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>Your conversations with lawyers</CardDescription>
        </CardHeader>
        <CardContent>
          {recentConversations.length > 0 ? (
            <div className="space-y-4">
              {recentConversations.map(convo => {
                const lawyer = (lawyerProfiles as any[]).find((l) => l.lawyer_id === convo.lawyer_id);
                return (
                  <div key={convo.conversation_id} className="flex items-center p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 mr-3">
                      {lawyer?.profile_picture_url && (
                        <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${lawyer.profile_picture_url})` }}></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {lawyer ? `${lawyer.first_name} ${lawyer.last_name}` : 'Unknown Lawyer'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">Last updated: {new Date(convo.updated_at).toLocaleDateString()}</p>
                    </div>
                    <Link 
                      href={`/app/messages/${convo.conversation_id}`}
                      className="text-sm text-primary hover:underline ml-2"
                    >
                      View →
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">You don't have any conversations yet.</p>
          )}
        </CardContent>
        <CardFooter>
          <Link 
            href="/app/messages"
            className="w-full text-center legal-gradient-text font-medium py-2 hover:underline"
          >
            View All Messages
          </Link>
        </CardFooter>
      </Card>
      
      {/* Helpful Links Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Helpful Links</CardTitle>
          <CardDescription>Resources to help you navigate your legal journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link 
              href="/about"
              className="block p-3 border rounded-lg text-primary hover:bg-gray-50"
            >
              About LegalTendr
            </Link>
            <Link 
              href="/blog"
              className="block p-3 border rounded-lg text-primary hover:bg-gray-50"
            >
              Legal Blog
            </Link>
            <Link 
              href="/faq"
              className="block p-3 border rounded-lg text-primary hover:bg-gray-50"
            >
              Frequently Asked Questions
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
