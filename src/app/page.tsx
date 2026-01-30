'use client';

import { OpenfortButton } from '@openfort/react';
import { useOpenfort } from '@openfort/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user } = useOpenfort();  // Get current user
  const router = useRouter();
  
  const handleViewProfile = async () => {
    if (!user) return;
  
    try {
      // Get user from database
      const userResponse = await fetch(`/api/user?email=${user.email}`);
      const { user: dbUser } = await userResponse.json();
      
      if (dbUser) {
        // Get profile
        const profileResponse = await fetch(`/api/profile?userId=${dbUser.id}`);
        const { profile } = await profileResponse.json();
        
        if (profile) {
          router.push(`/profile/${profile.id}`);
        } else {
          router.push('/create-profile');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    async function handleRedirect() {
      if (!user) return;
      
      // Check if they came from a student profile link
      const referredFrom = sessionStorage.getItem('studentProfileId');
      if (referredFrom) {
        router.push(`/profile/${referredFrom}`);
        return;
      }
      
      // Check if they're a student with a profile
      const userResponse = await fetch(`/api/user?email=${user.email}`);
      const { user: dbUser } = await userResponse.json();
      
      if (dbUser) {
        const profileResponse = await fetch(`/api/profile?userId=${dbUser.id}`);
        const { profile } = await profileResponse.json();
        
        if (profile) {
          // Student with profile - show their profile
          router.push(`/profile/${profile.id}`);
        } else {
          // New student - create profile
          router.push('/create-profile');
        }
      } else {
        // New user - check if student or sponsor
        if (user.email.includes('@student.') || user.email.endsWith('.edu.ng')) {
          // Looks like a student
          router.push('/create-profile');
        } else {
          // Probably a sponsor - show browse page
          router.push('/dashboard');
        }
      }
    }
    
    handleRedirect();
  }, [user, router]);

  // If user logged in, redirect to create profile
  useEffect(() => {
    async function checkUser() {
      if (user) {
        // Check if user has profile
        try {
          const userResponse = await fetch(`/api/user?email=${user.email}`);
          const { user: dbUser } = await userResponse.json();
          
          if (dbUser) {
            const profileResponse = await fetch(`/api/profile?userId=${dbUser.id}`);
            const { profile } = await profileResponse.json();
            
            if (profile) {
              // Has profile - show it
              router.push(`/profile/${profile.id}`);
            } else {
              // No profile - create one
              router.push('/create-profile');
            }
          } else {
            // New user - create profile
            router.push('/create-profile');
          }
        } catch (error) {
          console.error('Error checking user:', error);
        }
      }
    }
  
    checkUser();
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

            <OpenfortButton
              showAvatar={true}
              showBalance={false}
              label="Get Started"
            />
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500 mt-12">
          Zero platform fees • Direct to students • Blockchain transparent
        </p>
      </div>
    </main>
  );
}