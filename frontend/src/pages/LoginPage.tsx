import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, BarChart3, ShieldCheck, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import bgImage from '../5324c8eNike-IB7110-002_1.avif';

const features = [
  { icon: BarChart3, text: 'Monthly production tracking across all operations' },
  { icon: Layers, text: 'Financial year reporting with live totals' },
  { icon: ShieldCheck, text: 'Role-based access for your entire team' },
];

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      login(result.token, result.user);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid email or password.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] shrink-0 flex-col bg-slate-950 px-12 py-12 justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">Production Manager</span>
        </div>

        {/* Headline */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Production data<br />
              <span className="text-amber-400">Beautifully organized</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Track sole production, repairs, and purchases across your entire financial year — all in one place.
            </p>
          </div>

        </div>

        <p className="text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} Production Manager
        </p>
      </div>

      {/* ── Right panel ── */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Optional overlay for better form visibility against any image */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>

        <div className="relative w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-2xl">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-7 w-7 rounded-md bg-amber-500 flex items-center justify-center">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Production Manager</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white
                           transition-all duration-150"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white
                             transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full justify-center py-3" size="md" isLoading={isLoading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
