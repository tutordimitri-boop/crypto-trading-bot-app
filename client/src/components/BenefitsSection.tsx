import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Zap,
  TrendingUp,
  Shield,
  Clock,
  BarChart3,
  Cpu,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface Benefit {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const benefits: Benefit[] = [
  {
    id: 'speed',
    icon: <Zap className="h-8 w-8" />,
    title: 'Execução Rápida',
    description: 'Algoritmos otimizados para executar trades em milissegundos, capturando as melhores oportunidades de mercado.',
    color: 'from-yellow-500/20 to-yellow-600/20',
  },
  {
    id: 'performance',
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Alto Desempenho',
    description: 'Estratégias de trading comprovadas com histórico de retornos consistentes e gerenciamento de risco inteligente.',
    color: 'from-green-500/20 to-green-600/20',
  },
  {
    id: 'security',
    icon: <Shield className="h-8 w-8" />,
    title: 'Segurança Máxima',
    description: 'Suas chaves de API são criptografadas e nunca são armazenadas em servidores. Controle total sobre seus fundos.',
    color: 'from-blue-500/20 to-blue-600/20',
  },
  {
    id: 'automation',
    icon: <Clock className="h-8 w-8" />,
    title: 'Automação 24/7',
    description: 'O robô trabalha 24 horas por dia, 7 dias por semana, sem necessidade de supervisão constante.',
    color: 'from-purple-500/20 to-purple-600/20',
  },
  {
    id: 'analytics',
    icon: <BarChart3 className="h-8 w-8" />,
    title: 'Análise Avançada',
    description: 'Dashboard completo com indicadores técnicos, análise de performance e histórico detalhado de trades.',
    color: 'from-cyan-500/20 to-cyan-600/20',
  },
  {
    id: 'ai',
    icon: <Cpu className="h-8 w-8" />,
    title: 'IA Inteligente',
    description: 'Algoritmos de machine learning que se adaptam às condições de mercado em tempo real.',
    color: 'from-pink-500/20 to-pink-600/20',
  },
  {
    id: 'alerts',
    icon: <AlertCircle className="h-8 w-8" />,
    title: 'Alertas em Tempo Real',
    description: 'Notificações instantâneas sobre oportunidades de trading, mudanças de mercado e eventos importantes.',
    color: 'from-orange-500/20 to-orange-600/20',
  },
  {
    id: 'control',
    icon: <Lock className="h-8 w-8" />,
    title: 'Controle Total',
    description: 'Configure limites de risco, escolha estratégias, ajuste parâmetros e pause a qualquer momento.',
    color: 'from-red-500/20 to-red-600/20',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Por Que Escolher o CryptoBot?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra as principais vantagens que tornam o CryptoBot a melhor escolha para
            automatizar sua estratégia de trading
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105"
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Card content */}
              <Card className="relative h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-border transition-colors duration-300">
                <CardHeader className="pb-3">
                  <div className="mb-3 inline-flex p-2 rounded-lg bg-muted/50 text-primary group-hover:bg-primary/10 transition-colors duration-300">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Hover effect - glow */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-transparent blur-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Comece a usar o CryptoBot agora e veja a diferença em seus resultados de trading
          </p>
          <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all duration-300">
            Começar Agora
          </button>
        </div>
      </div>
    </section>
  );
}
