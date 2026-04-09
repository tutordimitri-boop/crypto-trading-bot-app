import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Configuration() {
  const { data: config, isLoading } = trpc.robot.getConfig.useQuery();
  const updateRiskMutation = trpc.robot.updateRiskSettings.useMutation();
  const updateApiKeysMutation = trpc.robot.updateApiKeys.useMutation();

  const [riskPercentage, setRiskPercentage] = useState(config?.riskPercentage || 1);
  const [maxLeverage, setMaxLeverage] = useState(config?.maxLeverage || 10);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  const handleUpdateRisk = () => {
    updateRiskMutation.mutate(
      { riskPercentage, maxLeverage },
      {
        onSuccess: () => {
          toast.success('Configurações de risco atualizadas com sucesso');
        },
        onError: () => {
          toast.error('Erro ao atualizar configurações de risco');
        },
      }
    );
  };

  const handleUpdateApiKeys = () => {
    if (!apiKey || !apiSecret) {
      toast.error('Chave de API e Segredo são obrigatórios');
      return;
    }

    updateApiKeysMutation.mutate(
      { apiKey, apiSecret },
      {
        onSuccess: () => {
          toast.success('Chaves de API atualizadas com sucesso');
          setApiKey('');
          setApiSecret('');
        },
        onError: () => {
          toast.error('Erro ao atualizar chaves de API');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="card-premium h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Management Section */}
      <div className="card-premium">
        <h2 className="text-xl font-bold text-foreground mb-6">Gestão de Risco</h2>

        <div className="space-y-6">
          {/* Risk Percentage */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="stat-label">Percentagem de Risco por Trade</Label>
              <span className="text-2xl font-bold text-accent">{riskPercentage.toFixed(2)}%</span>
            </div>
            <Slider
              value={[riskPercentage]}
              onValueChange={(value) => setRiskPercentage(value[0])}
              min={0.1}
              max={10}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Define o percentual máximo do saldo que será arriscado em cada trade
            </p>
          </div>

          {/* Max Leverage */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="stat-label">Alavancagem Máxima Permitida</Label>
              <span className="text-2xl font-bold text-accent">{maxLeverage}x</span>
            </div>
            <Slider
              value={[maxLeverage]}
              onValueChange={(value) => setMaxLeverage(value[0])}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Define a alavancagem máxima permitida nas operações
            </p>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-400">
              <p className="font-semibold mb-1">Aviso Importante</p>
              <p>Aumentar o risco e a alavancagem pode resultar em perdas significativas. Configure com cuidado.</p>
            </div>
          </div>

          <Button
            onClick={handleUpdateRisk}
            disabled={updateRiskMutation.isPending}
            className="btn-premium btn-premium-primary w-full"
          >
            {updateRiskMutation.isPending ? 'Atualizando...' : 'Salvar Configurações de Risco'}
          </Button>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="card-premium">
        <h2 className="text-xl font-bold text-foreground mb-6">Chaves de API da Bybit</h2>

        <div className="space-y-4">
          {/* API Key Input */}
          <div>
            <Label className="stat-label mb-2 block">Chave de API</Label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                placeholder="Cole sua chave de API da Bybit"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input-premium pr-10"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* API Secret Input */}
          <div>
            <Label className="stat-label mb-2 block">Segredo da API</Label>
            <div className="relative">
              <Input
                type={showApiSecret ? 'text' : 'password'}
                placeholder="Cole o segredo da sua API da Bybit"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="input-premium pr-10"
              />
              <button
                onClick={() => setShowApiSecret(!showApiSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Warning */}
          <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-400">
              <p className="font-semibold mb-1">Segurança</p>
              <p>Nunca compartilhe suas chaves de API. Elas serão armazenadas de forma segura e criptografada.</p>
            </div>
          </div>

          <Button
            onClick={handleUpdateApiKeys}
            disabled={updateApiKeysMutation.isPending || !apiKey || !apiSecret}
            className="btn-premium btn-premium-primary w-full"
          >
            {updateApiKeysMutation.isPending ? 'Atualizando...' : 'Salvar Chaves de API'}
          </Button>
        </div>
      </div>

      {/* Additional Settings */}
      <div className="card-premium">
        <h2 className="text-xl font-bold text-foreground mb-6">Configurações Adicionais</h2>

        <div className="space-y-4">
          <Card className="p-4 bg-card/50 border-border">
            <p className="text-sm font-semibold text-foreground mb-2">Modo de Operação Atual</p>
            <p className="text-lg text-accent font-bold">{config?.operationMode}</p>
          </Card>

          <Card className="p-4 bg-card/50 border-border">
            <p className="text-sm font-semibold text-foreground mb-2">Status do Robô</p>
            <p className={`text-lg font-bold ${config?.isActive ? 'text-green-400' : 'text-red-400'}`}>
              {config?.isActive ? 'Ativo' : 'Inativo'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
