'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyPassword } from '@/app/actions/auth';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await verifyPassword(password);

            if (result.success) {
                router.push('/admin/dashboard');
            } else {
                setError(result.error || 'Invalid password');
                setLoading(false);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
            <div className="max-w-md w-full bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gray-800 rounded-full">
                        <Lock className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2 text-center text-white">Admin Access</h1>
                <p className="text-gray-400 text-center mb-6 text-sm">Enter your secure credentials to continue.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500 transition-all"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
                    >
                        {loading ? 'Verifying...' : 'Unlock Dashboard'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
                        ← Return to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
