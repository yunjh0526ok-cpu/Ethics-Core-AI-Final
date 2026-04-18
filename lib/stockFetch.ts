export type BrokerType = 'nh' | 'kiwoom';

export interface StockQuote {
  broker: BrokerType;
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changeRate: number | null;
  volume: number | null;
  asOf: string;
  raw: Record<string, unknown>;
}

export async function fetchStockQuote(broker: BrokerType, symbol: string): Promise<StockQuote> {
  const response = await fetch('/api/stock-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ broker, symbol }),
  });

  let parsed: { quote?: StockQuote; error?: string } = {};
  try {
    parsed = (await response.json()) as { quote?: StockQuote; error?: string };
  } catch {
    /* ignore */
  }

  if (!response.ok || !parsed.quote) {
    throw new Error(parsed.error || `시세 조회 실패 (${response.status})`);
  }

  return parsed.quote;
}
