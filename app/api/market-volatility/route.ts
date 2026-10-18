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
  currentVolatility: number;
  baselineVolatility: number;
  changeVsBaseline: number;
  chart: number[];
  source: "Binance BTCUSDT hourly candles";
  updatedAt: string;
  stale: boolean;
};

let lastSuccessfulSnapshot: MarketVolatilitySnapshot | null = null;

const round = (value: number, digits = 1) => Number(value.toFixed(digits));

const standardDeviation = (values: number[]) => {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
};

const annualizedVolatility = (returns: number[]) =>
  standardDeviation(returns) * Math.sqrt(24 * 365) * 100;

const buildSnapshot = (klines: BinanceKline[]): MarketVolatilitySnapshot => {
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
    currentVolatility: round(currentVolatility),
    baselineVolatility: round(baselineVolatility),
    changeVsBaseline: round(changeVsBaseline),
    chart,
    source: "Binance BTCUSDT hourly candles",
    updatedAt: new Date().toISOString(),
    stale: false,
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
    const snapshot = buildSnapshot(await fetchBinanceKlines());
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
