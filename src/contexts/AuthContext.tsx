'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Helper function to capitalize each word in a string
const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Type definitions for our context
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any | null, user: User | null }>;
  signOut: () => Promise<void>;
  userProfile: any | null; // Will hold client or lawyer data depending on user type
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, user: null }),
  signOut: async () => {},
  userProfile: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get session on mount
    const getSession = async () => {
      setIsLoading(true);
      
      try {
        // Check for session in localStorage first (our custom auth)
        const savedSession = localStorage.getItem('legaltendr_session');
        
        if (savedSession) {
          try {
            const parsedSession = JSON.parse(savedSession);
            console.log('Retrieved session from localStorage:', parsedSession);
            
            // Validate the session has proper user data
            if (parsedSession && parsedSession.user && parsedSession.user.id) {
              // Set the session cookie for middleware auth protection
              document.cookie = `legaltendr_session=true; path=/; max-age=604800; SameSite=Lax`;  // 7 days
              
              setSession(parsedSession);
              setUser(parsedSession.user || null);
              
              await fetchUserProfile(parsedSession.user);
            } else {
              console.log('Invalid session in localStorage, clearing');
              localStorage.removeItem('legaltendr_session');
              document.cookie = `legaltendr_session=; path=/; max-age=0; SameSite=Lax`;  // Clear cookie
            }
          } catch (e) {
            console.error('Error parsing saved session:', e);
            localStorage.removeItem('legaltendr_session');
            document.cookie = `legaltendr_session=; path=/; max-age=0; SameSite=Lax`;  // Clear cookie
          }
        } else {
          // Fallback to Supabase session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            setIsLoading(false);
            return;
          }
          
          if (data.session) {
            console.log('Retrieved session from Supabase:', data.session);
            
            // Set the session cookie for middleware auth protection
            document.cookie = `legaltendr_session=true; path=/; max-age=604800; SameSite=Lax`;  // 7 days
            
            setSession(data.session);
            setUser(data.session.user || null);
            
            if (data.session.user) {
              await fetchUserProfile(data.session.user);
            }
          }
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      }
      
      setIsLoading(false);
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event}`);
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUserProfile(null);
      }
      
      // Save session to localStorage on sign in
      if (event === 'SIGNED_IN' && session) {
        // Save the session to localStorage
        localStorage.setItem('legaltendr_session', JSON.stringify(session));
        document.cookie = `legaltendr_session=true; path=/; max-age=604800; SameSite=Lax`;  // 7 days
        router.refresh();
      }
      if (event === 'SIGNED_OUT') {
        // Clear the session from localStorage
        localStorage.removeItem('legaltendr_session');
        document.cookie = `legaltendr_session=; path=/; max-age=0; SameSite=Lax`;  // Clear cookie
        setUserProfile(null);
        router.refresh();
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);
  
  // Function to fetch additional user profile data (client or lawyer)
  const fetchUserProfile = async (user: any) => {
    try {
      // Extract user ID from the user object
      const userId = user.id;
      
      console.log('Fetching profile for user ID:', userId);
      
      // Get user from users table to determine type
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        return;
      }
      
      // Based on user type, fetch additional profile data
      if (userData.user_type === 'client') {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('client_id', userId)
          .single();
        
        if (clientError) {
          console.error('Error fetching client profile:', clientError);
          return;
        }
        
        setUserProfile({ ...userData, ...clientData, profileType: 'client' });
      } else if (userData.user_type === 'lawyer') {
        const { data: lawyerData, error: lawyerError } = await supabase
          .from('lawyers')
          .select('*')
          .eq('lawyer_id', userId)
          .single();
        
        if (lawyerError) {
          console.error('Error fetching lawyer profile:', lawyerError);
          return;
        }
        
        // Also fetch lawyer specialties
        const { data: specialtiesData, error: specialtiesError } = await supabase
          .from('lawyer_specialties')
          .select(`
            specialty_id,
            specialties:specialty_id (*)
          `)
          .eq('lawyer_id', userId);
        
        if (specialtiesError) {
          console.error('Error fetching lawyer specialties:', specialtiesError);
        }
        
        // Extract specialty IDs
        const specialties = specialtiesData ? specialtiesData.map(s => s.specialty_id) : [];
        
        setUserProfile({ 
          ...userData, 
          ...lawyerData, 
          specialties,
          profileType: 'lawyer' 
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };
  
  // Custom sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Starting sign in process for:', email);
      
      // First check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        console.error('User not found:', userError);
        setIsLoading(false);
        return { error: 'Invalid email or password' };
      }
      
      // Verify password
      if (userData.password_hash !== password) {
        console.error('Password mismatch');
        setIsLoading(false);
        return { error: 'Invalid email or password' };
      }
      
      console.log('User authenticated successfully:', userData.user_id);
      
      // Create session object with user data
      const sessionData = {
        user: {
          id: userData.user_id,
          email: userData.email,
          user_type: userData.user_type,
          user_metadata: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            user_id: userData.user_id
          }
        }
      };
      
      // Set the session manually
      setUser(sessionData.user as any);
      setSession({ user: sessionData.user } as any);
      
      // Store session in localStorage for persistence
      localStorage.setItem('legaltendr_session', JSON.stringify(sessionData));
      
      // Set the session cookie for middleware auth protection
      document.cookie = `legaltendr_session=true; path=/; max-age=604800; SameSite=Lax`;  // 7 days
      
      // Fetch user profile
      await fetchUserProfile(sessionData.user as any);
      
      setIsLoading(false);
      return { error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      setIsLoading(false);
      return { error };
    }
  };
  
  // Generate a custom user ID based on phone, timestamp, and random characters
  const generateCustomUserId = (phoneNumber: string) => {
    // Clean the phone number (remove non-digits)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Get current timestamp
    const timestamp = new Date().getTime().toString();
    
    // Generate 6 random alphanumeric characters
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomChars = '';
    for (let i = 0; i < 6; i++) {
      randomChars += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Combine and limit length if needed
    return `${cleanPhone}${timestamp}${randomChars}`.slice(0, 50);
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Generate a custom user ID
      const customUserId = generateCustomUserId(userData.phone_number || '');
      
      // Add user data to 'users' table with geo_code information
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          user_id: customUserId,
          email: email,
          password_hash: password,
          user_type: userData.user_type,
          first_name: capitalizeWords(userData.first_name),
          last_name: capitalizeWords(userData.last_name),
          profile_picture_url: userData.profile_picture_url,
          province_id: userData.province_id || null,
          province_name: userData.province_name ? capitalizeWords(userData.province_name) : null,
          city_id: userData.city_id || null,
          city_name: userData.city_name ? capitalizeWords(userData.city_name) : null,
          phone_number: userData.phone_number,
        }]);
      
      if (userError) {
        console.error('Error inserting user data:', userError);
        return { error: userError, user: null };
      }
      
      // Based on user type, add to client or lawyer table
      if (userData.user_type === 'client') {
        const { error: clientError } = await supabase
          .from('clients')
          .insert([{
            client_id: customUserId, 
            bio: userData.bio || null,
          }]);
        
        if (clientError) {
          console.error('Error inserting client data:', clientError);
          return { error: clientError, user: null };
        }
        
        // Set flag for new user so discover page won't apply filters on first visit
        localStorage.setItem('isNewUser', 'true');
      } else if (userData.user_type === 'lawyer') {
        const { error: lawyerError } = await supabase
          .from('lawyers')
          .insert([{
            lawyer_id: customUserId,
            bio: userData.bio || null,
            matches_count: 0,
            rating: 0,
            reviews: 0,
            hourly_rate: userData.hourly_rate || 0,
            years_of_experience: userData.years_of_experience || 0,
          }]);
        
        if (lawyerError) {
          console.error('Error inserting lawyer data:', lawyerError);
          return { error: lawyerError, user: null };
        }
        
        // Add lawyer specialties if provided
        if (userData.specialties && userData.specialties.length > 0) {
          const specialtyInserts = userData.specialties.map((specialtyId: string) => ({
            lawyer_id: customUserId,
            specialty_id: specialtyId,
          }));
          
          const { error: specialtyError } = await supabase
            .from('lawyer_specialties')
            .insert(specialtyInserts);
          
          if (specialtyError) {
            console.error('Error inserting lawyer specialties:', specialtyError);
            // Not returning error here as this is not critical
          }
        }
      }
      
      // Create session object with user data
      const sessionData = {
        user: {
          id: customUserId,
          email: email,
          user_type: userData.user_type,
          user_metadata: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            user_id: customUserId
          }
        }
      };
      
      // Store the user data in session
      setUser(sessionData.user as any);
      setSession({ user: sessionData.user } as any);
      
      // Store session in localStorage for persistence
      localStorage.setItem('legaltendr_session', JSON.stringify(sessionData));
      
      // Set the session cookie for middleware auth protection
      document.cookie = `legaltendr_session=true; path=/; max-age=604800; SameSite=Lax`;  // 7 days
      
      // Fetch user profile (this will set userProfile state)
      await fetchUserProfile(sessionData.user as any);
      
      // Return user data for UI
      return { 
        error: null, 
        user: sessionData.user as any
      };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error, user: null };
    }
  };
  
  // Sign out function
  const signOut = async () => {
    // Clear our custom session
    localStorage.removeItem('legaltendr_session');
    // Clear the session cookie
    document.cookie = 'legaltendr_session=; path=/; max-age=0; SameSite=Lax';
    
    setUser(null);
    setSession(null);
    setUserProfile(null);
    
    // Also sign out from Supabase Auth as fallback
    await supabase.auth.signOut();
  };
  
  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    userProfile,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
