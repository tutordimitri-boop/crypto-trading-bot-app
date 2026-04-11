import { RestClientV5 } from 'bybit-api';

const isTestnet = process.env.BYBIT_ENVIRONMENT === 'testnet';

const bybitConfig = {
  testnet: isTestnet,
  key: isTestnet 
    ? process.env.BYBIT_TESTNET_API_KEY 
    : process.env.BYBIT_API_KEY,
  secret: isTestnet 
    ? process.env.BYBIT_TESTNET_API_SECRET 
    : process.env.BYBIT_API_SECRET,
};

if (!bybitConfig.key || !bybitConfig.secret) {
  console.warn('[Bybit] API credentials not configured');
}

export const bybit = new RestClientV5(bybitConfig);

/**
 * Verificar conexão com Bybit
 */
export async function verifyConnection() {
  try {
    const wallet = await bybit.getWalletBalance({
      accountType: 'UNIFIED',
    });
    const balance = wallet.result?.list?.[0]?.totalWalletBalance || '0';
    return { 
      success: true, 
      balance,
      message: 'Conexão com Bybit estabelecida' 
    };
  } catch (error) {
    console.error('[Bybit] Connection error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: 'Falha ao conectar com Bybit'
    };
  }
}

/**
 * Formatar resposta de erro da Bybit
 */
export function formatBybitError(error: any): string {
  if (error.retMsg) {
    return error.retMsg;
  }
  if (error.message) {
    return error.message;
  }
  return 'Erro desconhecido na Bybit';
}
