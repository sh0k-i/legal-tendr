'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/lib/supabase/client';

// Import types
import type { Case, Specialty } from '@/types';

export default function MyCasesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, isLoading: authLoading } = useAuth();
  const { clientCases, specialties, refreshClientCases, isLoading } = useApp();
  
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userCases, setUserCases] = useState<Case[]>([]);
  const [localUser, setLocalUser] = useState<any>(null);
  
  // Load session from localStorage on component mount
  useEffect(() => {
    const checkLocalSession = () => {
      try {
        const savedSession = localStorage.getItem('legaltendr_session');
        if (savedSession) {
          const parsedSession = JSON.parse(savedSession);
          if (parsedSession && parsedSession.user) {
            console.log('MyCasesPage: Retrieved local user session');
            setLocalUser(parsedSession.user);
          }
        }
      } catch (error) {
        console.error('Error checking local session:', error);
      }
    };
    
    // Only check local session if user is not already set from context
    if (!user) {
      checkLocalSession();
    } else {
      setLocalUser(user);
    }
  }, [user]);
  
  // Update user cases when client cases change or user/localUser changes
  useEffect(() => {
    const currentUser = user || localUser;
    if (currentUser && clientCases) {
      console.log('Filtering cases for user ID:', currentUser.id);
      const filtered = clientCases.filter(c => c.client_id === currentUser.id);
      console.log('Found cases:', filtered.length);
      setUserCases(filtered);
    }
  }, [user, localUser, clientCases]);
  
  // Refresh client cases when component mounts or user changes
  useEffect(() => {
    const currentUser = user || localUser;
    if (currentUser) {
      console.log('Triggering case refresh on mount or user change');
      // Force refresh cases when component mounts
      refreshClientCases(true); // Pass true to force refresh even if user context is not fully loaded
    }
  }, [refreshClientCases, user, localUser]);
  
  // Force refresh cases when the page is focused
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing cases');
      refreshClientCases();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshClientCases]);
  
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleCaseClick = (caseId: string) => {
    setSelectedCaseId(prevId => (prevId === caseId ? null : caseId));
    console.log('Case selected:', caseId);
  };

  const handleFindLawyers = () => {
    if (selectedCaseId) {
      console.log('Finding lawyers for case:', selectedCaseId);
      router.push(`/app/discover?case=${selectedCaseId}`);
    }
  };

  const handleCreateCase = async (data: any) => {
    try {
      // Log current user state for debugging
      console.log('Current user state:', user);
      console.log('Local user state:', localUser);
      
      // Try to get a valid user from either the context or local storage
      const currentUser = user || localUser;
      
      // Check for user authentication in a more thorough way
      if (!currentUser || !currentUser.id) {
        console.error('No valid user found in context or localStorage');
        toast({
          title: 'Authentication Error',
          description: 'Please try logging out and back in to resolve this issue.',
          variant: 'destructive'
        });
        return;
      }
      
      // Get client ID from the available user object
      const clientId = currentUser.id;
      
      // Create a new case in the database using Supabase
      const { error: insertError } = await supabase
        .from('cases')
        .insert([
          {
            client_id: clientId,
            title: data.title,
            description: data.description,
            status: 'open',
            created_at: new Date().toISOString()
          }
        ]);
      
      if (insertError) {
        console.error('Error inserting case:', insertError);
        throw insertError;
      }
      
      toast({
        title: "Case created",
        description: "Your new case has been created successfully.",
      });
      
      // Reset the form
      form.reset();
      
      // Close the dialog and refresh cases
      setIsDialogOpen(false);
      refreshClientCases();
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: "Error creating case",
        description: "There was a problem creating your case. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-4 pb-20 scrollbar-container">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">My Cases</h1>
        <p className="text-gray-500">Manage your legal cases</p>
      </header>
      
      {isLoading.cases ? (
        // Loading state
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : userCases.length > 0 ? (
        // Cases list when we have cases
        <div className="space-y-4">
          {userCases.map(caseItem => {
            const isSelected = selectedCaseId === caseItem.case_id;
            
            return (
              <Card 
                key={caseItem.case_id}
                className={`cursor-pointer transition-all ${isSelected ? 'border-primary' : ''}`}
                onClick={() => handleCaseClick(caseItem.case_id)}
              >
                <CardContent className="p-4">
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
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {caseItem.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {caseItem.specialties && caseItem.specialties.map((specialty: Specialty) => (
                      <span 
                        key={specialty.specialty_id}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                  
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/app/cases/${caseItem.case_id}`}>
                          View Case
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Empty state when no cases
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="mb-4 p-4 rounded-full bg-gray-100">
            <Briefcase className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Cases Yet</h3>
          <p className="text-gray-500 mb-6">Create your first legal case to get started</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            Create a Case
          </Button>
        </div>
      )}
      
      {/* Find Lawyers button (only active when a case is selected) */}
      {selectedCaseId && (
        <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center">
          <Button 
            onClick={handleFindLawyers}
            className="legal-gradient-bg text-white border-none shadow-md"
          >
            Find Lawyers
          </Button>
        </div>
      )}
      
      {/* Floating Action Button for creating a new case */}
      <div className="fixed bottom-20 right-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full legal-gradient-bg text-white border-none shadow-md">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Create a New Case</DialogTitle>
              <DialogDescription>
                Describe your legal issue to get matched with the right lawyers.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateCase)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Divorce Settlement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your legal situation in detail..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" className="w-full legal-gradient-bg text-white">
                    Create Case
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
