import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FAQPage() {
  // Mock FAQ data
  const faqCategories = [
    {
      id: 'general',
      title: 'General Questions',
      questions: [
        {
          id: 'what-is-legaltendr',
          question: 'What is LegalTendr?',
          answer: 'LegalTendr is a platform that connects clients with lawyers through an intuitive, mobile-centric interface. Similar to dating apps, it allows you to browse through lawyer profiles, match with legal professionals who fit your needs, and communicate directly with them to address your legal concerns.'
        },
        {
          id: 'how-does-it-work',
          question: 'How does LegalTendr work?',
          answer: 'LegalTendr works in three simple steps: First, create a case describing your legal needs. Second, browse and match with lawyers who specialize in your type of case. Finally, connect and communicate with your matches to find the perfect legal representation.'
        },
        {
          id: 'is-it-free',
          question: 'Is LegalTendr free to use?',
          answer: 'LegalTendr offers both free and premium subscription options. The basic features, including creating a profile and browsing lawyers, are free. Premium features, such as unlimited messaging and priority matching, require a subscription.'
        }
      ]
    },
    {
      id: 'clients',
      title: 'For Clients',
      questions: [
        {
          id: 'how-to-create-case',
          question: 'How do I create a case?',
          answer: 'To create a case, log in to your account, navigate to the "My Cases" section, and click on the "+" button. Fill in the details about your legal situation, select relevant categories, and submit. Your case will then be used to match you with appropriate lawyers.'
        },
        {
          id: 'how-matches-work',
          question: 'How are lawyer matches determined?',
          answer: 'Lawyer matches are determined based on several factors, including their legal specialties, location, availability, and experience relevant to your specific case. Our algorithm ensures you see the most suitable lawyers for your needs.'
        },
        {
          id: 'what-if-no-match',
          question: 'What if I don\'t find a lawyer I like?',
          answer: 'If you don\'t find a suitable match among the initially presented lawyers, you can adjust your case details or expand your search criteria. You can also continue browsing through our directory of lawyers until you find someone who meets your needs.'
        }
      ]
    },
    {
      id: 'lawyers',
      title: 'For Lawyers',
      questions: [
        {
          id: 'how-to-join',
          question: 'How can I join LegalTendr as a lawyer?',
          answer: 'To join as a lawyer, visit our "Sign Up as a Lawyer" page and complete the registration process. You\'ll need to provide your professional information, areas of expertise, and complete our verification process before your profile becomes active.'
        },
        {
          id: 'how-clients-find-me',
          question: 'How will clients find me?',
          answer: 'Clients will be matched with you based on your specialties, location, and their specific legal needs. When a client\'s case matches your expertise, your profile will be shown to them. They can then choose to connect with you.'
        },
        {
          id: 'fees-structure',
          question: 'What are the fees for lawyers?',
          answer: 'LegalTendr offers different subscription tiers for lawyers. You can start with a basic free listing, or choose premium options that offer enhanced visibility, priority matching, and advanced communication tools. Visit our pricing page for detailed information.'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      questions: [
        {
          id: 'data-secure',
          question: 'Is my information secure?',
          answer: 'Yes, LegalTendr takes data security very seriously. We use industry-standard encryption for all communications and store your data securely. We never share your personal information with third parties without your explicit consent.'
        },
        {
          id: 'conversation-confidential',
          question: 'Are my conversations with lawyers confidential?',
          answer: 'Yes, all communications between you and lawyers through our platform are private and confidential. We maintain strict privacy controls to ensure that only you and the lawyer you\'re communicating with can access your conversations.'
        }
      ]
    }
  ];

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
            <Link href="/about" className="text-sm font-medium hover:text-primary">About Us</Link>
            <Link href="/blog" className="text-sm font-medium hover:text-primary">Blog</Link>
            <Link href="/faq" className="text-sm font-medium text-primary">FAQ</Link>
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
          <h1 className="text-4xl font-bold mb-2 text-[#FD484F]">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions about LegalTendr
          </p>
          
          {/* FAQ categories */}
          <div className="space-y-10">
            {faqCategories.map(category => (
              <div key={category.id} id={category.id}>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">{category.title}</h2>
                <div className="space-y-6">
                  {category.questions.map(faq => (
                    <div key={faq.id} className="border-b pb-6">
                      <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Contact section */}
          <div className="mt-16 p-8 border rounded-lg bg-gray-50 text-center">
            <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Please contact our support team.
            </p>
            <Button asChild className="bg-[#FD484F] hover:bg-[#E13037] text-white">
              <Link href="mailto:support@legaltendr.com">Contact Support</Link>
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
