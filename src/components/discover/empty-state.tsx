'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { FilterOptions } from '@/components/discover/filter-drawer';

interface EmptyStateProps {
  isLoading: boolean;
  filters: FilterOptions;
  onOpenFilters: () => void;
  onResetSwipes: () => void;
  hasSwipedLawyers: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  isLoading,
  filters,
  onOpenFilters,
  onResetSwipes,
  hasSwipedLawyers
}) => {
  const isFiltersApplied = 
    filters.specialties.length > 0 || 
    (filters.provinceId && filters.cityId) || 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 500;
    
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
      {isLoading ? (
        <>
          <div className="rounded-full bg-gray-100 p-6 mb-2">
            <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold">Loading Lawyers</h3>
          <p className="text-gray-500 mb-4">Finding the best legal experts for you...</p>
        </>
      ) : (
        <>
          <div className="rounded-full bg-gray-100 p-6 mb-2">
            <RotateCcw className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold">No Lawyers Available</h3>
          <p className="text-gray-500 mb-4">
            {isFiltersApplied 
              ? "No lawyers match your current filters. Try adjusting your search criteria."
              : "No lawyers are available at the moment. Please check back later."}
          </p>
        </>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={onOpenFilters}
          className="w-full sm:w-auto"
          disabled={isLoading}
        >
          Adjust Filters
        </Button>
        {hasSwipedLawyers && (
          <Button 
            onClick={onResetSwipes}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Reset Swipes
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
