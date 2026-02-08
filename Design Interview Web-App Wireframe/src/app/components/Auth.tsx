import { useState } from 'react';
import { WireframeBox } from './wireframe/WireframeBox';
import { WireframeText } from './wireframe/WireframeText';
import { WireframeInput } from './wireframe/WireframeInput';
import { MacWindow } from './wireframe/MacWindow';
import { IsoCard } from './wireframe/IsoCard';
import { IsoButton } from './wireframe/IsoButton';
import { Mail, Lock, User, Briefcase } from 'lucide-react';

type AuthTab = 'login' | 'signup';

export function Auth() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

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

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 border-2 border-black font-mono uppercase text-sm transition-all ${
                  activeTab === 'login' 
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
                className={`flex-1 py-3 border-2 border-black font-mono uppercase text-sm transition-all ${
                  activeTab === 'signup' 
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
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <Mail size={16} />
                      <WireframeText variant="caption">Email Address</WireframeText>
                    </label>
                    <WireframeInput 
                      type="email"
                      placeholder="your@email.com" 
                      className="w-full"
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
                    <button className="font-mono text-xs underline hover:no-underline">
                      Forgot password?
                    </button>
                  </div>

                  <IsoButton variant="primary" className="w-full mt-6">
                    Log In
                  </IsoButton>
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
                  <WireframeText variant="caption">OR</WireframeText>
                  <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
                </div>

                {/* Social Login */}
                <div className="space-y-2">
                  <WireframeBox className="p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <WireframeText variant="caption">Continue with Google</WireframeText>
                  </WireframeBox>
                  <WireframeBox className="p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <WireframeText variant="caption">Continue with GitHub</WireframeText>
                  </WireframeBox>
                </div>
              </IsoCard>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <IsoCard className="p-6" color="bg-blue-50">
                <WireframeText variant="h2" className="mb-6">Create Account</WireframeText>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <User size={16} />
                      <WireframeText variant="caption">Full Name</WireframeText>
                    </label>
                    <WireframeInput 
                      placeholder="John Doe" 
                      className="w-full"
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
                    />
                  </div>

                  <WireframeBox dashed className="p-3 bg-yellow-50">
                    <label className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 border-2 border-black mt-1"
                      />
                      <WireframeText variant="caption">
                        I agree to the Terms of Service and Privacy Policy
                      </WireframeText>
                    </label>
                  </WireframeBox>

                  <IsoButton variant="primary" className="w-full mt-6">
                    Create Account
                  </IsoButton>
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
                  <WireframeText variant="caption">OR</WireframeText>
                  <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
                </div>

                {/* Social Signup */}
                <div className="space-y-2">
                  <WireframeBox className="p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <WireframeText variant="caption">Sign up with Google</WireframeText>
                  </WireframeBox>
                  <WireframeBox className="p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors">
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
