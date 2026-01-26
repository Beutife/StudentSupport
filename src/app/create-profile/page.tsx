'use client';

import { useState, useEffect } from 'react';
import { useOpenfort } from '@openfort/react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

export default function CreateProfile() {
  const { user } = useOpenfort();
  const { address: walletAddress } = useAccount();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    story: '',
    monthly_need: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if wallet is connected
      if (!walletAddress) {
        throw new Error('Wallet not connected. Please ensure you are logged in.');
      }

      // Create or get user in database
      const userResponse = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.emailVerified,
          wallet_address: walletAddress,
        }),
      });

      const { user: dbUser } = await userResponse.json();

      // Create student profile
      const profileResponse = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: dbUser.id,
          name: formData.name,
          school: formData.school,
          story: formData.story,
          monthly_need: parseInt(formData.monthly_need),
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }

      const { profile } = await profileResponse.json();

      // Redirect to profile page
      router.push(`/profile/${profile.id}`);
    } catch (err: any) {
      console.error('Profile creation error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Create Your Profile
          </h1>
          <p className="text-gray-600">
            Tell sponsors about yourself and your educational needs
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g., Tunde Adebayo"
              />
            </div>

            {/* School */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                University / School
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g., OAU - Computer Science (Final Year)"
              />
            </div>

            {/* Story */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Story *
              </label>
              <textarea
                name="story"
                value={formData.story}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Tell sponsors about your situation, why you need support, and your academic goals..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Be honest and specific. This helps sponsors understand your needs.
              </p>
            </div>

            {/* Monthly Need */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monthly Need (₦) *
              </label>
              <input
                type="number"
                name="monthly_need"
                value={formData.monthly_need}
                onChange={handleChange}
                required
                min="1000"
                step="1000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g., 15000"
              />
              <p className="text-xs text-gray-500 mt-1">
                How much do you need per month for school expenses?
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2">💡 Tips for a great profile:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be honest about your situation</li>
            <li>• Explain how support will help your education</li>
            <li>• Mention your academic goals and achievements</li>
            <li>• Keep it personal and genuine</li>
          </ul>
        </div>
      </div>
    </main>
  );
}