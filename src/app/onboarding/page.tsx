'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GeoCodeSelector } from '@/components/GeoCodeSelector';
import { useToast } from '@/components/ui/use-toast';

export default function OnboardingPage() {
  const router = useRouter();
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [loading, setLoading] = useState(false);
  // Only 2 steps for signup: (1) Email/password, (2) Personal info
  const [step, setStep] = useState(1);
  
  // Form data states
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Enhanced form data with geo code IDs and names
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    provinceId: '',  // stores the geo_code ID
    provinceName: '', // stores the display name
    cityId: '',      // stores the geo_code ID
    cityName: '',    // stores the display name
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle province selection
  const handleProvinceChange = (id: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      provinceId: id,
      provinceName: name,
      // Reset city when province changes
      cityId: '',
      cityName: ''
    }));
  };

  // Handle city selection
  const handleCityChange = (id: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      cityId: id,
      cityName: name
    }));
  };

  const handleNext = () => {
    // Validation for step 1
    if (step === 1) {
      if (!formData.email || !formData.password) {
        toast({
          title: 'Required fields',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }
      
      // Move to step 2
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast({
        title: 'Required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message || 'Invalid credentials',
          variant: 'destructive'
        });
        return;
      }
      
      router.push('/app/dashboard');
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For step 1, just move to next step
    if (step === 1) {
      handleNext();
      return;
    }
    
    // Final submission - validate all required fields
    if (step === 2) {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        toast({
          title: 'Required fields',
          description: 'Please fill in your personal information',
          variant: 'destructive'
        });
        return;
      }
      
      if (!formData.provinceId || !formData.cityId) {
        toast({
          title: 'Location required',
          description: 'Please select your province and city/municipality',
          variant: 'destructive'
        });
        return;
      }
      
      try {
        setLoading(true);
        
        const { error } = await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          user_type: 'client', // Always set as client
          phone_number: formData.phone,
          province_id: formData.provinceId,
          province_name: formData.provinceName,
          city_id: formData.cityId,
          city_name: formData.cityName
        });
        
        if (error) {
          toast({
            title: 'Signup failed',
            description: error.message || 'Failed to create account',
            variant: 'destructive'
          });
          return;
        }
        
        toast({
          title: 'Account created',
          description: 'Your account has been created successfully!',
        });
        
        router.push('/app/dashboard');
      } catch (error: Error | unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        toast({
          title: 'Signup failed',
          description: errorMessage,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/" className="block mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#FD484F]">LegalTendr</h1>
        </Link>
        
        {showLoginForm ? (
          // Login Form
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    name="email"
                    type="email" 
                    placeholder="you@example.com" 
                    value={loginData.email}
                    onChange={handleLoginInputChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    name="password"
                    type="password" 
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#FD484F] hover:bg-[#E13037] text-white"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/app/dashboard')}
              >
                Login with Google
              </Button>
              <div className="text-center w-full">
                <p className="text-sm text-gray-500">Don&apos;t have an account?</p>
                <Button 
                  variant="link" 
                  className="text-[#FD484F] p-0 h-auto"
                  onClick={() => setShowLoginForm(false)}
                >
                  Create Account
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          // Sign Up Form
          <Card>
            <CardHeader>
              <CardTitle>Create your account</CardTitle>
              <CardDescription>
                Sign up to find the perfect lawyer for your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignupSubmit}>
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          name="firstName" 
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          name="lastName" 
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Your phone number"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="province">Province</Label>
                      <GeoCodeSelector
                        type="province"
                        value={formData.provinceId}
                        onChange={handleProvinceChange}
                        placeholder="Select province"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City/Municipality</Label>
                      <GeoCodeSelector
                        type="city"
                        selectedProvince={formData.provinceId}
                        value={formData.cityId}
                        onChange={handleCityChange}
                        placeholder="Select city/municipality"
                        className="w-full"
                        disabled={!formData.provinceId}
                      />
                      {!formData.provinceId && (
                        <p className="text-xs text-gray-500 mt-1">Please select a province first</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-between">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  <Button 
                    type={step === 2 ? 'submit' : 'button'} 
                    onClick={step < 2 ? handleNext : undefined}
                    className={step === 1 ? 'w-full bg-[#FD484F] hover:bg-[#E13037] text-white' : 'bg-[#FD484F] hover:bg-[#E13037] text-white'}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (step === 1 ? 'Next' : 'Create Account')}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center w-full">
                <p className="text-sm text-gray-500">Already have an account?</p>
                <Button 
                  variant="link" 
                  className="text-[#FD484F] p-0 h-auto"
                  onClick={() => setShowLoginForm(true)}
                >
                  Login
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
