import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useOwner } from '@/contexts/OwnerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HardHat, Loader2, ArrowLeft, UserCircle, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Gradient Text Component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`text-[#111214] ${className}`}>
      {children}
    </span>
  );
};

// Glass Surface Component
const GlassSurface = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`border border-black/10 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.12)] ${className}`}
    >
      {children}
    </div>
  );
};

const Auth = () => {
  const [userType, setUserType] = useState<'manager' | 'owner'>('manager');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [ownerCode, setOwnerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { loginAsOwner, isOwner } = useOwner();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    } else if (isOwner) {
      navigate('/owner-dashboard');
    }
  }, [user, isOwner, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userType === 'owner') {
        // Owner login with 6-digit code
        if (ownerCode.length !== 6) {
          toast.error('Please enter a valid 6-digit code');
          return;
        }
        
        const success = await loginAsOwner(ownerCode);
        if (success) {
          toast.success('Welcome! Viewing project as owner');
          navigate('/owner-dashboard');
        } else {
          toast.error('Invalid or expired code. Please check with your site manager.');
        }
      } else {
        // Manager login/signup
        if (isLogin) {
          await signIn(email, password);
        } else {
          if (!fullName.trim()) {
            throw new Error('Full name is required');
          }
          await signUp(email, password, fullName);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f5f5f7] text-[#111214]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(0,0,0,.055),transparent_36%),linear-gradient(rgba(0,0,0,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.025)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Back to Home Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 flex items-center gap-2 text-[#656970] hover:text-black transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </motion.button>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white"><HardHat className="h-5 w-5" /></span>
          <GradientText className="text-xl font-semibold tracking-[0.18em]">CONSTY</GradientText>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <GlassSurface className="relative rounded-2xl p-8">
            {/* Decorative gradient border */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
              border: '1px solid rgba(0, 0, 0, 0.04)',
            }} />

            <div className="relative">
              {/* Icon */}
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="rounded-xl bg-black p-4"
                >
                  <HardHat className="h-8 w-8 text-white" />
                </motion.div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-semibold tracking-[-0.035em] text-center mb-2 text-[#111214]">
                {userType === 'owner' ? 'Project Owner' : isLogin ? 'Welcome Back' : 'Get Started'}
              </h1>
              <p className="text-[#777b82] text-center mb-6">
                {userType === 'owner' 
                  ? 'Enter your 6-digit code to view project' 
                  : isLogin ? 'Sign in to manage your projects' : 'Create your Consty account'}
              </p>

              {/* User Type Toggle */}
              <Tabs value={userType} onValueChange={(v) => setUserType(v as 'manager' | 'owner')} className="w-full mb-6">
                <TabsList className="grid w-full grid-cols-2 border border-[#e2e4e7] bg-[#f2f3f5]">
                  <TabsTrigger 
                    value="manager" 
                    className="text-[#777b82] data-[state=active]:bg-white data-[state=active]:text-black"
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Manager
                  </TabsTrigger>
                  <TabsTrigger 
                    value="owner"
                    className="text-[#777b82] data-[state=active]:bg-white data-[state=active]:text-black"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Owner
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {userType === 'owner' ? (
                  /* Owner Code Input */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="ownerCode">Access Code</Label>
                    <Input
                      id="ownerCode"
                      type="text"
                      value={ownerCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOwnerCode(value);
                      }}
                      placeholder="000000"
                      maxLength={6}
                      required
                      className="mt-1.5 border-[#dfe2e7] bg-[#f8f9fa] text-center text-2xl tracking-widest font-mono"
                    />
                    <p className="text-xs text-[#8a8e95] mt-2 text-center">
                      Enter the 6-digit code provided by your site manager
                    </p>
                  </motion.div>
                ) : (
                  /* Manager Email/Password */
                  <>
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          required={!isLogin}
                          className="mt-1.5 border-[#dfe2e7] bg-[#f8f9fa]"
                        />
                      </motion.div>
                    )}

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="mt-1.5 border-[#dfe2e7] bg-[#f8f9fa]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="mt-1.5 border-[#dfe2e7] bg-[#f8f9fa]"
                      />
                      {!isLogin && (
                        <p className="text-xs text-[#8a8e95] mt-1">Minimum 6 characters</p>
                      )}
                    </div>
                  </>
                )}

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="h-12 w-full border-0 bg-black text-base font-semibold text-white hover:bg-[#2b2c2f]"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : userType === 'owner' ? (
                      <>View Project</>
                    ) : (
                      <>{isLogin ? 'Sign In' : 'Sign Up'}</>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Toggle Auth Mode (only for managers) */}
              {userType === 'manager' && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-[#777b82] hover:text-black transition-colors"
                  >
                    {isLogin ? (
                      <>
                        Don't have an account?{' '}
                        <span className="font-medium text-[#0071e3]">Sign up</span>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <span className="font-medium text-[#0071e3]">Sign in</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </GlassSurface>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-sm text-[#8a8e95]"
        >
          Secure authentication powered by Supabase
        </motion.p>
      </div>
    </div>
  );
};

export default Auth;
