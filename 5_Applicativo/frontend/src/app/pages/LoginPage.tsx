import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Package, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, user, loginAsGuest, authLoading, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-zinc-400 text-lg animate-pulse font-medium">
            Loading X2SevenVault...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGuest = () => {
    loginAsGuest();
    navigate("/objects");
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      try {
        await login(email, password);
      } catch (err: any) {
          console.error("Login error:", err);
          switch (err.code) {
              case 'auth/invalid-credential':
                  setError("Invalid credentials");
                  break;
              case 'auth/too-many-requests':
                  setError("Too many attempts, please try again later");
                  break;
              default:
                  setError("Error during login, please try again later");
          }
      }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email address first");
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setError("");
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError("No account found with this email");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address");
          break;
        default:
          setError("Error sending reset email, try again later");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">X2SevenVault</h1>
          <p className="text-zinc-400">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
              >
                {resetLoading ? "Sending..." : "Forgot password?"}
              </button>
            </div>

            {resetSent && (
              <div className="bg-green-950/50 border border-green-900 rounded-lg p-3">
                <p className="text-green-400 text-sm">Reset email sent! Check your inbox.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-950/50 border border-red-900 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </form>

          {/* Guest Access */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-zinc-900 px-2 text-zinc-500">Or</span>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleGuest}
              variant="outline"
              className="w-full mt-4 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Continue as Guest (Read Only)
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-sm mt-6">
          © 2026 X2SevenVault. All rights reserved.
        </p>
      </div>
    </div>
  );
}