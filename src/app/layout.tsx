import { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const config = {
  title: "LegalTendr - Find the Right Lawyer for Your Legal Needs",
  description: "LegalTendr connects clients with lawyers through a simple and intuitive matching process.",
};

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            <ToastProvider>
              {children}
              {/* Hidden element for toast fallback */}
              <div data-toast-container className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md" />
            </ToastProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
