import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="text-xl font-bold text-[#FD484F]">LegalTendr</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">Home</Link>
            <Link href="/about" className="text-sm font-medium text-primary">About Us</Link>
            <Link href="/blog" className="text-sm font-medium hover:text-primary">Blog</Link>
            <Link href="/faq" className="text-sm font-medium hover:text-primary">FAQ</Link>
            <Link href="/app/discover" className="text-sm font-medium hover:text-primary">Discover Lawyers</Link>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/onboarding" className="text-sm font-medium hover:text-primary">Sign Up as a Lawyer</Link>
            <Button asChild className="bg-[#FD484F] hover:bg-[#E13037] text-white border-none">
              <Link href="/onboarding">Sign Up</Link>
            </Button>
          </div>
          
          {/* Mobile hamburger menu button */}
          <button className="md:hidden p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-[#FD484F]">About LegalTendr</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-4">
              LegalTendr was founded with a clear mission: to revolutionize how people connect with legal professionals. We believe that finding the right lawyer should be as intuitive and personal as any other important relationship in your life.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              By combining the familiar interface of modern dating apps with sophisticated matching algorithms specifically designed for legal needs, we've created a platform that makes finding legal representation simpler, more transparent, and more effective.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-[#FD484F] flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Create Your Case</h3>
                  <p className="text-gray-700">Tell us about your legal situation. The more details you provide, the better we can match you with the right legal professionals.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-[#FD484F] flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Browse Matching Lawyers</h3>
                  <p className="text-gray-700">Our algorithm presents you with lawyers who specialize in your type of case. Swipe through profiles to find someone you connect with.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-[#FD484F] flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Connect and Collaborate</h3>
                  <p className="text-gray-700">Once you've found a match, communicate directly through our platform to share details and work together on your case.</p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Team</h2>
            <p className="text-lg text-gray-700 mb-6">
              LegalTendr was created by a team of legal professionals, technologists, and design thinkers who recognized the need for a more human-centered approach to legal services.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
                <h3 className="font-semibold">Jessica Chen</h3>
                <p className="text-gray-500">Co-Founder & CEO</p>
              </div>
              
              <div className="text-center">
                <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
                <h3 className="font-semibold">Marcus Johnson</h3>
                <p className="text-gray-500">Co-Founder & CTO</p>
              </div>
              
              <div className="text-center">
                <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
                <h3 className="font-semibold">Sophia Rodriguez</h3>
                <p className="text-gray-500">Chief Legal Officer</p>
              </div>
            </div>
          </section>
          
          <div className="text-center">
            <Button asChild size="lg" className="bg-[#FD484F] hover:bg-[#E13037] text-white">
              <Link href="/onboarding">Join LegalTendr Today</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#FD484F]">LegalTendr</h3>
              <p className="text-gray-400">Connecting clients with the perfect legal representation.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Lawyers</h4>
              <ul className="space-y-2">
                <li><Link href="/onboarding" className="text-gray-400 hover:text-white">Sign Up</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white">How It Works</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">info@legaltendr.com</li>
                <li className="text-gray-400">1-800-LEGAL-MATCH</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} LegalTendr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
