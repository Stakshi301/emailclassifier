'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { EmailClassification } from '@/lib/classifyEmails';

type Email = {
  id: string;
  subject: string;
  snippet: string;
  classification?: EmailClassification;
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  // Use useGoogleLogin to get an access token with Gmail scope
  const login = useGoogleLogin({
    scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
    onSuccess: async (tokenResponse) => {
      setUser(tokenResponse); // tokenResponse.access_token is what you want!
    },
    onError: () => setError('Login Failed'),
  });

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/emails?count=10', {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const classifyEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          openaiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        }),
      });

      const data = await response.json();
      setEmails(data.classifiedEmails || []);
    } catch (error) {
      console.error('Error classifying emails:', error);
      setError('Failed to classify emails');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleEmailClick = async (id: string) => {
    const response = await fetch(`/api/emails/${id}`, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    const data = await response.json();
    setSelectedEmail(data);
  };

  return (
    <main className="min-h-screen animated-blue-black-gradient">
      <div className="max-w-4xl mx-auto">
        {/* <h1 className="text-4xl text-center hover:text-blue-500 font-bold mb-8">Email Classifier</h1> */}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!user ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl text-center hover:text-blue-500 font-bold mb-8">
              Email Classifier
            </h1>
            <button
              onClick={() => login()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-xl text-center pt-4 font-semibold mb-4">Welcome!</h2>
              <div className="space-x-4 flex justify-between pt-4">
                <button
                  onClick={fetchEmails}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Fetch Emails'}
                </button>
                {Array.isArray(emails) && emails.length > 0 && (
                  <button
                    onClick={classifyEmails}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Classifying...' : 'Classify Emails'}
                  </button>
                )}
              </div>
            </div>

            {Array.isArray(emails) && emails.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Emails</h3>
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailClick(email.id)}
                    className="cursor-pointer border p-4 rounded-2xl hover:bg-gray-50"
                  >
                    <h4 className="font-medium text-green-500">{email.subject}</h4>
                    <p className="text-gray-600 mb-2">{email.snippet}</p>
                    {email.classification && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <span className="font-medium text-blue-500">Category:</span>{' '}
                          <span className='text-green-500'> {email.classification.label}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedEmail && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold z-10"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h4 className="text-xl font-bold mb-2">{selectedEmail.subject}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">From:</span> {selectedEmail.from}<br />
                    <span className="font-semibold">To:</span> {selectedEmail.to}<br />
                    <span className="font-semibold">Date:</span> {selectedEmail.date}
                  </p>
                  <div className="whitespace-pre-wrap text-gray-800 overflow-y-auto max-h-96 pr-2">
                    {selectedEmail.body}
                  </div>
                </div>
              </div>
            )}
            {/* Logout Button */}
            <div className="flex mt-4 ">
              <button
                onClick={() => {
                  setUser(null);
                  setEmails([]);
                  setSelectedEmail(null);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
