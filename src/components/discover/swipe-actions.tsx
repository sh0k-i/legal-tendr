'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Heart, CornerUpLeft } from 'lucide-react';

interface SwipeActionsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onUndoSwipe: () => void;
  canUndo: boolean;
  disabled: boolean;
}

const SwipeActions: React.FC<SwipeActionsProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onUndoSwipe,
  canUndo,
  disabled
}) => {
  return (
    <div className="flex items-center justify-center gap-4 py-5">
      <Button
        onClick={onSwipeLeft}
        disabled={disabled}
        size="icon"
        variant="outline"
        className="h-14 w-14 rounded-full bg-white border-gray-200 shadow-md hover:bg-red-50 hover:border-red-200 transition-all"
      >
        <X className="h-6 w-6 text-red-500" />
      </Button>
      
      {canUndo && (
        <Button
          onClick={onUndoSwipe}
          disabled={disabled}
          size="icon"
          variant="outline"
          className="h-12 w-12 rounded-full bg-white border-gray-200 shadow-md hover:bg-blue-50 hover:border-blue-200 transition-all"
        >
          <CornerUpLeft className="h-5 w-5 text-blue-500" />
        </Button>
      )}
      
      <Button
        onClick={onSwipeRight}
        disabled={disabled}
        size="icon"
        variant="outline"
        className="h-14 w-14 rounded-full bg-white border-gray-200 shadow-md hover:bg-green-50 hover:border-green-200 transition-all"
      >
        <Heart className="h-6 w-6 text-green-500" />
      </Button>
    </div>
  );
};

export default SwipeActions;
