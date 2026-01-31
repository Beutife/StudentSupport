'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useOpenfort, OpenfortButton } from '@openfort/react';
import { useAccount } from 'wagmi'; 
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  name: string;
  school: string | null;
  story: string;
  monthly_need: number;
  photo_url: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const { user } = useOpenfort();
  const { address } = useAccount();
  const router = useRouter();   
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [copied, setCopied] = useState(false);


  const handleShareProfile = () => { 
    const profileUrl = `${window.location.origin}/profile/${profileId}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  useEffect(() => {
    // Save this profile ID so we know sponsor came from here
    sessionStorage.setItem('studentProfileId', profileId);
  }, [profileId]);

  
  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/profile?profileId=${profileId}`);
        const data = await response.json();
        
        if (data.profile) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [profileId]);

  // Handle subscription (we'll implement this later with session keys)
  const handleSubscribe = async (amount: number) => {
    if (!user) {
      // Store profile ID so we can redirect back after login
      sessionStorage.setItem('studentProfileId', profileId);
      sessionStorage.setItem('subscribeAmount', amount.toString());
      // Redirect to home page to login
      router.push('/');
      return;
    }
  
    if (!address) {
      alert('Wallet not ready. Please wait a moment and try again.');
      return;
    }
  
    setSubscribing(true);
    
    try {
      // Get student's wallet address via API
      const studentWalletResponse = await fetch(`/api/profile?profileId=${profileId}`);
      const studentData = await studentWalletResponse.json();
      
      if (!studentData.profile) {
        throw new Error('Student profile not found');
      }

      // Get student's user record to get wallet address
      const userResponse = await fetch(`/api/user?userId=${studentData.profile.user_id}`);
      const userData = await userResponse.json();
      
      if (!userData.user?.wallet_address) {
        throw new Error('Student wallet not found');
      }

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsor_email: user.email || user.emailVerified || (user as any)?.emailAddress,
          sponsor_player_id: user.id,
          student_profile_id: profileId,
          student_wallet: userData.user.wallet_address,
          amount: amount,
          months: 3, // Fixed 3 months for now
        }),
      });
  
      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            throw new Error('Invalid response from server');
          }
        } else {
          throw new Error('Empty response from server');
        }
      } else {
        throw new Error('Unexpected response format from server');
      }
  
      if (!response.ok) {
        // Handle error - could be string or object
        const errorMessage = typeof data?.error === 'string' 
          ? data.error 
          : data?.error?.message || JSON.stringify(data?.error) || 'Subscription failed';
        throw new Error(errorMessage);
      }
  
      // Show success message
      alert(`
         Subscription Successful!
        
        You're now sponsoring ${profile?.name} with ₦${amount.toLocaleString()}/month for 3 months.
        
        Total: ₦${(amount * 3).toLocaleString()}
        
        Payments will happen automatically each month - no popups!
      `);
  
      // Redirect to sponsor dashboard
    router.push(`/dashboard`);
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">This student profile doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-6 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center text-3xl sm:text-4xl">
                🎓
              </div>
              
              {/* Name & School */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{profile.name}</h1>
                {profile.school && (
                  <p className="text-blue-100 text-base sm:text-lg">{profile.school}</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-4 sm:p-8">
            {/* Monthly Need */}
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-50 rounded-xl border-2 border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-600 font-semibold mb-1">
                    Monthly Need
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                    ₦{profile.monthly_need.toLocaleString()}
                  </p>
                </div>
                <div className="text-4xl sm:text-5xl">💰</div>
              </div>
            </div>

            {/* Story */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">My Story</h2>
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                {profile.story}
              </p>
            </div>

            {/* Share Profile */}
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-green-50 rounded-xl border-2 border-green-200">
              <h3 className="font-bold text-green-900 mb-2 sm:mb-3 text-base sm:text-lg">📤 Share Your Profile</h3>
              <p className="text-xs sm:text-sm text-green-800 mb-3 sm:mb-4">
                Share this link with potential sponsors (alumni, family, friends)
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${profileId}`}
                  readOnly
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-green-300 rounded-lg text-xs sm:text-sm"
                />
                <button
                  onClick={handleShareProfile}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <a
          href={`https://twitter.com/intent/tweet?text=Help me stay in school! ${window.location.href}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm rounded-lg text-center"
        >
          Share on Twitter
        </a>
         <a 
          href={`https://wa.me/?text=Help me stay in school! ${window.location.href}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm rounded-lg text-center"
        >
          Share on WhatsApp
        </a>
      </div>
    </div>
  

            {/* Sponsor Buttons */}
            <div className="border-t-2 border-gray-100 pt-6 sm:pt-8">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">
                Support {profile.name.split(' ')[0]}'s Education
              </h3>
              
              {!user ? (
                // Show login prompt if not logged in
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                  <p className="text-sm sm:text-base text-yellow-800 mb-4">
                    Please login to subscribe and support this student
                  </p>
                  <div className="flex justify-center">
                    <OpenfortButton
                      showAvatar={false}
                      showBalance={false}
                      label="Login to Subscribe"
                    />
                  </div>
                  <p className="text-xs text-yellow-700 mt-3">
                    After logging in, you'll be redirected back here to complete your subscription
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {/* Option 1 */}
                    <button
                      onClick={() => handleSubscribe(3000)}
                      disabled={subscribing}
                      className="p-4 sm:p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
                    >
                      <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">₦3,000</p>
                      <p className="text-xs sm:text-sm text-gray-600">per month</p>
                    </button>

                    {/* Option 2 */}
                    <button
                      onClick={() => handleSubscribe(5000)}
                      disabled={subscribing}
                      className="p-4 sm:p-6 border-2 border-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50"
                    >
                      <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">₦5,000</p>
                      <p className="text-xs sm:text-sm text-gray-600">per month</p>
                      <span className="inline-block mt-2 px-2 sm:px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                        POPULAR
                      </span>
                    </button>

                    {/* Option 3 */}
                    <button
                      onClick={() => handleSubscribe(10000)}
                      disabled={subscribing}
                      className="p-4 sm:p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
                    >
                      <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">₦10,000</p>
                      <p className="text-xs sm:text-sm text-gray-600">per month</p>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500 text-center mt-4 sm:mt-6">
                    Auto-charged monthly for 3 months • Cancel anytime • Zero platform fees
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-xl shadow-lg border-2 border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">🔒 How it works:</h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-600">
            <p>✓ Subscribe once, auto-charged monthly (no popups!)</p>
            <p>✓ Money goes directly to student's wallet</p>
            <p>✓ Cancel anytime from your dashboard</p>
            <p>✓ Powered by Openfort session keys (gasless!)</p>
          </div>
        </div>
      </div>
    </main>
  );
}