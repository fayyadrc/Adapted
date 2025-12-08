import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/apiService';

const CanvaCallback = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setStatus('error');
                setError(errorParam);
                return;
            }

            if (!code) {
                setStatus('error');
                setError('No authorization code found');
                return;
            }

            // Retrieve verifier from storage (set by CanvaConnect)
            const codeVerifier = localStorage.getItem('canva_code_verifier');
            if (!codeVerifier) {
                setStatus('error');
                setError('Missing code verifier. Please try again.');
                return;
            }

            try {
                // Call backend to exchange code
                const response = await fetch('http://localhost:5000/api/canva/auth/callback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, code_verifier: codeVerifier })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to exchange token');
                }

                // Success!
                // Notify via BroadcastChannel
                const channel = new BroadcastChannel('canva_auth');
                channel.postMessage({ type: 'CANVA_AUTH_SUCCESS', token: data.access_token });

                setStatus('success');

                // Close after a brief moment
                setTimeout(() => {
                    window.close();
                }, 1500);

            } catch (err) {
                console.error("Callback error:", err);
                setStatus('error');
                setError(err.message);

                const channel = new BroadcastChannel('canva_auth');
                channel.postMessage({ type: 'CANVA_AUTH_ERROR', error: err.message });
            }
        };

        handleCallback();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                {status === 'processing' && (
                    <>
                        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to Canva...</h2>
                        <p className="text-gray-500">Please wait while we verify your account.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Successfully Connected!</h2>
                        <p className="text-gray-500">You can now close this window and return to the app.</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={() => window.close()}
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Close Window
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CanvaCallback;
