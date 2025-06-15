'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

// Type definitions
interface Specialty {
  specialty_id: string;
  name: string;
  description?: string;
}

interface LawyerProfile {
  lawyer_id: string;
  user_id?: string;
  email?: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  city_id?: string;
  city_name?: string;
  province_id?: string;
  province_name?: string;
  bio?: string;
  matches_count: number;
  rating: number;
  reviews: number;
  hourly_rate: number;
  years_of_experience: number;
  specialties?: Specialty[];
}

interface Case {
  case_id: string;
  client_id: string;
  title: string;
  description: string;
  hired_lawyer_id?: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at?: string;
  specialties?: Specialty[];
}

interface Match {
  match_id: string;
  client_id: string;
  lawyer_id: string;
  created_at: string;
}

interface Conversation {
  conversation_id: string;
  client_id: string;
  lawyer_id: string;
  created_at: string;
  updated_at: string;
  lawyer?: LawyerProfile;
  latest_message?: {
    content: string;
    timestamp: string;
    is_read: boolean;
  };
}

interface FilterOptions {
  specialties: string[];
  priceRange: [number, number];
  provinceId?: string;
  provinceName?: string;
  cityId?: string;
  cityName?: string;
  location?: string; // Kept for backward compatibility
}

// Interface for function references to avoid circular dependencies
interface AppFunctions {
  refreshLawyerProfiles: (filters?: FilterOptions) => Promise<void>;
  createMatch: (lawyerId: string, isMatch?: boolean) => Promise<boolean | string>;
  getCaseById: (caseId: string) => Promise<Case | null>;
  getCaseSpecialties: (caseId: string) => Promise<Specialty[]>;
  getLawyerById: (lawyerId: string) => Promise<LawyerProfile | null>;
  refreshClientCases: (forceRefresh?: boolean) => Promise<void>;
  refreshUserMatches: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  getMatchingLawyers: (caseId: string) => Promise<LawyerProfile[]>;
}

// Context type
interface AppContextType extends AppFunctions {
  // Data
  specialties: Specialty[];
  lawyerProfiles: LawyerProfile[];
  clientCases: Case[];
  userMatches: Match[];
  conversations: Conversation[];
  isLoading: {
    lawyers: boolean;
    cases: boolean;
    matches: boolean;
    conversations: boolean;
  };
}

// Define default values for the context
const defaultFunctions: AppFunctions = {
  refreshLawyerProfiles: async () => {},
  createMatch: async () => false,
  getCaseById: async () => null,
  getCaseSpecialties: async () => [],
  getLawyerById: async () => null,
  refreshClientCases: async () => {},
  refreshUserMatches: async () => {},
  refreshConversations: async () => {},
  getMatchingLawyers: async () => [],
};

const defaultContextValue: AppContextType = {
  ...defaultFunctions,
  specialties: [],
  lawyerProfiles: [],
  clientCases: [],
  userMatches: [],
  conversations: [],
  isLoading: {
    lawyers: false,
    cases: false,
    matches: false,
    conversations: false,
  },
};

// Create context with default values
const AppContext = createContext<AppContextType>(defaultContextValue);

// Custom hook to use the app context
export const useApp = () => useContext(AppContext);

// Provider component
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, userProfile } = useAuth();
  
  // State declarations
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [lawyerProfiles, setLawyerProfiles] = useState<LawyerProfile[]>([]);
  const [clientCases, setClientCases] = useState<Case[]>([]);
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState({
    lawyers: false,
    cases: false,
    matches: false,
    conversations: false,
  });

  // Create a ref to hold the function references to avoid circular dependencies
  const functionsRef = useRef<AppFunctions>(defaultFunctions);

  // Get lawyer by ID implementation
  const getLawyerById = useCallback(async (lawyerId: string): Promise<LawyerProfile | null> => {
    try {
      // Lawyer_id is both the PK and a FK to user_id, so we need two queries:
      // 1. Get lawyer details from lawyers table
      const { data: lawyerData, error: lawyerError } = await supabase
        .from('lawyers')
        .select(`
          lawyer_id,
          bio,
          matches_count,
          rating,
          reviews,
          hourly_rate,
          years_of_experience
        `)
        .eq('lawyer_id', lawyerId)
        .single();
      
      if (lawyerError) {
        console.error('Error fetching lawyer:', lawyerError);
        return null;
      }
      
      // 2. Get user details from users table using lawyer_id (which equals user_id)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          user_id,
          email,
          first_name,
          last_name,
          profile_picture_url,
          city_id,
          city_name,
          province_id,
          province_name
        `)
        .eq('user_id', lawyerId) // lawyer_id = user_id
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        return null;
      }
      
      // Get specialties
      const { data: specialtiesData, error: specialtiesError } = await supabase
        .from('lawyer_specialties')
        .select(`
          specialty_id,
          specialties:specialty_id (*)
        `)
        .eq('lawyer_id', lawyerId);
      
      if (specialtiesError) {
        console.error('Error fetching lawyer specialties:', specialtiesError);
      }
      
      // Transform raw specialty data into proper Specialty objects
      const specialties = specialtiesData?.map((item: any) => ({
        specialty_id: item.specialties.specialty_id,
        name: item.specialties.name,
        description: item.specialties.description,
      })) || [];
      
      // Process and return lawyer profile by combining data from both queries
      return {
        lawyer_id: lawyerData.lawyer_id,
        user_id: userData.user_id, // This is the same as lawyer_id
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        profile_picture_url: userData.profile_picture_url,
        city_id: userData.city_id,
        city_name: userData.city_name,
        province_id: userData.province_id,
        province_name: userData.province_name,
        bio: lawyerData.bio,
        matches_count: lawyerData.matches_count || 0,
        rating: lawyerData.rating || 0,
        reviews: lawyerData.reviews || 0,
        hourly_rate: lawyerData.hourly_rate || 0,
        years_of_experience: lawyerData.years_of_experience || 0,
        specialties,
      } as LawyerProfile;
    } catch (error) {
      console.error('Error in getLawyerById:', error);
      return null;
    }
  }, []);

  // Get case by ID implementation
  const getCaseById = useCallback(async (caseId: string): Promise<Case | null> => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('case_id', caseId)
        .single();
      
      if (error) {
        console.error('Error fetching case:', error);
        return null;
      }
      
      return data as Case;
    } catch (error) {
      console.error('Error in getCaseById:', error);
      return null;
    }
  }, []);

  // Get case specialties implementation
  const getCaseSpecialties = useCallback(async (caseId: string): Promise<Specialty[]> => {
    try {
      const { data, error } = await supabase
        .from('case_categories')
        .select(`
          specialty_id,
          specialties:specialty_id (*)
        `)
        .eq('case_id', caseId);
      
      if (error) {
        console.error('Error fetching case specialties:', error);
        return [];
      }
      
      // Transform raw specialty data into proper Specialty objects
      return data.map((item: any) => ({
        specialty_id: item.specialties.specialty_id,
        name: item.specialties.name,
        description: item.specialties.description,
      })) as Specialty[];
    } catch (error) {
      console.error('Error in getCaseSpecialties:', error);
      return [];
    }
  }, []);

  // Refresh client cases implementation
  const refreshClientCases = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    // Only require user to be present, don't check profile type to allow cases to load regardless
    if (!user && !forceRefresh) return;
    
    try {
      setIsLoading(prev => ({ ...prev, cases: true }));
      
      // Get user ID from user object or try to get from localStorage if user is not available
      let userId = user?.id;
      
      // If no user in context but forceRefresh is true, try to get user from localStorage
      if (!userId && forceRefresh) {
        try {
          const savedSession = localStorage.getItem('legaltendr_session');
          if (savedSession) {
            const parsedSession = JSON.parse(savedSession);
            userId = parsedSession?.user?.id;
            console.log('Using user ID from localStorage for cases:', userId);
          }
        } catch (e) {
          console.error('Error parsing saved session:', e);
        }
      }
      
      if (!userId) {
        console.log('No user ID available for fetching cases');
        setIsLoading(prev => ({ ...prev, cases: false }));
        return;
      }
      
      console.log('Fetching cases for user ID:', userId);
      
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching client cases:', error);
        return;
      }
      
      console.log('Found cases count:', data?.length || 0);
      
      // Process case specialties for each case
      const casesWithSpecialties = await Promise.all(
        (data || []).map(async (caseItem: any) => {
          const specialties = await functionsRef.current.getCaseSpecialties(caseItem.case_id);
          return {
            ...caseItem,
            specialties
          } as Case;
        })
      );
      
      setClientCases(casesWithSpecialties);
    } catch (error) {
      console.error('Error in refreshClientCases:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, cases: false }));
    }
  }, [user, userProfile]);

  // Refresh user matches from swipes table
  const refreshUserMatches = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    try {
      setIsLoading(prev => ({ ...prev, matches: true }));
      
      // Fetch swipes based on user type
      let responseData: any[] = [];
      let responseError = null;
      
      // Filter based on user type
      if (userProfile?.profileType === 'client') {
        // For clients, get all their right swipes (matches)
        const response = await supabase
          .from('swipes')
          .select(`
            swipe_id,
            client_id,
            lawyer_id,
            matched,
            created_at,
            lawyers:lawyer_id (*)  
          `)
          .eq('client_id', user.id)
          .eq('matched', true);
        
        responseData = response.data || [];
        responseError = response.error;
      } else if (userProfile?.profileType === 'lawyer') {
        // For lawyers, get all right swipes made towards them
        const response = await supabase
          .from('swipes')
          .select(`
            swipe_id,
            client_id,
            lawyer_id,
            matched,
            created_at,
            clients:client_id (*)
          `)
          .eq('lawyer_id', user.id)
          .eq('matched', true);
        
        responseData = response.data || [];
        responseError = response.error;
      }
      
      if (responseError) {
        console.error('Error fetching swipes:', responseError);
        return;
      }
      
      // Transform data to match the expected format
      const transformedMatches = responseData.map((swipe: any) => ({
        match_id: swipe.swipe_id,
        client_id: swipe.client_id,
        lawyer_id: swipe.lawyer_id,
        created_at: swipe.created_at,
      }));
      
      setUserMatches(transformedMatches);
    } catch (error) {
      console.error('Error in refreshUserMatches:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, matches: false }));
    }
  }, [user, userProfile]);

  // Create a swipe between a client and lawyer
  // isMatch = true for right swipe, false for left swipe
  const createMatch = useCallback(async (lawyerId: string, isMatch: boolean = true): Promise<boolean | string> => {
    console.log('createMatch called with:', { lawyerId, isMatch });
    
    if (!user || !userProfile || userProfile.profileType !== 'client') {
      console.log('User validation failed:', { user, userProfile });
      return false;
    }
    
    try {
      console.log('Creating swipe record for user:', user.id, 'and lawyer:', lawyerId);
      
      // Create new swipe record - both left and right swipes are recorded
      // but only right swipes (isMatch=true) create conversations
      const { data: swipeData, error: swipeError } = await supabase
        .from('swipes')
        .insert([{
          client_id: user.id,
          lawyer_id: lawyerId,
          matched: isMatch, // true for right swipe, false for left swipe
          created_at: new Date().toISOString(),
        }])
        .select('swipe_id')
        .single();
      
      if (swipeError) {
        console.error('Error creating swipe record:', swipeError);
        return false;
      }
      
      console.log('Successfully created swipe record:', swipeData);
      
      // Only update match count and create conversation for right swipes
      if (isMatch) {
        try {
          // Update lawyer's match count
          const { data: rpcData, error: updateError } = await supabase
            .rpc('increment_lawyer_matches', { 
              lawyer_id_param: lawyerId // Make sure the parameter name matches what's expected in the RPC function
            });
          
          if (updateError) {
            console.error('Error updating lawyer match count:', updateError);
          } else {
            console.log('Successfully updated lawyer match count');
          }
          
          // Create a new conversation automatically when swiping right
          const { error: convError, data: convData } = await supabase
            .from('conversations')
            .insert([{
              client_id: user.id,
              lawyer_id: lawyerId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }])
            .select('conversation_id'); // Select the ID after insertion
          
          if (convError) {
            console.error('Error creating conversation after swipe:', convError);
          } else {
            console.log('Successfully created conversation after swipe right');
            // Return the conversation ID if available
            if (convData && convData.length > 0) {
              // Schedule a refresh of matches data after returning
              setTimeout(() => {
                if (functionsRef.current) {
                  functionsRef.current.refreshUserMatches();
                }
              }, 500);
              return convData[0].conversation_id;
            }
          }
        } catch (matchError) {
          console.error('Error in match processing:', matchError);
          // Continue execution even if there's an error with the match count or conversation
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in createMatch:', error);
      return false;
    }
  }, [user, userProfile]);

  // Refresh conversations implementation
  const refreshConversations = useCallback(async (): Promise<void> => {
    if (!user || !userProfile) return;
    
    try {
      setIsLoading(prev => ({ ...prev, conversations: true }));
      
      let query = supabase
        .from('conversations')
        .select('*');
      
      // Filter based on user type
      if (userProfile.profileType === 'client') {
        query = query.eq('client_id', user.id);
      } else if (userProfile.profileType === 'lawyer') {
        query = query.eq('lawyer_id', user.id);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }
      
      // Enrich conversations with lawyer details and latest message
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (convo: any) => {
          // Get lawyer info for each conversation
          const otherPartyId = userProfile.profileType === 'client' 
            ? convo.lawyer_id 
            : convo.client_id;
          
          const otherPartyData = await functionsRef.current.getLawyerById(otherPartyId);
          
          // Get latest message
          const { data: messageData, error: messageError } = await supabase
            .from('messages')
            .select('content, timestamp, is_read')
            .eq('conversation_id', convo.conversation_id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();
          
          if (messageError && messageError.code !== 'PGRST116') {
            console.error('Error fetching latest message:', messageError);
          }
          
          return {
            ...convo,
            lawyer: otherPartyData,
            latest_message: messageData || undefined,
          };
        })
      );
      
      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error in refreshConversations:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, conversations: false }));
    }
  }, [user, userProfile]);

  // Fetch lawyer profiles with specialties
  const refreshLawyerProfiles = useCallback(async (filters?: FilterOptions): Promise<void> => {
    try {
      setIsLoading(prev => ({ ...prev, lawyers: true }));

      // Start building the query
      let query = supabase
        .from('lawyers')
        .select(`
          lawyer_id,
          bio,
          matches_count,
          rating,
          reviews,
          hourly_rate,
          years_of_experience,
          users!inner (*),
          lawyer_specialties (specialty_id)
        `);
      
      // Apply filters if provided
      if (filters) {
        // Filter by province
        if (filters.provinceId) {
          query = query.eq('users.province_id', filters.provinceId);
        }
        
        // Filter by city
        if (filters.cityId) {
          query = query.eq('users.city_id', filters.cityId);
        }
        
        // Filter by price range
        if (filters.priceRange && filters.priceRange.length === 2) {
          query = query
            .gte('hourly_rate', filters.priceRange[0])
            .lte('hourly_rate', filters.priceRange[1]);
        }
      }
      
      const { data: lawyersData, error } = await query;
      
      if (error) {
        console.error('Error fetching lawyers:', error);
        return;
      }
      
      // Process each lawyer
      const lawyersWithSpecialties = await Promise.all(
        (lawyersData || []).map(async (lawyer: any) => {
          // If specialty filter is applied, check if lawyer has any of the specified specialties
          if (filters?.specialties && filters.specialties.length > 0) {
            const specialtyIds = lawyer.lawyer_specialties.map((s: any) => s.specialty_id);
            const hasMatchingSpecialty = specialtyIds.some((id: string) => filters.specialties.includes(id));
            
            if (!hasMatchingSpecialty) {
              return null; // Filter out this lawyer
            }
          }
          
          // Get all specialties for this lawyer
          const { data: specialtyData, error: specialtyError } = await supabase
            .from('lawyer_specialties')
            .select(`
              specialties (*)
            `)
            .eq('lawyer_id', lawyer.lawyer_id);
          
          if (specialtyError) {
            console.error('Error fetching lawyer specialties:', specialtyError);
          }
          
          // Format the lawyer profile
          return {
            lawyer_id: lawyer.lawyer_id,
            user_id: lawyer.user_id,
            email: lawyer.users.email,
            first_name: lawyer.users.first_name,
            last_name: lawyer.users.last_name,
            profile_picture_url: lawyer.profile_picture_url || lawyer.users.profile_picture_url,
            city_id: lawyer.users.city_id,
            city_name: lawyer.users.city_name,
            province_id: lawyer.users.province_id,
            province_name: lawyer.users.province_name,
            bio: lawyer.bio,
            matches_count: lawyer.matches_count || 0,
            rating: lawyer.rating || 0,
            reviews: lawyer.reviews || 0,
            hourly_rate: lawyer.hourly_rate || 0,
            years_of_experience: lawyer.years_of_experience || 0,
            specialties: specialtyData?.map((s: any) => s.specialties) || [],
          } as LawyerProfile;
        })
      );
      
      // Filter out null values (from specialty filtering)
      const lawyersWithProfile = lawyersWithSpecialties.filter(Boolean) as LawyerProfile[];
      
      setLawyerProfiles(lawyersWithProfile);
    } catch (error) {
      console.error('Error in refreshLawyerProfiles:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, lawyers: false }));
    }
  }, []);

  // Get matching lawyers for a case
  const getMatchingLawyers = useCallback(async (caseId: string): Promise<LawyerProfile[]> => {
    try {
      // Get case specialties
      const caseSpecialties = await functionsRef.current.getCaseSpecialties(caseId);
      
      if (!caseSpecialties.length) {
        return [];
      }
      
      const specialtyIds = caseSpecialties.map(specialty => specialty.specialty_id);
      
      // Find lawyers with matching specialties
      const { data, error } = await supabase
        .from('lawyer_specialties')
        .select(`
          lawyer_id
        `)
        .in('specialty_id', specialtyIds);
      
      if (error) {
        console.error('Error fetching matching lawyers:', error);
        return [];
      }
      
      // Get unique lawyer IDs
      const uniqueLawyerIds = [...new Set(data.map((item: any) => item.lawyer_id))];
      
      // Get full lawyer profiles
      const matchingLawyersPromises = uniqueLawyerIds.map(
        (lawyerId: string) => functionsRef.current.getLawyerById(lawyerId)
      );
      
      const matchingLawyers = await Promise.all(matchingLawyersPromises);
      
      // Filter out null values
      return matchingLawyers.filter((lawyer): lawyer is LawyerProfile => lawyer !== null);
    } catch (error) {
      console.error('Error in getMatchingLawyers:', error);
      return [];
    }
  }, []);

  // Load specialties on mount (they don't change often)
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const { data, error } = await supabase
          .from('specialties')
          .select('*');
        
        if (error) {
          console.error('Error loading specialties:', error);
          return;
        }
        
        setSpecialties(data || []);
      } catch (error) {
        console.error('Error in loadSpecialties:', error);
      }
    };
    
    loadSpecialties();
  }, []);

  // Update the functionsRef when any function changes
  useEffect(() => {
    functionsRef.current = {
      refreshLawyerProfiles,
      createMatch,
      getCaseById,
      getCaseSpecialties,
      getLawyerById,
      refreshClientCases,
      refreshUserMatches,
      refreshConversations,
      getMatchingLawyers,
    };
  }, [
    refreshLawyerProfiles,
    createMatch,
    getCaseById,
    getCaseSpecialties,
    getLawyerById,
    refreshClientCases,
    refreshUserMatches,
    refreshConversations,
    getMatchingLawyers,
  ]);

  // Load initial data when user is authenticated
  useEffect(() => {
    if (!user) return;
    
    refreshLawyerProfiles();
    
    if (userProfile?.profileType === 'client') {
      refreshClientCases();
    }
    
    refreshUserMatches();
    refreshConversations();
  }, [user, userProfile, refreshLawyerProfiles, refreshClientCases, refreshUserMatches, refreshConversations]);

  // Create the context value
  const value: AppContextType = {
    specialties,
    lawyerProfiles,
    clientCases,
    userMatches,
    conversations,
    isLoading,
    refreshLawyerProfiles,
    createMatch,
    getCaseById,
    getCaseSpecialties,
    getLawyerById,
    refreshClientCases,
    refreshUserMatches,
    refreshConversations,
    getMatchingLawyers,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
