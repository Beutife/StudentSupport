'use client';

import { OpenfortButton } from '@openfort/react';
import { useOpenfort } from '@openfort/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user } = useOpenfort();  // Get current user
  const router = useRouter();
  
  // If user logged in, redirect to create profile
  useEffect(() => {
    if (user) {
      router.push('/create-profile');
    }
  }, [user, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-3xl w-full text-center">
        {/* Header */}
        <h1 className="text-6xl font-bold mb-4 text-blue-600">
          🎓 StudentSupport
        </h1>
        <p className="text-2xl text-gray-700 mb-8">
          Help Nigerian students stay in school through crypto subscriptions
        </p>
        
        {/* Login Button (from Openfort docs) */}
        <div className="mb-12 p-8 bg-white rounded-2xl shadow-xl">
          <OpenfortButton
            showAvatar={true}
            showBalance={false}
            label="Get Started"
          />
          <p className="text-sm text-gray-500 mt-4">
            Your wallet will be created automatically - no crypto knowledge needed
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border-2 border-blue-100 rounded-xl">
            <div className="text-4xl mb-3">1️⃣</div>
            <h3 className="font-bold text-lg mb-2">Create Profile</h3>
            <p className="text-sm text-gray-600">
              Students share their story and monthly needs
            </p>
          </div>
          
          <div className="p-6 bg-white border-2 border-blue-100 rounded-xl">
            <div className="text-4xl mb-3">2️⃣</div>
            <h3 className="font-bold text-lg mb-2">Subscribe</h3>
            <p className="text-sm text-gray-600">
              Sponsors choose amount and duration
            </p>
          </div>
          
          <div className="p-6 bg-white border-2 border-blue-100 rounded-xl">
            <div className="text-4xl mb-3">3️⃣</div>
            <h3 className="font-bold text-lg mb-2">Auto-Pay Monthly</h3>
            <p className="text-sm text-gray-600">
              Session keys enable gasless recurring payments
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500 mt-12">
          Zero platform fees • Direct to students • Blockchain transparent
        </p>
      </div>
    </main>
  );
}