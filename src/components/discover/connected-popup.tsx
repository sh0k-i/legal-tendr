'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface ConnectedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  lawyerName: string;
  lawyerImage: string;
  onMessage: () => void;
  keepSwiping?: () => void;
}

export function ConnectedPopup({ 
  isOpen, 
  onClose, 
  lawyerName, 
  lawyerImage,
  onMessage,
  keepSwiping = () => onClose() // Default implementation closes the popup
}: ConnectedPopupProps) {
  const [popupState, setPopupState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');

  // Handle popup animation states
  useEffect(() => {
    if (isOpen && popupState === 'closed') {
      setPopupState('opening');
      setTimeout(() => setPopupState('open'), 10);
    } else if (!isOpen && (popupState === 'open' || popupState === 'opening')) {
      setPopupState('closing');
      setTimeout(() => setPopupState('closed'), 300);
    }
  }, [isOpen, popupState]);

  // If popup is completely closed, don't render anything
  if (popupState === 'closed' && !isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        popupState === 'opening' || popupState === 'open' ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-[#FD484F] text-white rounded-3xl p-6 max-w-xs w-full transition-transform duration-300 transform ${
          popupState === 'opening' || popupState === 'open' 
            ? 'scale-100' 
            : 'scale-90'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold mb-6">You connected with {lawyerName}</h2>
          
          <div className="relative w-24 h-24 mb-6 rounded-full border-4 border-white overflow-hidden">
            {lawyerImage ? (
              <Image 
                src={lawyerImage} 
                alt={lawyerName} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-2xl font-bold text-gray-400">
                  {lawyerName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <p className="text-sm mb-8">
            Now you can message each other directly in the app
          </p>
          
          <div className="flex flex-col gap-3 w-full">
            <Button 
              className="w-full rounded-full py-6 bg-white/20 hover:bg-white/30 text-white border border-white/30"
              onClick={onMessage}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Send Message
            </Button>
            <Button 
              className="w-full rounded-full py-6 bg-transparent hover:bg-white/10 text-white border border-white/30"
              variant="ghost"
              onClick={keepSwiping}
            >
              Keep Swiping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
