'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Heart, X, DollarSign } from 'lucide-react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import Image from 'next/image';
import { LawyerProfileData } from '@/components/discover/lawyer-profile';

interface LawyerCardProps {
  lawyer: LawyerProfileData;
  index: number;
  total: number;
  dragX: MotionValue<number>;
  dragXProgress: MotionValue<number>;
  cardRef: React.RefObject<HTMLDivElement>;
  swipeDirection: 'left' | 'right' | null;
  handleDragEnd: (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => void;
  handleOpenProfile: () => void;
}

const LawyerCard: React.FC<LawyerCardProps> = ({
  lawyer,
  index,
  total,
  dragX,
  dragXProgress,
  cardRef,
  swipeDirection,
  handleDragEnd,
  handleOpenProfile
}) => {
  return (
    <motion.div 
      ref={cardRef}
      className="relative w-full max-w-md will-change-transform"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x: dragX }}
      animate={{
        x: swipeDirection === 'left' ? -600 : swipeDirection === 'right' ? 600 : 0,
        rotate: swipeDirection === 'left' ? -20 : swipeDirection === 'right' ? 20 : 0,
        opacity: swipeDirection ? 0 : 1
      }}
      transition={{ duration: 0.3, type: 'spring', bounce: 0.2 }}
    >
      <Card 
        className="overflow-hidden shadow-xl border-0 rounded-[28px] cursor-pointer h-full w-full max-w-sm"
        onClick={handleOpenProfile}
      >
        {/* Lawyer photo covering the entire card */}
        <div className="aspect-[3/4] relative w-full h-full overflow-hidden rounded-[28px]">
          {lawyer.profile_picture_url ? (
            <div className="absolute inset-0">
              <Image 
                src={lawyer.profile_picture_url}
                alt={`${lawyer.first_name} ${lawyer.last_name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#FD484F]/10">
              <span className="text-6xl font-bold text-gray-300">
                {lawyer.first_name?.[0]}{lawyer.last_name?.[0]}
              </span>
            </div>
          )}
          
          {/* Swipe indicators */}
          <motion.div 
            className="absolute top-6 right-6 bg-green-500 text-white rounded-full p-3 transform origin-center shadow-lg z-30"
            style={{ 
              opacity: useTransform(dragXProgress, [0, 0.5, 1], [0, 0, 1]),
              scale: useTransform(dragXProgress, [0, 0.8, 1], [0.5, 1, 1.5]),
              rotate: useTransform(dragXProgress, [0, 1], [0, 40])
            }}
          >
            <Heart className="h-8 w-8" />
          </motion.div>
          
          <motion.div 
            className="absolute top-6 left-6 bg-red-500 text-white rounded-full p-3 transform origin-center shadow-lg z-30"
            style={{ 
              opacity: useTransform(dragXProgress, [-1, -0.5, 0], [1, 0, 0]),
              scale: useTransform(dragXProgress, [-1, -0.8, 0], [1.5, 1, 0.5]),
              rotate: useTransform(dragXProgress, [-1, 0], [-40, 0])
            }}
          >
            <X className="h-8 w-8" />
          </motion.div>
          
          {/* Color overlay */}
          <div className="absolute inset-0 bg-[#FD484F]/40" />
          
          {/* Lawyer info at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold">{lawyer.first_name} {lawyer.last_name}</h3>
              <div className="flex items-center gap-0.5">
                <span className="text-lg font-semibold">{lawyer.rating || '—'}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {lawyer.specialties?.slice(0, 2).map(specialty => (
                <span 
                  key={specialty.specialty_id} 
                  className="bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium"
                >
                  {specialty.name}
                </span>
              ))}
              {lawyer.specialties && lawyer.specialties.length > 2 && (
                <span className="bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                  +{lawyer.specialties.length - 2} more
                </span>
              )}
            </div>
            
            <div className="flex items-center mt-1">
              <DollarSign className="h-4 w-4 mr-1 text-green-400" />
              <span className="text-sm font-medium">${lawyer.hourly_rate}/hour</span>
            </div>
          </div>
        </div>
        
        {/* Card counter */}
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-white/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full font-medium text-gray-700">
            {index + 1} of {total}
          </span>
        </div>
      </Card>
    </motion.div>
  );
};

export default LawyerCard;
