import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Premium PayStore | Next.js E-Commerce & UddoktaPay',
  description: 'Experience instant checkouts with bKash, Rocket, Nagad, and more through UddoktaPay.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <header className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-4 flex justify-end gap-3 text-xs">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="bg-white/5 border border-border px-3 py-1.5 rounded-lg font-semibold hover:bg-white/10 transition-all cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-semibold hover:bg-primary/90 transition-all cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
