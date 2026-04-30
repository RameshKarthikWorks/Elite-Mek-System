import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/store/auth";
import { useAuditLog } from "@/lib/audit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import logoUrl from "@/assets/elite-mek-logo.png";
import { Activity, ArrowRight, HardHat, Cog, ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { login, demoUsers } = useAuthStore();
  const { addLog } = useAuditLog();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    // Accept any password for mock auth
    login(email);
    addLog("system", email, "Auth", "LOGIN", "User logged in to the system");
    toast.success("Successfully logged in");
    setLocation("/");
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    login(demoEmail);
    addLog("system", demoEmail, "Auth", "LOGIN", "User logged in using demo account");
    toast.success("Successfully logged in");
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-muted/30">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground relative overflow-hidden">
        {/* Abstract motif background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 border-4 border-white/10 rounded-full pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 border-4 border-white/10 rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <img src={logoUrl} alt="Elite Mek Engineering" className="h-12 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ELITE MEK</h1>
            <p className="text-primary-foreground/80 text-sm tracking-widest uppercase">Engineering</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold mb-6 leading-tight">Enterprise Operations Control Center</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed">
            Precision management for large-scale mechanical, electrical, and plumbing systems. 
            Built for engineering excellence.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Project Control</h3>
                <p className="text-sm text-primary-foreground/70">Real-time site management</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Live Metrics</h3>
                <p className="text-sm text-primary-foreground/70">Financial & resource tracking</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Cog className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Procurement</h3>
                <p className="text-sm text-primary-foreground/70">Streamlined supply chain</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Audit Ready</h3>
                <p className="text-sm text-primary-foreground/70">Complete history logs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          &copy; {new Date().getFullYear()} Elite Mek Engineering. All rights reserved.
        </div>
      </div>

      {/* Right side - Login */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center md:hidden mb-8">
            <img src={logoUrl} alt="Elite Mek Engineering" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Elite Mek ERP</h1>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@elitemek.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto text-xs font-normal" data-testid="link-forgot-password">
                        Forgot password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter your work email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input placeholder="name@elitemek.com" />
                        </div>
                        <Button className="w-full" onClick={() => toast.success("Reset link sent to your email")}>
                          Send Reset Link
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  data-testid="input-password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-medium" data-testid="button-login">
              Sign In <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">
                Or continue with demo accounts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {demoUsers.slice(0, 4).map(u => (
              <Button 
                key={u.id} 
                variant="outline" 
                className="h-auto py-3 px-4 justify-start flex-col items-start gap-1"
                onClick={() => handleDemoLogin(u.email)}
                data-testid={`button-demo-${u.role.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <span className="font-semibold text-sm truncate w-full text-left">{u.role}</span>
                <span className="text-xs text-muted-foreground font-normal truncate w-full text-left">{u.name}</span>
              </Button>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}
