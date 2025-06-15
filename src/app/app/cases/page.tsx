'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PlusCircle, Clock, ArrowRight, Filter, Briefcase } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

// Define the Case type with optional specialties
type CaseWithSpecialties = {
  case_id: string;
  title: string;
  description: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  hired_lawyer_id?: string;
  specialties?: { specialty_id: string; name: string }[];
};

export default function CasesPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { clientCases, isLoading, refreshClientCases } = useApp();
  const [filteredStatus, setFilteredStatus] = useState<string | null>(null);

  // Ensure client cases are loaded
  useEffect(() => {
    if (user && !isLoading && clientCases.length === 0) {
      refreshClientCases();
    }
  }, [user, isLoading, clientCases, refreshClientCases]);

  // Get filtered cases
  const filteredCases = filteredStatus 
    ? clientCases.filter(c => c.status === filteredStatus)
    : clientCases;

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get formatted status text
  const getStatusText = (status: string) => {
    return status.replace('_', ' ');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-center text-gray-500">Loading cases...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">My Cases</h1>
        <p className="text-gray-500">Manage your legal inquiries</p>
      </header>
      
      {/* Filters & Create button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button 
            variant={filteredStatus === null ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilteredStatus(null)}
          >
            All
          </Button>
          <Button 
            variant={filteredStatus === 'open' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilteredStatus('open')}
          >
            Open
          </Button>
          <Button 
            variant={filteredStatus === 'in_progress' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilteredStatus('in_progress')}
          >
            In Progress
          </Button>
          <Button 
            variant={filteredStatus === 'closed' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilteredStatus('closed')}
          >
            Closed
          </Button>
        </div>
        
        <Button className="legal-gradient-bg text-white">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </div>
      
      {/* Cases list */}
      {filteredCases.length > 0 ? (
        <div className="space-y-4">
          {filteredCases.map((caseItem: CaseWithSpecialties) => (
            <Card key={caseItem.case_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <Link 
                  href={`/app/cases/${caseItem.case_id}`}
                  className="block p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-medium">{caseItem.title}</h2>
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {caseItem.description}
                      </p>
                      
                      <div className="flex items-center mt-2 space-x-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClasses(caseItem.status)}`}>
                          {getStatusText(caseItem.status)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(caseItem.created_at)}
                        </span>
                      </div>
                      
                      {/* Case specialties */}
                      {caseItem.specialties && caseItem.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {caseItem.specialties.slice(0, 2).map(specialty => (
                            <span 
                              key={specialty.specialty_id}
                              className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-full"
                            >
                              {specialty.name}
                            </span>
                          ))}
                          {caseItem.specialties.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{caseItem.specialties.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="font-medium mb-2">No cases found</h3>
          <p className="text-gray-500 mb-6">
            {filteredStatus 
              ? `You don't have any ${getStatusText(filteredStatus)} cases.` 
              : "You haven't created any legal cases yet."}
          </p>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create a New Case
          </Button>
        </div>
      )}
    </div>
  );
}
