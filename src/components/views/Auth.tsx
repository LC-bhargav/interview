"use client";

import { useState } from 'react';
import { WireframeBox } from '@/components/wireframe/WireframeBox';
import { WireframeText } from '@/components/wireframe/WireframeText';
import { WireframeInput } from '@/components/wireframe/WireframeInput';
import { MacWindow } from '@/components/wireframe/MacWindow';
import { IsoCard } from '@/components/wireframe/IsoCard';
import { IsoButton } from '@/components/wireframe/IsoButton';
import { Mail, Lock, User, Briefcase, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type AuthTab = 'login' | 'signup';

interface AuthProps {
    onAuthSuccess?: () => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
    const [activeTab, setActiveTab] = useState<AuthTab>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signInWithEmail(email, password);
            onAuthSuccess?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await signUpWithEmail(email, password);
            onAuthSuccess?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
            onAuthSuccess?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGithub();
            onAuthSuccess?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'GitHub login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                <MacWindow title="Authentication">
                    <div className="p-8">
                        {/* Logo/Branding */}
                        <div className="text-center mb-8">
                            <WireframeBox className="inline-block p-4 mb-4">
                                <div className="text-4xl">🎯</div>
                            </WireframeBox>
                            <WireframeText variant="h1" className="mb-2">InterviewApp</WireframeText>
                            <WireframeText variant="caption">Streamline Your Interview Process</WireframeText>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <WireframeBox className="p-3 mb-4 bg-red-50 border-red-400">
                                <WireframeText variant="caption" className="text-red-600">{error}</WireframeText>
                            </WireframeBox>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setActiveTab('login')}
                                className={`flex-1 py-3 border-2 border-black font-mono uppercase text-sm transition-all ${activeTab === 'login'
                                        ? 'bg-black text-white'
                                        : 'bg-white text-black hover:bg-gray-100'
                                    }`}
                                style={{
                                    boxShadow: activeTab === 'login' ? '4px 4px 0px rgba(0,0,0,1)' : '2px 2px 0px rgba(0,0,0,1)'
                                }}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => setActiveTab('signup')}
                                className={`flex-1 py-3 border-2 border-black font-mono uppercase text-sm transition-all ${activeTab === 'signup'
                                        ? 'bg-black text-white'
                                        : 'bg-white text-black hover:bg-gray-100'
                                    }`}
                                style={{
                                    boxShadow: activeTab === 'signup' ? '4px 4px 0px rgba(0,0,0,1)' : '2px 2px 0px rgba(0,0,0,1)'
                                }}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Login Form */}
                        {activeTab === 'login' && (
                            <IsoCard className="p-6">
                                <WireframeText variant="h2" className="mb-6">Welcome Back</WireframeText>

                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className="flex items-center gap-2 mb-2">
                                            <Mail size={16} />
                                            <WireframeText variant="caption">Email Address</WireframeText>
                                        </label>
                                        <WireframeInput
                                            type="email"
                                            placeholder="your@email.com"
                                            className="w-full"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 mb-2">
                                            <Lock size={16} />
                                            <WireframeText variant="caption">Password</WireframeText>
                                        </label>
                                        <WireframeInput
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 border-2 border-black"
                                            />
                                            <WireframeText variant="caption">Remember me</WireframeText>
                                        </label>
                                        <button type="button" className="font-mono text-xs underline hover:no-underline">
                                            Forgot password?
                                        </button>
                                    </div>

                                    <IsoButton variant="primary" className="w-full mt-6" type="submit" disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Log In'}
                                    </IsoButton>
                                </form>

                                {/* Divider */}
                                <div className="my-6 flex items-center gap-3">
                                    <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
                                    <WireframeText variant="caption">OR</WireframeText>
                                    <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
                                </div>

                                {/* Social Login */}
                                <div className="space-y-2">
                                    <WireframeBox
                                        className="p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={handleGoogleLogin}
                                    >
                                        <WireframeText variant="caption">Continue with Google</WireframeText>
                                    </WireframeBox>
                                    <WireframeBox
                                        className="p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={handleGithubLogin}
                                    >
                                        <WireframeText variant="caption">Continue with GitHub</WireframeText>
                                    </WireframeBox>
                                </div>
                            </IsoCard>
                        )}

                        {/* Signup Form */}
                        {activeTab === 'signup' && (
                            <IsoCard className="p-6" color="bg-blue-50">
                                <WireframeText variant="h2" className="mb-6">Create Account</WireframeText>

                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div>
                                        <label className="flex items-center gap-2 mb-2">
                                            <User size={16} />
                                            <WireframeText variant="caption">Full Name</WireframeText>
                                        </label>
                                        <WireframeInput
                                            placeholder="John Doe"
                                            className="w-full"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 mb-2">
                                            <Mail size={16} />
                                            <WireframeText variant="caption">Email Address</WireframeText>
                                        </label>
                                        <WireframeInput
                                            type="email"
                                            placeholder="your@email.com"
                                            className="w-full"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 mb-2">
                                            <Briefcase size={16} />
                                            <WireframeText variant="caption">Company</WireframeText>
                                        </label>
                                        <WireframeInput
                                            placeholder="Company Name"
                                            className="w-full"
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 mb-2">
                                            <Lock size={16} />
                                            <WireframeText variant="caption">Password</WireframeText>
                                        </label>
                                        <WireframeInput
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 mb-2">
                                            <Lock size={16} />
                                            <WireframeText variant="caption">Confirm Password</WireframeText>
                                        </label>
                                        <WireframeInput
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <WireframeBox dashed className="p-3 bg-yellow-50">
                                        <label className="flex items-start gap-2">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 border-2 border-black mt-1"
                                                required
                                            />
                                            <WireframeText variant="caption">
                                                I agree to the Terms of Service and Privacy Policy
                                            </WireframeText>
                                        </label>
                                    </WireframeBox>

                                    <IsoButton variant="primary" className="w-full mt-6" type="submit" disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Create Account'}
                                    </IsoButton>
                                </form>

                                {/* Divider */}
                                <div className="my-6 flex items-center gap-3">
                                    <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
                                    <WireframeText variant="caption">OR</WireframeText>
                                    <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
                                </div>

                                {/* Social Signup */}
                                <div className="space-y-2">
                                    <WireframeBox
                                        className="p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={handleGoogleLogin}
                                    >
                                        <WireframeText variant="caption">Sign up with Google</WireframeText>
                                    </WireframeBox>
                                    <WireframeBox
                                        className="p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={handleGithubLogin}
                                    >
                                        <WireframeText variant="caption">Sign up with GitHub</WireframeText>
                                    </WireframeBox>
                                </div>
                            </IsoCard>
                        )}

                        {/* Footer */}
                        <div className="text-center mt-6">
                            <WireframeText variant="caption" className="text-gray-500">
                                © 2026 InterviewApp. All rights reserved.
                            </WireframeText>
                        </div>
                    </div>
                </MacWindow>
            </div>
        </div>
    );
}
