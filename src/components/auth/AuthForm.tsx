import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Mail, Lock, Loader2, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { toast } from 'sonner';

const features = [
  { icon: Shield, title: 'Secure Storage', desc: 'End-to-end encryption' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Global CDN delivery' },
  { icon: Globe, title: 'Access Anywhere', desc: 'All your devices' },
];

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast.success('Account created successfully!');
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 gradient-primary-vibrant animate-gradient relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-accent/20 blur-2xl animate-float" style={{ animationDelay: '-4s' }} />
          
          {/* Floating orbs */}
          <div className="absolute top-1/4 right-1/3 w-4 h-4 rounded-full bg-white/40 animate-float shadow-glow" style={{ animationDelay: '-1s' }} />
          <div className="absolute top-2/3 left-1/3 w-3 h-3 rounded-full bg-white/30 animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-5 h-5 rounded-full bg-white/25 animate-float" style={{ animationDelay: '-5s' }} />
          
          {/* Glass circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/20 opacity-60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/10 opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/5 opacity-30" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center animate-float shadow-glow">
              <Cloud className="w-9 h-9 text-white drop-shadow-lg" />
            </div>
            <span className="text-4xl font-bold text-white drop-shadow-lg">CloudVault</span>
          </div>
          
          <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
            Your files,<br />
            <span className="text-white/85">everywhere you go.</span>
          </h1>
          
          <p className="text-xl text-white/75 mb-14 max-w-md leading-relaxed">
            Store, share, and collaborate on files from anywhere. Simple, secure, and blazingly fast.
          </p>

          <div className="space-y-5">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-white/90 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center shadow-soft">
                  <feature.icon className="w-6 h-6 drop-shadow-md" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{feature.title}</p>
                  <p className="text-sm text-white/65">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-2xl gradient-primary-vibrant flex items-center justify-center shadow-glow animate-pulse-glow">
              <Cloud className="w-7 h-7 text-primary-foreground drop-shadow-lg" />
            </div>
            <span className="text-3xl font-bold text-gradient-vibrant">CloudVault</span>
          </div>

          <Card className="glass-card rounded-3xl border-0 shadow-elevated overflow-hidden">
            <CardHeader className="text-center pb-2 pt-8">
              <CardTitle className="text-3xl font-bold">
                {isLogin ? 'Welcome back' : 'Create account'}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isLogin 
                  ? 'Sign in to access your files' 
                  : 'Get started with your free account'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-background/60 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-12 bg-background/60 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                {isLogin && (
                  <div className="flex justify-end">
                    <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full h-12 gradient-primary-vibrant shadow-glow hover-lift group rounded-xl font-semibold text-base animate-shimmer" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 py-1 text-muted-foreground rounded-full">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 glass-button rounded-xl font-medium" disabled>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="h-12 glass-button rounded-xl font-medium" disabled>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
              </div>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <span className="font-semibold text-primary">
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
