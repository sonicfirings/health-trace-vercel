import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_SECONDS = 300;
const KLINE_LIMIT = 193;
const BINANCE_ENDPOINTS = [
  "https://data-api.binance.vision/api/v3/klines",
  "https://api.binance.com/api/v3/klines",
];

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

type MarketVolatilitySnapshot = {
  symbol: "BTCUSDT";
  price: number;
  currentVolatility: number;
  baselineVolatility: number;
  changeVsBaseline: number;
  chart: number[];
  fearGreed: {
    value: number;
    classification: string;
    updatedAt: string;
    source: "Alternative.me";
  } | null;
  source: "Binance BTCUSDT hourly candles";
  updatedAt: string;
  stale: boolean;
};

let lastSuccessfulSnapshot: MarketVolatilitySnapshot | null = null;

type FearGreedResponse = {
  data?: Array<{
    value?: string;
    value_classification?: string;
    timestamp?: string;
  }>;
};

const round = (value: number, digits = 1) => Number(value.toFixed(digits));

const standardDeviation = (values: number[]) => {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
};

const annualizedVolatility = (returns: number[]) =>
  standardDeviation(returns) * Math.sqrt(24 * 365) * 100;

const buildSnapshot = (
  klines: BinanceKline[],
  fearGreed: MarketVolatilitySnapshot["fearGreed"],
): MarketVolatilitySnapshot => {
  const closes = klines.map((kline) => Number(kline[4])).filter((price) => Number.isFinite(price) && price > 0);
  if (closes.length < KLINE_LIMIT) {
    throw new Error("Binance returned insufficient BTC candle history.");
  }

  const hourlyReturns = closes.slice(1).map((price, index) => Math.log(price / closes[index]));
  const currentReturns = hourlyReturns.slice(-24);
  const baselineReturns = hourlyReturns.slice(-192, -24);
  const currentVolatility = annualizedVolatility(currentReturns);
  const baselineVolatility = annualizedVolatility(baselineReturns);
  const changeVsBaseline = baselineVolatility > 0
    ? ((currentVolatility - baselineVolatility) / baselineVolatility) * 100
    : 0;
  const chart = Array.from({ length: 7 }, (_, index) => {
    const end = hourlyReturns.length - (6 - index) * 24;
    return round(annualizedVolatility(hourlyReturns.slice(Math.max(0, end - 24), end)));
  });

  return {
    symbol: "BTCUSDT",
    price: round(closes[closes.length - 1] ?? 0, 2),
    currentVolatility: round(currentVolatility),
    baselineVolatility: round(baselineVolatility),
    changeVsBaseline: round(changeVsBaseline),
    chart,
    fearGreed,
    source: "Binance BTCUSDT hourly candles",
    updatedAt: new Date().toISOString(),
    stale: false,
  };
};

const fetchFearGreed = async (): Promise<MarketVolatilitySnapshot["fearGreed"]> => {
  const response = await fetch("https://api.alternative.me/fng/?limit=1&format=json", {
    headers: { accept: "application/json" },
    next: { revalidate: CACHE_SECONDS },
  });
  if (!response.ok) throw new Error(`Fear and Greed feed returned ${response.status}.`);

  const payload = (await response.json()) as FearGreedResponse;
  const latest = payload.data?.[0];
  const value = Number(latest?.value);
  if (!Number.isFinite(value)) throw new Error("Fear and Greed feed returned an invalid value.");

  return {
    value,
    classification: latest?.value_classification?.trim() || "Neutral",
    updatedAt: latest?.timestamp
      ? new Date(Number(latest.timestamp) * 1000).toISOString()
      : new Date().toISOString(),
    source: "Alternative.me",
  };
};

const fetchBinanceKlines = async () => {
  let lastError: unknown;

  for (const endpoint of BINANCE_ENDPOINTS) {
    try {
      const url = new URL(endpoint);
      url.searchParams.set("symbol", "BTCUSDT");
      url.searchParams.set("interval", "1h");
      url.searchParams.set("limit", String(KLINE_LIMIT));
      const response = await fetch(url, {
        headers: { accept: "application/json" },
        next: { revalidate: CACHE_SECONDS },
      });
      if (!response.ok) {
        throw new Error(`Binance market data returned ${response.status}.`);
      }

      return (await response.json()) as BinanceKline[];
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Binance market data is unavailable.");
};

export async function GET() {
  try {
    const [klines, fearGreed] = await Promise.all([
      fetchBinanceKlines(),
      fetchFearGreed().catch(() => lastSuccessfulSnapshot?.fearGreed ?? null),
    ]);
    const snapshot = buildSnapshot(klines, fearGreed);
    lastSuccessfulSnapshot = snapshot;
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=900`,
      },
    });
  } catch (error) {
    if (lastSuccessfulSnapshot) {
      return NextResponse.json(
        { ...lastSuccessfulSnapshot, stale: true },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=900" } },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load BTC volatility." },
      { status: 502 },
    );
  }
}
