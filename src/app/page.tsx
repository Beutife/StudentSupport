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
      
      try {
        // Check if they came from a student profile link (sponsor viewing a student profile)
        const referredFrom = sessionStorage.getItem('studentProfileId');
        if (referredFrom) {
          // Redirect back to the profile page they were viewing
          sessionStorage.removeItem('studentProfileId');
          // Clear subscribe amount if it exists (will be handled on profile page)
          sessionStorage.removeItem('subscribeAmount');
          router.push(`/profile/${referredFrom}`);
          return;
        }
        
        // Get email from user object
        const email = user?.email || user?.emailVerified || (user as any)?.emailAddress;
        if (!email) return;
        
        // Check if user exists in database
        const userResponse = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
        const { user: dbUser } = await userResponse.json();
        
        if (dbUser) {
          // User exists - check if they have a student profile
          const profileResponse = await fetch(`/api/profile?userId=${dbUser.id}`);
          const { profile } = await profileResponse.json();
          
          if (profile) {
            // Student with profile - show their profile
            router.push(`/profile/${profile.id}`);
          } else {
            // User exists but no profile - could be sponsor or student
            // Check email pattern to determine
            if (email.includes('@student.') || email.endsWith('.edu.ng') || email.includes('.edu.ng')) {
              // Looks like a student - create profile
              router.push('/create-profile');
            } else {
              // Probably a sponsor - go to dashboard (they can browse and sponsor)
              router.push('/dashboard');
            }
          }
        } else {
          // New user - check email pattern
          if (email.includes('@student.') || email.endsWith('.edu.ng') || email.includes('.edu.ng')) {
            // Looks like a student - create profile
            router.push('/create-profile');
          } else {
            // Probably a sponsor - go to dashboard (no profile needed)
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
        // On error, default to dashboard (sponsors don't need profile)
        router.push('/dashboard');
      }
    }
    
    handleRedirect();
  }, [user, router]);
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-3xl w-full text-center">
        {/* Header */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 text-blue-600">
          🎓 StudentSupport
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 sm:mb-8 px-4">
          Help Nigerian students stay in school through crypto subscriptions
        </p>
        
        {/* Login Button (from Openfort docs) */}
        <div className="mb-8 sm:mb-12 p-6 sm:p-8 bg-white rounded-2xl shadow-xl me-4">
        <OpenfortButton
            showAvatar={true}
            showBalance={false}
            label="Get Started"
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-4">
            Your wallet will be created automatically - no crypto knowledge needed
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="p-4 sm:p-6 bg-white border-2 border-blue-100 rounded-xl">
            <div className="text-3xl sm:text-4xl mb-3">1️⃣</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Create Profile</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Students share their story and monthly needs
            </p>
          </div>
          
          <div className="p-4 sm:p-6 bg-white border-2 border-blue-100 rounded-xl">
            <div className="text-3xl sm:text-4xl mb-3">2️⃣</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Subscribe</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Sponsors choose amount and duration
            </p>
          </div>
          
          <div className="p-4 sm:p-6 bg-white border-2 border-blue-100 rounded-xl">
            <div className="text-3xl sm:text-4xl mb-3">3️⃣</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Auto-Pay Monthly</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Session keys enable gasless recurring payments
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs sm:text-sm text-gray-500 mt-8 sm:mt-12 px-4">
          Zero platform fees • Direct to students • Blockchain transparent
        </p>
      </div>
    </main>
  );
}