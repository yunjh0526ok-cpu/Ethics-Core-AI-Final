import React, { useMemo, useState } from 'react';
import { fetchStockQuote, type BrokerType, type StockQuote } from '../lib/stockFetch';

const formatNumber = (value: number | null, digits = 0) => {
  if (value == null) return '-';
  return value.toLocaleString('ko-KR', { maximumFractionDigits: digits });
};

const StockBrokerPanel: React.FC = () => {
  const [broker, setBroker] = useState<BrokerType>('nh');
  const [symbol, setSymbol] = useState('005930');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState<StockQuote | null>(null);

  const changeTone = useMemo(() => {
    if (!quote || quote.change == null) return 'text-slate-200';
    if (quote.change > 0) return 'text-rose-400';
    if (quote.change < 0) return 'text-cyan-400';
    return 'text-slate-200';
  }, [quote]);

  const handleLoadQuote = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchStockQuote(broker, symbol.trim());
      setQuote(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '시세 조회 중 오류가 발생했습니다.');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10 text-slate-100">
      <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
        <h2 className="text-2xl font-black text-white">NH / 키움 시세 조회 테스트</h2>
        <p className="mt-2 text-sm text-slate-300">
          서버 환경변수에 증권사 API를 설정하면 실데이터로 조회됩니다.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-[160px_1fr_auto]">
          <select
            value={broker}
            onChange={(e) => setBroker(e.target.value as BrokerType)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-bold text-white"
          >
            <option value="nh">NH증권</option>
            <option value="kiwoom">키움증권</option>
          </select>

          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="종목코드 (예: 005930)"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          />

          <button
            type="button"
            onClick={handleLoadQuote}
            disabled={loading}
            className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '조회중...' : '시세 조회'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {quote && (
          <div className="mt-6 rounded-2xl border border-slate-700 bg-black/30 p-5">
            <p className="text-xs tracking-wider text-slate-400">
              {quote.broker.toUpperCase()} / {quote.symbol}
            </p>
            <p className="mt-2 text-xl font-extrabold text-white">{quote.name}</p>
            <p className={`mt-1 text-3xl font-black ${changeTone}`}>
              {formatNumber(quote.price)}원
            </p>
            <div className={`mt-2 text-sm font-bold ${changeTone}`}>
              {formatNumber(quote.change)} ({formatNumber(quote.changeRate, 2)}%)
            </div>
            <div className="mt-3 text-xs text-slate-400">
              거래량: {formatNumber(quote.volume)} / 조회시각: {new Date(quote.asOf).toLocaleString('ko-KR')}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-slate-700/70 bg-slate-950/70 p-4 text-xs text-slate-300">
          <p className="font-bold text-slate-200">환경변수 설정 예시</p>
          <p className="mt-2">- NH: STOCK_NH_BASE_URL, STOCK_NH_QUOTE_PATH, STOCK_NH_AUTH_HEADER, STOCK_NH_AUTH_VALUE</p>
          <p>- 키움: STOCK_KIWOOM_BASE_URL, STOCK_KIWOOM_QUOTE_PATH, STOCK_KIWOOM_AUTH_HEADER, STOCK_KIWOOM_AUTH_VALUE</p>
        </div>
      </div>
    </section>
  );
};

export default StockBrokerPanel;
