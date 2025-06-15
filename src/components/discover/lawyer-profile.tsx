'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, X, MessageSquare, Star, Phone, MapPin, Clock, DollarSign, ChevronLeft } from 'lucide-react';
// Define types for our lawyer profile data
export interface Specialty {
  specialty_id: string;
  name: string;
  description?: string;
}

export interface LawyerBase {
  lawyer_id: string;
  bio?: string;
  matches_count: number;
  rating: number;
  reviews: number;
  hourly_rate: number;
  years_of_experience: number;
  created_at?: string;
  updated_at?: string;
}

export interface Lawyer extends LawyerBase {
  profile_picture_url?: string;
  first_name: string;
  last_name: string;
  city_id?: string;
  city_name?: string;
  province_id?: string;
  province_name?: string;
}

export interface User {
  user_id: string;
  email?: string;
}

// Combined lawyer profile with user data and specialties
export interface LawyerProfileData extends LawyerBase, Partial<User> {
  profile_picture_url?: string;
  first_name: string;
  last_name: string;
  city_id?: string;
  city_name?: string;
  province_id?: string;
  province_name?: string;
  specialties: Specialty[];
  // For tracking matched conversation
  conversation_id?: string;
}

import { motion, AnimatePresence } from 'framer-motion';
import { HIDE_BOTTOM_NAV, SHOW_BOTTOM_NAV } from '@/components/layout/bottom-nav';

interface LawyerProfileProps {
  lawyer: LawyerProfileData;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
}

export function LawyerProfile({ 
  lawyer, 
  isOpen, 
  onClose, 
  onLike, 
  onPass 
}: LawyerProfileProps) {
  // Handle hiding/showing bottom nav
  useEffect(() => {
    if (isOpen) {
      // Dispatch custom event to hide bottom nav
      window.dispatchEvent(new Event(HIDE_BOTTOM_NAV));
    }
    
    return () => {
      // Dispatch custom event to show bottom nav when component unmounts
      window.dispatchEvent(new Event(SHOW_BOTTOM_NAV));
    };
  }, [isOpen]);
  
  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-40 bg-white overflow-y-auto"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {/* Header with profile image */}
      <div className="relative h-80">
        {lawyer.profile_picture_url ? (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${lawyer.profile_picture_url})` }}
          ></div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-6xl font-bold text-gray-300">
              {lawyer.first_name?.[0]}{lawyer.last_name?.[0]}
            </span>
          </div>
        )}
        
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full h-10 w-10"
          onClick={onClose}
        >
          <ChevronLeft className="h-5 w-5 text-gray-800" />
        </Button>
        
        {/* Color overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#FD484F]/40 h-40"></div>
      </div>
      
      {/* Profile content */}
      <div className="px-5 py-0 -mt-16 relative z-10">
        {/* Name, rating and location card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-5 mb-6"
        >
          {/* Name and location */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold">{lawyer.first_name} {lawyer.last_name}</h1>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{lawyer.city_name || 'Unknown City'}, {lawyer.province_name || 'Unknown Province'}</span>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-5 w-5 ${star <= Math.round(lawyer.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
              />
            ))}
            <span className="ml-2 text-sm font-medium">{lawyer.rating.toFixed(1)}</span>
            <span className="ml-1 text-sm text-gray-500">({lawyer.reviews} reviews)</span>
          </div>
        </motion.div>
        
        {/* Quick info */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <div className="flex items-center p-4 bg-gray-50 rounded-xl shadow-sm">
            <DollarSign className="h-6 w-6 text-[#FD484F] mr-3" />
            <div>
              <p className="text-xs text-gray-500">Hourly Rate</p>
              <p className="font-medium text-lg">${lawyer.hourly_rate}/hr</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-xl shadow-sm">
            <Clock className="h-6 w-6 text-[#FD484F] mr-3" />
            <div>
              <p className="text-xs text-gray-500">Experience</p>
              <p className="font-medium text-lg">{lawyer.years_of_experience} years</p>
            </div>
          </div>
        </motion.div>
        
        {/* Specialties */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold mb-3">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {lawyer.specialties?.map((specialty: Specialty) => (
              <span 
                key={specialty.specialty_id} 
                className="bg-gray-100 px-4 py-2 rounded-full text-sm"
              >
                {specialty.name}
              </span>
            ))}
          </div>
        </motion.div>
        
        {/* About */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold mb-3">About</h2>
          <p className="text-gray-700 leading-relaxed">{lawyer.bio || 'No bio available.'}</p>
        </motion.div>
        
        {/* Education */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mb-20"
        >
          <h2 className="text-lg font-semibold mb-3">Education</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-medium">J.D. Law Degree</p>
              <p className="text-sm text-gray-600">University of {lawyer.province_name || 'Ontario'}</p>
              <p className="text-xs text-gray-500 mt-1">2010 - 2013</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-4 shadow-lg">
        <Button 
          variant="outline"
          className="flex-1 h-14 rounded-full border-2"
          onClick={onPass}
        >
          <X className="h-5 w-5 mr-2" /> Pass
        </Button>
        <Button 
          className="flex-1 h-14 rounded-full bg-[#FD484F] hover:bg-[#E13037] text-white"
          onClick={onLike}
        >
          <Heart className="h-5 w-5 mr-2" /> Like
        </Button>
      </div>
    </motion.div>
  );
}
