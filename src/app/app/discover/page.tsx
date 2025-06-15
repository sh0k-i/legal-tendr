'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet } from '@/components/ui/sheet'; 
import { FilterDrawer, type FilterOptions } from '@/components/discover/filter-drawer';
import { ConnectedPopup } from '@/components/discover/connected-popup';
import { LawyerProfile as LawyerProfileComponent, type LawyerProfileData } from '@/components/discover/lawyer-profile';
import LawyerCard from '@/components/discover/lawyer-card';
import EmptyState from '@/components/discover/empty-state';
import SwipeActions from '@/components/discover/swipe-actions';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useMotionValue, useTransform, motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Loader2, Star, DollarSign, X, Heart, Users, SlidersHorizontal } from 'lucide-react';

// Type for swipe data stored in localStorage
interface StoredSwipe {
  lawyerId: string;
  isMatch: boolean; // true = right swipe, false = left swipe
  timestamp: string;
}

// Type for match conversation data
interface MatchConversationData {
  conversationId: string;
  lawyerName: string;
  profilePicture: string;
}

// Main Discover page component
export default function DiscoverPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { lawyerProfiles, refreshLawyerProfiles } = useApp();
  const { toast } = useToast();
  
  // States for UI
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfileData | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showConnectedPopup, setShowConnectedPopup] = useState(false);
  const [connectedLawyer, setConnectedLawyer] = useState<MatchConversationData>({
    conversationId: '',
    lawyerName: '',
    profilePicture: ''
  });
  const [isLoading, setIsLoading] = useState({
    lawyers: true,
    swipe: false
  });
  
  // Set empty default filters to ensure all lawyers are shown initially
  const [filters, setFilters] = useState<FilterOptions>({
    specialties: [],
    priceRange: [0, 1000],
    provinceId: undefined,
    cityId: undefined
  });
  
  // States for swipe tracking using localStorage
  const [swipedLawyers, setSwipedLawyers] = useState<Set<string>>(new Set());
  const [matchedLawyers, setMatchedLawyers] = useState<Set<string>>(new Set());
  const [swipeHistory, setSwipeHistory] = useState<StoredSwipe[]>([]);
  
  // Refs and motion values for swipe animation
  const cardRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const dragXProgress = useTransform(dragX, [-300, 0, 300], [-1, 0, 1]);
  

  
  // Filter the lawyers to avoid showing already swiped ones
  const sortedLawyers = useMemo(() => {
    // Quick exit for no profiles
    if (!lawyerProfiles || lawyerProfiles.length === 0) return [];
    
    // Only filter out lawyers who have a valid user_id and haven't been swiped already
    return lawyerProfiles.filter(lawyer => {
      // Must have user_id to be valid
      if (!lawyer?.user_id) return false;
      
      // Only filter out if already swiped
      return !swipedLawyers.has(lawyer.user_id);
    });
  }, [lawyerProfiles, swipedLawyers]);

  // Load swipe data from localStorage on mount
  useEffect(() => {
    if (!user) return;

    try {
      const key = `legal-tendr-swipes-${user.id}`;
      const storedSwipes = localStorage.getItem(key);
      
      // Initialize empty sets as default
      const swiped = new Set<string>();
      const matched = new Set<string>();
      let history: StoredSwipe[] = [];
      
      if (storedSwipes) {
        try {
          const parsedSwipes = JSON.parse(storedSwipes) as StoredSwipe[];
          
          if (Array.isArray(parsedSwipes)) {
            history = parsedSwipes;
            
            // Add to sets for lookups
            parsedSwipes.forEach(swipe => {
              if (swipe?.lawyerId) {
                swiped.add(swipe.lawyerId);
                if (swipe.isMatch) {
                  matched.add(swipe.lawyerId);
                }
              }
            });
          }
        } catch (parseError) {
          // Silently handle parse error and use defaults
        }
      }
      
      // Set state with either parsed data or empty defaults
      setSwipeHistory(history);
      setSwipedLawyers(swiped);
      setMatchedLawyers(matched);
    } catch (error) {
      // Fallback to empty state
      setSwipedLawyers(new Set());
      setMatchedLawyers(new Set());
      setSwipeHistory([]);
    }
  }, [user]);
  
  // Load lawyer profiles on mount and when user is available
  useEffect(() => {
    const loadProfiles = async () => {
      if (!user) return;
      
      setIsLoading(prev => ({
        ...prev,
        lawyers: true
      }));
      
      try {
        // Force refresh with empty filters to get all lawyers
        await refreshLawyerProfiles({
          specialties: [],
          priceRange: [0, 1000],
          provinceId: undefined,
          cityId: undefined
        });
        
        // Reset to first lawyer
        setCurrentIndex(0);
      } catch (err) {
        console.error('Failed to load lawyer profiles:', err);
      } finally {
        setIsLoading(prev => ({
          ...prev,
          lawyers: false
        }));
      }
    };
    
    // Load immediately if user is available
    if (user) {
      loadProfiles();
    }
    
    // No dependencies on lawyerProfiles to avoid update loops
  }, [user, refreshLawyerProfiles]);
  
  // Add effect to detect when we need to refresh the lawyer list
  useEffect(() => {
    if (sortedLawyers.length === 0 && !isLoading.lawyers && lawyerProfiles && lawyerProfiles.length > 0) {
      // We have lawyers but none are being displayed - likely all swiped
      // Show toast telling user they can reset swipes
      toast({
        title: "No more lawyers available",
        description: "You've seen all available lawyers. Reset passed lawyers to see them again.",
        variant: "default"
      });
    }
  }, [sortedLawyers.length, isLoading.lawyers, lawyerProfiles, toast]);


  
  // Function to save swipe to localStorage and optionally create conversation
  const saveSwipe = useCallback(async (lawyerId: string, isMatch: boolean): Promise<string | null> => {
    if (!user) {
      console.error('Cannot save swipe: user not logged in');
      return null;
    }
    
    if (!lawyerId) {
      console.error('Cannot save swipe: invalid lawyer ID');
      return null;
    }
    
    console.log(`DEBUG: Saving swipe for lawyer ${lawyerId}, isMatch: ${isMatch}`);
    
    // Create new swipe record
    const newSwipe: StoredSwipe = {
      lawyerId,
      isMatch,
      timestamp: new Date().toISOString()
    };
    
    // Update swipe history - ensure we create a new array for React state
    const updatedHistory = [...swipeHistory, newSwipe];
    setSwipeHistory(updatedHistory);
    
    // Update sets of swiped and matched lawyers - ensure new Set is created
    setSwipedLawyers(prev => {
      const updated = new Set(prev);
      updated.add(lawyerId);
      return updated;
    });
    
    if (isMatch) {
      setMatchedLawyers(prev => {
        const updated = new Set(prev);
        updated.add(lawyerId);
        return updated;
      });
    }
    
    // Save to localStorage - ensure key is formatted correctly
    const storageKey = `legal-tendr-swipes-${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    console.log(`DEBUG: Saved swipe history to localStorage with key: ${storageKey}`);
    console.log(`DEBUG: Updated swipe history now has ${updatedHistory.length} entries`);
    
    // If it's a match, create conversation in database
    if (isMatch) {
      console.log('DEBUG: Match detected, creating conversation...');
      setIsLoading(prev => ({ ...prev, swipe: true }));
      try {
        // Get the lawyer to double-check their ID
        const lawyer = sortedLawyers.find(l => l.user_id === lawyerId);
        
        if (!lawyer || !lawyer.user_id) {
          console.error('Cannot create conversation: lawyer not found or invalid lawyer.user_id');
          setIsLoading(prev => ({ ...prev, swipe: false }));
          return null;
        }
        
        // Create conversation in Supabase
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .insert({
            client_id: user.id,
            lawyer_id: lawyer.user_id,
            last_message_time: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('conversation_id');
        
        if (convError || !convData || convData.length === 0) {
          console.error('Error creating conversation:', convError);
          setIsLoading(prev => ({ ...prev, swipe: false }));
          return null;
        }
        
        console.log('DEBUG: Conversation created successfully:', convData[0].conversation_id);
        setIsLoading(prev => ({ ...prev, swipe: false }));
        return convData[0].conversation_id;
      } catch (error) {
        console.error('Error in conversation creation:', error);
        setIsLoading(prev => ({ ...prev, swipe: false }));
        return null;
      }
    }
    
    return null;
  }, [user, swipeHistory, sortedLawyers]);
  
  // Handle swipe gesture (left or right)
  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (isLoading.swipe || currentIndex >= sortedLawyers.length) return;
    
    // Set animation direction
    setSwipeDirection(direction);
    
    // Get current lawyer
    const currentLawyer = sortedLawyers[currentIndex];
    if (!currentLawyer || !currentLawyer.user_id) {
      console.error('Cannot swipe: invalid lawyer data');
      return;
    }
    
    const isMatch = direction === 'right';
    
    // Save swipe to localStorage and create conversation if it's a match
    try {
      const conversationId = await saveSwipe(currentLawyer.user_id, isMatch);
      
      // If it's a right swipe, show the connected popup
      if (isMatch) {
        setConnectedLawyer({
          conversationId: conversationId || '',
          lawyerName: currentLawyer.first_name + ' ' + currentLawyer.last_name,
          profilePicture: currentLawyer.profile_picture_url || ''
        });
        
        // Always show connected popup for right swipes, even if conversation creation failed
        setShowConnectedPopup(true);
      }
    } catch (error) {
      console.error('Error handling swipe:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
    
    // Reset and advance to next card after animation
    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentIndex(prevIndex => prevIndex + 1);
      dragX.set(0);
    }, 300);
  }, [sortedLawyers, currentIndex, isLoading, saveSwipe, dragX, setSwipeDirection, toast]);
  
  // Function to view lawyer profile
  const handleViewProfile = useCallback(() => {
    if (sortedLawyers.length > currentIndex) {
      const lawyer = sortedLawyers[currentIndex];
      // Convert to LawyerProfileData type to fix TypeScript error
      const lawyerData: LawyerProfileData = {
        ...lawyer,
        specialties: lawyer.specialties || [],
        profile_picture_url: lawyer.profile_picture_url || ''
      };
      setSelectedLawyer(lawyerData);
    }
  }, [sortedLawyers, currentIndex]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setFilterDrawerOpen(false);
  }, []);
  
  // Function to handle undo last swipe
  const handleUndoSwipe = useCallback(() => {
    if (swipeHistory.length === 0 || currentIndex === 0) return;
    
    // Remove the last swipe
    const updatedHistory = [...swipeHistory];
    const removedSwipe = updatedHistory.pop();
    
    if (removedSwipe) {
      // Update localStorage
      if (user) {
        localStorage.setItem(`legal-tendr-swipes-${user.id}`, JSON.stringify(updatedHistory));
      }
      
      // Update swipe history state
      setSwipeHistory(updatedHistory);
      
      // Update sets of swiped/matched lawyers
      const updatedSwipedLawyers = new Set(swipedLawyers);
      updatedSwipedLawyers.delete(removedSwipe.lawyerId);
      setSwipedLawyers(updatedSwipedLawyers);
      
      if (removedSwipe.isMatch) {
        const updatedMatchedLawyers = new Set(matchedLawyers);
        updatedMatchedLawyers.delete(removedSwipe.lawyerId);
        setMatchedLawyers(updatedMatchedLawyers);
      }
      
      // Decrement current index to go back to previous card
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
  }, [swipeHistory, currentIndex, user, swipedLawyers, matchedLawyers]);
  
  // Handle drag end events from Framer Motion
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    } else {
      // Reset position if not swiped far enough
      dragX.set(0);
    }
  }, [dragX, handleSwipe]);

  // Handle action buttons
  const handleSwipeLeft = useCallback(() => handleSwipe('left'), [handleSwipe]);
  const handleSwipeRight = useCallback(() => handleSwipe('right'), [handleSwipe]);
  
  // Function to navigate to the conversation after match
  const handleGoToConversation = useCallback(() => {
    if (connectedLawyer && connectedLawyer.conversationId) {
      router.push(`/app/messages/${connectedLawyer.conversationId}`);
    }
    setShowConnectedPopup(false);
  }, [connectedLawyer, router]);
  
  // Reset function for swipe history (only resets passed lawyers, not matches)
  const handleResetSwipes = useCallback(() => {
    if (!user) return;
    
    setIsLoading(prev => ({ ...prev, lawyers: true }));
    
    try {
      // Filter out only right swipes (matches) to keep
      const updatedHistory = swipeHistory.filter(swipe => swipe.isMatch);
      
      // Save to localStorage with updated history
      const storageKey = `legal-tendr-swipes-${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      
      // Update state to keep only matched lawyers
      const updatedSwipedLawyers = new Set<string>(matchedLawyers);
      setSwipedLawyers(updatedSwipedLawyers);
      setSwipeHistory(updatedHistory);
      
      // Reset index to first lawyer
      setCurrentIndex(0);
      
      // Refresh lawyer profiles with empty filters
      refreshLawyerProfiles({
        specialties: [],
        priceRange: [0, 1000],
        provinceId: undefined,
        cityId: undefined
      });
      
      toast({
        title: "Reset successful",
        description: "Passed lawyers have been reset. You'll see them again now.",
        variant: "default"
      });
    } catch (err) {
      console.error("Error resetting lawyers:", err);
      toast({
        title: "Error",
        description: "Failed to reset passed lawyers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, lawyers: false }));
    }
  }, [user, swipeHistory, matchedLawyers, refreshLawyerProfiles, toast]);

  // Check if there are any cards left to swipe
  const hasCardsLeft = sortedLawyers.length > currentIndex;
  
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden">
      {/* Bottom sheet/drawer content is rendered inside the component */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setFilterDrawerOpen(false)} />
      )}
      <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${filterDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="p-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-4">Filter Lawyers</h3>
          
          {/* Filter content */}
          <div className="space-y-4 pb-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="rounded-full">Family Law</Button>
                <Button variant="outline" size="sm" className="rounded-full">Criminal Law</Button>
                <Button variant="outline" size="sm" className="rounded-full">Corporate Law</Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Price Range</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">₱{filters.priceRange[0]}</span>
                <div className="h-4 flex-1 bg-gray-200 rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: '30%' }}></div>
                </div>
                <span className="text-sm">₱{filters.priceRange[1]}</span>
              </div>
            </div>
            
            <div className="pt-4">
              <Button className="w-full" onClick={() => setFilterDrawerOpen(false)}>Apply Filters</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 relative">
          {/* Filter icon */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-50 rounded-full bg-white shadow-md border-none"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="sr-only">Filters</span>
          </Button>

          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 h-full">
            {isLoading.lawyers ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p>Loading lawyers...</p>
              </div>
            ) : hasCardsLeft ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Debug info at the top of the card stack - only visible in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-0 left-0 right-0 z-50 text-xs bg-black/50 text-white p-1 rounded mb-2">
                  <div>Lawyers: {sortedLawyers.length} | Current: {currentIndex} | Loading: {isLoading.lawyers ? 'Yes' : 'No'}</div>
                </div>
              )}
              
              {/* Card stack */}
              <AnimatePresence initial={false}>
                {/* Only render card if we have lawyers to show and the index is valid */}
                {sortedLawyers.length > 0 && currentIndex < sortedLawyers.length && (
                  <motion.div 
                    key={currentIndex}
                    className="absolute w-full h-full cursor-pointer"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.9}
                    onDragEnd={handleDragEnd}
                    style={{ x: dragX }}
                    animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
                    exit={{ 
                      x: swipeDirection === 'left' ? -500 : swipeDirection === 'right' ? 500 : 0,
                      opacity: 0,
                      scale: 0.8,
                      rotateZ: swipeDirection === 'left' ? -20 : swipeDirection === 'right' ? 20 : 0,
                      transition: { duration: 0.5 }
                    }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    onClick={handleViewProfile}
                  >
                    {/* Using simple div wrapper instead of LawyerCard with incorrect props */}
                    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg bg-white relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      
                      {/* Profile image */}
                      {sortedLawyers[currentIndex]?.profile_picture_url ? (
                        <Image 
                          src={sortedLawyers[currentIndex].profile_picture_url} 
                          alt={`${sortedLawyers[currentIndex].first_name || ''} ${sortedLawyers[currentIndex].last_name || ''}`}
                          className="object-cover w-full h-full"
                          fill
                          sizes="(max-width: 640px) 100vw, 640px"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                          <span className="text-4xl text-white font-bold">
                            {sortedLawyers[currentIndex]?.first_name?.[0] || ''}{sortedLawyers[currentIndex]?.last_name?.[0] || ''}
                          </span>
                        </div>
                      )}
                      
                      {/* Lawyer info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
                        <h3 className="text-xl font-bold">
                          {sortedLawyers[currentIndex]?.first_name || 'Unknown'} {sortedLawyers[currentIndex]?.last_name || ''}
                        </h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{sortedLawyers[currentIndex]?.rating || '5.0'}</span>
                        </div>
                        <p className="mt-1 text-sm opacity-90">
                          {sortedLawyers[currentIndex]?.specialties?.map(s => s.name).join(', ') || 'Lawyer'}
                        </p>
                        <div className="flex items-center mt-2">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>${sortedLawyers[currentIndex]?.hourly_rate || '150'}/hr</span>
                        </div>
                      </div>
                      
                      {/* Swipe indicators */}
                      <div 
                        className="absolute top-4 left-4 rounded-full bg-red-500 p-2 z-30 transition-opacity"
                        style={{ opacity: dragXProgress.get() < -0.5 ? 1 : 0 }}
                      >
                        <X className="h-6 w-6 text-white" />
                      </div>
                      
                      <div 
                        className="absolute top-4 right-4 rounded-full bg-green-500 p-2 z-30 transition-opacity"
                        style={{ opacity: dragXProgress.get() > 0.5 ? 1 : 0 }}
                      >
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Swipe action buttons */}
              <SwipeActions 
                onSwipeLeft={handleSwipeLeft} 
                onSwipeRight={handleSwipeRight} 
                onUndoSwipe={handleUndoSwipe} 
                canUndo={swipeHistory.length > 0 && currentIndex > 0}
                disabled={isLoading.swipe}
              />
            </div>
          ) : (
            <EmptyState 
              isLoading={isLoading.lawyers}
              filters={filters}
              onOpenFilters={() => setFilterDrawerOpen(true)}
              onResetSwipes={handleResetSwipes}
              hasSwipedLawyers={swipedLawyers.size > 0}
            />
          )}
        </div>
        
        {/* Filter drawer */}
        <FilterDrawer
          isOpen={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          initialFilters={filters}
          onApply={handleFilterChange}
        />
        
        {/* Lawyer profile modal */}
        {selectedLawyer && (
          <LawyerProfileComponent 
            lawyer={selectedLawyer} 
            isOpen={true} 
            onClose={() => setSelectedLawyer(null)} 
            onLike={() => {
              setSelectedLawyer(null);
              handleSwipe('right');
            }} 
            onPass={() => {
              setSelectedLawyer(null);
              handleSwipe('left');
            }} 
          />
        )}
        
        {/* Connected popup for matches */}
        <ConnectedPopup
          isOpen={showConnectedPopup}
          onClose={() => setShowConnectedPopup(false)}
          lawyerName={connectedLawyer?.lawyerName || ''}
          lawyerImage={connectedLawyer?.profilePicture || ''}
          onMessage={() => {
            if (connectedLawyer?.conversationId) {
              handleGoToConversation();
            } else {
              // If there's no conversation ID, just close the popup
              setShowConnectedPopup(false);
            }
          }}
          keepSwiping={() => setShowConnectedPopup(false)}
        />
      </div>
    </main>
  );
}
