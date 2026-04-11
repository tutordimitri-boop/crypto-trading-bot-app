import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { TrendingUp, Zap, Shield, BarChart3, ArrowRight } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Carregando...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Se autenticado, redireciona para dashboard
    window.location.href = "/overview";
    return null;
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-accent" />
              <span className="text-xl font-bold text-foreground">Crypto Trading Bot</span>
            </div>
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Entrar
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Dashboard Premium para Trading de Criptomoedas
            </h1>
            <p className="text-xl text-muted-foreground">
              Gerencie seus robôs de trading com uma interface elegante e sofisticada. Monitore posições, execute trades e analise performance em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Começar Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Funcionalidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="p-6 bg-card/50 border-border/50 hover:border-accent/50 transition-colors">
              <Zap className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-bold text-foreground mb-2">3 Modos de Operação</h3>
              <p className="text-sm text-muted-foreground">
                Normal (1H), Estratégico (15min) e Insano (5min) para diferentes estratégias
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 bg-card/50 border-border/50 hover:border-accent/50 transition-colors">
              <BarChart3 className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-bold text-foreground mb-2">Análise em Tempo Real</h3>
              <p className="text-sm text-muted-foreground">
                Monitore P&L, saldo, trades e indicadores técnicos (SMC, BOS, CHoCH, FVG)
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 bg-card/50 border-border/50 hover:border-accent/50 transition-colors">
              <Shield className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-bold text-foreground mb-2">Gestão de Risco</h3>
              <p className="text-sm text-muted-foreground">
                Configure percentagem de risco, alavancagem máxima e stop loss automático
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 bg-card/50 border-border/50 hover:border-accent/50 transition-colors">
              <TrendingUp className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-bold text-foreground mb-2">Integração Bybit</h3>
              <p className="text-sm text-muted-foreground">
                Conecte com sua conta Bybit e execute trades diretamente do dashboard
              </p>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-20 border-t border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">8+</div>
              <p className="text-muted-foreground">Procedures tRPC</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">26</div>
              <p className="text-muted-foreground">Testes Unitários</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">100%</div>
              <p className="text-muted-foreground">Funcional</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="p-12 bg-accent/10 border-accent/20 text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Pronto para começar?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Acesse seu dashboard agora e comece a gerenciar seus robôs de trading com uma interface premium e sofisticada.
            </p>
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Entrar no Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 mt-20 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>Crypto Trading Bot Manager © 2026 - Todos os direitos reservados</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
