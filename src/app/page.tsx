"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden">
      <Navbar />

      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section Desktop*/}
        <section className="hidden sm:block relative px-0 py-4">
          <div className="relative flex flex-row items-center">
            {/* left content */}
            <div className="w-3/4 z-0 bg-white">
              <img src="/hero_1.png" alt="Background" className="w-full" />
            </div>
            <div className="absolute left-0 center-y w-3/4 z-20 pl-16 pr-36 space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl text-gray-50 font-bold mb-4">
                  Find Legal Help That Fits Your Needs
                </h1>
                <p className="text-gray-50 text-base font-light">
                  Connect with qualified legal professionals in your area who
                  specialize in your specific legal needs. Compare lawyers, read
                  reviews, and choose the right lawyer for you.{" "}
                </p>
              </div>
              <Button
                size="lg"
                className="rounded-full border border-gray-50/10 text-gray-50 bg-white/10 backdrop-blur-xl hover:scale-105 transition-all hover:bg-white/20"
              >
                <Link href="/onboarding">Get Started</Link>
              </Button>
            </div>
            {/* right content */}
            <div className="absolute right-0 sm:w-[200px] md:w-[250px] lg:w-[350px] xl:w-[400px] max-w-[400px] z-20 flex justify-end">
              <img
                src="/hero_feature.png"
                alt="Background"
                className="w-full drop-shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Hero Section Mobile */}
        <section className="block sm:hidden relative px-0 py-4 pb-80">
          <div className="relative flex flex-col items-center">
            {/* left content */}
            <div className="w-full z-0">
              <img
                src="/hero_3_mobile.png"
                alt="Background"
                className="w-full"
              />
            </div>

            {/* left content 2 */}
            <div className="absolute top-0 center-y w-full z-20 px-4 pt-8 space-y-6">
              <div className="space-y-4 w-full">
                <h1 className="text-3xl text-gray-50 font-bold mb-4 text-center">
                  Find Legal Help That Fits Your Needs
                </h1>
                <p className="text-gray-50 text-sm text-center font-light">
                  Connect with qualified legal professionals in your area who
                  specialize in your specific legal needs. Compare lawyers, read
                  reviews, and choose the right lawyer for you.{" "}
                </p>
              </div>
              <Button
                size="lg"
                className="rounded-full w-full border border-gray-50/10 text-gray-50 bg-white/10 backdrop-blur-xl hover:scale-105 transition-all hover:bg-white/20"
              >
                <Link href="/onboarding">Get Started</Link>
              </Button>
            </div>

            {/* bottom content */}
            <div className="absolute right-0 bottom-[-220px] w-[300px] max-w-[300px] z-0 flex justify-end">
              <img
                src="/hero_feature.png"
                alt="Background"
                className="w-full drop-shadow-xl"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How LegalTendr Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find the Right Lawyer</h3>
              <p className="text-gray-600">Browse lawyers based on specialty, location, and reviews to find the perfect match for your legal needs.</p>
            </div>
            
            <div className=" p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Directly</h3>
              <p className="text-gray-600">Message lawyers directly through our secure platform to discuss your case and get initial guidance.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Your Cases</h3>
              <p className="text-gray-600">Keep track of your legal matters, documents, and communications all in one secure place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Legal Help?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">Join thousands of people who have found the right legal help through LegalTendr.</p>
          <Button size="lg" className="bg-[#FD484F] hover:bg-[#E13037] text-white">
            <Link href="/onboarding">Get Started Now</Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LegalTendr</h3>
              <p className="text-gray-300">
                Connecting you with legal professionals who can help with your
                specific needs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-white"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-300 hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-300 hover:text-white"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-300 hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-gray-300 hover:text-white"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-300">support@legaltendr.com</li>
                <li className="text-gray-300">+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} LegalTendr. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
