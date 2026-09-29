"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Eye, EyeOff, AlertCircle, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please verify your credentials.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold">Sign In to GovEx</CardTitle>
        <CardDescription className="text-xs">
          Enter researcher or administrator credentials to update evidence and audit logs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-muted-foreground block"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. admin@govex.org"
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-muted-foreground block"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="h-10 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 font-bold gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </Button>
        </form>

        {/* Demo Quick Fill */}
        <div className="pt-4 border-t border-border space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Demo Credentials (1-Click Fill)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillCredentials("admin@govex.demo", "admin123")}
              className="text-xs h-8 justify-start truncate"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600 mr-1.5 shrink-0" />
              <span>Admin User</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillCredentials("researcher@govex.demo", "researcher123")}
              className="text-xs h-8 justify-start truncate"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5 shrink-0" />
              <span>Researcher User</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/20">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            GovEx Verification Portal
          </h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Citizens can browse all evidence without logging in. Authentication is reserved for verified researchers and platform maintainers.
          </p>
        </div>

        <Suspense fallback={
          <Card className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          </Card>
        }>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary hover:underline font-medium">
            ← Return to public evidence registry
          </Link>
        </p>
      </div>
    </div>
  );
}
