import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Leaf, Droplets, Sun, Users, Loader2 } from 'lucide-react';

interface User {
  name: string;
  email: string;
  farmId?: string;
}

interface WelcomePageProps {
  onLogin: (user: User) => void;
}

export function WelcomePage({ onLogin }: WelcomePageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    farmId: ''
  });
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  // Persist user on login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          onLogin({
            name: userData.name,
            email: userData.email,
            farmId: userData.farmId || undefined
          });
        }
      }
    });
    return () => unsubscribe();
  }, [onLogin]);

  // Map Firebase error codes to user-friendly messages
  function getFriendlyError(error: unknown) {
    if (typeof error === 'object' && error && 'code' in error) {
      // @ts-ignore
      switch (error.code) {
        case 'auth/email-already-in-use':
          return 'Email is already in use.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/weak-password':
          return 'Password should be at least 6 characters.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          return 'Invalid credentials.';
        default:
          // @ts-ignore
          return error.message || 'An unexpected error occurred.';
      }
    }
    return 'An unexpected error occurred.';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    if (formData.email && formData.password && (isSignup ? formData.name : true)) {
      const password = formData.password;
      if (isSignup) {
        // Sign up
        try {
          const userCred = await createUserWithEmailAndPassword(auth, formData.email, password);
          await setDoc(doc(db, "users", userCred.user.uid), {
            name: formData.name,
            email: formData.email,
            farmId: formData.farmId
          });
          setLoading(false);
          toast.success('Registration successful! You are now logged in.');
          onLogin({ name: formData.name, email: formData.email, farmId: formData.farmId });
        } catch (signupErr: any) {
          setLoading(false);
          toast.error(getFriendlyError(signupErr));
        }
      } else {
        // Login
        try {
          const userCred = await signInWithEmailAndPassword(auth, formData.email, password);
          const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
          const userData = userDoc.exists() ? userDoc.data() : { name: '', email: formData.email, farmId: formData.farmId };
          onLogin(userData as User);
        } catch (err: any) {
          toast.error(getFriendlyError(err));
        } finally {
          setLoading(false);
        }
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full mr-4">
              <Leaf className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl text-green-800">
              Smart Farming Assistant
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Harness the power of IoT and AI to optimize your farm's productivity, 
            reduce costs, and make data-driven decisions for sustainable agriculture.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-white/80 rounded-lg shadow-sm">
            <Droplets className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="mb-2">Smart Irrigation</h3>
            <p className="text-gray-600">Monitor soil moisture and automate watering schedules</p>
          </div>
          <div className="text-center p-6 bg-white/80 rounded-lg shadow-sm">
            <Sun className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="mb-2">Weather Insights</h3>
            <p className="text-gray-600">Get accurate forecasts and climate recommendations</p>
          </div>
          <div className="text-center p-6 bg-white/80 rounded-lg shadow-sm">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="mb-2">AI Assistant</h3>
            <p className="text-gray-600">Chat with our farming expert for personalized advice</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Enter your details to access your farm dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Toaster position="top-center" richColors />
              <div className="flex mb-4 gap-2">
                <button
                  type="button"
                  onClick={() => setIsSignup(false)}
                  className={`flex-1 py-2 rounded ${!isSignup ? 'bg-green-600 text-white font-semibold' : 'bg-gray-100 text-green-700 border border-green-600'}`}
                  disabled={loading}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignup(true)}
                  className={`flex-1 py-2 rounded ${isSignup ? 'bg-green-600 text-white font-semibold' : 'bg-gray-100 text-green-700 border border-green-600'}`}
                  disabled={loading}
                >
                  Sign Up
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                {isSignup && (
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={isSignup}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="farmId">Farm ID (Optional)</Label>
                  <Input
                    id="farmId"
                    type="text"
                    placeholder="e.g., FARM001"
                    value={formData.farmId}
                    onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  className={`w-full ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2 text-white" />
                      Processing...
                    </span>
                  ) : (
                    isSignup ? 'Sign Up' : 'Access Dashboard'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}