'use client';

import { useState, useEffect } from 'react';
import { useOpenfort } from '@openfort/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Subscription {
  id: string;
  amount: number;
  months: number;
  current_month: number;
  status: string;
  next_charge_date: string;
  student: {
    name: string;
    school: string;
  };
}

export default function Dashboard() {
  const { user } = useOpenfort();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    async function fetchSubscriptions() {
      try {
        // Get email from user object (try multiple possible properties)
        const email = user?.email || user?.emailVerified || (user as any)?.emailAddress;
        if (!email) {
          console.error('No email found for user');
          setLoading(false);
          return;
        }

        // Get user's subscriptions
        const response = await fetch(`/api/subscriptions?email=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions');
        }

        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
        setSubscriptions([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, [user, router]);

  const handleCancel = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/subscriptions/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });
      
      if (!response.ok) throw new Error('Failed to cancel');
      
      alert('Subscription cancelled successfully');
      window.location.reload(); // Refresh to show updated status
    } catch (error) {
      alert('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          Your Impact Dashboard
        </h1>

        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Active Subscriptions
            </h2>
            <p className="text-gray-600 mb-8">
              Start supporting a student today!
            </p>
            <Link
              href="/students"
              className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              Browse Students
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {sub.student.name}
                    </h3>
                    <p className="text-gray-600">{sub.student.school}</p>
                  </div>
                  <span className="px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-full text-sm">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₦{sub.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Progress</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {sub.current_month}/{sub.months} months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Given</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ₦{(sub.amount * sub.current_month).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Next payment: {new Date(sub.next_charge_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">📊 Total Impact</h3>
              <p className="text-3xl font-bold text-blue-600">
                ₦{subscriptions.reduce((sum, sub) => sum + (sub.amount * sub.current_month), 0).toLocaleString()}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                given to {subscriptions.length} student{subscriptions.length !== 1 ? 's' : ''}
              </p>
                <button
                onClick={() => handleCancel(sub.id)}
                className="mt-4 w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors"
                >
                Cancel Subscription
                </button>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}
