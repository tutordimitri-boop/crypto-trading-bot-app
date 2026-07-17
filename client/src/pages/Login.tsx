import { useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getLoginUrl } from '@/const';
import { TrendingUp, Zap, Shield, BarChart3, Lock, Mail } from 'lucide-react';

export default function Login() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-8 h-8 text-accent" />
              <span className="text-2xl font-bold text-foreground">Crypto Trading Bot</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Dashboard Premium para Trading de Criptomoedas
            </p>
          </div>

          {/* Login Card */}
          <Card className="card-premium p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Bem-vindo</h1>
              <p className="text-muted-foreground">
                Faça login para acessar seu dashboard de trading
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 py-6 border-y border-border">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">3 Modos de Operação</p>
                  <p className="text-xs text-muted-foreground">Normal, Estratégico e Insano</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Análise em Tempo Real</p>
                  <p className="text-xs text-muted-foreground">Indicadores técnicos avançados</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Gestão de Risco</p>
                  <p className="text-xs text-muted-foreground">Controle total sobre suas operações</p>
                </div>
              </div>
            </div>

            {/* Login Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="btn-premium btn-premium-primary w-full h-12 text-base font-semibold"
              >
                <Lock className="w-5 h-5 mr-2" />
                Entrar com Manus
              </Button>
              <Button
                onClick={() => {
                  window.location.href = `/api/google/login?returnPath=${encodeURIComponent(window.location.pathname)}`;
                }}
                className="btn-premium btn-premium-secondary w-full h-12 text-base font-semibold"
              >
                <Mail className="w-5 h-5 mr-2" />
                Entrar com Google
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground space-y-2">
              <p>Ao fazer login, você concorda com nossos</p>
              <div className="flex items-center justify-center gap-2">
                <a href="#" className="text-accent hover:text-accent/80 transition-colors">
                  Termos de Serviço
                </a>
                <span>•</span>
                <a href="#" className="text-accent hover:text-accent/80 transition-colors">
                  Política de Privacidade
                </a>
              </div>
            </div>
          </Card>

          {/* Security Note */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400">
              <span className="font-semibold">🔒 Seguro:</span> Suas chaves de API nunca são compartilhadas. Usamos criptografia end-to-end.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
