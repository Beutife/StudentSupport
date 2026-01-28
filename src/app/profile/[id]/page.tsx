'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useOpenfort } from '@openfort/react';
import { useAccount } from 'wagmi'; 

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

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

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
      alert('Please login first to sponsor this student');
      return;
    }
  
    if (!address) {
      alert('Wallet not ready. Please wait a moment and try again.');
      return;
    }
  
    setSubscribing(true);
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsor_email: user.email || user.emailVerified || (user as any)?.emailAddress,
          sponsor_wallet: address,
          student_profile_id: profileId,
          amount: amount,
          months: 3, // Fixed 3 months for now
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Subscription failed');
      }
  
      // Show success message
      alert(`
        🎉 Subscription Successful!
        
        You're now sponsoring ${profile?.name} with ₦${amount.toLocaleString()}/month for 3 months.
        
        Total: ₦${(amount * 3).toLocaleString()}
        
        Payments will happen automatically each month - no popups!
      `);
  
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
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl">
                🎓
              </div>
              
              {/* Name & School */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                {profile.school && (
                  <p className="text-blue-100 text-lg">{profile.school}</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {/* Monthly Need */}
            <div className="mb-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-semibold mb-1">
                    Monthly Need
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    ₦{profile.monthly_need.toLocaleString()}
                  </p>
                </div>
                <div className="text-5xl">💰</div>
              </div>
            </div>

            {/* Story */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">My Story</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {profile.story}
              </p>
            </div>

            {/* Sponsor Buttons */}
            <div className="border-t-2 border-gray-100 pt-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Support {profile.name.split(' ')[0]}'s Education
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Option 1 */}
                <button
                  onClick={() => handleSubscribe(3000)}
                  disabled={subscribing}
                  className="p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
                >
                  <p className="text-2xl font-bold text-blue-600 mb-1">₦3,000</p>
                  <p className="text-sm text-gray-600">per month</p>
                </button>

                {/* Option 2 */}
                <button
                  onClick={() => handleSubscribe(5000)}
                  disabled={subscribing}
                  className="p-6 border-2 border-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  <p className="text-2xl font-bold text-blue-600 mb-1">₦5,000</p>
                  <p className="text-sm text-gray-600">per month</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                    POPULAR
                  </span>
                </button>

                {/* Option 3 */}
                <button
                  onClick={() => handleSubscribe(10000)}
                  disabled={subscribing}
                  className="p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
                >
                  <p className="text-2xl font-bold text-blue-600 mb-1">₦10,000</p>
                  <p className="text-sm text-gray-600">per month</p>
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center mt-6">
                Auto-charged monthly for 3 months • Cancel anytime • Zero platform fees
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border-2 border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3">🔒 How it works:</h3>
          <div className="space-y-2 text-sm text-gray-600">
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