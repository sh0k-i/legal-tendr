import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function BlogPage() {
  // Mock blog posts
  const blogPosts = [
    {
      id: 1,
      title: 'How to Choose the Right Family Lawyer',
      excerpt: 'Finding the right family lawyer is crucial for navigating divorce, custody, and other sensitive legal matters. Here are our top tips for making this important decision.',
      date: 'May 15, 2025',
      author: 'Jessica Chen',
      category: 'Family Law',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'Understanding Business Incorporation: A Guide for Startups',
      excerpt: 'Choosing the right business structure is one of the most important decisions for new entrepreneurs. This guide breaks down the options and their legal implications.',
      date: 'May 10, 2025',
      author: 'Marcus Johnson',
      category: 'Business Law',
      readTime: '8 min read',
    },
    {
      id: 3,
      title: 'The Changing Landscape of Immigration Law in 2025',
      excerpt: 'Recent policy changes have significantly impacted immigration procedures. Learn what these changes mean for applicants and how to navigate the new requirements.',
      date: 'May 5, 2025',
      author: 'Sophia Rodriguez',
      category: 'Immigration Law',
      readTime: '7 min read',
    },
    {
      id: 4,
      title: 'Estate Planning Essentials: Protecting Your Family\'s Future',
      excerpt: 'Many people put off estate planning, but it\'s one of the most important steps you can take to protect your loved ones. Here\'s what you need to know to get started.',
      date: 'April 28, 2025',
      author: 'David Wong',
      category: 'Estate Law',
      readTime: '6 min read',
    },
    {
      id: 5,
      title: 'Digital Privacy Rights: What You Need to Know',
      excerpt: 'In an increasingly digital world, understanding your privacy rights is more important than ever. This post explains current laws and how they protect you online.',
      date: 'April 20, 2025',
      author: 'Aisha Patel',
      category: 'Privacy Law',
      readTime: '9 min read',
    },
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
            <Link href="/blog" className="text-sm font-medium text-primary">Blog</Link>
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 legal-gradient-text">Legal Blog</h1>
          <p className="text-xl text-gray-600 mb-8">
            Insights, guides, and updates from the legal world
          </p>
          
          {/* Categories filter - could be expanded in a real app */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button variant="outline" className="rounded-full">All Topics</Button>
            <Button variant="outline" className="rounded-full">Family Law</Button>
            <Button variant="outline" className="rounded-full">Business Law</Button>
            <Button variant="outline" className="rounded-full">Immigration</Button>
            <Button variant="outline" className="rounded-full">Estate Planning</Button>
          </div>
          
          {/* Blog posts */}
          <div className="space-y-6">
            {blogPosts.map(post => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl hover:text-primary">
                        <Link href={`/blog/${post.id}`}>
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex gap-3 mt-1">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                        <span>•</span>
                        <span>{post.category}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-gray-500">By {post.author}</div>
                  <Link href={`/blog/${post.id}`} className="text-primary hover:underline">
                    Read More →
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Pagination - simplified for prototype */}
          <div className="flex justify-center mt-10">
            <div className="flex gap-2">
              <Button variant="outline" disabled>Previous</Button>
              <Button variant="outline" className="bg-primary text-white">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
          
          {/* Newsletter signup */}
          <div className="mt-16 p-8 border rounded-lg bg-gray-50">
            <h2 className="text-2xl font-bold mb-3 text-center">Subscribe to Our Newsletter</h2>
            <p className="text-center text-gray-600 mb-6">
              Get the latest legal insights and tips delivered directly to your inbox.
            </p>
            <form className="flex gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-[#FD484F] hover:bg-[#E13037] text-white">Subscribe</Button>
            </form>
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
