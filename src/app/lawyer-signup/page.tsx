'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/components/ui/toast";

export default function LawyerSignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    city: '',
    province: '',
    phone: '',
    bio: '',
    hourlyRate: '',
    yearsOfExperience: '',
  });

  // Fetch specialties on component mount
  useEffect(() => {
    async function fetchSpecialties() {
      const { data, error } = await supabase.from('specialties').select('*');
      if (!error && data) {
        setSpecialties(data);
      }
    }
    fetchSpecialties();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecialtyChange = (specialtyId: string) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(specialtyId)) {
        return prev.filter(id => id !== specialtyId);
      } else {
        return [...prev, specialtyId];
      }
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For step 1 and 2, just move to next step
    if (step < 3) {
      handleNext();
      return;
    }
    
    // For last step, register the lawyer
    setIsLoading(true);
    try {
      const userData = {
        user_type: 'lawyer',
        first_name: formData.firstName,
        last_name: formData.lastName,
        city: formData.city,
        province: formData.province,
        phone_number: formData.phone,
        profile_picture_url: null,
        bio: formData.bio,
        hourly_rate: parseFloat(formData.hourlyRate),
        years_of_experience: parseInt(formData.yearsOfExperience, 10),
        specialties: selectedSpecialties,
      };
      
      const { error, user } = await signUp(formData.email, formData.password, userData);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message || "Please check your information and try again."
        });
        return;
      }
      
      toast({
        variant: "success",
        title: "Account created successfully!",
        description: "Welcome to LegalTendr"
      });
      
      // On success, redirect to the dashboard
      router.push('/app/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration error",
        description: error.message || "An unexpected error occurred."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Link href="/" className="block mb-8 text-center">
          <h1 className="text-2xl font-bold legal-gradient-text">LegalTendr</h1>
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle>Create a Lawyer Account</CardTitle>
            <CardDescription>
              {step === 1 && "Enter your email to get started"}
              {step === 2 && "Tell us about your professional background"}
              {step === 3 && "Complete your lawyer profile"}
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
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Creating an account as a lawyer</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Are you a client? <Link href="/onboarding" className="text-blue-600 hover:underline">Sign up here</Link>
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (in $)</Label>
                    <Input 
                      id="hourlyRate" 
                      name="hourlyRate" 
                      type="number"
                      min="0"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Input 
                      id="yearsOfExperience" 
                      name="yearsOfExperience" 
                      type="number"
                      min="0"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input 
                      id="province" 
                      name="province" 
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio" 
                      name="bio" 
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Specialties</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {specialties.map(specialty => (
                        <div key={specialty.specialty_id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`specialty-${specialty.specialty_id}`}
                            checked={selectedSpecialties.includes(specialty.specialty_id)}
                            onChange={() => handleSpecialtyChange(specialty.specialty_id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label htmlFor={`specialty-${specialty.specialty_id}`} className="text-sm">
                            {specialty.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                    Back
                  </Button>
                )}
                <Button 
                  type={step === 3 ? 'submit' : 'button'} 
                  onClick={step < 3 ? handleNext : undefined}
                  className={step === 1 ? 'w-full legal-gradient-bg text-white' : 'legal-gradient-bg text-white'}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : step < 3 ? 'Next' : 'Create Account'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Already have an account? <Link href="/onboarding?tab=login" className="text-blue-600 hover:underline">Login here</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
