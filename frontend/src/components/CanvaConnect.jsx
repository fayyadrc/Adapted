import React, { useState, useEffect } from 'react';
import { Sparkles, Check, AlertCircle } from 'lucide-react';
import api from '../services/apiService';

const CanvaConnect = ({ onConnected }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Check if we have a token stored (simple check)
    useEffect(() => {
        const token = localStorage.getItem('canva_access_token');
        if (token) {
            setIsConnected(true);
            if (onConnected) onConnected(token);
        }
    }, [onConnected]);

    const handleConnect = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Get Auth URL from backend
            const response = await fetch('http://localhost:5000/api/canva/auth/url');
            const data = await response.json();

            if (!data.url) throw new Error("Failed to get auth URL");

            // Store verifier for the callback
            localStorage.setItem('canva_code_verifier', data.code_verifier);

            // 2. Open Popup
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            const popup = window.open(
                data.url,
                'CanvaConnect',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // 3. Listen for message from popup (or poll for callback)
            // Since we don't have a dedicated callback page in frontend yet that sends postMessage,
            // we might need to rely on the user manually copying code OR 
            // setup a simple route /canva/callback in React Router that handles it.

            // Let's assume we implement the route /canva/callback in App.js/Router
            // which will broadcast to this channel.
            const interval = setInterval(() => {
                if (popup.closed) {
                    clearInterval(interval);
                    setLoading(false);
                    // Check if connected (callback might have set it)
                    const token = localStorage.getItem('canva_access_token');
                    if (token) {
                        setIsConnected(true);
                        if (onConnected) onConnected(token);
                    }
                }
            }, 1000);

            // For a smoother Dev experience without setting up the callback route first:
            // We can create a BroadcastChannel
            const channel = new BroadcastChannel('canva_auth');
            channel.onmessage = (event) => {
                if (event.data.type === 'CANVA_AUTH_SUCCESS') {
                    localStorage.setItem('canva_access_token', event.data.token);
                    setIsConnected(true);
                    if (onConnected) onConnected(event.data.token);
                    popup.close();
                    setLoading(false);
                } else if (event.data.type === 'CANVA_AUTH_ERROR') {
                    setError(event.data.error);
                    setLoading(false);
                }
            };

        } catch (err) {
            console.error("Auth init error:", err);
            setError("Failed to initialize connection");
            setLoading(false);
        }
    };

    if (isConnected) {
        return (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <Check className="w-5 h-5" />
                <span className="font-medium">Connected to Canva</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleConnect}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#00C4CC] hover:bg-[#00b3ba] text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-70"
            >
                <Sparkles className="w-5 h-5" />
                {loading ? 'Connecting...' : 'Connect to Canva'}
            </button>
            {error && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}
        </div>
    );
};

export default CanvaConnect;
