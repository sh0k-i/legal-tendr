'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { Edit, LogOut, Settings, HelpCircle, Trash, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, signOut, isLoading: authLoading } = useAuth();
  const { refreshLawyerProfiles } = useApp();
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    province: ''
  });
  
  // Update form data when user profile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone_number || '',
        city: userProfile.city || '',
        province: userProfile.province || ''
      });
    }
  }, [userProfile]);
  
  if (authLoading) {
    return (
      <div className="flex flex-col h-full p-4">
        <header className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </header>
        
        <Card className="mb-6">
          <CardHeader className="relative">
            <div className="flex flex-col items-center">
              <Skeleton className="w-24 h-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-center text-gray-500">Unable to load user profile.</p>
        <Button 
          onClick={() => router.push('/')}
          className="mt-4"
        >
          Return to Home
        </Button>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error logging out',
        description: 'There was a problem logging out. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Reset passed lawyers - clear the left swiped lawyers from localStorage
  const handleResetPassedLawyers = () => {
    try {
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get the swipe history from localStorage
      const swipesJSON = localStorage.getItem(`legal-tendr-swipes-${user.id}`);
      if (!swipesJSON) {
        // If no swipes exist, nothing to reset
        setResetConfirmOpen(false);
        toast({
          title: 'No passed lawyers',
          description: 'You haven\'t passed on any lawyers yet.',
          variant: 'default'
        });
        return;
      }
      
      // Parse the swipe history
      const swipes = JSON.parse(swipesJSON);
      
      // Check if there are any left swipes to reset
      const leftSwipes = swipes.filter((swipe: any) => swipe.isMatch === false);
      if (leftSwipes.length === 0) {
        setResetConfirmOpen(false);
        toast({
          title: 'No passed lawyers',
          description: 'You haven\'t passed on any lawyers yet.',
          variant: 'default'
        });
        return;
      }
      
      // Filter out left swipes, keep only right swipes (matches)
      const filteredSwipes = swipes.filter((swipe: any) => swipe.isMatch === true);
      
      // Save the filtered history back to localStorage
      localStorage.setItem(`legal-tendr-swipes-${user.id}`, JSON.stringify(filteredSwipes));
      
      // Refresh lawyer profiles to show passed lawyers again
      refreshLawyerProfiles();
      
      // Close the confirmation dialog
      setResetConfirmOpen(false);
      
      // Provide user feedback with count of reset lawyers
      toast({
        title: `${leftSwipes.length} passed lawyers reset`,
        description: 'You will see previously passed lawyers again in Discover.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error resetting passed lawyers:', error);
      toast({
        title: 'Error resetting passed lawyers',
        description: 'There was a problem resetting passed lawyers. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-4 scrollbar-container">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-gray-500">Manage your profile and settings</p>
      </header>
      
      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
              {userProfile.profile_picture_url ? (
                <div 
                  className="w-24 h-24 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${userProfile.profile_picture_url})` }}
                ></div>
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-200">
                  <span className="text-3xl font-bold text-gray-400">
                    {userProfile.first_name?.[0]}{userProfile.last_name?.[0]}
                  </span>
                </div>
              )}
            </div>
            <CardTitle className="text-xl">
              {userProfile.first_name} {userProfile.last_name}
            </CardTitle>
            <p className="text-gray-500">{userProfile.email}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 divide-y">
            <div className="pt-3">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
              <p>{userProfile.city}, {userProfile.province}</p>
            </div>
            <div className="pt-3">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Account Type</h3>
              <p>{userProfile.profileType === 'lawyer' ? 'Lawyer' : 'Client'}</p>
            </div>
            <div className="pt-3">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
              <p>{userProfile.phone_number || 'Not provided'}</p>
            </div>
            <div className="pt-3">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Member Since</h3>
              <p>{new Date(userProfile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Options Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link href="/app/account/settings" className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <Settings className="h-5 w-5 mr-3 text-gray-500" />
              <span>Settings</span>
            </Link>
            <Link href="/faq" className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <HelpCircle className="h-5 w-5 mr-3 text-gray-500" />
              <span>Help Center</span>
            </Link>
            <button 
              onClick={() => setResetConfirmOpen(true)}
              className="flex items-center p-3 border rounded-lg w-full text-left hover:bg-gray-50"
            >
              <RefreshCw className="h-5 w-5 mr-3 text-gray-500" />
              <span>Reset Passed Lawyers</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center p-3 border rounded-lg w-full text-left hover:bg-gray-50 text-red-600"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog for Reset Passed Lawyers */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Passed Lawyers</DialogTitle>
            <DialogDescription>
              This will reset all lawyers you've passed (swiped left) so they will show up again in your Discover feed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassedLawyers}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Reset Passed Lawyers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input 
                  id="province" 
                  value={formData.province}
                  onChange={(e) => setFormData({...formData, province: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                className="legal-gradient-bg text-white"
                onClick={() => {
                  // In a real app, we would call an API to update the user profile
                  toast({
                    title: 'Profile updated',
                    description: 'Your profile has been updated successfully.',
                    variant: 'success'
                  });
                  setIsEditProfileOpen(false);
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
