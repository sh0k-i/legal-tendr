"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"

export type GeoCodeItem = {
  id: string
  name: string
  geo_level: 'Prov' | 'City' | 'Mun'
}

type GeoCodeSelectorProps = {
  type: 'province' | 'city'
  selectedProvince?: string | null
  value: string
  onChange: (value: string, name: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function GeoCodeSelector({ 
  type, 
  selectedProvince = null,
  value, 
  onChange,
  placeholder = "Select...",
  className,
  disabled = false
}: GeoCodeSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<GeoCodeItem[]>([])
  const [loading, setLoading] = React.useState(false)
  
  // Cache data to avoid excessive fetching
  const [provinceCache, setProvinceCache] = React.useState<GeoCodeItem[]>([])
  const [cityCache, setCityCache] = React.useState<Record<string, GeoCodeItem[]>>({})

  // Selected item name for display
  const [selectedName, setSelectedName] = React.useState<string>("")
  
  // For debugging
  const [debugInfo, setDebugInfo] = React.useState<string>("")

  // Fetch provinces (only done once)
  React.useEffect(() => {
    if (type === 'province' && provinceCache.length === 0) {
      fetchProvinces();
    }
  }, [type, provinceCache.length]);

  // Fetch cities/municipalities when province changes
  React.useEffect(() => {
    if (type === 'city' && selectedProvince) {
      fetchCitiesByProvince(selectedProvince);
    }
  }, [type, selectedProvince]);

  // Update selected name when value changes
  React.useEffect(() => {
    if (value) {
      const list = type === 'province' ? provinceCache : 
        (selectedProvince && cityCache[selectedProvince]) || [];
      
      const selected = list.find(item => item.id === value);
      if (selected) {
        setSelectedName(selected.name);
      }
    } else {
      setSelectedName("");
    }
  }, [value, type, provinceCache, cityCache, selectedProvince]);

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('geo_code')
        .select('id, name, geo_level')
        .eq('geo_level', 'Prov')
        .order('name');

      if (error) {
        console.error('Error fetching provinces:', error);
        return;
      }

      setProvinceCache(data || []);
      if (type === 'province') {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error in fetchProvinces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCitiesByProvince = async (provinceId: string | null) => {
    // Safety check - ensure provinceId is a valid string
    if (!provinceId) {
      console.warn('Invalid province ID');
      setItems([]);
      return;
    }
    
    setDebugInfo(`Fetching cities for province: ${provinceId}`);
    
    // Return from cache if available
    if (cityCache[provinceId]) {
      setItems(cityCache[provinceId]);
      setDebugInfo(`Using cached cities for province: ${provinceId}`);
      return;
    }

    try {
      setLoading(true);
      
      // Make sure provinceId is a string and get the first 4 digits
      const provinceIdStr = String(provinceId);
      const provincePrefix = provinceIdStr.substring(0, 4);
      
      setDebugInfo(`Fetching with province ID: ${provinceId}, prefix: ${provincePrefix}`);
      
      // Use ilike with ::text casting to ensure proper type conversion
      const { data, error } = await supabase
        .from('geo_code')
        .select('id, name, geo_level')
        .in('geo_level', ['City', 'Mun'])
        .filter('id::text', 'ilike', `${provincePrefix}%`)
        .order('name');

      if (error) {
        console.error('Error fetching cities:', error.message || JSON.stringify(error));
        setDebugInfo(`Error: ${error.message || JSON.stringify(error)}`);
        return;
      }

      // Update cache
      setCityCache(prev => ({
        ...prev,
        [provinceId]: data || []
      }));
      
      setItems(data || []);
      setDebugInfo(`Fetched ${data?.length || 0} cities for province: ${provinceId}`);
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      console.error('Error in fetchCitiesByProvince:', errorMessage);
      setDebugInfo(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Direct click handler for each item
  const handleItemClick = (item: GeoCodeItem) => {
    console.log('Clicked item:', item.name, 'with ID:', item.id);
    setDebugInfo(`Selected: ${item.name} (${item.id})`);
    onChange(item.id, item.name);
    setSelectedName(item.name);
    setOpen(false);
  };

  return (
    <div className="w-full">
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <div className="relative">
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                className,
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
              onClick={() => !disabled && setOpen(!open)}
            >
              {selectedName || placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="p-0 bg-white shadow-lg z-[100] border border-gray-200 w-[--radix-popover-trigger-width]" 
            align="start" 
            sideOffset={4}
          >
            <div className="w-full bg-white rounded-md overflow-hidden">
              <div className="bg-white border-b">
                <div className="flex items-center px-3 py-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input 
                    placeholder={`Search ${type === 'province' ? 'province' : 'city/municipality'}...`}
                    className="h-9 w-full bg-white border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                    onChange={(e) => {
                      const query = e.target.value.toLowerCase();
                      const filtered = (type === 'province' ? provinceCache : 
                        (selectedProvince && cityCache[selectedProvince]) || [])
                        .filter(item => item.name.toLowerCase().includes(query));
                      setItems(filtered);
                    }}
                  />
                </div>
              </div>
              <div className="max-h-[200px] overflow-auto">
                <div className="p-1 bg-white">
                  {loading && <div className="p-2 text-sm text-center">Loading...</div>}
                  {!loading && items.length === 0 && <div className="p-2 text-sm text-center">No matches found.</div>}
                  <div>
                    {items.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          "px-2 py-1.5 text-sm rounded-sm flex items-center justify-between cursor-pointer hover:bg-gray-100",
                          value === item.id && "bg-gray-100"
                        )}
                      >
                        <span className="flex-grow truncate">
                          {item.name} 
                          <span className="text-xs text-gray-500 ml-1">
                            ({item.geo_level})
                          </span>
                        </span>
                        {value === item.id && <Check className="h-4 w-4" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </div>
      </Popover>
    </div>
  )
}
