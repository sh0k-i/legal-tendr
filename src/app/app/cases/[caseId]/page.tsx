'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Briefcase, Calendar, Clock, MessageSquare } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

// Define the type for case specialties
type CaseSpecialty = {
  specialty_id: string;
  name: string;
};

// Extended Case type with specialties
type CaseWithSpecialties = {
  case_id: string;
  title: string;
  description: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  hired_lawyer_id?: string;
  specialties?: CaseSpecialty[];
};

export default function CaseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.caseId as string;
  const { user } = useAuth();
  const { clientCases, lawyerProfiles, specialties, isLoading } = useApp();
  
  const [matchingLawyers, setMatchingLawyers] = useState(lawyerProfiles);
  
  // Get the case details
  const caseData = clientCases.find(c => c.case_id === caseId) as CaseWithSpecialties | undefined;
  
  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-center text-gray-500">Loading case details...</p>
      </div>
    );
  }
  
  // If case not found, show error or redirect
  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-center text-gray-500">Case not found. It may have been deleted or you don't have access.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push('/app/cases')}
        >
          Back to My Cases
        </Button>
      </div>
    );
  }
  
  // Get case specialties 
  const caseSpecialties = caseData?.specialties || [];
  
  // Find matching lawyers based on case specialties
  useEffect(() => {
    if (caseData?.specialties && caseData.specialties.length > 0) {
      // Filter lawyers who have at least one specialty that matches the case
      const matching = lawyerProfiles.filter(lawyer => 
        lawyer.specialties?.some(lawyerSpecialty => 
          caseData.specialties!.some((caseSpecialty: CaseSpecialty) => 
            lawyerSpecialty.specialty_id === caseSpecialty.specialty_id
          )
        )
      );
      setMatchingLawyers(matching);
    } else {
      setMatchingLawyers(lawyerProfiles);
    }
  }, [caseData, lawyerProfiles]);
  
  // Get hired lawyer info if applicable
  const hiredLawyer = caseData?.hired_lawyer_id 
    ? lawyerProfiles.find(lawyer => lawyer.lawyer_id === caseData.hired_lawyer_id)
    : null;

  return (
    <div className="flex flex-col h-full p-4">
      <header className="mb-6">
        <Button 
          variant="ghost" 
          className="p-0 mb-2" 
          onClick={() => router.push('/app/my-cases')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Cases
        </Button>
        <h1 className="text-2xl font-bold">{caseData.title}</h1>
        <div className="flex items-center mt-1">
          <span className={`text-xs px-2 py-1 rounded-full ${
            caseData.status === 'open' 
              ? 'bg-blue-100 text-blue-800' 
              : caseData.status === 'in_progress' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
          }`}>
            {caseData.status.replace('_', ' ')}
          </span>
          <span className="text-gray-500 text-sm ml-3 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Created {new Date(caseData.created_at).toLocaleDateString()}
          </span>
        </div>
      </header>
      
      <div className="space-y-6">
        {/* Case Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Case Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-1">Description</h3>
                <p>{caseData.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-1">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {caseSpecialties.map((specialty: CaseSpecialty) => (
                    <span 
                      key={specialty.specialty_id}
                      className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full"
                    >
                      {specialty.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Hired Lawyer (if applicable) */}
        {hiredLawyer && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Lawyer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4 flex-shrink-0">
                  {hiredLawyer?.profile_picture_url ? (
                    <img 
                      src={hiredLawyer.profile_picture_url} 
                      alt={`${hiredLawyer.first_name} ${hiredLawyer.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-2xl font-bold">
                        {hiredLawyer?.first_name?.[0]}{hiredLawyer?.last_name?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold">
                    {hiredLawyer?.first_name} {hiredLawyer?.last_name}
                  </h3>
                  <p className="text-gray-500">{hiredLawyer?.bio}</p>
                  <div className="mt-2 flex items-center">
                    <Button size="sm" className="mr-2" asChild>
                      <Link href={`/app/chat`}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/app/profile/${hiredLawyer?.lawyer_id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Matching Lawyers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Matching Lawyers</CardTitle>
          </CardHeader>
          <CardContent>
            {matchingLawyers.length > 0 ? (
              <div className="space-y-4">
                {matchingLawyers.map(lawyer => (
                  <div 
                    key={lawyer.lawyer_id}
                    className="flex items-center p-3 border rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 mr-3">
                      {lawyer.profile_picture_url ? (
                        <div 
                          className="w-12 h-12 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${lawyer.profile_picture_url})` }}
                        ></div>
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200">
                          <span className="text-lg font-bold text-gray-400">
                            {lawyer.first_name?.[0]}{lawyer.last_name?.[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">
                        {lawyer.first_name} {lawyer.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{lawyer.city_name || '-'}, {lawyer.province_name || '-'}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lawyer.specialties?.slice(0, 2).map((specialty: any) => (
                          <span 
                            key={specialty.specialty_id}
                            className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-full"
                          >
                            {specialty.name}
                          </span>
                        ))}
                        {lawyer.specialties && lawyer.specialties.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{lawyer.specialties.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="ml-2 legal-gradient-bg text-white"
                      asChild
                    >
                      <Link href={`/app/discover`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium mb-2">No matching lawyers found</h3>
                <p className="text-gray-500 mb-4">Try expanding your case categories to find more matches.</p>
                <Button 
                  asChild
                  variant="outline"
                >
                  <Link href="/app/discover">
                    Browse All Lawyers
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Case Timeline/Billing (simplified for prototype) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Case Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0 mr-3">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">Case Created</h3>
                  <p className="text-sm text-gray-500">{new Date(caseData.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {caseData.status !== 'open' && (
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0 mr-3">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">Lawyer Assigned</h3>
                    <p className="text-sm text-gray-500">{caseData.updated_at ? new Date(caseData.updated_at).toLocaleDateString() : 'Pending'}</p>
                  </div>
                </div>
              )}
              
              {/* Additional timeline events would go here in a real application */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
