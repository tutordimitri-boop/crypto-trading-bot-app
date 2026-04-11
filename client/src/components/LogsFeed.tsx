import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { LogLevelBadge } from './LogLevelBadge';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Trash2, RotateCcw } from 'lucide-react';

type LogLevel = 'info' | 'aviso' | 'erro';

interface LogsFeedProps {
  maxHeight?: string;
  autoScroll?: boolean;
  limit?: number;
}

export function LogsFeed({ maxHeight = 'max-h-96', autoScroll = true, limit = 100 }: LogsFeedProps) {
  const { data: logs, isLoading, refetch } = trpc.logs.getLogs.useQuery({ limit });
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Polling for real-time updates (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const filteredLogs = logs?.filter((log: any) => {
    if (filterLevel === 'all') return true;
    return log.level === filterLevel;
  }) || [];

  const levelCounts = {
    info: logs?.filter((l: any) => l.level === 'info').length || 0,
    aviso: logs?.filter((l: any) => l.level === 'aviso').length || 0,
    erro: logs?.filter((l: any) => l.level === 'erro').length || 0,
  };

  if (isLoading) {
    return (
      <div className={`card-premium ${maxHeight} animate-pulse flex items-center justify-center`}>
        <p className="text-muted-foreground">Carregando logs...</p>
      </div>
    );
  }

  return (
    <div className="card-premium space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-bold text-foreground">Feed de Logs</h3>
        <div className="flex items-center gap-2">
          <Select value={filterLevel} onValueChange={(value) => setFilterLevel(value as LogLevel | 'all')}>
            <SelectTrigger className="input-premium sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({logs?.length || 0})</SelectItem>
              <SelectItem value="info">Info ({levelCounts.info})</SelectItem>
              <SelectItem value="aviso">Aviso ({levelCounts.aviso})</SelectItem>
              <SelectItem value="erro">Erro ({levelCounts.erro})</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-10 px-3"
            title="Atualizar logs"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`${maxHeight} overflow-y-auto space-y-2 bg-background/50 rounded-lg border border-border/50 p-3`}
      >
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log: any, index: number) => (
            <div
              key={`${log.id}-${index}`}
              className="flex items-start gap-3 p-3 bg-card/30 rounded-lg border border-border/30 hover:border-border/50 transition-colors"
            >
              <LogLevelBadge level={log.level} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground break-words">{log.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-24">
            <p className="text-muted-foreground text-sm">
              {filterLevel === 'all' ? 'Nenhum log disponível' : `Nenhum log de ${filterLevel}`}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <p>Exibindo {filteredLogs.length} de {logs?.length || 0} logs</p>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          disabled={!logs || logs.length === 0}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Limpar
        </Button>
      </div>
    </div>
  );
}
