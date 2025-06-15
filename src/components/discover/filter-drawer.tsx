'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Star, RotateCcw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { HIDE_BOTTOM_NAV, SHOW_BOTTOM_NAV } from '@/components/layout/bottom-nav';
import { GeoCodeSelector } from '@/components/GeoCodeSelector';
import { useToast } from '@/components/ui/use-toast';

// Specialty categories that match our Supabase data
const specialtyCategories = [
  { id: 's1', name: 'Family Law' },
  { id: 's2', name: 'Corporate Law' },
  { id: 's3', name: 'Immigration Law' },
  { id: 's4', name: 'Real Estate Law' },
  { id: 's5', name: 'Criminal Law' },
  { id: 's6', name: 'Employment Law' },
  { id: 's7', name: 'Environmental Law' },
  { id: 's8', name: 'Intellectual Property Law' },
];

// Major cities in Canada
const cities = [
  'Toronto',
  'Vancouver',
  'Montreal',
  'Calgary',
  'Ottawa',
  'Edmonton',
  'Winnipeg',
  'Halifax',
  'Quebec City',
  'Victoria',
  'Saskatoon',
  'Regina',
  'St. John\'s',
];

export type FilterOptions = {
  specialties: string[];
  location?: string;
  provinceId?: string;
  provinceName?: string;
  cityId?: string;
  cityName?: string;
  priceRange: [number, number];
};

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
}

export function FilterDrawer({ isOpen, onClose, onApply, initialFilters }: FilterDrawerProps) {
  // Local state for filters
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const { toast } = useToast();
  const [drawerState, setDrawerState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  
  // Update local filters when initialFilters change (e.g., when filters are loaded from localStorage)
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Handle drawer animation states
  useEffect(() => {
    if (isOpen && drawerState === 'closed') {
      setDrawerState('opening');
      // Hide bottom nav when drawer opens
      window.dispatchEvent(new Event(HIDE_BOTTOM_NAV));
      setTimeout(() => setDrawerState('open'), 10); // Start transition after a small delay
    } else if (!isOpen && (drawerState === 'open' || drawerState === 'opening')) {
      setDrawerState('closing');
      setTimeout(() => {
        setDrawerState('closed');
        // Show bottom nav when drawer is fully closed
        window.dispatchEvent(new Event(SHOW_BOTTOM_NAV));
      }, 300); // Match transition duration
    }
  }, [isOpen, drawerState]);

  // If drawer is completely closed, don't render anything
  if (drawerState === 'closed' && !isOpen) return null;

  // Handle specialty toggle
  const toggleSpecialty = (specialtyId: string) => {
    setFilters(prev => {
      const specialties = prev.specialties.includes(specialtyId)
        ? prev.specialties.filter(id => id !== specialtyId)
        : [...prev.specialties, specialtyId];

      return { ...prev, specialties };
    });
  };

  // Handle location change
  const handleLocationChange = (location: string) => {
    setFilters(prev => ({ ...prev, location }));
  };

  // Handle price range change
  const handlePriceRangeChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, priceRange: [value[0], value[1]] }));
  };

  // Apply filters and close drawer
  const handleApply = () => {
    // Validate: if province is selected, city must also be selected
    if (filters.provinceId && !filters.cityId) {
      toast({
        title: "City/Municipality Required",
        description: "Please select a city or municipality when province is selected",
        variant: "destructive"
      });
      return;
    }
    
    onApply(filters);
    onClose();
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      specialties: [],
      priceRange: [0, 500],
    });
  };

  // The actual filter content is the same for both mobile and desktop
  const FilterContent = () => (
    <>
      {/* Province and City selectors */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium mb-2">Location</h3>
          {(filters.provinceId || filters.cityId) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs" 
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  provinceId: undefined,
                  provinceName: undefined,
                  cityId: undefined,
                  cityName: undefined
                }));
              }}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        
        {/* Province Selector */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="province">Province</Label>
            <GeoCodeSelector
              type="province"
              value={filters.provinceId || ''}
              onChange={(value, name) => {
                setFilters(prev => ({
                  ...prev,
                  provinceId: value,
                  provinceName: name,
                  // Reset city when province changes
                  cityId: undefined,
                  cityName: undefined
                }));
              }}
              placeholder="Select province"
              className="w-full"
            />
          </div>
          
          {/* City/Municipality Selector */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label htmlFor="city">City/Municipality</Label>
              {filters.provinceId && !filters.cityId && (
                <span className="text-xs text-red-500">* Required with Province</span>
              )}
            </div>
            <GeoCodeSelector
              type="city"
              selectedProvince={filters.provinceId || ''}
              value={filters.cityId || ''}
              onChange={(value, name) => {
                setFilters(prev => ({
                  ...prev,
                  cityId: value,
                  cityName: name
                }));
              }}
              placeholder="Select city/municipality"
              className="w-full"
              disabled={!filters.provinceId}
            />
            {!filters.provinceId && (
              <p className="text-xs text-gray-500 mt-1">Please select a province first</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Price range */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Price Range</h3>
        <div className="px-2">
          <Slider 
            defaultValue={filters.priceRange} 
            max={500}
            step={25}
            onValueChange={handlePriceRangeChange}
          />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>
      
      {/* Specialties */}
      <div>
        <h3 className="font-medium mb-2">Select Practice Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {specialtyCategories.map(specialty => (
            <div key={specialty.id} className="flex items-center space-x-2">
              <Checkbox 
                id={specialty.id} 
                checked={filters.specialties.includes(specialty.id)}
                onCheckedChange={() => toggleSpecialty(specialty.id)}
              />
              <Label htmlFor={specialty.id} className="text-sm">{specialty.name}</Label>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
        drawerState === 'opening' || drawerState === 'open' ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Mobile: Bottom Drawer */}
      <div 
        className={`md:hidden absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden shadow-lg transition-transform duration-300 ease-out transform ${
          drawerState === 'opening' || drawerState === 'open' 
            ? 'translate-y-0' 
            : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer handle - only shown on mobile */}
        <div className="w-full flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Filter content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          <FilterContent />
        </div>
        
        {/* Footer with action button */}
        <div className="p-4 border-t">
          <Button 
            className="w-full py-6 rounded-lg font-medium bg-[#FD484F] hover:bg-[#E13037] text-white" 
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Desktop: Side Drawer */}
      <div 
        className={`hidden md:block absolute top-0 right-0 bottom-0 w-96 bg-white dark:bg-gray-900 overflow-hidden shadow-lg transition-transform duration-300 ease-out transform ${
          drawerState === 'opening' || drawerState === 'open' 
            ? 'translate-x-0' 
            : 'translate-x-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-semibold">Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Filter content */}
        <div className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          <FilterContent />
        </div>
        
        {/* Footer with action buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white flex gap-2">
          <Button 
            variant="outline" 
            onClick={resetFilters} 
            className="flex-1"
          >
            Reset
          </Button>
          <Button 
            onClick={handleApply} 
            className="flex-1 bg-[#FD484F] hover:bg-[#E13037] text-white"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
