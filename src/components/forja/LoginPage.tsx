import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import loginLogo from "@/assets/login_logo.png.asset.json";
import videoAsset from "@/assets/background_login.mp4.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Artificial delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = login(username, password);
    
    if (result.success) {
      toast.success("Acesso autorizado. Bem-vindo à Forja.");
      navigate({ to: "/" });
    } else {
      setError(result.message || "Erro ao entrar.");
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black font-sans">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src={videoAsset.url} type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        <div className="flex flex-col items-center mb-12">
          <img
            src={loginLogo.url}
            alt="A Forja"
            className="h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(239,68,68,0.3)] mb-4"
          />
        </div>

        <div className="relative group">
          {/* Card with glassmorphism */}
          <div className="absolute -inset-0.5 bg-red-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">
                  Usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-red-500/50 text-foreground placeholder:text-muted-foreground/50 h-12"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-red-500/50 text-foreground placeholder:text-muted-foreground/50 h-12 pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-destructive text-sm text-center animate-shake">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "ENTRAR"
                )}
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/40 font-display uppercase tracking-widest">
          Sistema Restrito • Acesso Monitorado
        </p>
      </div>
    </div>
  );
}
