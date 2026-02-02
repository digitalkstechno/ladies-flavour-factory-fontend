"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { MdLock } from "react-icons/md";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md" noPadding>
        <div className="p-8 text-center border-b border-gray-100 bg-white">
            <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                <MdLock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-2">Sign in to your account to continue</p>
        </div>
        
        <div className="p-8 bg-white">
            {error && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />
            </div>
            <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
            >
                Sign In
            </Button>
            </form>
        </div>
        <div className="p-4 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-100">
            &copy; {new Date().getFullYear()} Ladies Flavour Factory. All rights reserved.
        </div>
      </Card>
    </div>
  );
}
