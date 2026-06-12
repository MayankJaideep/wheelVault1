import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, Zap, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const DEMO_ACCOUNTS = [
  {
    label: 'Admin',
    email: 'admin@wheelvault.com',
    password: 'demo1234',
    description: 'Full admin access',
    icon: Shield,
    cardClass: 'border-primary-500/40 bg-primary-500/10 hover:bg-primary-500/20',
    textClass: 'text-primary-400',
  },
  {
    label: 'User',
    email: 'user@wheelvault.com',
    password: 'demo1234',
    description: 'Regular buyer account',
    icon: User,
    cardClass: 'border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20',
    textClass: 'text-blue-400',
  },
];

export function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message || 'Invalid email or password');
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const fillDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-display font-bold text-2xl">W</span>
              </div>
            </Link>
            <h1 className="text-2xl font-display font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to access your collection</p>
          </div>

          {/* Demo Accounts */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Try a Demo Account</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${account.cardClass}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <account.icon className={`w-4 h-4 ${account.textClass}`} />
                    <span className={`text-sm font-semibold ${account.textClass}`}>{account.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{account.description}</p>
                  <p className="text-xs text-gray-600 mt-1 font-mono truncate">{account.email}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">
              Click to fill in — password: <span className="font-mono text-gray-500">demo1234</span>
            </p>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-dark-850 text-xs text-gray-500">or sign in with your account</span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Sign in failed</p>
                <p className="text-red-400/80 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-12"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Username must be 3-20 characters (letters, numbers, underscore only)');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, username);
    if (error) { setError(error.message || 'Failed to create account'); setLoading(false); }
    else setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
            <p className="text-gray-400 mb-6">Your account is ready. Sign in to start browsing.</p>
            <Link to="/signin" className="btn-primary">Continue to Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-display font-bold text-2xl">W</span>
              </div>
            </Link>
            <h1 className="text-2xl font-display font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join to browse and buy from the collection</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="coolcollector"
                  className="input pl-12"
                  required
                  minLength={3}
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">Letters, numbers, underscore only</p>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-12"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-12 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-12"
                  required
                />
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 mt-1" required />
              <span className="text-sm text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-400 hover:text-primary-300">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary-400 hover:text-primary-300">Privacy Policy</Link>
              </span>
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-400">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
