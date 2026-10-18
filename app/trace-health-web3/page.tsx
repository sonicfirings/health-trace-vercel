"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrowserProvider, Contract, id, type Eip1193Provider } from "ethers";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  CalendarCheck,
  Check,
  CircleAlert,
  Clock3,
  Droplets,
  Dumbbell,
  FileText,
  Gamepad2,
  Gem,
  HeartPulse,
  LayoutDashboard,
  LockKeyhole,
  MessageCircle,
  Moon,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Smartphone,
  TrendingUp,
  Wallet,
  Waves,
  Watch,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { ChogQuest } from "./chog-quest";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown>[] }) => Promise<unknown>;
  on?: (event: "accountsChanged", handler: (accounts: string[]) => void) => void;
  removeListener?: (event: "accountsChanged", handler: (accounts: string[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

type HealthTab =
  | "Home"
  | "Guardian"
  | "Chog Quest"
  | "Market Stress"
  | "Recovery"
  | "Eye Break"
  | "Journal"
  | "Rewards"
  | "AI Chat"
  | "Proofs"
  | "Settings";

const navigation: { label: HealthTab; icon: typeof LayoutDashboard }[] = [
  { label: "Home", icon: LayoutDashboard },
  { label: "Guardian", icon: Sparkles },
  { label: "Chog Quest", icon: Gamepad2 },
  { label: "Market Stress", icon: TrendingUp },
  { label: "Recovery", icon: Moon },
  { label: "Eye Break", icon: Activity },
  { label: "Journal", icon: MessageCircle },
  { label: "Rewards", icon: CalendarCheck },
  { label: "AI Chat", icon: BrainCircuit },
  { label: "Proofs", icon: ShieldCheck },
  { label: "Settings", icon: Settings },
];

const healthTabs = navigation.map((item) => item.label);
const savedContextWalletAddress = "0xEf6fdfe87081da6acC6E4755d095b8C23568577F";
const walletStorageKey = "health-trace-web3-wallet";
const walletProfileStoragePrefix = "health-trace-web3-profile:";
const chogQuestStoragePrefix = "health-trace-chog-quest:";
const walletRegistryStorageKey = "health-trace-web3-wallet-registry";
const chogGenesisContractAddress =
  process.env.NEXT_PUBLIC_CHOG_GENESIS_CONTRACT ?? "0xc96d31f8626c6d03fae5dcd3d61e3fb9f4a73763";
const traceChogGuardianContractAddress = process.env.NEXT_PUBLIC_TRACE_CHOG_GUARDIAN_CONTRACT ?? "";
const chogGuardianImage = "/chog/chog-guardian.png";
const chogLoginHeroImage = "/chog/chog-login-hero.png";
const chogGenesisAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokensOfOwner(address owner) view returns (uint256[])",
  "function tokenURI(uint256 tokenId) view returns (string)",
];
const traceChogGuardianAbi = [
  "function claimWeeklyProof(uint256 tokenId, uint32 weekKey, bytes32 summaryHash)",
];

type ChogGuardianProfile = {
  tokenId: string;
  label: string;
  mode: "wallet" | "preview";
  image: string;
  activatedAt: string;
};

type OwnedChogToken = {
  tokenId: string;
  displayTokenId: string;
  label: string;
  image: string;
};

type WalletRegistryEntry = {
  wallet: string;
  firstSeen: string;
  lastSeen: string;
  displayName: string;
  connectedApps: number;
  rewardPoints: number;
  resetAt?: string;
  guardianData?: {
    guardian: ChogGuardianProfile | null;
    careXp: number;
    traits: string[];
    lastProofWeek: string;
    proofReference: string;
  };
};

type WalletProfile = {
  displayName: string;
  resetAt?: string;
  chogGuardian: ChogGuardianProfile | null;
  careXp: number;
  chogTraits: string[];
  lastGuardianProofWeek: string;
  guardianProofTxHash: string;
  lastChogQuestDate: string;
  chogQuestStreak: number;
  healthContextConnectedDate: string;
  dailyRecords: Record<string, HealthDailyRecord>;
  lastTaskResetDate: string;
  lastWeeklyResetKey: string;
  weeklyEyeBreaks: number;
  weeklyStressChecks: number;
  weeklySleepBoundaries: number;
  eyeBreakCount: number;
  isEyeResetOnCooldown: boolean;
  eyeResetCooldownSeconds: number;
  postureResetDone: boolean;
  completedGuardianActions: string[];
  completedMarketActions: string[];
  journalSelections: Record<string, string>;
  completedRewardMissions: string[];
  completedProofActions: string[];
  rewardPoints: number;
  selectedHealthApp: string;
  connectedHealthApps: string[];
  healthPermissions: Record<string, string[]>;
};

type HealthDailyRecord = {
  dateKey: string;
  score: number;
  sleep: number;
  market: number;
  healthScore: number;
  healthScoreLabel: string;
  marketStress: number;
  recoveryScore: number;
  marketVolatility: string;
  sleepDebt: string;
  screenFatigue: string;
  screenFatigueLevel: string;
  bodyStress: string;
  currentState: string;
  guardianRisk: string;
  guardianTitle: string;
  guardianCopy: string;
  guardianRecommendation: string;
  guardianEvidence: [string, string, string?][];
  guardianProtocol: { title: string; detail: string; targetTab: HealthTab }[];
  marketStressCopy: string;
  recoveryTitle: string;
  recoveryCopy: string;
  briefItems: { status: string; title: string; detail: string; color: string }[];
  eyeBreakCount: number;
  postureResetDone: boolean;
  completedMarketActions: string[];
  journalSelections: Record<string, string>;
  completedProofActions: string[];
  completedRewardMissions: string[];
  chogQuestCompleted: boolean;
};

const getWalletProfileKey = (wallet: string) => `${walletProfileStoragePrefix}${wallet.toLowerCase()}`;
const getChogQuestStorageKey = (wallet: string) => `${chogQuestStoragePrefix}${wallet.toLowerCase()}`;
const getGmt8DateKey = () => new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
const getGmt8DateFromKey = (key: string) => new Date(`${key}T00:00:00.000Z`);
const getGmt8WeekStart = () => {
  const gmt8Now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const day = gmt8Now.getUTCDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(gmt8Now.getUTCFullYear(), gmt8Now.getUTCMonth(), gmt8Now.getUTCDate() - mondayOffset));
  return monday;
};
const getGmt8WeekKey = () => getGmt8WeekStart().toISOString().slice(0, 10);
const getGmt8OnchainWeekIndex = () =>
  Math.floor((Date.now() / 1000 + 3 * 24 * 60 * 60 + 8 * 60 * 60) / (7 * 24 * 60 * 60));
const formatGmt8WeekRange = () => {
  const formatter = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", timeZone: "UTC" });
  const start = getGmt8WeekStart();
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return `${formatter.format(start)} - ${formatter.format(end)}`;
};
const getGmt8CurrentWeekDays = () => {
  const formatter = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", timeZone: "UTC" });
  const start = getGmt8WeekStart();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return {
      day: formatter.format(date),
      dateKey: date.toISOString().slice(0, 10),
    };
  });
};
const getWeekDayIndexFromDateKey = (dateKey: string) => {
  const date = getGmt8DateFromKey(dateKey);
  const day = date.getUTCDay();
  return day === 0 ? 6 : day - 1;
};
const createDailyRecord = (dateKey: string): HealthDailyRecord => {
  const dayIndex = getWeekDayIndexFromDateKey(dateKey);
  const context = weeklyDemoContexts[dayIndex] ?? weeklyDemoContexts[0];

  return {
    dateKey,
    ...context,
    eyeBreakCount: 0,
    postureResetDone: false,
    completedMarketActions: [],
    journalSelections: {},
    completedProofActions: [],
    completedRewardMissions: [],
    chogQuestCompleted: false,
  };
};
const normalizeDailyRecords = (records: Record<string, Partial<HealthDailyRecord>> = {}) =>
  Object.fromEntries(
    Object.entries(records).map(([dateKey, record]) => [
      dateKey,
      {
        ...createDailyRecord(record.dateKey ?? dateKey),
        ...record,
        dateKey: record.dateKey ?? dateKey,
      },
    ]),
  ) as Record<string, HealthDailyRecord>;

type ProofAction = {
  label: string;
  status: string;
  icon: typeof Activity;
  actionLabel: string;
  sourceTab?: HealthTab;
  syncable?: boolean;
  completed: boolean;
};

const careXpByMission: Record<string, number> = {
  "Complete 20-20-20 eye break": 15,
  "Log FOMO / FUD check-in": 20,
  "Take a recovery walk": 25,
  "Keep midnight boundary": 35,
  "Complete Chog Reset Quest": 30,
};

const resolveChogAssetUrl = (uri: string) => {
  if (!uri.startsWith("ipfs://")) return uri;
  return `https://gateway.pinata.cloud/ipfs/${uri.slice("ipfs://".length)}`;
};

const formatWalletTransactionError = (error: unknown) => {
  const walletError = error as {
    code?: string | number;
    message?: string;
    info?: { error?: { code?: string | number; message?: string } };
  };
  const errorCode = walletError?.code ?? walletError?.info?.error?.code;
  const errorMessage = `${walletError?.message ?? ""} ${walletError?.info?.error?.message ?? ""}`.toLowerCase();
  const userCancelled =
    errorCode === "ACTION_REJECTED" ||
    errorCode === 4001 ||
    errorCode === "4001" ||
    errorMessage.includes("user rejected") ||
    errorMessage.includes("user denied");

  return userCancelled ? "user cancelled transaction" : "Transaction could not be completed. Please try again.";
};

const loadOwnedChogToken = async (collection: Contract, tokenId: string): Promise<OwnedChogToken> => {
  const tokenUri = String(await collection.tokenURI(tokenId));
  const metadataFile = tokenUri.match(/\/([^/?#]+)\.json(?:[?#].*)?$/i)?.[1];
  const displayTokenId = metadataFile ? decodeURIComponent(metadataFile) : tokenId;
  let label = `CHOG #${displayTokenId}`;
  let image = chogGuardianImage;

  try {
    const metadataResponse = await fetch(resolveChogAssetUrl(tokenUri));
    if (metadataResponse.ok) {
      const metadata = (await metadataResponse.json()) as { name?: string; image?: string };
      label = metadata.name?.trim() || label;
      image = metadata.image ? resolveChogAssetUrl(metadata.image) : image;
    }
  } catch {
    // Keep ownership usable even if the metadata gateway is temporarily unavailable.
  }

  return { tokenId, displayTokenId, label, image };
};

const loadWalletChogTokens = async (provider: BrowserProvider, wallet: string) => {
  const network = await provider.getNetwork();
  if (network.chainId !== BigInt(143)) {
    throw new Error("Switch your wallet to Monad Mainnet, then scan again.");
  }

  const collection = new Contract(chogGenesisContractAddress, chogGenesisAbi, provider);
  const balance = (await collection.balanceOf(wallet)) as bigint;
  if (balance === BigInt(0)) return [];

  const tokenIds = ((await collection.tokensOfOwner(wallet)) as bigint[]).map(String);
  const tokens = await Promise.all(tokenIds.map((tokenId) => loadOwnedChogToken(collection, tokenId)));
  tokens.sort((left, right) => Number(left.displayTokenId) - Number(right.displayTokenId));

  if (tokens.length !== Number(balance)) {
    throw new Error("The Chog collection returned an incomplete ownership list. Please scan again.");
  }
  return tokens;
};

const getGuardianMood = (record: HealthDailyRecord | null) => {
  if (!record) return { label: "Waiting for signals", tone: "text-white/50", aura: "from-white/10 to-white/[0.02]" };
  if (record.healthScore >= 84) return { label: "Protected", tone: "text-trace-green", aura: "from-trace-green/30 to-sky-300/10" };
  if (record.healthScore >= 70) return { label: "Alert", tone: "text-amber-200", aura: "from-amber-300/24 to-trace-green/8" };
  return { label: "Recovering", tone: "text-rose-200", aura: "from-rose-300/24 to-violet-300/10" };
};

function GuardianArtwork({
  className = "",
  src = chogGuardianImage,
  alt = "Chog Guardian",
}: {
  className?: string;
  src?: string;
  alt?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[1.2rem] border border-white/14 bg-[#24153d] ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 180px, 240px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#171022]/55 via-transparent to-white/5" />
    </div>
  );
}

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-[1rem] bg-[#21143A] shadow-[0_14px_38px_rgba(52,35,92,0.28)] ring-1 ring-[#836EF9]/45 ${className}`}
      aria-label="Health Trace Chog Guardian"
    >
      <Image
        src={chogGuardianImage}
        alt=""
        fill
        sizes="56px"
        className="scale-[1.32] object-cover object-[50%_38%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#21143A]/48 via-transparent to-[#FF7BAC]/8" />
      <div className="absolute inset-x-1 bottom-1 h-0.5 rounded-full bg-trace-green shadow-[0_0_12px_rgba(255,123,172,0.88)]" />
    </div>
  );
}

function ChogTokenPicker({
  tokens,
  onSelect,
  dark = false,
}: {
  tokens: OwnedChogToken[];
  onSelect: (token: OwnedChogToken) => void;
  dark?: boolean;
}) {
  if (!tokens.length) return null;

  return (
    <div className={`rounded-[1.25rem] border p-3 ${dark ? "border-white/12 bg-white/[0.06]" : "border-[#DED6EE] bg-[#F7F4FF]"}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${dark ? "text-violet-200/72" : "text-[#7555DA]"}`}>
        Choose your active Chog
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {tokens.map((token) => (
          <button
            key={token.tokenId}
            type="button"
            onClick={() => onSelect(token)}
            className={`flex min-h-14 items-center gap-3 rounded-[0.9rem] border p-2 text-left text-sm font-semibold transition ${
              dark
                ? "border-white/14 bg-[#21143A] text-white hover:border-trace-green hover:text-trace-green"
                : "border-[#D9D0F1] bg-white text-[#21143A] hover:border-[#836EF9] hover:text-[#7555DA]"
            }`}
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-[0.7rem] bg-[#21143A]">
              <Image src={token.image} alt="" fill sizes="40px" className="object-cover" />
            </span>
            <span className="truncate">{token.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const demoConnectedHealthApps = ["Apple Health", "Samsung Health", "Google Fit"];
const emptyHealthPermissions: Record<string, string[]> = {
  "Apple Health": [],
  "Samsung Health": [],
  "Google Fit": [],
  "Mi Fitness": [],
};

const demoHealthPermissions: Record<string, string[]> = {
  "Apple Health": ["Sleep", "Heart rate"],
  "Samsung Health": ["Sleep", "Activity"],
  "Google Fit": ["Activity"],
  "Mi Fitness": [],
};

const tabDescriptions: Record<HealthTab, string> = {
  Home: "Health Trace dashboard",
  Guardian: "AI health reasoning",
  "Chog Quest": "Daily CHOG recovery game",
  "Market Stress": "Volatility and body load",
  Recovery: "Night watch recovery",
  "Eye Break": "Screen fatigue protection",
  Journal: "FOMO and FUD check-ins",
  Rewards: "Healthy missions and points",
  "AI Chat": "Ask the health guardian",
  Proofs: "Private healthy actions",
  Settings: "Connections and permissions",
};

const recoveryTrend = [
  { day: "Mon", score: 82, sleep: 74, market: 39 },
  { day: "Tue", score: 78, sleep: 68, market: 58 },
  { day: "Wed", score: 75, sleep: 62, market: 71 },
  { day: "Thu", score: 81, sleep: 72, market: 48 },
  { day: "Fri", score: 76, sleep: 66, market: 84 },
  { day: "Sat", score: 88, sleep: 82, market: 35 },
  { day: "Today", score: 86, sleep: 79, market: 62 },
];

const weeklyDemoContexts: Omit<
  HealthDailyRecord,
  | "dateKey"
  | "eyeBreakCount"
  | "postureResetDone"
  | "completedMarketActions"
  | "journalSelections"
  | "completedProofActions"
  | "completedRewardMissions"
  | "chogQuestCompleted"
>[] = [
  {
    score: 86,
    sleep: 79,
    market: 62,
    healthScore: 86,
    healthScoreLabel: "Stable",
    marketStress: 62,
    recoveryScore: 84,
    marketVolatility: "+18%",
    sleepDebt: "1h 48m",
    screenFatigue: "91m",
    screenFatigueLevel: "High",
    bodyStress: "Moderate",
    currentState: "High attention load",
    guardianRisk: "Watch",
    guardianTitle: "Today is a high-risk attention day.",
    guardianCopy:
      "BTC volatility is elevated, your sleep was below baseline, and your current screen streak crossed your usual stress threshold. Health Trace recommends protecting deep work before markets and avoiding major decisions after midnight.",
    guardianRecommendation:
      "Do deep work before checking markets. Take an eye break now, and avoid major decisions after midnight.",
    guardianEvidence: [
      ["Market volatility", "BTC volatility is +18% above the 7-day baseline.", "https://www.tradingview.com/symbols/BTCUSD/"],
      ["Sleep debt", "Today shows 1h 48m of accumulated sleep debt."],
      ["Screen fatigue", "91m of uninterrupted chart and Discord exposure."],
      ["Decision risk", "Delay high-stress trades until after lunch and complete one eye break before the next market session."],
    ],
    guardianProtocol: [
      { title: "Take a 20-20-20 eye break now.", detail: "Your current screen streak crossed 90 minutes. Completing this lowers short-term fatigue risk.", targetTab: "Eye Break" },
      { title: "Do the next deep-work block before checking markets.", detail: "Trace sees better focus before market/news loops. Finish one protected block first.", targetTab: "Market Stress" },
      { title: "Use a 10-minute cool-down before high-risk decisions.", detail: "Sleep debt plus volatility increases impulsive decisions. Cool-down creates a decision buffer.", targetTab: "Market Stress" },
    ],
    marketStressCopy:
      "Trace reads volatility, screen intensity, sleep debt, and body stress as one context layer, then tells you when market behavior is starting to tax recovery.",
    recoveryTitle: "Recovery is still protected.",
    recoveryCopy:
      "Sleep debt is present, but your morning movement and HRV trend are keeping the buffer intact. Tonight is about preventing a second-order drop.",
    briefItems: [
      { status: "Watch", title: "Market pressure is elevated today.", detail: "Volatility, screen exposure, and resting heart rate are moving together.", color: "bg-amber-300" },
      { status: "Recovery", title: "Late-night activity is reducing your buffer.", detail: "You were active after midnight on three of the last four nights.", color: "bg-sky-300" },
      { status: "Protect", title: "Your attention load is high.", detail: "Take an eye break before another long Discord, X, or chart session.", color: "bg-trace-green" },
    ],
  },
  {
    score: 72,
    sleep: 58,
    market: 78,
    healthScore: 72,
    healthScoreLabel: "Strained",
    marketStress: 78,
    recoveryScore: 68,
    marketVolatility: "+31%",
    sleepDebt: "2h 34m",
    screenFatigue: "2h 10m",
    screenFatigueLevel: "Very high",
    bodyStress: "Elevated",
    currentState: "Recovery buffer thin",
    guardianRisk: "Elevated",
    guardianTitle: "Recovery buffer is thin today.",
    guardianCopy:
      "BTC volatility is sharper, sleep debt widened overnight, and screen exposure has already crossed two hours. Health Trace recommends watch-only mode until recovery signals settle.",
    guardianRecommendation:
      "Use watch-only mode, skip high-risk trades, and set a strict sleep boundary tonight.",
    guardianEvidence: [
      ["Market volatility", "BTC volatility is +31% above the 7-day baseline.", "https://www.tradingview.com/symbols/BTCUSD/"],
      ["Sleep debt", "Sleep debt increased to 2h 34m after another late session."],
      ["Screen fatigue", "2h 10m of continuous charts and social feeds pushed fatigue into the red zone."],
      ["Decision risk", "Avoid new high-conviction decisions until after a recovery walk and one full eye reset."],
    ],
    guardianProtocol: [
      { title: "Switch to watch-only mode for the next session.", detail: "Market volatility is high while recovery is thin. Observe without acting.", targetTab: "Market Stress" },
      { title: "Take a recovery walk before checking charts again.", detail: "A short walk lowers attention load and gives stress markers time to settle.", targetTab: "Recovery" },
      { title: "Complete a 20-second eye reset now.", detail: "Screen fatigue crossed two hours and is compounding decision risk.", targetTab: "Eye Break" },
    ],
    marketStressCopy:
      "Today the market layer is loud, but the bigger risk is the stack: low sleep, long screen exposure, and elevated volatility arriving together.",
    recoveryTitle: "Recovery is fragile.",
    recoveryCopy:
      "The buffer is thinner today. Sleep debt and screen fatigue are pulling readiness down, so the best action is to reduce intensity early.",
    briefItems: [
      { status: "Elevated", title: "BTC volatility is sharply above baseline.", detail: "Market movement is high enough to increase decision pressure.", color: "bg-rose-300" },
      { status: "Debt", title: "Sleep debt increased overnight.", detail: "Recovery dropped after another late screen session.", color: "bg-amber-300" },
      { status: "Action", title: "Watch-only mode is recommended.", detail: "Reduce active decisions until body stress settles.", color: "bg-trace-green" },
    ],
  },
  {
    score: 79,
    sleep: 66,
    market: 69,
    healthScore: 79,
    healthScoreLabel: "Rebuilding",
    marketStress: 69,
    recoveryScore: 76,
    marketVolatility: "+22%",
    sleepDebt: "1h 56m",
    screenFatigue: "78m",
    screenFatigueLevel: "Moderate",
    bodyStress: "Moderate",
    currentState: "Rebuilding baseline",
    guardianRisk: "Watch",
    guardianTitle: "You are rebuilding your buffer.",
    guardianCopy:
      "Sleep debt improved from yesterday, but market pressure is still above normal. Health Trace recommends one focused work block before opening charts.",
    guardianRecommendation:
      "Protect the first deep-work block, then batch market checks into two windows.",
    guardianEvidence: [
      ["Market volatility", "BTC volatility is +22% above the 7-day baseline.", "https://www.tradingview.com/symbols/BTCUSD/"],
      ["Sleep debt", "Sleep debt improved to 1h 56m, but it is not fully recovered."],
      ["Screen fatigue", "78m of screen exposure is manageable if you take a break soon."],
      ["Decision risk", "Batching checks should keep decision load from rising again."],
    ],
    guardianProtocol: [
      { title: "Finish one protected work block first.", detail: "Your best focus window is before the first chart check.", targetTab: "Market Stress" },
      { title: "Batch market checks into two windows.", detail: "Fewer context switches help recovery continue improving.", targetTab: "Market Stress" },
      { title: "Keep caffeine before 3 PM.", detail: "Recovery is rebuilding, so late stimulation is the easiest thing to avoid.", targetTab: "Recovery" },
    ],
    marketStressCopy:
      "Market pressure remains elevated, but your personal stress stack is less severe than yesterday. The task is containment, not shutdown.",
    recoveryTitle: "Recovery is rebuilding.",
    recoveryCopy:
      "Sleep debt has narrowed and screen fatigue is manageable. Keeping stimulation bounded today should improve tomorrow's score.",
    briefItems: [
      { status: "Improving", title: "Sleep debt is moving down.", detail: "Recovery has started to rebuild after yesterday's strain.", color: "bg-sky-300" },
      { status: "Watch", title: "Market pressure remains above normal.", detail: "Volatility is still high enough to trigger repeated checking.", color: "bg-amber-300" },
      { status: "Focus", title: "Your first work block matters most.", detail: "Protect it before charts and Discord fragment attention.", color: "bg-trace-green" },
    ],
  },
  {
    score: 83,
    sleep: 74,
    market: 55,
    healthScore: 83,
    healthScoreLabel: "Balanced",
    marketStress: 54,
    recoveryScore: 85,
    marketVolatility: "+11%",
    sleepDebt: "1h 08m",
    screenFatigue: "64m",
    screenFatigueLevel: "Moderate",
    bodyStress: "Low",
    currentState: "Balanced load",
    guardianRisk: "Calm",
    guardianTitle: "Your context is stabilizing.",
    guardianCopy:
      "Market volatility cooled, recovery improved, and screen fatigue is below your usual risk threshold. Health Trace recommends maintaining the current rhythm.",
    guardianRecommendation:
      "Maintain the rhythm: focused work, batched checks, and one short movement break.",
    guardianEvidence: [
      ["Market volatility", "BTC volatility is +11% above the 7-day baseline.", "https://www.tradingview.com/symbols/BTCUSD/"],
      ["Sleep debt", "Sleep debt is down to 1h 08m."],
      ["Screen fatigue", "64m of screen exposure is below your usual risk threshold."],
      ["Decision risk", "No major decision warning. Keep the structure that is working."],
    ],
    guardianProtocol: [
      { title: "Keep chart checks batched.", detail: "The current rhythm is working; do not reopen noisy loops.", targetTab: "Market Stress" },
      { title: "Take one short movement break.", detail: "Low body stress is worth preserving before afternoon work.", targetTab: "Recovery" },
      { title: "Complete one eye reset before the next long session.", detail: "Stay ahead of fatigue rather than reacting late.", targetTab: "Eye Break" },
    ],
    marketStressCopy:
      "The market is still moving, but today the personal stress layer is calmer. Trace is keeping the guardrails light.",
    recoveryTitle: "Recovery is stabilizing.",
    recoveryCopy:
      "Sleep debt and body stress are both trending in the right direction. The priority is consistency, not restriction.",
    briefItems: [
      { status: "Stable", title: "Recovery is improving.", detail: "Sleep debt is lower and body stress is not elevated.", color: "bg-trace-green" },
      { status: "Calmer", title: "BTC volatility cooled today.", detail: "Market pressure is less likely to dominate attention.", color: "bg-sky-300" },
      { status: "Maintain", title: "Keep your current routine.", detail: "Batched checks and breaks are protecting decision quality.", color: "bg-emerald-300" },
    ],
  },
  {
    score: 68,
    sleep: 55,
    market: 84,
    healthScore: 68,
    healthScoreLabel: "At risk",
    marketStress: 84,
    recoveryScore: 64,
    marketVolatility: "+39%",
    sleepDebt: "3h 05m",
    screenFatigue: "2h 42m",
    screenFatigueLevel: "Extreme",
    bodyStress: "Elevated",
    currentState: "High decision load",
    guardianRisk: "High",
    guardianTitle: "Decision risk is high today.",
    guardianCopy:
      "BTC volatility spiked while sleep debt and screen fatigue are both elevated. Health Trace recommends avoiding high-stakes actions until recovery is protected.",
    guardianRecommendation:
      "No high-risk trades today. Complete eye rest, recovery walk, and a midnight hard stop.",
    guardianEvidence: [
      ["Market volatility", "BTC volatility is +39% above the 7-day baseline.", "https://www.tradingview.com/symbols/BTCUSD/"],
      ["Sleep debt", "Sleep debt widened to 3h 05m."],
      ["Screen fatigue", "2h 42m of screen exposure is well beyond your usual risk threshold."],
      ["Decision risk", "High-risk actions should wait until after recovery improves."],
    ],
    guardianProtocol: [
      { title: "Avoid high-risk trades today.", detail: "The stack is too loaded: volatility, sleep debt, and screen fatigue are all elevated.", targetTab: "Market Stress" },
      { title: "Do a full eye reset before any new chart session.", detail: "Screen fatigue is now the strongest controllable risk.", targetTab: "Eye Break" },
      { title: "Set a hard stop before midnight.", detail: "Tonight determines whether tomorrow starts with recovery or more debt.", targetTab: "Recovery" },
    ],
    marketStressCopy:
      "This is the highest-risk day in the week. Trace is not predicting markets; it is protecting the person making decisions.",
    recoveryTitle: "Recovery is under pressure.",
    recoveryCopy:
      "Sleep debt and late screen exposure are now heavy enough to affect tomorrow unless you reduce intensity today.",
    briefItems: [
      { status: "High", title: "Decision risk is elevated.", detail: "Volatility, screen fatigue, and sleep debt are stacked together.", color: "bg-rose-300" },
      { status: "Debt", title: "Sleep debt crossed three hours.", detail: "Recovery is unlikely to rebound without an earlier stop tonight.", color: "bg-amber-300" },
      { status: "Protect", title: "No high-risk trades recommended.", detail: "Use watch-only mode until recovery improves.", color: "bg-trace-green" },
    ],
  },
  {
    score: 88,
    sleep: 84,
    market: 43,
    healthScore: 88,
    healthScoreLabel: "Strong",
    marketStress: 49,
    recoveryScore: 88,
    marketVolatility: "+8%",
    sleepDebt: "42m",
    screenFatigue: "62m",
    screenFatigueLevel: "Low",
    bodyStress: "Low",
    currentState: "Strong recovery",
    guardianRisk: "Calm",
    guardianTitle: "Recovery is leading today.",
    guardianCopy:
      "Sleep debt is low, market pressure cooled, and screen fatigue is controlled. Health Trace recommends using the day for calm execution rather than urgency.",
    guardianRecommendation:
      "Use the recovery window for calm work, light movement, and low-noise market checks.",
    guardianEvidence: [
      ["Market volatility", "BTC volatility is +8% above the 7-day baseline.", "https://www.tradingview.com/symbols/BTCUSD/"],
      ["Sleep debt", "Sleep debt is down to 42m."],
      ["Screen fatigue", "62m of screen exposure is currently low-risk."],
      ["Decision risk", "Decision state looks stable if checks stay batched."],
    ],
    guardianProtocol: [
      { title: "Use one calm execution block.", detail: "Recovery is strong enough for focused work without chasing urgency.", targetTab: "Market Stress" },
      { title: "Keep movement light and consistent.", detail: "Do not turn a good recovery day into another high-load day.", targetTab: "Recovery" },
      { title: "Preserve low screen fatigue.", detail: "Take an eye reset before fatigue compounds later.", targetTab: "Eye Break" },
    ],
    marketStressCopy:
      "Market pressure is lower today. The opportunity is not to do more; it is to keep decision quality high.",
    recoveryTitle: "Recovery is strong.",
    recoveryCopy:
      "Sleep debt is low and body stress is calm. This is the cleanest recovery window of the week.",
    briefItems: [
      { status: "Strong", title: "Recovery is leading today.", detail: "Sleep debt is low and body stress is calm.", color: "bg-trace-green" },
      { status: "Low", title: "Market pressure cooled.", detail: "BTC movement is less likely to hijack attention.", color: "bg-sky-300" },
      { status: "Use", title: "This is a calm execution window.", detail: "Do focused work without increasing screen load.", color: "bg-emerald-300" },
    ],
  },
  {
    score: 90,
    sleep: 88,
    market: 38,
    healthScore: 90,
    healthScoreLabel: "Excellent",
    marketStress: 44,
    recoveryScore: 90,
    marketVolatility: "+5%",
    sleepDebt: "36m",
    screenFatigue: "58m",
    screenFatigueLevel: "Low",
    bodyStress: "Low",
    currentState: "Recovered baseline",
    guardianRisk: "Clear",
    guardianTitle: "You are back near baseline.",
    guardianCopy:
      "Recovery, sleep debt, and screen fatigue are all back near baseline. Health Trace recommends a normal routine with one light proof action.",
    guardianRecommendation:
      "Stay consistent: one healthy proof action, normal work cadence, and no late market loops.",
    guardianEvidence: [
      ["Market volatility", "BTC volatility is +5% above the 7-day baseline.", "https://www.tradingview.com/symbols/BTCUSD/"],
      ["Sleep debt", "Sleep debt is only 36m."],
      ["Screen fatigue", "58m of screen exposure is below the alert threshold."],
      ["Decision risk", "Decision risk is clear if late loops stay closed."],
    ],
    guardianProtocol: [
      { title: "Complete one healthy proof action.", detail: "A light action keeps the streak alive without adding burden.", targetTab: "Proofs" },
      { title: "Keep market checks lightweight.", detail: "No need for extra restrictions while volatility is low.", targetTab: "Market Stress" },
      { title: "Protect the recovered baseline tonight.", detail: "Avoid late loops so Monday starts clean.", targetTab: "Recovery" },
    ],
    marketStressCopy:
      "Market stress is low and personal recovery is strong. Trace is showing a green-light day with simple guardrails.",
    recoveryTitle: "Recovered baseline.",
    recoveryCopy:
      "Your recovery context is close to baseline. The best move is to preserve it into the next week.",
    briefItems: [
      { status: "Excellent", title: "Health Trace is near baseline.", detail: "Sleep, screen, and market stress are all controlled.", color: "bg-trace-green" },
      { status: "Clear", title: "Decision risk is low.", detail: "No major alert unless late market loops reopen.", color: "bg-emerald-300" },
      { status: "Proof", title: "One light action keeps momentum.", detail: "Complete a healthy proof without over-optimizing the day.", color: "bg-sky-300" },
    ],
  },
];

const homeSignals = [
  {
    label: "Health Trace Score",
    value: "86",
    detail: "Stable, with market pressure elevated",
    icon: HeartPulse,
    tone: "text-trace-green",
    chart: [72, 75, 71, 78, 74, 84, 86],
  },
  {
    label: "Market Stress",
    value: "62",
    detail: "BTC volatility is above normal",
    icon: TrendingUp,
    tone: "text-amber-300",
    chart: [31, 44, 56, 48, 76, 69, 62],
  },
  {
    label: "Sleep Debt",
    value: "1h 48m",
    detail: "Built up across three late nights",
    icon: Moon,
    tone: "text-sky-300",
    chart: [30, 42, 67, 78, 84, 62, 48],
  },
  {
    label: "Screen Fatigue",
    value: "High",
    detail: "91 minutes without a proper eye break",
    icon: Activity,
    tone: "text-rose-300",
    chart: [42, 56, 68, 74, 82, 86, 91],
  },
  {
    label: "Proof Streak",
    value: "6 days",
    detail: "Healthy actions privately verified",
    icon: ShieldCheck,
    tone: "text-emerald-300",
    chart: [12, 24, 38, 52, 66, 82, 92],
  },
];

const briefItems = [
  {
    status: "Watch",
    title: "Market pressure is elevated today.",
    detail: "Volatility, screen exposure, and resting heart rate are moving together.",
    color: "bg-amber-300",
  },
  {
    status: "Recovery",
    title: "Late-night activity is reducing your buffer.",
    detail: "You were active after midnight on three of the last four nights.",
    color: "bg-sky-300",
  },
  {
    status: "Protect",
    title: "Your attention load is high.",
    detail: "Take an eye break before another long Discord, X, or chart session.",
    color: "bg-trace-green",
  },
];

const emptyHomeSignals = homeSignals.map((signal) => ({
  ...signal,
  value:
    signal.label === "Health Trace Score"
      ? "0"
      : signal.label === "Proof Streak"
        ? "0 days"
        : "--",
  detail:
    signal.label === "Health Trace Score"
      ? "Connect health apps to build a baseline"
      : signal.label === "Proof Streak"
        ? "No healthy actions verified yet"
        : "No source connected yet",
  chart: [0, 0, 0, 0, 0, 0, 0],
}));

const emptyBriefItems = [
  {
    status: "Start",
    title: "No health sources connected yet.",
    detail: "Connect Apple Health, Samsung Health, Google Fit, or Mi Fitness to begin.",
    color: "bg-trace-green",
  },
  {
    status: "Waiting",
    title: "Guardian has no baseline yet.",
    detail: "Health Trace needs permissioned signals before it can reason about patterns.",
    color: "bg-sky-300",
  },
  {
    status: "Private",
    title: "Your account is ready.",
    detail: "Nothing is synced until you choose exactly which sources and data types to connect.",
    color: "bg-emerald-300",
  },
];

const marketDrivers = [
  { label: "BTC volatility", value: "+18%", note: "Above 7-day baseline", chart: [34, 42, 58, 63, 70, 66, 72] },
  { label: "Screen exposure", value: "6h 14m", note: "X, Discord, charts", chart: [48, 52, 61, 73, 80, 84, 86] },
  { label: "Body stress", value: "Moderate", note: "HRV recovery still acceptable", chart: [42, 48, 55, 61, 66, 58, 54] },
];

const marketStressActions = [
  {
    title: "Pause active market decisions for 10 minutes.",
    detail: "Volatility is elevated and your body stress is moderate. A pause lowers impulse risk.",
  },
  {
    title: "Batch X and Discord checks.",
    detail: "Repeated context switching is driving the screen exposure score.",
  },
  {
    title: "Switch to watch-only mode after one more review.",
    detail: "This keeps market awareness without extending decision load.",
  },
];

const recoveryRows = [
  ["Midnight activity", "3 nights", "Lower deep recovery"],
  ["Sleep debt", "1h 48m", "Reduce intense work after 11 PM"],
  ["Caffeine window", "Late risk", "Avoid coffee after 3 PM"],
  ["Builder load", "High", "Protect a 20-minute walk"],
];

const eyeBreaks = [
  { label: "K-line session", value: "91 min", detail: "Current high-focus streak" },
  { label: "20-20-20 breaks", value: "2 / 6", detail: "Four breaks remaining" },
  { label: "Posture reset", value: "Due", detail: "Shoulders and neck risk" },
];

const guardianStatus = [
  {
    label: "91% confidence",
    detail: "Strong signal match",
    className: "border-trace-green/30 bg-trace-green/15 text-trace-green",
  },
  {
    label: "No medical urgency",
    detail: "No acute health alert",
    className: "border-sky-300/25 bg-sky-300/10 text-sky-100",
  },
  {
    label: "Attention watch",
    detail: "Protect decisions today",
    className: "border-amber-300/30 bg-amber-300/12 text-amber-100",
  },
];

const guardianProtocolActions = [
  {
    title: "Take a 20-20-20 eye break now.",
    detail: "Your current screen streak crossed 90 minutes. Completing this lowers short-term fatigue risk.",
    targetTab: "Eye Break" as HealthTab,
  },
  {
    title: "Do the next deep-work block before checking markets.",
    detail: "Trace sees better focus before market/news loops. Finish one protected block first.",
    targetTab: "Market Stress" as HealthTab,
  },
  {
    title: "Use a 10-minute cool-down before high-risk decisions.",
    detail: "Sleep debt plus volatility increases impulsive decisions. Cool-down creates a decision buffer.",
    targetTab: "Market Stress" as HealthTab,
  },
  {
    title: "Set a midnight hard stop if volatility remains high.",
    detail: "Late volatility checks are linked to worse recovery tomorrow morning.",
    targetTab: "Recovery" as HealthTab,
  },
];

const journalEntries = [
  {
    label: "FOMO",
    value: "Medium",
    detail: "Triggered by token volatility and Discord alerts.",
    action: "Delay major decisions for 10 minutes.",
  },
  {
    label: "FUD",
    value: "Low",
    detail: "No sustained fear signal from today's check-ins.",
    action: "Keep notifications batched.",
  },
  {
    label: "Revenge trade urge",
    value: "Watch",
    detail: "Appears when sleep is below baseline and charts are open late.",
    action: "Use a cool-down prompt before high-risk actions.",
  },
];

const journalCheckIns = [
  {
    title: "FOMO",
    detail: "Turns market urge into context the Guardian can reason over later.",
  },
  {
    title: "FUD",
    detail: "Separates actual risk from noise, Discord pressure, or portfolio anxiety.",
  },
  {
    title: "Revenge trade urge",
    detail: "Creates a small delay before high-stress decisions.",
  },
];

const journalResponseCopy: Record<string, Record<string, { detail: string; action: string }>> = {
  FOMO: {
    Low: {
      detail: "Low urge. You are aware of market movement without feeling pulled into it.",
      action: "Keep notifications batched and continue your planned work block.",
    },
    Mid: {
      detail: "Medium urge. Token volatility and social alerts are starting to pull attention.",
      action: "Delay major decisions for 10 minutes and write down the actual reason to act.",
    },
    High: {
      detail: "High urge. This looks like a momentum-chasing state rather than a clear plan.",
      action: "Pause market actions for 20 minutes and switch to watch-only mode.",
    },
  },
  FUD: {
    Low: {
      detail: "Low fear signal. You are not showing sustained anxiety from today's check-in.",
      action: "Keep notifications batched and avoid refreshing the same thread repeatedly.",
    },
    Mid: {
      detail: "Medium fear signal. Concern is present, but not yet dominating decisions.",
      action: "Separate facts from rumors before changing any position or workflow.",
    },
    High: {
      detail: "High fear signal. This may be driven by noise, loss aversion, or social pressure.",
      action: "Step away from feeds and review only pre-defined risk rules.",
    },
  },
  "Revenge trade urge": {
    Low: {
      detail: "Low revenge urge. No strong signal that losses are driving the next action.",
      action: "Continue with normal decision rules.",
    },
    Mid: {
      detail: "Medium revenge urge. Sleep debt and late chart exposure can amplify this.",
      action: "Use a cool-down prompt before any high-risk action.",
    },
    High: {
      detail: "High revenge urge. The next decision may be emotional recovery, not strategy.",
      action: "Lock active trading for 30 minutes and do a recovery reset first.",
    },
  },
};

const syncableProofLabels = ["Recovery walk", "Sleep boundary", "Hydration check"];

const rewardMissions = [
  { label: "Complete Chog Reset Quest", reward: "+75 HT Points", status: "Daily", icon: Gamepad2, targetTab: "Chog Quest" },
  { label: "Complete 20-20-20 eye break", reward: "+30 HT Points", status: "Ready", icon: Activity, targetTab: "Eye Break" },
  { label: "Log FOMO / FUD check-in", reward: "+45 HT Points", status: "New", icon: MessageCircle, targetTab: "Journal" },
  { label: "Take a recovery walk", reward: "+60 HT Points", status: "Suggested", icon: Dumbbell, targetTab: "Proofs" },
  { label: "Keep midnight boundary", reward: "+90 HT Points", status: "Tonight", icon: Moon, targetTab: "Proofs" },
];

const healthBadges = [
  { label: "Builder Balance", detail: "Identity badge for consistently completing healthy builder routines.", status: "Not ready" },
  { label: "Calm Trader", detail: "Progress badge for using cool-downs before stressful market decisions.", status: "82%" },
  { label: "Recovery Keeper", detail: "Ongoing badge for protecting sleep and recovery after market spikes.", status: "Active" },
];

const weeklyReport = {
  title: "Weekly Recovery Proof",
  summary: "You reduced late-night chart exposure and completed 11 healthy actions this week.",
  stats: [
    ["Proof streak", "6 days"],
    ["Eye breaks", "18"],
    ["Stress checks", "9"],
    ["Sleep boundary", "4 nights"],
  ],
};

const connections = [
  { label: "Market context", detail: "BTC, ETH, watchlist volatility", status: "Mocked", icon: TrendingUp },
];

const healthApps = [
  { label: "Apple Health", detail: "Sleep, heart rate, workouts", icon: HeartPulse },
  { label: "Samsung Health", detail: "Steps, sleep, body composition", icon: Smartphone },
  { label: "Google Fit", detail: "Activity, heart points, sessions", icon: Activity },
  { label: "Mi Fitness", detail: "Wearables, sleep, activity", icon: Watch },
];

const healthPermissionOptions = ["Sleep", "Heart rate", "Activity", "Stress", "Blood pressure", "Screen time"];

const chatMessages = [
  {
    role: "user",
    text: "Should I keep trading tonight?",
  },
  {
    role: "assistant",
    text: "Your health context suggests lowering intensity tonight. Sleep debt is 1h 48m, market stress is elevated, and your current screen streak is 91 minutes. Health Trace would recommend an eye break now and delaying high-stress decisions until tomorrow morning.",
  },
];

const chatPrompts = [
  "Why is my stress score elevated?",
  "Should I trade tonight?",
  "Explain my sleep debt",
  "What should I do now?",
];

function formatWalletAddress(address: string) {
  return `${address.slice(0, 7)}...${address.slice(-5)}`;
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.72, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function MiniChart({ data }: { data: number[] }) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data.map((value, index) => ({ index, value }))}>
        <defs>
          <linearGradient id="miniSignalWeb3" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF7BAC" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#FF7BAC" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="#FF7BAC"
          strokeWidth={2}
          fill="url(#miniSignalWeb3)"
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  chart,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof LayoutDashboard;
  tone: string;
  chart: number[];
}) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.015 }}
      transition={{ duration: 0.25 }}
      className="flex h-full min-h-[10.5rem] flex-col rounded-[1.35rem] border border-[#E2DCF0] bg-[#FCFBFF] p-4 shadow-[0_16px_50px_rgba(52,35,92,0.055)] sm:min-h-[12.5rem]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-[#F0ECFF]">
          <Icon className={`size-4 ${tone}`} />
        </div>
        <TrendingUp className="size-4 text-[#9A8CBA]" />
      </div>
      <p className="text-xs text-[#716982]">{label}</p>
      <p className="mt-1 text-2xl font-medium text-[#21143A]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#817793]">{detail}</p>
      <div className="mt-auto pt-3">
        <MiniChart data={chart} />
      </div>
    </motion.div>
  );
}

function MobileShell({
  eyebrow,
  title,
  children,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[2rem] p-5 shadow-[0_28px_80px_rgba(52,35,92,0.14)] ${
        dark
          ? "bg-[#21143A] text-white"
          : "border border-[#DED6EE] bg-white/86 text-[#21143A] backdrop-blur-2xl"
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${dark ? "text-trace-green/76" : "text-[#7555DA]"}`}>
        {eyebrow}
      </p>
      <h2 className="mt-2 text-[2.35rem] font-medium leading-[0.95] tracking-normal">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MobilePillCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof LayoutDashboard;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[#E2DCF0] bg-[#FCFBFF] p-4 shadow-[0_14px_40px_rgba(52,35,92,0.055)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[#716982]">{label}</p>
          <p className="mt-1 text-2xl font-medium leading-none text-[#21143A]">{value}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-2xl bg-[#F0ECFF] text-[#7555DA]">
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#817793]">{detail}</p>
    </div>
  );
}

function EyeResetPanel({
  compact = false,
  onComplete,
  isOnCooldown,
  cooldownSecondsLeft,
}: {
  compact?: boolean;
  onComplete?: () => void;
  isOnCooldown: boolean;
  cooldownSecondsLeft: number;
}) {
  const totalSeconds = 20;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const hasCompletedRef = useRef(false);
  const progress = isOnCooldown ? 100 : ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const cooldownMinutes = Math.floor(cooldownSecondsLeft / 60);
  const cooldownSeconds = String(cooldownSecondsLeft % 60).padStart(2, "0");
  const cooldownLabel = `${cooldownMinutes}:${cooldownSeconds}`;

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (!isRunning || secondsLeft !== 0 || hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsRunning(false);
    onComplete?.();
  }, [isRunning, onComplete, secondsLeft]);

  const startReset = () => {
    if (isOnCooldown) return;
    hasCompletedRef.current = false;
    setSecondsLeft(totalSeconds);
    setIsRunning(true);
  };

  const resetLabel = isOnCooldown ? "Reset complete" : isRunning ? "Look 20 feet away" : "20-second reset";
  const helperText = isOnCooldown
    ? "Eye break logged. Your screen fatigue risk is reduced for this session."
    : isRunning
      ? "Relax your shoulders, soften your focus, and avoid the screen until the timer ends."
      : "Start a guided 20-20-20 reset before your next chart or Discord session.";

  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border ${
        compact
          ? "border-white/10 bg-white/[0.055] p-4 text-white"
          : "border-[#836EF9]/30 bg-[#21143A] p-5 text-white shadow-[0_24px_75px_rgba(52,35,92,0.22)]"
      }`}
    >
      <motion.div
        aria-hidden
        className="absolute -right-12 -top-16 size-40 rounded-full bg-trace-green/20 blur-3xl"
        animate={{ opacity: [0.38, 0.76, 0.38], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex size-32 items-center justify-center rounded-full bg-[conic-gradient(#FF7BAC_var(--eye-progress),rgba(255,255,255,0.12)_0deg)] p-1.5" style={{ "--eye-progress": `${progress * 3.6}deg` } as React.CSSProperties}>
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#21143A] ring-1 ring-white/10">
            <p className="text-4xl font-medium leading-none">{isOnCooldown ? 0 : secondsLeft}</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.2em] text-trace-green">seconds</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-trace-green/76">{resetLabel}</p>
          <p className="mt-3 text-sm leading-6 text-white/62">{helperText}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-trace-green"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
          <Button
            onClick={startReset}
            disabled={isRunning || isOnCooldown}
            className="mt-5 h-11 w-full rounded-full bg-trace-green text-[#171022] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isRunning ? "Reset in progress" : isOnCooldown ? `Next eye rest in ${cooldownLabel}` : "Start 20-second reset"}
            {!isRunning && !isOnCooldown ? <ArrowRight className="ml-2 size-4" /> : null}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileTabScreen({
  activeTab,
  setActiveTab,
  walletAddress,
  walletError,
  isWalletConnecting,
  onConnectWallet,
  selectedHealthApp,
  setSelectedHealthApp,
  connectedHealthApps,
  connectHealthApp,
  requestDisconnectHealthApp,
  healthPermissions,
  toggleHealthPermission,
  eyeBreakMetrics,
  onEyeResetComplete,
  isEyeResetOnCooldown,
  eyeResetCooldownSeconds,
  completedGuardianActions,
  toggleGuardianAction,
  completedMarketActions,
  toggleMarketAction,
  journalSelections,
  openJournalCheckIn,
  rewardPoints,
  completedRewardMissions,
  chogGuardian,
  ownedChogTokens,
  isDiscoveringChog,
  chogActivationError,
  discoverChogGuardian,
  selectOwnedChogGuardian,
  careXp,
  guardianLevel,
  guardianLevelProgress,
  guardianTraits,
  lastChogQuestDate,
  chogQuestStreak,
  todayKey,
  guardianOwnershipState,
  verifyActiveChogOwnership,
  completeChogQuest,
  currentDayRecord,
  isDemoAccount,
  proofActions,
  proofStreakLabel,
  weeklyRangeLabel,
  weeklyReportStats,
  weeklyReportSummary,
  syncProofAction,
  guardianWeeklyProofReady,
  guardianWeeklyProofClaimed,
  guardianClaimState,
  claimWeeklyGuardianProof,
}: {
  activeTab: Exclude<HealthTab, "Home">;
  setActiveTab: (tab: HealthTab) => void;
  walletAddress: string;
  walletError: string;
  isWalletConnecting: boolean;
  onConnectWallet: () => void;
  selectedHealthApp: string;
  setSelectedHealthApp: (app: string) => void;
  connectedHealthApps: string[];
  connectHealthApp: (app: string) => void;
  requestDisconnectHealthApp: (app: string) => void;
  healthPermissions: Record<string, string[]>;
  toggleHealthPermission: (app: string, permission: string) => void;
  eyeBreakMetrics: typeof eyeBreaks;
  onEyeResetComplete: () => void;
  isEyeResetOnCooldown: boolean;
  eyeResetCooldownSeconds: number;
  completedGuardianActions: string[];
  toggleGuardianAction: (action: string) => void;
  completedMarketActions: string[];
  toggleMarketAction: (action: string) => void;
  journalSelections: Record<string, string>;
  openJournalCheckIn: (label: string) => void;
  rewardPoints: number;
  completedRewardMissions: string[];
  chogGuardian: ChogGuardianProfile | null;
  ownedChogTokens: OwnedChogToken[];
  isDiscoveringChog: boolean;
  chogActivationError: string;
  discoverChogGuardian: () => void;
  selectOwnedChogGuardian: (token: OwnedChogToken) => void;
  careXp: number;
  guardianLevel: number;
  guardianLevelProgress: number;
  guardianTraits: string[];
  lastChogQuestDate: string;
  chogQuestStreak: number;
  todayKey: string;
  guardianOwnershipState: "idle" | "checking" | "verified" | "missing";
  verifyActiveChogOwnership: () => Promise<boolean>;
  completeChogQuest: () => void;
  currentDayRecord: HealthDailyRecord | null;
  isDemoAccount: boolean;
  proofActions: ProofAction[];
  proofStreakLabel: string;
  weeklyRangeLabel: string;
  weeklyReportStats: string[][];
  weeklyReportSummary: string;
  syncProofAction: (proof: ProofAction) => void;
  guardianWeeklyProofReady: boolean;
  guardianWeeklyProofClaimed: boolean;
  guardianClaimState: "" | "preparing" | "wallet" | "confirmed";
  claimWeeklyGuardianProof: () => void;
}) {
  const hasMobileGuardianContext = isDemoAccount || connectedHealthApps.length > 0;
  const mobileChogMood = getGuardianMood(currentDayRecord);
  const mobileGuardianTitle = currentDayRecord ? currentDayRecord.guardianTitle : "Market volatility is live.";
  const mobileGuardianCopy = currentDayRecord
    ? currentDayRecord.guardianCopy
    : "Connect health apps in Settings to add sleep, screen fatigue, and decision-risk context.";
  const mobileGuardianStatus = hasMobileGuardianContext
    ? [
        { label: "Connected", detail: isDemoAccount ? "Demo stack" : `${connectedHealthApps.length} source${connectedHealthApps.length === 1 ? "" : "s"}`, className: "border-trace-green/30 bg-trace-green/15 text-trace-green" },
        { label: "Decision watch", detail: "Protect trades", className: "border-amber-300/30 bg-amber-300/12 text-amber-100" },
        { label: "91%", detail: "Confidence", className: "border-trace-green/30 bg-trace-green/15 text-trace-green" },
      ]
    : [
        { label: "Market feed", detail: `BTC ${currentDayRecord?.marketVolatility ?? "+18%"}`, className: "border-amber-300/25 bg-amber-300/10 text-white" },
        { label: "Devices", detail: "0 sources", className: "border-white/10 bg-white/[0.06] text-white" },
        { label: "Personal", detail: "0%", className: "border-white/10 bg-white/[0.06] text-white" },
      ];
  const mobileMarketStats = hasMobileGuardianContext
    ? [
        ["Volatility", currentDayRecord?.marketVolatility ?? "+18%"],
        ["Screen load", currentDayRecord?.screenFatigue ?? "0m"],
        ["Body stress", currentDayRecord?.bodyStress ?? "Moderate"],
      ]
    : [
        ["Volatility", "+18%"],
        ["Screen load", "--"],
        ["Body stress", "--"],
      ];
  const mobileRecoveryStats = hasMobileGuardianContext
    ? [
        ["Sleep debt", currentDayRecord?.sleepDebt ?? "0h"],
        ["Recovery", currentDayRecord ? String(currentDayRecord.recoveryScore) : "--"],
        ["Wind-down", "Due"],
      ]
    : [
        ["Sleep debt", "--"],
        ["Deep sleep", "--"],
        ["Wind-down", "--"],
      ];
  const mobileBadges = hasMobileGuardianContext ? healthBadges : healthBadges.map((badge) => ({ ...badge, status: "NOT READY" }));

  if (activeTab === "Chog Quest") {
    return (
      <ChogQuest
        guardian={chogGuardian}
        careXp={careXp}
        level={guardianLevel}
        levelProgress={guardianLevelProgress}
        traits={guardianTraits}
        streak={chogQuestStreak}
        lastCompletedDate={lastChogQuestDate}
        todayKey={todayKey}
        ownershipState={guardianOwnershipState}
        detectionError={chogActivationError}
        onDetect={discoverChogGuardian}
        onVerifyOwnership={verifyActiveChogOwnership}
        onComplete={completeChogQuest}
      />
    );
  }

  if (activeTab === "Guardian") {
    return (
      <div className="space-y-4">
        <MobileShell eyebrow="Guardian" title={mobileGuardianTitle} dark>
          <p className="text-sm leading-6 text-white/62">
            {mobileGuardianCopy}
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {mobileGuardianStatus.map((item) => (
              <div key={item.label} className={`rounded-[1.15rem] border p-3 text-center ${item.className}`}>
                <p className="text-xs font-semibold leading-tight">{item.label}</p>
                <p className="mt-1 text-[0.58rem] leading-tight opacity-70">{item.detail}</p>
              </div>
            ))}
          </div>
        </MobileShell>
        <section className="rounded-[1.75rem] border border-[#E5DFF2] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <p className="text-sm font-medium text-[#21182C]">Recommended protocol</p>
          <div className="mt-3 space-y-2">
            {[
              ...(currentDayRecord?.guardianProtocol ?? guardianProtocolActions),
            ].map((item, index) => {
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.targetTab);
                  }}
                  className="flex w-full gap-3 rounded-[1.15rem] bg-[#FAF7FF] px-3 py-3 text-left text-sm leading-5 text-[#3B2D4A] transition hover:bg-white"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FF7BAC] text-xs font-semibold text-[#171022]">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#746A80]">{item.detail}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === "Market Stress") {
    return (
      <div className="space-y-4">
        <section className="relative overflow-hidden rounded-[2.15rem] bg-[#171022] p-5 text-white shadow-[0_34px_100px_rgba(16,21,16,0.34)]">
          <motion.div
            aria-hidden
            className="absolute -right-16 -top-20 size-60 rounded-full bg-amber-300/18 blur-3xl"
            animate={{ opacity: [0.28, 0.62, 0.28], scale: [0.92, 1.08, 0.92] }}
            transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-20 left-8 size-52 rounded-full bg-trace-green/20 blur-3xl"
            animate={{ opacity: [0.24, 0.58, 0.24], scale: [1, 1.14, 1] }}
            transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-trace-green/72">Market Stress</p>
            <h2 className="mt-3 text-[2.55rem] font-medium leading-[0.9] tracking-normal">
              Trade calm before trading fast.
            </h2>
            <div className="mt-6 grid grid-cols-[8.2rem_1fr] items-center gap-4">
              <div className="flex size-32 items-center justify-center rounded-full bg-[conic-gradient(#fbbf24_0deg,#FF7BAC_224deg,rgba(255,255,255,0.12)_224deg)] p-1.5 shadow-[0_0_70px_rgba(251,191,36,0.16)]">
                <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#171022] ring-1 ring-white/10">
                  <p className="text-5xl font-medium leading-none">{hasMobileGuardianContext ? "62" : "--"}</p>
                  <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-amber-200">{hasMobileGuardianContext ? "Elevated" : "No data"}</p>
                </div>
              </div>
              <div className="space-y-2">
                {mobileMarketStats.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2">
                    <p className="text-lg font-medium leading-none">{value}</p>
                    <p className="mt-1 text-[0.62rem] text-white/42">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-white/[0.065] p-4">
              <p className="text-sm font-medium text-white">Guardian readout</p>
              <p className="mt-2 text-xs leading-5 text-white/56">
                {hasMobileGuardianContext
                  ? "Market movement is not dangerous by itself. The risk appears when volatility, screen time, and sleep debt stack together."
                  : "BTC volatility is visible, but personal stress signals need connected health sources."}
              </p>
            </div>
          </div>
        </section>
        <section className="rounded-[1.9rem] border border-[#E5DFF2] bg-white/90 p-4 shadow-[0_24px_70px_rgba(16,21,16,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F617F]">Stress protocol</p>
              <p className="mt-1 text-sm font-medium text-[#21182C]">
                {completedMarketActions.length} / {marketStressActions.length} actions done
              </p>
            </div>
            <div className="rounded-full bg-[#171022] px-3 py-1 text-xs font-medium text-trace-green">Watch mode</div>
          </div>
          <div className="mt-4 space-y-3">
            {marketStressActions.map((action, index) => {
              const isDone = completedMarketActions.includes(action.title);
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => toggleMarketAction(action.title)}
                  className={`flex w-full gap-3 rounded-[1.25rem] border px-4 py-3 text-left text-sm leading-5 transition ${
                    isDone
                      ? "border-[#171022] bg-[#171022] text-white shadow-[0_16px_44px_rgba(16,21,16,0.16)]"
                      : "border-[#E5DFF2] bg-[#FAF7FF] text-[#3B2D4A] hover:border-[#D9D0F1]"
                  }`}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FF7BAC] text-xs font-semibold text-[#171022]">
                    {isDone ? <Check size={13} strokeWidth={3} /> : index + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{action.title}</span>
                    <span className={`mt-1 block text-xs leading-5 ${isDone ? "text-white/54" : "text-[#746A80]"}`}>{action.detail}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === "Recovery") {
    return (
      <div className="space-y-4">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#171022] p-5 text-white shadow-[0_30px_90px_rgba(16,21,16,0.32)]">
          <motion.div
            aria-hidden
            className="absolute -right-16 -top-20 size-56 rounded-full bg-[#FF7BAC]/20 blur-3xl"
            animate={{ opacity: [0.42, 0.78, 0.42], scale: [0.92, 1.08, 0.92] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-trace-green/72">
              Night Watch
            </p>
            <div className="mt-4 flex items-end justify-between gap-5">
              <div>
                <h2 className="text-[2.45rem] font-medium leading-[0.92] tracking-normal">
                  {hasMobileGuardianContext ? "Recovery is still protected." : "Recovery needs a baseline."}
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/62">
                  {hasMobileGuardianContext
                    ? "You have mild sleep debt, but HRV and morning movement are keeping your buffer intact."
                    : "Connect sleep and activity data so Trace can personalize recovery guidance."}
                </p>
              </div>
              <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#FF7BAC_0deg,#FF7BAC_302deg,rgba(255,255,255,0.12)_302deg)] p-1.5 shadow-[0_0_48px_rgba(255,123,172,0.18)]">
                <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#171022]">
                  <p className="text-3xl font-medium leading-none">{hasMobileGuardianContext ? "84" : "--"}</p>
                  <p className="mt-1 text-[0.6rem] text-trace-green">{hasMobileGuardianContext ? "Ready" : "No data"}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {mobileRecoveryStats.map(([label, value]) => (
                <div key={label} className="rounded-[1.15rem] border border-white/10 bg-white/[0.06] p-3">
                  <p className="text-lg font-medium leading-none">{value}</p>
                  <p className="mt-2 text-[0.62rem] text-white/42">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-[1.75rem] border border-[#E5DFF2] bg-white/88 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#21182C]">Tonight&apos;s recovery protocol</p>
            <Moon className="size-5 text-[#7555DA]" />
          </div>
          <div className="mt-4 space-y-3">
            {[
              [
                "3 PM",
                "Caffeine boundary",
                "Your sleep onset is more fragile when caffeine appears after mid-afternoon. Trace will watch tonight's sleep latency and resting heart rate.",
                "Expected: easier wind-down",
              ],
              [
                "10 PM",
                "Dim screens",
                "Bright charts, X, and Discord keep attention high even after you stop working. Lower brightness and switch to reading or audio.",
                "Expected: lower stress drift",
              ],
              [
                "11:30 PM",
                "Market hard stop",
                "Your worst recovery dips follow late volatility checks. Stop active market decisions so sleep debt does not compound tomorrow.",
                "Expected: protect readiness",
              ],
            ].map(([time, title, detail, outcome]) => (
              <div key={title} className="grid grid-cols-[4.5rem_1fr] gap-3 rounded-[1.25rem] bg-[#FAF7FF] p-3">
                <p className="text-sm font-medium text-[#7555DA]">{time}</p>
                <div>
                  <p className="text-sm font-medium text-[#21182C]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#746A80]">{detail}</p>
                  <p className="mt-2 text-xs font-medium text-[#7555DA]">{outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === "Eye Break") {
    return (
      <div className="space-y-4">
        <MobileShell eyebrow="Eye Break" title="Reset your eyes before your focus breaks." dark>
          <EyeResetPanel
            compact
            onComplete={onEyeResetComplete}
            isOnCooldown={isEyeResetOnCooldown}
            cooldownSecondsLeft={eyeResetCooldownSeconds}
          />
        </MobileShell>
        <div className="grid gap-3">
          {eyeBreakMetrics.map((item) => (
            <MobilePillCard key={item.label} label={item.label} value={item.value} detail={item.detail} icon={Activity} />
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "Journal") {
    return (
      <div className="space-y-4">
        <MobileShell eyebrow="FOMO / FUD" title="Track decision state, not mood.">
          <p className="text-sm leading-6 text-[#756A82]">
            Capture market-specific emotions so the Guardian knows when volatility, losses, or
            Discord noise are driving stress.
          </p>
        </MobileShell>
        <div className="space-y-3">
          {journalEntries.map((entry) => {
            const selectedLevel = journalSelections[entry.label];
            const response = selectedLevel ? journalResponseCopy[entry.label]?.[selectedLevel] : null;
            return (
            <button
              key={entry.label}
              type="button"
              onClick={() => openJournalCheckIn(entry.label)}
              className="w-full rounded-[1.5rem] border border-[#E8E2F2] bg-white/86 p-4 text-left shadow-[0_14px_40px_rgba(16,21,16,0.045)] transition hover:border-[#D9D0F1]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#756A82]">{entry.label}</p>
                  <p className="mt-1 text-2xl font-medium text-[#21182C]">{selectedLevel ?? entry.value}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${selectedLevel ? "bg-[#171022] text-white" : "bg-[#F3EEFF] text-[#836EF9]"}`}>
                  {selectedLevel ? "Checked in" : "Check-in"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#746A80]">{response?.detail ?? entry.detail}</p>
              <p className="mt-3 text-sm font-medium text-[#7555DA]">{response?.action ?? entry.action}</p>
            </button>
            );
          })}
        </div>
        <section className="rounded-[1.75rem] border border-[#E5DFF2] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <p className="text-sm font-medium text-[#21182C]">Today&apos;s check-ins</p>
          <div className="mt-3 space-y-2">
            {journalCheckIns.map((action, index) => {
              const isDone = Boolean(journalSelections[action.title]);
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => openJournalCheckIn(action.title)}
                  className={`flex w-full gap-3 rounded-[1.15rem] px-3 py-3 text-left text-sm leading-5 transition ${
                    isDone ? "bg-[#171022] text-white" : "bg-[#FAF7FF] text-[#3B2D4A]"
                  }`}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FF7BAC] text-xs font-semibold text-[#171022]">
                    {isDone ? <Check size={13} strokeWidth={3} /> : index + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{action.title}</span>
                    <span className={`mt-1 block text-xs leading-5 ${isDone ? "text-white/54" : "text-[#746A80]"}`}>{action.detail}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === "Rewards") {
    return (
      <div className="space-y-4">
        <MobileShell eyebrow="Rewards" title="Healthy actions earn identity." dark>
          <div className="grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <p className="text-sm text-white/50">Health Trace Points</p>
              <p className="mt-1 text-5xl font-medium leading-none">{rewardPoints.toLocaleString()}</p>
              <p className="mt-2 text-sm text-trace-green">Level {guardianLevel} Chog Guardian</p>
            </div>
            <div className="rounded-[1.15rem] border border-trace-green/20 bg-trace-green/10 px-3 py-2 text-center">
              <p className="text-2xl font-medium">{isDemoAccount ? "6" : "0"}</p>
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/46">Streak</p>
            </div>
          </div>
          {chogGuardian ? (
            <div className="mt-5 grid grid-cols-[6rem_1fr] gap-4 border-t border-white/10 pt-5">
              <GuardianArtwork className="aspect-square" />
              <div className="min-w-0 py-1">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-violet-200/68">{chogGuardian.label}</p>
                <p className={`mt-2 text-xl font-medium ${mobileChogMood.tone}`}>{mobileChogMood.label}</p>
                <p className="mt-1 text-xs text-white/46">
                  {careXp} Care XP · {chogGuardian.mode === "wallet" ? "3× NFT boost" : "1× preview"}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-trace-green" style={{ width: `${guardianLevelProgress}%` }} />
                </div>
              </div>
            </div>
          ) : null}
        </MobileShell>
        <section className="rounded-[1.75rem] border border-[#E5DFF2] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <p className="text-sm font-medium text-[#21182C]">Today&apos;s missions</p>
          <div className="mt-3 space-y-2">
            {rewardMissions.map((mission) => {
              const Icon = mission.icon;
              const isDone = completedRewardMissions.includes(mission.label);
              return (
                <button
                  key={mission.label}
                  type="button"
                  onClick={() => setActiveTab(mission.targetTab as HealthTab)}
                  className={`flex w-full items-center gap-3 rounded-[1.2rem] p-3 text-left ${isDone ? "bg-[#171022] text-white" : "bg-[#FAF7FF]"}`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#F5EDFF] text-[#7555DA]">
                    {isDone ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-medium leading-5 ${isDone ? "text-white" : "text-[#21182C]"}`}>
                      {mission.label === "Complete 20-20-20 eye break" ? (
                        <>
                          <span className="block">Complete 20-20-20</span>
                          <span className="block">eye break</span>
                        </>
                      ) : mission.label === "Log FOMO / FUD check-in" ? (
                        <>
                          <span className="block">Log FOMO / FUD</span>
                          <span className="block">check in</span>
                        </>
                      ) : (
                        mission.label
                      )}
                    </span>
                    <span className={`mt-0.5 block text-xs ${isDone ? "text-white/54" : "text-[#746A80]"}`}>{isDone ? "Completed" : mission.status}</span>
                  </span>
                  <span className="text-xs font-semibold text-[#7555DA]">{isDone ? "Earned" : mission.reward}</span>
                </button>
              );
            })}
          </div>
        </section>
        <div className="grid gap-3">
          {mobileBadges.map((badge) => (
            <MobilePillCard key={badge.label} label={badge.label} value={badge.status} detail={badge.detail} icon={ShieldCheck} />
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "AI Chat") {
    return (
      <div className="space-y-4">
        <MobileShell eyebrow="AI Chat" title="Ask your health context." dark>
          <p className="text-sm leading-6 text-white/62">
            Chog Guardian answers with your health signals, proof history, and onchain behavior context.
          </p>
        </MobileShell>
        <section className="rounded-[1.75rem] border border-[#E5DFF2] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <div className="space-y-3">
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-[1.35rem] p-4 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "bg-[#171022] text-white shadow-[0_20px_55px_rgba(16,21,16,0.16)]"
                    : "ml-8 bg-[#F3EEFF] text-[#21182C]"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {chatPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="rounded-full border border-[#E1DAEC] bg-white px-3 py-2 text-xs text-[#5F526F]"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-[#E1DAEC] bg-[#FAF7FF] px-4 py-3 text-sm text-[#85788F]">
            <MessageCircle size={16} />
            Ask why recovery is dropping...
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === "Proofs") {
    return (
      <div className="space-y-4">
        <MobileShell eyebrow="Proofs" title="Prove actions, not health data." dark>
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs text-white/42">Current streak</p>
            <p className="mt-1 text-4xl font-medium">{proofStreakLabel}</p>
            <p className="mt-2 text-sm text-trace-green">Builder Balance Badge pending</p>
          </div>
        </MobileShell>
        <section className="rounded-[1.75rem] border border-[#E5DFF2] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F617F]">Weekly report</p>
              <h3 className="mt-2 text-2xl font-medium leading-tight text-[#21182C]">{weeklyReport.title}</h3>
              <p className="mt-1 text-xs text-[#746A80]">{weeklyRangeLabel}</p>
            </div>
            <FileText className="size-6 text-[#7555DA]" />
          </div>
          <p className="mt-3 text-sm leading-6 text-[#746A80]">{weeklyReportSummary}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {weeklyReportStats.map(([label, value]) => (
              <div key={label} className="rounded-[1.1rem] bg-[#FAF7FF] p-3">
                <p className="text-lg font-medium text-[#21182C]">{value}</p>
                <p className="mt-1 text-[0.68rem] text-[#746A80]">{label}</p>
              </div>
            ))}
          </div>
        </section>
        {chogGuardian ? (
          <section className="grid grid-cols-[5.5rem_1fr] gap-4 rounded-[1.75rem] bg-[#21143a] p-3 text-white shadow-[0_20px_60px_rgba(33,20,58,0.2)]">
            <GuardianArtwork className="aspect-square" />
            <div className="min-w-0 py-1 pr-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-violet-200/70">Weekly Chog proof</p>
                <span className="text-[0.65rem] text-trace-green">
                  {chogGuardian.mode !== "wallet" ? "NFT required" : guardianWeeklyProofClaimed ? "Claimed" : guardianWeeklyProofReady ? "Ready" : "Locked"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/46">Claim the action summary without publishing raw health signals.</p>
              <Button
                type="button"
                onClick={claimWeeklyGuardianProof}
                disabled={chogGuardian.mode !== "wallet" || !guardianWeeklyProofReady || guardianWeeklyProofClaimed || Boolean(guardianClaimState)}
                className="mt-3 h-9 w-full rounded-full bg-trace-green text-xs font-semibold text-[#130B20] hover:bg-[#FF9DCA] disabled:bg-white/10 disabled:text-white/32"
              >
                {chogGuardian.mode !== "wallet"
                  ? "CHOG NFT required"
                  : guardianClaimState
                    ? "Confirm in wallet..."
                    : guardianWeeklyProofClaimed
                      ? "Proof claimed"
                      : "Claim weekly proof"}
              </Button>
            </div>
          </section>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          {proofActions.map((proof) => {
            const Icon = proof.icon;
            return (
              <button
                key={proof.label}
                type="button"
                onClick={() => syncProofAction(proof)}
                disabled={proof.completed && proof.syncable}
                className={`rounded-[1.35rem] border p-3 text-left shadow-[0_14px_40px_rgba(16,21,16,0.045)] ${
                  proof.completed ? "border-[#D9D0F1] bg-[#F8F0FF]" : "border-[#E8E2F2] bg-white/86"
                }`}
              >
                <div className="flex size-9 items-center justify-center rounded-2xl bg-[#F3EEFF] text-[#836EF9]">
                  {proof.completed ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                </div>
                <p className="mt-4 text-sm font-medium leading-5 text-[#21182C]">{proof.label}</p>
                <p className="mt-2 text-[0.68rem] text-[#7A6F86]">{proof.status}</p>
                <p className="mt-3 text-[0.68rem] font-semibold text-[#7555DA]">{proof.actionLabel}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[1.75rem] border border-[#E5DFF2] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#21182C]">Wallet</p>
            <p className="mt-1 text-xs leading-5 text-[#746A80]">
              {walletAddress ? `Wallet ${formatWalletAddress(walletAddress)}` : "Connect for proofs and consent records"}
            </p>
          </div>
          <Wallet className="size-5 text-[#7555DA]" />
        </div>
        <Button
          onClick={onConnectWallet}
          disabled={isWalletConnecting}
          className="mt-4 h-11 w-full rounded-full bg-[#171022] text-white hover:bg-[#302345]"
        >
          {walletAddress ? "Wallet connected" : isWalletConnecting ? "Connecting..." : "Connect wallet"}
        </Button>
        {walletError ? <p className="mt-3 text-xs leading-5 text-rose-500">{walletError}</p> : null}
      </section>
      {chogGuardian ? (
        <section className="grid grid-cols-[5.5rem_1fr] gap-4 rounded-[1.75rem] bg-[#21143a] p-3 text-white shadow-[0_20px_60px_rgba(33,20,58,0.18)]">
          <GuardianArtwork className="aspect-square" src={chogGuardian.image} alt={chogGuardian.label} />
          <div className="min-w-0 py-2 pr-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-violet-200/68">Active Chog guardian</p>
              <button
                type="button"
                onClick={discoverChogGuardian}
                disabled={isDiscoveringChog}
                className="shrink-0 rounded-full border border-white/16 px-2.5 py-1 text-[0.65rem] font-medium text-white/74"
              >
                {isDiscoveringChog ? "Scanning..." : "Change"}
              </button>
            </div>
            <p className="mt-2 truncate text-lg font-medium">{chogGuardian.label}</p>
            <p className="mt-1 text-xs text-white/42">Level {guardianLevel} · Ownership verified</p>
          </div>
        </section>
      ) : null}
      <ChogTokenPicker tokens={ownedChogTokens} onSelect={selectOwnedChogGuardian} />
      {!chogGuardian && !ownedChogTokens.length ? (
        <section className="rounded-[1.5rem] border border-[#E1DAEF] bg-[#FAF7FF] p-4">
          <p className="text-sm font-medium text-[#21182C]">No NFT detected</p>
          <p className="mt-1 text-xs leading-5 text-[#746A80]">Scan again after buying or receiving a CHOG NFT.</p>
          <Button
            type="button"
            onClick={discoverChogGuardian}
            disabled={isDiscoveringChog}
            className="mt-3 h-11 w-full rounded-full bg-[#21143A] text-white hover:bg-[#33204F]"
          >
            {isDiscoveringChog ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Gem className="mr-2 size-4" />}
            {isDiscoveringChog ? "Scanning Monad..." : "Detect CHOG NFT"}
          </Button>
        </section>
      ) : null}
      {chogActivationError ? <p className="text-xs leading-5 text-[#7555DA]">{chogActivationError}</p> : null}
      <section className="rounded-[1.75rem] border border-[#E5DFF2] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
        <p className="text-sm font-medium text-[#21182C]">Health Apps</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {healthApps.map((app) => {
            const Icon = app.icon;
            const isSelected = selectedHealthApp === app.label;
            const isConnected = connectedHealthApps.includes(app.label);
            const connectedCount = healthPermissions[app.label]?.length ?? 0;
            return (
              <button
                key={app.label}
                type="button"
                onClick={() => setSelectedHealthApp(app.label)}
                className={`relative rounded-[1.15rem] border p-2 text-center transition ${
                  isSelected ? "border-[#171022] bg-[#171022] text-white" : "border-transparent bg-[#FAF7FF] text-[#756A82]"
                }`}
              >
                {isConnected ? (
                  <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-trace-green text-[#171022]">
                    <Check size={10} strokeWidth={3} />
                  </span>
                ) : null}
                <span className={`mx-auto flex size-10 items-center justify-center rounded-2xl ${isSelected ? "bg-trace-green/15 text-trace-green" : "bg-[#F3EEFF] text-[#836EF9]"}`}>
                  <Icon size={17} />
                </span>
                <span className="mt-2 block text-[0.62rem] font-medium leading-tight">{app.label}</span>
                <span className={`mt-1 block text-[0.58rem] ${isSelected ? "text-white/46" : "text-[#836EF9]"}`}>
                  {isConnected ? `${connectedCount} data` : "Tap to connect"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="rounded-[1.75rem] border border-[#E5DFF2] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
        <p className="text-sm font-medium text-[#21182C]">{selectedHealthApp} data permissions</p>
        {connectedHealthApps.includes(selectedHealthApp) ? (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {healthPermissionOptions.map((permission) => {
                const isEnabled = healthPermissions[selectedHealthApp]?.includes(permission);
                return (
                  <button
                    key={permission}
                    type="button"
                    onClick={() => toggleHealthPermission(selectedHealthApp, permission)}
                    className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                      isEnabled
                        ? "border-[#171022] bg-[#171022] text-white"
                        : "border-[#E5DFF2] bg-[#FAF7FF] text-[#756A82]"
                    }`}
                  >
                    {permission}
                  </button>
                );
              })}
            </div>
            <Button
              onClick={() => requestDisconnectHealthApp(selectedHealthApp)}
              className="mt-3 h-10 w-full rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              Disconnect {selectedHealthApp}
            </Button>
          </>
        ) : (
          <div className="mt-3 rounded-[1.25rem] bg-[#FAF7FF] p-3">
            <p className="text-xs leading-5 text-[#746A80]">
              Connect to {selectedHealthApp} first, then choose what health data to share.
            </p>
            <Button
              onClick={() => connectHealthApp(selectedHealthApp)}
              className="mt-3 h-10 w-full rounded-full bg-[#171022] text-white hover:bg-[#302345]"
            >
              Connect to {selectedHealthApp}
            </Button>
          </div>
        )}
      </section>
      <Button onClick={() => setActiveTab("Proofs")} className="h-12 w-full rounded-full bg-[#171022] text-white hover:bg-[#302345]">
        Review proof model
      </Button>
    </div>
  );
}

export default function Web3HealthPage() {
  const hydratedWalletRef = useRef("");
  const verifiedGuardianKeyRef = useRef("");
  const [activeTab, setActiveTab] = useState<HealthTab>("Home");
  const [syncedAt, setSyncedAt] = useState("");
  const [guardianOpen, setGuardianOpen] = useState(true);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [pendingDisplayName, setPendingDisplayName] = useState("");
  const [walletResetAt, setWalletResetAt] = useState("");
  const [chogGuardian, setChogGuardian] = useState<ChogGuardianProfile | null>(null);
  const [careXp, setCareXp] = useState(0);
  const [chogTraits, setChogTraits] = useState<string[]>([]);
  const [lastGuardianProofWeek, setLastGuardianProofWeek] = useState("");
  const [guardianProofTxHash, setGuardianProofTxHash] = useState("");
  const [lastChogQuestDate, setLastChogQuestDate] = useState("");
  const [chogQuestStreak, setChogQuestStreak] = useState(0);
  const [guardianOwnershipState, setGuardianOwnershipState] = useState<"idle" | "checking" | "verified" | "missing">("idle");
  const [isDiscoveringChog, setIsDiscoveringChog] = useState(false);
  const [chogActivationError, setChogActivationError] = useState("");
  const [ownedChogTokens, setOwnedChogTokens] = useState<OwnedChogToken[]>([]);
  const [guardianClaimState, setGuardianClaimState] = useState<"" | "preparing" | "wallet" | "confirmed">("");
  const [eyeBreakCount, setEyeBreakCount] = useState(0);
  const [isEyeResetOnCooldown, setIsEyeResetOnCooldown] = useState(false);
  const [eyeResetCooldownSeconds, setEyeResetCooldownSeconds] = useState(0);
  const [postureResetDone, setPostureResetDone] = useState(false);
  const [completedGuardianActions, setCompletedGuardianActions] = useState<string[]>([]);
  const [completedMarketActions, setCompletedMarketActions] = useState<string[]>([]);
  const [journalSelections, setJournalSelections] = useState<Record<string, string>>({});
  const [pendingJournalCheckIn, setPendingJournalCheckIn] = useState("");
  const [completedRewardMissions, setCompletedRewardMissions] = useState<string[]>([]);
  const [completedProofActions, setCompletedProofActions] = useState<string[]>([]);
  const [syncingProofAction, setSyncingProofAction] = useState("");
  const [weeklyEyeBreaks, setWeeklyEyeBreaks] = useState(0);
  const [weeklyStressChecks, setWeeklyStressChecks] = useState(0);
  const [weeklySleepBoundaries, setWeeklySleepBoundaries] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [selectedHealthApp, setSelectedHealthApp] = useState(healthApps[0].label);
  const [connectedHealthApps, setConnectedHealthApps] = useState<string[]>([]);
  const [healthContextConnectedDate, setHealthContextConnectedDate] = useState("");
  const [dailyRecords, setDailyRecords] = useState<Record<string, HealthDailyRecord>>({});
  const [pendingDisconnectApp, setPendingDisconnectApp] = useState("");
  const [healthPermissions, setHealthPermissions] = useState<Record<string, string[]>>(emptyHealthPermissions);
  const [badgeHintOpen, setBadgeHintOpen] = useState("");
  const [walletRegistry, setWalletRegistry] = useState<WalletRegistryEntry[]>([]);
  const mobilePrimaryNavigation = navigation.slice(0, 8);
  const mobileOverflowNavigation = navigation.slice(8);
  const isMobileOverflowActive = mobileOverflowNavigation.some((item) => item.label === activeTab);
  const isDemoAccount = walletAddress.toLowerCase() === savedContextWalletAddress.toLowerCase();
  const isAdminWallet = isDemoAccount;
  const hasLiveHealthContext = isDemoAccount || connectedHealthApps.length > 0;
  const hasGuardianContext = hasLiveHealthContext;
  const profileName = displayName.trim() || "there";
  const currentWeekDays = getGmt8CurrentWeekDays();
  const todayKey = getGmt8DateKey();
  const weeklyRecords = currentWeekDays
    .map((day) => dailyRecords[day.dateKey])
    .filter((record): record is HealthDailyRecord => Boolean(record));
  const weeklyEyeBreakTotal = weeklyRecords.reduce((total, record) => total + record.eyeBreakCount, 0);
  const weeklyStressCheckTotal = weeklyRecords.reduce((total, record) => total + record.completedMarketActions.length, 0);
  const weeklySleepBoundaryTotal = weeklyRecords.reduce(
    (total, record) => total + (record.completedProofActions.includes("Sleep boundary") ? 1 : 0),
    0,
  );
  const weeklyEyeBreakDisplay = Math.max(weeklyEyeBreaks, weeklyEyeBreakTotal, eyeBreakCount);
  const weeklyFomoReflectionTotal = Object.keys(journalSelections).length > 0 ? 1 : 0;
  const weeklyStressCheckDisplay = Math.max(weeklyStressChecks, weeklyStressCheckTotal) + weeklyFomoReflectionTotal;
  const weeklySleepBoundaryDisplay = Math.max(
    weeklySleepBoundaries,
    weeklySleepBoundaryTotal,
    completedProofActions.includes("Sleep boundary") ? 1 : 0,
  );
  const weeklyProofDayCount = weeklyRecords.filter(
    (record) =>
      record.eyeBreakCount >= 6 ||
      record.completedMarketActions.length > 0 ||
      record.completedProofActions.length > 0 ||
      Object.keys(record.journalSelections).length > 0,
  ).length;
  const fomoReflectionDone = Boolean(journalSelections.FOMO || journalSelections.FUD || journalSelections["Revenge trade urge"]);
  const completedProofCount =
    completedProofActions.length +
    (eyeBreakCount >= 6 ? 1 : 0) +
    (fomoReflectionDone ? 1 : 0) +
    completedMarketActions.length;
  const proofStreakLabel = isDemoAccount
    ? "6 days"
    : weeklyProofDayCount > 0
      ? `${weeklyProofDayCount} day${weeklyProofDayCount === 1 ? "" : "s"}`
      : "0 days";
  const currentDayRecord = hasLiveHealthContext
    ? dailyRecords[todayKey]
      ? { ...createDailyRecord(todayKey), ...dailyRecords[todayKey] }
      : createDailyRecord(todayKey)
    : null;
  const guardianLevel = Math.min(6, Math.max(1, Math.floor(careXp / 100) + 1));
  const hasVerifiedChog = chogGuardian?.mode === "wallet";
  const careXpMultiplier = hasVerifiedChog ? 3 : 1;
  const guardianLevelFloor = (guardianLevel - 1) * 100;
  const guardianLevelProgress = guardianLevel >= 6 ? 100 : Math.min(100, careXp - guardianLevelFloor);
  const guardianMood = getGuardianMood(currentDayRecord);
  const guardianTraits = Array.from(
    new Set([
      ...chogTraits,
      ...(guardianLevel >= 2 ? ["Focus antenna"] : []),
      ...(guardianLevel >= 3 ? ["Recovery aura"] : []),
      ...(guardianLevel >= 4 ? ["Calm trader"] : []),
      ...(guardianLevel >= 6 && hasVerifiedChog ? ["Builder balance"] : []),
    ]),
  );
  const guardianProofWeek = getGmt8WeekKey();
  const guardianWeeklyProofReady = Boolean(hasVerifiedChog && completedProofCount >= 3);
  const guardianWeeklyProofClaimed = lastGuardianProofWeek === guardianProofWeek;
  const firstSavedRecordDate = Object.keys(dailyRecords).sort()[0] ?? "";
  const chartConnectedDate = isDemoAccount
    ? getGmt8WeekKey()
    : healthContextConnectedDate || firstSavedRecordDate || (hasLiveHealthContext ? todayKey : "");
  const dashboardTrend = currentWeekDays.map((day, index) => {
    const savedPoint = day.dateKey === todayKey && currentDayRecord ? currentDayRecord : dailyRecords[day.dateKey];
    const isFuture = day.dateKey > todayKey;
    const isBeforeConnected = !chartConnectedDate || day.dateKey < chartConnectedDate;

    if (!hasLiveHealthContext || isBeforeConnected) {
      return { ...day, score: 0, sleep: 0, market: 0 };
    }

    if (isFuture) {
      return { ...day, score: 0, sleep: 0, market: 0 };
    }

    if (!savedPoint) {
      return { ...day, score: 0, sleep: 0, market: 0 };
    }

    return {
      ...day,
      score: savedPoint.healthScore,
      sleep: savedPoint.recoveryScore,
      market: savedPoint.marketStress,
    };
  });
  const dashboardScoreSeries = dashboardTrend.map((point) => point.score ?? 0);
  const dashboardRecoverySeries = dashboardTrend.map((point) => point.sleep ?? 0);
  const dashboardMarketSeries = dashboardTrend.map((point) => point.market ?? 0);
  const dashboardSignals = (hasLiveHealthContext ? homeSignals : emptyHomeSignals).map((signal) => {
    if (signal.label === "Health Trace Score") {
      return {
        ...signal,
        value: currentDayRecord ? String(currentDayRecord.healthScore) : "0",
        detail: currentDayRecord ? "Synced from today's health context" : "Connect health apps to build a baseline",
        chart: dashboardScoreSeries,
      };
    }
    if (signal.label === "Market Stress") {
      return {
        ...signal,
        value: currentDayRecord ? String(currentDayRecord.marketStress) : "--",
        detail: currentDayRecord ? `BTC volatility is ${currentDayRecord.marketVolatility} vs baseline` : "No source connected yet",
        chart: dashboardMarketSeries,
      };
    }
    if (signal.label === "Sleep Debt") {
      return {
        ...signal,
        value: currentDayRecord ? currentDayRecord.sleepDebt : "--",
        detail: currentDayRecord ? "Synced from recovery context" : "No source connected yet",
        chart: dashboardRecoverySeries,
      };
    }
    if (signal.label === "Screen Fatigue") {
      return {
        ...signal,
        value: currentDayRecord ? currentDayRecord.screenFatigueLevel : "--",
        detail: currentDayRecord ? `${currentDayRecord.screenFatigue} without a proper eye break` : "No source connected yet",
      };
    }
    if (signal.label === "Proof Streak") {
      return {
        ...signal,
        value: proofStreakLabel,
        detail: completedProofCount > 0 || isDemoAccount ? "Healthy actions privately verified" : "No healthy actions verified yet",
        chart: completedProofCount > 0 || isDemoAccount ? signal.chart : [0, 0, 0, 0, 0, 0, 0],
      };
    }
    return signal;
  });
  const dashboardBriefItems = currentDayRecord ? currentDayRecord.briefItems : emptyBriefItems;
  const healthScore = currentDayRecord ? String(currentDayRecord.healthScore) : "0";
  const healthScoreLabel = currentDayRecord ? currentDayRecord.healthScoreLabel : "No data";
  const currentState = currentDayRecord ? currentDayRecord.currentState : "No baseline yet";
  const mobileSummaryStats = hasLiveHealthContext
    ? [
        ["Stress", String(currentDayRecord?.marketStress ?? 0), currentDayRecord?.guardianRisk ?? "Watch"],
        ["Sleep", currentDayRecord?.sleepDebt ?? "0h", "Debt"],
        ["Screen", currentDayRecord?.screenFatigue ?? "0m", "Break"],
      ]
    : [
        ["Apps", "0", "Connect"],
        ["Score", "0", "No data"],
        ["Proofs", "0", "Start"],
      ];
  const guardianRecommendation = currentDayRecord
    ? currentDayRecord.guardianRecommendation
    : "Connect a health source in Settings to start building your private baseline.";
  const rewardStats = [
    ["HT Points", rewardPoints.toLocaleString()],
    ["Level", String(guardianLevel)],
    ["Streak", proofStreakLabel],
    ["Badge status", !hasVerifiedChog ? "NFT required" : guardianLevel >= 6 ? "Mint ready" : "Not ready"],
  ];
  const dashboardBadges = healthBadges.map((badge) => {
    if (!hasLiveHealthContext) return { ...badge, status: "NOT READY" };
    if (badge.label === "Builder Balance") {
      return { ...badge, status: !hasVerifiedChog ? "NFT required" : guardianLevel >= 6 ? "Mint ready" : "Not ready" };
    }
    if (badge.label === "Calm Trader") {
      return { ...badge, status: `${Math.min(100, Math.max(0, Math.round((careXp / 500) * 100)))}%` };
    }
    return badge;
  });
  const dashboardMarketDrivers = hasLiveHealthContext
    ? marketDrivers.map((driver) => {
        if (driver.label === "Screen exposure") {
          return { ...driver, value: currentDayRecord?.screenFatigue ?? "0m", note: "X, Discord, charts" };
        }
        if (driver.label === "Body stress") {
          return { ...driver, value: currentDayRecord?.bodyStress ?? "Moderate", note: "HRV recovery still acceptable" };
        }
        return { ...driver, value: currentDayRecord?.marketVolatility ?? "+18%", note: "Above 7-day baseline" };
      })
    : marketDrivers.map((driver) =>
        driver.label === "BTC volatility"
          ? driver
          : {
              ...driver,
              value: "--",
              note: "Connect health sources to calculate this signal",
              chart: [0, 0, 0, 0, 0, 0, 0],
            },
      );
  const dashboardRecoveryRows = hasLiveHealthContext
    ? recoveryRows.map(([label, value, detail]) => {
        if (label === "Sleep debt") return [label, currentDayRecord?.sleepDebt ?? value, "Reduce intense work after 11 PM"];
        if (label === "Builder load") return [label, currentDayRecord?.currentState.includes("High") ? "High" : "Moderate", detail];
        return [label, value, detail];
      })
    : [
        ["Midnight activity", "--", "Connect sleep/activity data"],
        ["Sleep debt", "--", "Connect a sleep source"],
        ["Caffeine window", "--", "No journal baseline yet"],
        ["Builder load", "--", "No activity context yet"],
      ];
  const guardianTitle = currentDayRecord
    ? currentDayRecord.guardianTitle
    : "Market volatility is live. Personal health context is not connected.";
  const guardianCopy = currentDayRecord
    ? currentDayRecord.guardianCopy
    : "Health Trace can always read the public market-volatility layer. Connect a health device to add sleep, screen fatigue, and decision-risk context.";
  const guardianPills = hasGuardianContext
    ? [
        { label: "Devices connected", detail: isDemoAccount ? "Demo health stack" : `${connectedHealthApps.length} source${connectedHealthApps.length === 1 ? "" : "s"}`, className: "border-sky-200 bg-sky-50 text-sky-700" },
        { label: "Decision watch", detail: "Protect trades", className: "border-amber-200 bg-amber-50 text-amber-700" },
        { label: "91% confidence", detail: "Strong signal match", className: "border-[#FF7BAC]/50 bg-[#FFF0F7] text-[#7555DA]" },
      ]
    : [
        { label: "Market feed live", detail: `BTC volatility ${currentDayRecord?.marketVolatility ?? "+18%"}`, className: "border-amber-200 bg-amber-50 text-amber-700" },
        { label: "Devices connected", detail: "0 sources", className: "border-[#E1DAEF] bg-white text-[#756A82]" },
        { label: "Personal confidence", detail: "0%", className: "border-[#E1DAEF] bg-white text-[#756A82]" },
      ];
  const guardianEvidence = currentDayRecord
    ? currentDayRecord.guardianEvidence
    : [
        ["Market volatility", "BTC volatility is +18% above the 7-day baseline.", "https://www.tradingview.com/symbols/BTCUSD/"],
        ["Sleep debt", "0 hours. Connect Apple Health, Samsung Health, Google Fit, or Mi Fitness to estimate recovery debt."],
        ["Screen fatigue", "0 minutes. Connect a device or screen context source to unlock fatigue detection."],
        ["Decision risk", "0 personalized risk. Health Trace needs sleep, screen, and journal signals before recommending trading decisions."],
      ];
  const guardianReadout = hasGuardianContext
    ? { value: currentDayRecord?.guardianRisk ?? "Watch", label: "Attention risk", chart: [42, 48, 56, 64, 72, 68, currentDayRecord?.marketStress ?? 62] }
    : { value: "0", label: "Personal signals", chart: [0, 0, 0, 0, 0, 0, 0] };
  const marketStressScore = currentDayRecord ? String(currentDayRecord.marketStress) : "--";
  const marketStressLabel = hasLiveHealthContext ? "Elevated, manageable" : "Health context needed";
  const dailyGuardianProtocol = currentDayRecord?.guardianProtocol ?? guardianProtocolActions;
  const marketStressCopy = currentDayRecord
    ? currentDayRecord.marketStressCopy
    : "BTC volatility can be visible immediately, but screen intensity, sleep debt, and body stress need connected health sources before Trace can personalize the readout.";
  const recoveryScore = currentDayRecord ? String(currentDayRecord.recoveryScore) : "--";
  const recoveryTitle = currentDayRecord ? currentDayRecord.recoveryTitle : "Recovery needs a baseline.";
  const recoveryCopy = currentDayRecord
    ? currentDayRecord.recoveryCopy
    : "This wallet has no sleep, activity, or wearable context yet. Connect a health source to let Trace build recovery intelligence.";

  const syncWalletRegistryEntry = async (entry: WalletRegistryEntry) => {
    try {
      const response = await fetch("/api/wallets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wallet: entry.wallet,
          displayName: entry.displayName,
          connectedApps: entry.connectedApps,
          rewardPoints: entry.rewardPoints,
          guardianData: entry.guardianData,
        }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
    } catch {
      // Local storage remains the offline fallback for the prototype.
    }
  };

  const loadBackendWalletRegistry = async () => {
    if (!isAdminWallet || !walletAddress) return;

    try {
      const response = await fetch(`/api/wallets?adminWallet=${encodeURIComponent(walletAddress)}`);
      if (!response.ok) return;
      const data = (await response.json()) as { wallets?: WalletRegistryEntry[] };
      if (data.wallets?.length) {
        saveWalletRegistry([...getStoredWalletRegistry(), ...data.wallets]);
      }
    } catch {
      // Keep the local registry if Supabase is not configured yet.
    }
  };

  const loadBackendWalletProfile = async (wallet: string) => {
    try {
      const response = await fetch(`/api/wallets?wallet=${encodeURIComponent(wallet)}`);
      if (!response.ok) return null;
      const data = (await response.json()) as { wallet?: WalletRegistryEntry | null };
      return data.wallet ?? null;
    } catch {
      return null;
    }
  };

  const getStoredWalletRegistry = () => {
    try {
      return JSON.parse(window.localStorage.getItem(walletRegistryStorageKey) ?? "[]") as WalletRegistryEntry[];
    } catch {
      return [];
    }
  };

  const normalizeWalletRegistryEntry = (entry: WalletRegistryEntry): WalletRegistryEntry => {
    if (entry.wallet.toLowerCase() !== savedContextWalletAddress.toLowerCase()) {
      return entry;
    }

    return {
      ...entry,
      wallet: savedContextWalletAddress,
      displayName: "Mervyn",
      connectedApps: demoConnectedHealthApps.length,
      rewardPoints: 1280,
      resetAt: undefined,
    };
  };

  const saveWalletRegistry = (entries: WalletRegistryEntry[]) => {
    const normalized = entries
      .map(normalizeWalletRegistryEntry)
      .reduce<WalletRegistryEntry[]>((list, entry) => {
        const existingIndex = list.findIndex((item) => item.wallet.toLowerCase() === entry.wallet.toLowerCase());
        if (existingIndex >= 0) {
          list[existingIndex] = normalizeWalletRegistryEntry({
            ...list[existingIndex],
            ...entry,
            firstSeen: list[existingIndex].firstSeen || entry.firstSeen,
          });
          return list;
        }
        return [...list, entry];
      }, [])
      .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));

    setWalletRegistry(normalized);
    window.localStorage.setItem(walletRegistryStorageKey, JSON.stringify(normalized));
  };

  const upsertWalletRegistry = (entry: WalletRegistryEntry) => {
    const storedRegistry = getStoredWalletRegistry();
    const existing = storedRegistry.find((item) => item.wallet.toLowerCase() === entry.wallet.toLowerCase());
    const nextEntry = normalizeWalletRegistryEntry({
      ...existing,
      ...entry,
      firstSeen: existing?.firstSeen ?? entry.firstSeen,
    });

    saveWalletRegistry([
      ...storedRegistry.filter((item) => item.wallet.toLowerCase() !== entry.wallet.toLowerCase()),
      nextEntry,
    ]);
    void syncWalletRegistryEntry(nextEntry);
  };

  const rememberProviderAccounts = (accounts: string[]) => {
    const now = new Date().toISOString();
    accounts.filter(Boolean).forEach((account) => {
      const existing = getStoredWalletRegistry().find((entry) => entry.wallet.toLowerCase() === account.toLowerCase());
      upsertWalletRegistry({
        wallet: account,
        firstSeen: existing?.firstSeen ?? now,
        lastSeen: now,
        displayName: existing?.displayName ?? "",
        connectedApps: existing?.connectedApps ?? 0,
        rewardPoints: existing?.rewardPoints ?? 0,
        resetAt: existing?.resetAt,
      });
    });
  };

  const scanProviderAccounts = async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
      rememberProviderAccounts(accounts ?? []);
    } catch {
      // Some wallet providers block passive account scans.
    }
  };

  const readWalletRegistry = () => {
    const storedRegistry = getStoredWalletRegistry();
    const currentWallet = window.localStorage.getItem(walletStorageKey);

    const profileEntries = Object.keys(window.localStorage)
      .filter((key) => key.startsWith(walletProfileStoragePrefix))
      .map((key) => {
        const wallet = key.replace(walletProfileStoragePrefix, "");
        let profile: Partial<WalletProfile> = {};
        try {
          profile = JSON.parse(window.localStorage.getItem(key) ?? "{}") as Partial<WalletProfile>;
        } catch {
          profile = {};
        }
        const existing = storedRegistry.find((entry) => entry.wallet.toLowerCase() === wallet.toLowerCase());
        return {
          wallet,
          firstSeen: existing?.firstSeen ?? profile.lastTaskResetDate ?? getGmt8DateKey(),
          lastSeen: existing?.lastSeen ?? profile.lastTaskResetDate ?? getGmt8DateKey(),
          displayName: existing?.displayName ?? profile.displayName ?? "",
          connectedApps: profile.connectedHealthApps?.length ?? existing?.connectedApps ?? 0,
          rewardPoints: profile.rewardPoints ?? existing?.rewardPoints ?? 0,
          resetAt: existing?.resetAt,
        };
      });

    const currentWalletEntry =
      currentWallet && !profileEntries.some((entry) => entry.wallet.toLowerCase() === currentWallet.toLowerCase())
        ? [
            {
              wallet: currentWallet,
              firstSeen:
                storedRegistry.find((entry) => entry.wallet.toLowerCase() === currentWallet.toLowerCase())?.firstSeen ??
                new Date().toISOString(),
              lastSeen: new Date().toISOString(),
              displayName: "",
              connectedApps: 0,
              rewardPoints: 0,
              resetAt: storedRegistry.find((entry) => entry.wallet.toLowerCase() === currentWallet.toLowerCase())?.resetAt,
            },
          ]
        : [];

    saveWalletRegistry([...storedRegistry, ...profileEntries, ...currentWalletEntry]);
  };

  const refreshAdminWalletRegistry = () => {
    void scanProviderAccounts();
    readWalletRegistry();
    void loadBackendWalletRegistry();
  };

  const resetWalletProfile = (targetWallet: string) => {
    if (!isAdminWallet) return;

    const normalizedTarget = targetWallet.toLowerCase();
    if (normalizedTarget === savedContextWalletAddress.toLowerCase()) {
      setWalletError("Admin wallet cannot be reset from the registry.");
      return;
    }

    window.localStorage.removeItem(getWalletProfileKey(targetWallet));
    window.localStorage.removeItem(getChogQuestStorageKey(targetWallet));
    const now = new Date().toISOString();
    saveWalletRegistry(
      walletRegistry.map((entry) =>
        entry.wallet.toLowerCase() === normalizedTarget
          ? {
              ...entry,
              displayName: "",
              connectedApps: 0,
              rewardPoints: 0,
              resetAt: now,
              lastSeen: now,
            }
          : entry,
      ),
    );
    void fetch("/api/wallets", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ adminWallet: walletAddress, targetWallet }),
    }).catch(() => undefined);
  };

  useEffect(() => {
    const updateSyncedAt = () => {
      setSyncedAt(new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()));
    };

    updateSyncedAt();
    const timer = window.setInterval(updateSyncedAt, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab && healthTabs.includes(tab as HealthTab)) {
      setActiveTab(tab as HealthTab);
    }
  }, []);

  useEffect(() => {
    const storedWallet = window.localStorage.getItem(walletStorageKey);
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }
    void scanProviderAccounts();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum?.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      rememberProviderAccounts(accounts);
      if (accounts[0]) {
        setWalletAddress(accounts[0]);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
  }, []);

  useEffect(() => {
    readWalletRegistry();
  }, []);

  useEffect(() => {
    void loadBackendWalletRegistry();
  }, [isAdminWallet, walletAddress]);

  useEffect(() => {
    if (!walletAddress) return;

    const now = new Date().toISOString();
    const existing = getStoredWalletRegistry().find((entry) => entry.wallet.toLowerCase() === walletAddress.toLowerCase());
    upsertWalletRegistry({
      wallet: walletAddress,
      firstSeen: existing?.firstSeen ?? now,
      lastSeen: now,
      displayName,
      connectedApps: connectedHealthApps.length,
      rewardPoints,
      resetAt: existing?.resetAt,
      guardianData: {
        guardian: chogGuardian,
        careXp,
        traits: chogTraits,
        lastProofWeek: lastGuardianProofWeek,
        proofReference: guardianProofTxHash,
      },
    });
  }, [
    careXp,
    chogGuardian,
    chogTraits,
    connectedHealthApps.length,
    displayName,
    guardianProofTxHash,
    lastGuardianProofWeek,
    rewardPoints,
    walletAddress,
  ]);

  useEffect(() => {
    let cancelled = false;

    const resetToEmptyWallet = (normalizedWallet: string, resetAt = "") => {
      setDisplayName("");
      setPendingDisplayName("");
      setWalletResetAt(resetAt);
      setChogGuardian(null);
      setCareXp(0);
      setChogTraits([]);
      setLastGuardianProofWeek("");
      setGuardianProofTxHash("");
      setLastChogQuestDate("");
      setChogQuestStreak(0);
      setGuardianOwnershipState("idle");
      verifiedGuardianKeyRef.current = "";
      setChogActivationError("");
      setOwnedChogTokens([]);
      setEyeBreakCount(0);
      setWeeklyEyeBreaks(0);
      setWeeklyStressChecks(0);
      setWeeklySleepBoundaries(0);
      setRewardPoints(0);
      setConnectedHealthApps([]);
      setHealthContextConnectedDate("");
      setDailyRecords({});
      setHealthPermissions(emptyHealthPermissions);
      setCompletedRewardMissions([]);
      setCompletedProofActions([]);
      setCompletedGuardianActions([]);
      setCompletedMarketActions([]);
      setJournalSelections({});
      setPostureResetDone(false);
      setIsEyeResetOnCooldown(false);
      setEyeResetCooldownSeconds(0);
      setSelectedHealthApp(healthApps[0].label);
      hydratedWalletRef.current = normalizedWallet;
    };

    const hydrateWallet = async () => {
      if (!walletAddress) {
        hydratedWalletRef.current = "";
        window.localStorage.removeItem(walletStorageKey);
        return;
      }

      hydratedWalletRef.current = "";
      verifiedGuardianKeyRef.current = "";
      setGuardianOwnershipState("idle");
      window.localStorage.setItem(walletStorageKey, walletAddress);
      const normalizedWallet = walletAddress.toLowerCase();
      const todayKey = getGmt8DateKey();
      const weekKey = getGmt8WeekKey();
      const backendProfile = await loadBackendWalletProfile(walletAddress);
      if (cancelled) return;

      if (normalizedWallet === savedContextWalletAddress.toLowerCase()) {
        let savedQuest: { lastCompletedDate?: string; streak?: number; rewardPoints?: number; careXp?: number } = {};
        try {
          savedQuest = JSON.parse(window.localStorage.getItem(getChogQuestStorageKey(walletAddress)) ?? "{}") as {
            lastCompletedDate?: string;
            streak?: number;
            rewardPoints?: number;
            careXp?: number;
          };
        } catch {
          savedQuest = {};
        }
        const questCompletedToday = savedQuest.lastCompletedDate === todayKey;
        const demoTodayRecord = {
          ...createDailyRecord(todayKey),
          eyeBreakCount: questCompletedToday ? 3 : 2,
          postureResetDone: true,
          completedProofActions: questCompletedToday ? [...syncableProofLabels, "Chog Reset Quest"] : syncableProofLabels,
          completedRewardMissions: questCompletedToday ? ["Complete Chog Reset Quest"] : [],
          chogQuestCompleted: questCompletedToday,
        };
        setDisplayName("Mervyn");
        setPendingDisplayName("Mervyn");
        setWalletResetAt("");
        const savedGuardian = backendProfile?.guardianData?.guardian;
        setChogGuardian(savedGuardian?.mode === "wallet" ? savedGuardian : null);
        setGuardianOwnershipState(savedGuardian?.mode === "wallet" ? "idle" : "missing");
        setCareXp(savedQuest.careXp ?? backendProfile?.guardianData?.careXp ?? 340);
        setChogTraits(backendProfile?.guardianData?.traits?.length ? backendProfile.guardianData.traits : ["Focus antenna", "Recovery aura", "Calm trader"]);
        setLastGuardianProofWeek(backendProfile?.guardianData?.lastProofWeek ?? "");
        setGuardianProofTxHash(backendProfile?.guardianData?.proofReference ?? "");
        setLastChogQuestDate(savedQuest.lastCompletedDate ?? "");
        setChogQuestStreak(savedQuest.streak ?? 0);
        setEyeBreakCount(questCompletedToday ? 3 : 2);
        setWeeklyEyeBreaks(18);
        setWeeklyStressChecks(9);
        setWeeklySleepBoundaries(4);
        setRewardPoints(savedQuest.rewardPoints ?? 1280);
        setConnectedHealthApps(demoConnectedHealthApps);
        setHealthContextConnectedDate(getGmt8WeekKey());
        setDailyRecords({ [todayKey]: demoTodayRecord });
        setHealthPermissions(demoHealthPermissions);
        setCompletedProofActions(questCompletedToday ? [...syncableProofLabels, "Chog Reset Quest"] : syncableProofLabels);
        setCompletedRewardMissions(questCompletedToday ? ["Complete Chog Reset Quest"] : []);
        hydratedWalletRef.current = normalizedWallet;
        return;
      }

      const profileKey = getWalletProfileKey(walletAddress);
      const storedProfile = window.localStorage.getItem(profileKey);
      let parsedProfile: Partial<WalletProfile> | null = null;
      if (storedProfile) {
        try {
          parsedProfile = JSON.parse(storedProfile) as Partial<WalletProfile>;
        } catch {
          window.localStorage.removeItem(profileKey);
        }
      }

      const backendResetAt = backendProfile?.resetAt;
      const localResetAt = parsedProfile?.resetAt;
      if (backendResetAt && (!localResetAt || new Date(backendResetAt).getTime() > new Date(localResetAt).getTime())) {
        window.localStorage.removeItem(profileKey);
        resetToEmptyWallet(normalizedWallet, backendResetAt);
        return;
      }

      if (parsedProfile) {
        const profile = parsedProfile;
        const shouldResetDailyTasks = profile.lastTaskResetDate !== todayKey;
        const shouldResetWeeklyCounters = profile.lastWeeklyResetKey !== weekKey;
        setDisplayName(profile.displayName ?? "");
        setPendingDisplayName(profile.displayName ?? "");
        setWalletResetAt(profile.resetAt ?? backendResetAt ?? "");
        const restoredGuardian = profile.chogGuardian ?? backendProfile?.guardianData?.guardian ?? null;
        setChogGuardian(restoredGuardian?.mode === "wallet" ? restoredGuardian : null);
        setGuardianOwnershipState(restoredGuardian?.mode === "wallet" ? "idle" : "missing");
        setCareXp(profile.careXp ?? backendProfile?.guardianData?.careXp ?? 0);
        setChogTraits(profile.chogTraits ?? backendProfile?.guardianData?.traits ?? []);
        setLastGuardianProofWeek(profile.lastGuardianProofWeek ?? backendProfile?.guardianData?.lastProofWeek ?? "");
        setGuardianProofTxHash(profile.guardianProofTxHash ?? backendProfile?.guardianData?.proofReference ?? "");
        setLastChogQuestDate(profile.lastChogQuestDate ?? "");
        setChogQuestStreak(profile.chogQuestStreak ?? 0);
        setEyeBreakCount(shouldResetDailyTasks ? 0 : profile.eyeBreakCount ?? 0);
        setWeeklyEyeBreaks(shouldResetWeeklyCounters ? 0 : profile.weeklyEyeBreaks ?? 0);
        setWeeklyStressChecks(shouldResetWeeklyCounters ? 0 : profile.weeklyStressChecks ?? 0);
        setWeeklySleepBoundaries(shouldResetWeeklyCounters ? 0 : profile.weeklySleepBoundaries ?? 0);
        setRewardPoints(profile.rewardPoints ?? 0);
        setConnectedHealthApps(profile.connectedHealthApps ?? []);
        setHealthContextConnectedDate(profile.healthContextConnectedDate ?? "");
        const normalizedRecords = normalizeDailyRecords(profile.dailyRecords ?? {});
        const restoredEyeBreakCount = shouldResetDailyTasks ? 0 : profile.eyeBreakCount ?? 0;
        const restoredProofActions = shouldResetDailyTasks ? [] : profile.completedProofActions ?? [];
        const restoredRewardMissions = shouldResetDailyTasks ? [] : profile.completedRewardMissions ?? [];
        const restoredMarketActions = shouldResetDailyTasks ? [] : profile.completedMarketActions ?? [];
        const restoredJournalSelections = shouldResetDailyTasks ? {} : profile.journalSelections ?? {};
        const restoredPostureResetDone = shouldResetDailyTasks ? false : profile.postureResetDone ?? false;
        const existingTodayRecord = normalizedRecords[todayKey];
        const shouldMergeTodayState =
          !shouldResetDailyTasks &&
          (restoredEyeBreakCount > 0 ||
            restoredProofActions.length > 0 ||
            restoredRewardMissions.length > 0 ||
            restoredMarketActions.length > 0 ||
            Object.keys(restoredJournalSelections).length > 0 ||
            restoredPostureResetDone);
        const mergedDailyRecords =
          shouldMergeTodayState
            ? {
                ...normalizedRecords,
                [todayKey]: {
                  ...(existingTodayRecord ?? createDailyRecord(todayKey)),
                  eyeBreakCount: Math.max(existingTodayRecord?.eyeBreakCount ?? 0, restoredEyeBreakCount),
                  postureResetDone: Boolean(existingTodayRecord?.postureResetDone || restoredPostureResetDone),
                  completedProofActions: Array.from(
                    new Set([...(existingTodayRecord?.completedProofActions ?? []), ...restoredProofActions]),
                  ),
                  completedRewardMissions: Array.from(
                    new Set([...(existingTodayRecord?.completedRewardMissions ?? []), ...restoredRewardMissions]),
                  ),
                  completedMarketActions: Array.from(
                    new Set([...(existingTodayRecord?.completedMarketActions ?? []), ...restoredMarketActions]),
                  ),
                  journalSelections: {
                    ...(existingTodayRecord?.journalSelections ?? {}),
                    ...restoredJournalSelections,
                  },
                },
              }
            : normalizedRecords;
        setDailyRecords(mergedDailyRecords);
        setHealthPermissions(profile.healthPermissions ?? emptyHealthPermissions);
        setCompletedRewardMissions(restoredRewardMissions);
        setCompletedProofActions(restoredProofActions);
        setCompletedGuardianActions(shouldResetDailyTasks ? [] : profile.completedGuardianActions ?? []);
        setCompletedMarketActions(restoredMarketActions);
        setJournalSelections(restoredJournalSelections);
        setPostureResetDone(restoredPostureResetDone);
        setIsEyeResetOnCooldown(shouldResetDailyTasks ? false : profile.isEyeResetOnCooldown ?? false);
        setEyeResetCooldownSeconds(shouldResetDailyTasks ? 0 : profile.eyeResetCooldownSeconds ?? 0);
        setSelectedHealthApp(profile.selectedHealthApp ?? healthApps[0].label);
        hydratedWalletRef.current = normalizedWallet;
        return;
      }

      resetToEmptyWallet(normalizedWallet);
      if (backendProfile?.displayName) {
        setDisplayName(backendProfile.displayName);
        setPendingDisplayName(backendProfile.displayName);
      }
      if (backendProfile?.guardianData) {
        const restoredGuardian = backendProfile.guardianData.guardian;
        setChogGuardian(restoredGuardian?.mode === "wallet" ? restoredGuardian : null);
        setGuardianOwnershipState(restoredGuardian?.mode === "wallet" ? "idle" : "missing");
        setCareXp(backendProfile.guardianData.careXp ?? 0);
        setChogTraits(backendProfile.guardianData.traits ?? []);
        setLastGuardianProofWeek(backendProfile.guardianData.lastProofWeek ?? "");
        setGuardianProofTxHash(backendProfile.guardianData.proofReference ?? "");
      }
    };

    void hydrateWallet();
    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress || hydratedWalletRef.current !== walletAddress.toLowerCase()) return;
    window.localStorage.setItem(
      getChogQuestStorageKey(walletAddress),
      JSON.stringify({ lastCompletedDate: lastChogQuestDate, streak: chogQuestStreak, rewardPoints, careXp }),
    );
  }, [careXp, chogQuestStreak, lastChogQuestDate, rewardPoints, walletAddress]);

  useEffect(() => {
    if (!walletAddress || isDemoAccount || hydratedWalletRef.current !== walletAddress.toLowerCase()) {
      return;
    }

    const profile: WalletProfile = {
      displayName,
      resetAt: walletResetAt || undefined,
      chogGuardian,
      careXp,
      chogTraits,
      lastGuardianProofWeek,
      guardianProofTxHash,
      lastChogQuestDate,
      chogQuestStreak,
      healthContextConnectedDate,
      dailyRecords,
      lastTaskResetDate: getGmt8DateKey(),
      lastWeeklyResetKey: getGmt8WeekKey(),
      weeklyEyeBreaks,
      weeklyStressChecks,
      weeklySleepBoundaries,
      eyeBreakCount,
      isEyeResetOnCooldown,
      eyeResetCooldownSeconds,
      postureResetDone,
      completedGuardianActions,
      completedMarketActions,
      journalSelections,
      completedRewardMissions,
      completedProofActions,
      rewardPoints,
      selectedHealthApp,
      connectedHealthApps,
      healthPermissions,
    };

    window.localStorage.setItem(getWalletProfileKey(walletAddress), JSON.stringify(profile));
  }, [
    careXp,
    chogGuardian,
    chogTraits,
    completedGuardianActions,
    completedMarketActions,
    completedProofActions,
    completedRewardMissions,
    connectedHealthApps,
    dailyRecords,
    displayName,
    eyeBreakCount,
    eyeResetCooldownSeconds,
    healthContextConnectedDate,
    healthPermissions,
    guardianProofTxHash,
    lastChogQuestDate,
    chogQuestStreak,
    isDemoAccount,
    isEyeResetOnCooldown,
    journalSelections,
    lastGuardianProofWeek,
    postureResetDone,
    rewardPoints,
    selectedHealthApp,
    walletAddress,
    walletResetAt,
    weeklyEyeBreaks,
    weeklySleepBoundaries,
    weeklyStressChecks,
  ]);

  useEffect(() => {
    if (chogGuardian?.mode === "preview") {
      setChogGuardian(null);
    }
  }, [chogGuardian]);

  useEffect(() => {
    if (
      !walletAddress ||
      hydratedWalletRef.current !== walletAddress.toLowerCase() ||
      !chogGuardian ||
      chogGuardian.mode !== "wallet"
    ) return;
    const verificationKey = `${walletAddress.toLowerCase()}:${chogGuardian.tokenId}`;
    if (verifiedGuardianKeyRef.current === verificationKey) return;
    verifiedGuardianKeyRef.current = verificationKey;
    void verifyActiveChogOwnership();
  }, [chogGuardian?.tokenId, walletAddress]);

  useEffect(() => {
    if (!walletAddress || !hasLiveHealthContext || dailyRecords[todayKey]) {
      return;
    }

    setDailyRecords((current) => ({
      ...current,
      [todayKey]: createDailyRecord(todayKey),
    }));
  }, [dailyRecords, hasLiveHealthContext, todayKey, walletAddress]);

  const eyeBreakMetrics = eyeBreaks.map((item) =>
    item.label === "20-20-20 breaks"
      ? {
          ...item,
          value: `${eyeBreakCount} / 6`,
          detail: eyeBreakCount >= 6 ? "Daily target complete" : `${6 - eyeBreakCount} breaks remaining`,
        }
      : item.label === "Posture reset"
        ? {
            ...item,
            value: postureResetDone ? "Done" : "Due",
            detail: postureResetDone ? "Neck and shoulders reset" : "Shoulders and neck risk",
          }
      : item,
  );
  const weeklyRangeLabel = formatGmt8WeekRange();
  const proofActions: ProofAction[] = [
    {
      label: "Chog Reset Quest",
      status: lastChogQuestDate === todayKey ? "Completed today" : "Not completed",
      icon: Gamepad2,
      actionLabel: "Open Chog Quest",
      sourceTab: "Chog Quest",
      completed: lastChogQuestDate === todayKey,
    },
    {
      label: "Eye break",
      status: `${eyeBreakCount}/6 completed`,
      icon: Activity,
      actionLabel: "View eye break data",
      sourceTab: "Eye Break",
      completed: eyeBreakCount >= 6,
    },
    {
      label: "Recovery walk",
      status: completedProofActions.includes("Recovery walk") ? "Synced" : "Not synced",
      icon: Dumbbell,
      actionLabel: completedProofActions.includes("Recovery walk") ? "Synced" : "Sync to connected health apps",
      syncable: true,
      completed: completedProofActions.includes("Recovery walk"),
    },
    {
      label: "FOMO reflection",
      status: fomoReflectionDone ? "Check-in completed" : "No check-in yet",
      icon: MessageCircle,
      actionLabel: "View journal data",
      sourceTab: "Journal",
      completed: fomoReflectionDone,
    },
    {
      label: "Sleep boundary",
      status: completedProofActions.includes("Sleep boundary") ? "Synced" : "Not synced",
      icon: Moon,
      actionLabel: completedProofActions.includes("Sleep boundary") ? "Synced" : "Sync to connected health apps",
      syncable: true,
      completed: completedProofActions.includes("Sleep boundary"),
    },
    {
      label: "Hydration check",
      status: completedProofActions.includes("Hydration check") ? "Synced" : "Not synced",
      icon: Droplets,
      actionLabel: completedProofActions.includes("Hydration check") ? "Synced" : "Sync to connected health apps",
      syncable: true,
      completed: completedProofActions.includes("Hydration check"),
    },
    {
      label: "Builder balance",
      status: isDemoAccount || completedProofCount >= 3 ? "Ready" : "NOT READY",
      icon: ShieldCheck,
      actionLabel: "View rewards",
      sourceTab: "Rewards",
      completed: isDemoAccount || completedProofCount >= 3,
    },
  ];
  const weeklyReportStats = [
    ["Proof streak", proofStreakLabel],
    ["Eye breaks", String(isDemoAccount ? 18 : weeklyEyeBreakDisplay)],
    ["Stress checks", String(isDemoAccount ? 9 : weeklyStressCheckDisplay)],
    [
      "Sleep boundary",
      `${isDemoAccount ? 4 : weeklySleepBoundaryDisplay} night${(isDemoAccount ? 4 : weeklySleepBoundaryDisplay) === 1 ? "" : "s"}`,
    ],
  ];
  const weeklyReportSummary = isDemoAccount
    ? weeklyReport.summary
    : completedProofCount > 0
      ? `You have completed ${completedProofCount} healthy proof action${completedProofCount === 1 ? "" : "s"} so far.`
      : "No healthy actions have been proved yet. Complete an eye break, journal check-in, or synced health action to start.";

  const completeEyeReset = () => {
    setEyeBreakCount((current) => {
      if (current >= 6) return current;
      setWeeklyEyeBreaks((weekly) => weekly + 1);
      updateTodayRecord((record) => ({
        ...record,
        eyeBreakCount: Math.min(6, record.eyeBreakCount + 1),
        postureResetDone: true,
      }));
      return current + 1;
    });
    setIsEyeResetOnCooldown(true);
    setEyeResetCooldownSeconds(20 * 60);
    setPostureResetDone(true);
    completeRewardMission("Complete 20-20-20 eye break", 30);
  };

  useEffect(() => {
    if (!isEyeResetOnCooldown || eyeResetCooldownSeconds <= 0) {
      if (isEyeResetOnCooldown && eyeResetCooldownSeconds <= 0) {
        setIsEyeResetOnCooldown(false);
      }
      return;
    }

    const timer = window.setInterval(() => {
      setEyeResetCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [eyeResetCooldownSeconds, isEyeResetOnCooldown]);

  const completeRewardMission = (mission: string, points: number) => {
    setCompletedRewardMissions((current) => {
      if (current.includes(mission)) return current;
      setRewardPoints((pointsCurrent) => pointsCurrent + points);
      const missionCareXp = careXpByMission[mission] ?? 0;
      if (missionCareXp > 0) {
        setCareXp((currentXp) => currentXp + missionCareXp * careXpMultiplier);
      }
      updateTodayRecord((record) => ({
        ...record,
        completedRewardMissions: record.completedRewardMissions.includes(mission)
          ? record.completedRewardMissions
          : [...record.completedRewardMissions, mission],
      }));
      return [...current, mission];
    });
  };

  const updateTodayRecord = (updater: (record: HealthDailyRecord) => HealthDailyRecord) => {
    if (!walletAddress) return;
    setDailyRecords((current) => {
      const existing = current[todayKey] ?? createDailyRecord(todayKey);
      return {
        ...current,
        [todayKey]: updater(existing),
      };
    });
  };

  const completeChogQuest = () => {
    if (!chogGuardian || lastChogQuestDate === todayKey) return;

    const yesterday = getGmt8DateFromKey(todayKey);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    const nextStreak = lastChogQuestDate === yesterdayKey ? chogQuestStreak + 1 : 1;

    setLastChogQuestDate(todayKey);
    setChogQuestStreak(nextStreak);
    setPostureResetDone(true);
    setEyeBreakCount((current) => {
      if (current >= 6) return current;
      setWeeklyEyeBreaks((weekly) => weekly + 1);
      return current + 1;
    });
    setCompletedProofActions((current) =>
      current.includes("Chog Reset Quest") ? current : [...current, "Chog Reset Quest"],
    );
    if (nextStreak >= 3) {
      setChogTraits((current) => (current.includes("Quest keeper") ? current : [...current, "Quest keeper"]));
    }
    completeRewardMission("Complete Chog Reset Quest", 75);
    updateTodayRecord((record) => ({
      ...record,
      chogQuestCompleted: true,
      eyeBreakCount: Math.min(6, record.eyeBreakCount + 1),
      postureResetDone: true,
      completedProofActions: record.completedProofActions.includes("Chog Reset Quest")
        ? record.completedProofActions
        : [...record.completedProofActions, "Chog Reset Quest"],
    }));
  };

  const syncProofAction = (proof: ProofAction) => {
    if (proof.sourceTab) {
      setActiveTab(proof.sourceTab);
      return;
    }

    if (!proof.syncable || proof.completed) return;

    setSyncingProofAction(proof.label);
    window.setTimeout(() => {
      setCompletedProofActions((current) => (current.includes(proof.label) ? current : [...current, proof.label]));
      updateTodayRecord((record) => ({
        ...record,
        completedProofActions: record.completedProofActions.includes(proof.label)
          ? record.completedProofActions
          : [...record.completedProofActions, proof.label],
      }));
      if (proof.label === "Recovery walk") {
        completeRewardMission("Take a recovery walk", 60);
      }
      if (proof.label === "Sleep boundary") {
        setWeeklySleepBoundaries((current) => current + 1);
        completeRewardMission("Keep midnight boundary", 90);
      }
      if (proof.label === "Hydration check") {
        setRewardPoints((current) => current + 20);
        setCareXp((current) => current + 10);
      }
      setSyncingProofAction("");
    }, 3000);
  };

  const toggleGuardianAction = (action: string) => {
    setCompletedGuardianActions((current) =>
      current.includes(action) ? current.filter((item) => item !== action) : [...current, action],
    );
  };

  const toggleMarketAction = (action: string) => {
    setCompletedMarketActions((current) => {
      if (current.includes(action)) return current.filter((item) => item !== action);
      setWeeklyStressChecks((weekly) => weekly + 1);
      return [...current, action];
    });
    updateTodayRecord((record) => {
      const hasAction = record.completedMarketActions.includes(action);
      return {
        ...record,
        completedMarketActions: hasAction
          ? record.completedMarketActions.filter((item) => item !== action)
          : [...record.completedMarketActions, action],
      };
    });
  };

  const openJournalCheckIn = (label: string) => {
    setPendingJournalCheckIn(label);
  };

  const selectJournalLevel = (level: string) => {
    if (!pendingJournalCheckIn) return;
    setJournalSelections((current) => ({ ...current, [pendingJournalCheckIn]: level }));
    updateTodayRecord((record) => ({
      ...record,
      journalSelections: { ...record.journalSelections, [pendingJournalCheckIn]: level },
    }));
    completeRewardMission("Log FOMO / FUD check-in", 45);
    setPendingJournalCheckIn("");
  };

  const connectWallet = async () => {
    setWalletError("");

    if (typeof window === "undefined" || !window.ethereum) {
      setWalletError("No browser wallet found. Install or unlock MetaMask/Rabby, then try again.");
      return;
    }

    setIsWalletConnecting(true);
    try {
      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (permissionError) {
        if (
          typeof permissionError === "object" &&
          permissionError !== null &&
          "code" in permissionError &&
          (permissionError as { code?: number }).code === 4001
        ) {
          throw permissionError;
        }
        // Some wallets do not support a forced account picker; eth_requestAccounts is the fallback.
      }
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      if (accounts?.[0]) {
        rememberProviderAccounts(accounts);
        const nextWallet = accounts[0];
        const now = new Date().toISOString();
        const existing = getStoredWalletRegistry().find((entry) => entry.wallet.toLowerCase() === nextWallet.toLowerCase());
        const nextRegistryEntry = {
          wallet: nextWallet,
          firstSeen: existing?.firstSeen ?? now,
          lastSeen: now,
          displayName: existing?.displayName ?? "",
          connectedApps: existing?.connectedApps ?? 0,
          rewardPoints: existing?.rewardPoints ?? 0,
          resetAt: existing?.resetAt,
        };
        upsertWalletRegistry(nextRegistryEntry);
        await syncWalletRegistryEntry(nextRegistryEntry);
        setWalletAddress(nextWallet);
      } else {
        setWalletError("Wallet did not return an account.");
      }
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Wallet connection was cancelled.");
    } finally {
      setIsWalletConnecting(false);
    }
  };

  const saveProfileName = () => {
    const nextName = pendingDisplayName.trim();
    if (!nextName) return;
    setDisplayName(nextName);
  };

  const selectOwnedChogGuardian = (token: OwnedChogToken) => {
    setChogGuardian({
      tokenId: token.tokenId,
      label: token.label,
      mode: "wallet",
      image: token.image,
      activatedAt: new Date().toISOString(),
    });
    setOwnedChogTokens([]);
    setChogActivationError("");
    setGuardianOwnershipState("verified");
    verifiedGuardianKeyRef.current = `${walletAddress.toLowerCase()}:${token.tokenId}`;
  };

  async function verifyActiveChogOwnership() {
    if (!window.ethereum || !walletAddress || !chogGuardian) {
      setGuardianOwnershipState("missing");
      return false;
    }

    setGuardianOwnershipState("checking");
    try {
      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
      const tokens = await loadWalletChogTokens(provider, walletAddress);
      const verifiedToken = tokens.find((token) => token.tokenId === chogGuardian.tokenId);
      if (!verifiedToken) {
        setOwnedChogTokens(tokens);
        setChogGuardian(null);
        setGuardianOwnershipState("missing");
        setChogActivationError("The active CHOG is no longer in this wallet. Progress is saved; select or detect another CHOG to continue.");
        verifiedGuardianKeyRef.current = "";
        return false;
      }

      setChogGuardian((current) =>
        current?.tokenId === verifiedToken.tokenId
          ? { ...current, label: verifiedToken.label, image: verifiedToken.image }
          : current,
      );
      setGuardianOwnershipState("verified");
      setChogActivationError("");
      return true;
    } catch (error) {
      setGuardianOwnershipState("idle");
      setChogActivationError(
        error instanceof Error
          ? error.message
          : "Chog ownership could not be verified. Confirm the wallet is on Monad Mainnet and try again.",
      );
      return false;
    }
  }

  const discoverChogGuardian = async () => {
    setChogActivationError("");
    if (!window.ethereum || !walletAddress) {
      setChogActivationError("Connect and unlock your wallet first.");
      return;
    }

    setIsDiscoveringChog(true);
    setGuardianOwnershipState("checking");
    try {
      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
      const tokens = await loadWalletChogTokens(provider, walletAddress);
      if (!tokens.length) {
        setChogGuardian(null);
        setGuardianOwnershipState("missing");
        throw new Error("No CHOG NFT detected. Scan again after buying or receiving one.");
      }

      setOwnedChogTokens(tokens);
      if (tokens.length === 1) {
        selectOwnedChogGuardian(tokens[0]);
      } else {
        setChogGuardian(null);
        setGuardianOwnershipState("verified");
        setChogActivationError(`${tokens.length} Chogs found. Choose the guardian you want to activate.`);
      }
    } catch (error) {
      setOwnedChogTokens([]);
      setGuardianOwnershipState((current) => (current === "missing" ? "missing" : "idle"));
      setChogActivationError(
        error instanceof Error
          ? error.message
          : "Chog ownership could not be verified. Confirm the wallet is on Monad Mainnet and try again.",
      );
    } finally {
      setIsDiscoveringChog(false);
    }
  };

  const claimWeeklyGuardianProof = async () => {
    if (!chogGuardian || guardianWeeklyProofClaimed || !window.ethereum) return;
    if (!hasVerifiedChog) {
      setChogActivationError("CHOG NFT required for on-chain weekly proofs.");
      return;
    }
    if (!guardianWeeklyProofReady) return;
    if (!(await verifyActiveChogOwnership())) return;

    setChogActivationError("");
    setGuardianClaimState("preparing");
    try {
      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
      const signer = await provider.getSigner();
      const summaryHash = id(
        [walletAddress, guardianProofWeek, completedProofCount, weeklyEyeBreakDisplay, weeklyStressCheckDisplay].join(":"),
      );
      let proofReference = "";

      if (traceChogGuardianContractAddress && chogGuardian.mode === "wallet") {
        const network = await provider.getNetwork();
        if (network.chainId !== BigInt(143)) {
          throw new Error("Switch your wallet to Monad Mainnet before claiming the weekly proof.");
        }
        setGuardianClaimState("wallet");
        const guardianContract = new Contract(traceChogGuardianContractAddress, traceChogGuardianAbi, signer);
        const transaction = await guardianContract.claimWeeklyProof(
          BigInt(chogGuardian.tokenId),
          getGmt8OnchainWeekIndex(),
          summaryHash,
        );
        proofReference = transaction.hash as string;
        await transaction.wait();
      } else {
        setGuardianClaimState("wallet");
        const signature = await signer.signMessage(
          `Trace Health weekly Chog proof\nWeek: ${guardianProofWeek}\nGuardian: ${chogGuardian.label}\nSummary: ${summaryHash}`,
        );
        proofReference = `signed:${signature.slice(0, 18)}`;
      }

      setGuardianProofTxHash(proofReference);
      setLastGuardianProofWeek(guardianProofWeek);
      setCareXp((current) => current + 60);
      setChogTraits((current) => (current.includes("Weekly proof aura") ? current : [...current, "Weekly proof aura"]));
      setGuardianClaimState("confirmed");
      window.setTimeout(() => setGuardianClaimState(""), 1800);
    } catch (error) {
      setGuardianClaimState("");
      setChogActivationError(formatWalletTransactionError(error));
    }
  };

  const toggleHealthPermission = (app: string, permission: string) => {
    setHealthPermissions((current) => {
      const existing = current[app] ?? [];
      const next = existing.includes(permission)
        ? existing.filter((item) => item !== permission)
        : [...existing, permission];

      return { ...current, [app]: next };
    });
  };

  const connectHealthApp = (app: string) => {
    setHealthContextConnectedDate((current) => current || getGmt8DateKey());
    setDailyRecords((current) =>
      current[todayKey]
        ? current
        : {
            ...current,
            [todayKey]: createDailyRecord(todayKey),
          },
    );
    setConnectedHealthApps((current) => (current.includes(app) ? current : [...current, app]));
    setHealthPermissions((current) => ({
      ...current,
      [app]: current[app]?.length ? current[app] : ["Sleep", "Activity"],
    }));
  };

  const requestDisconnectHealthApp = (app: string) => {
    setPendingDisconnectApp(app);
  };

  const confirmDisconnectHealthApp = () => {
    const app = pendingDisconnectApp;
    if (!app) return;
    setConnectedHealthApps((current) => current.filter((item) => item !== app));
    setHealthPermissions((current) => ({ ...current, [app]: [] }));
    setPendingDisconnectApp("");
  };

  if (!walletAddress) {
    return (
      <main className="min-h-[100svh] overflow-hidden bg-[#12091F] text-white">
        <section className="relative isolate min-h-[100svh] overflow-hidden">
          <Image
            src={chogLoginHeroImage}
            alt="Chog Guardian holding a Chog card in a moonlit Monad world"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[67%_center] sm:object-[64%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,6,20,0.98)_0%,rgba(17,8,31,0.94)_32%,rgba(25,12,46,0.62)_57%,rgba(25,12,46,0.1)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,4,16,0.5)_0%,transparent_27%,transparent_68%,rgba(9,4,16,0.72)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/24" />

          <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[92rem] flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-12 lg:py-9">
            <header className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-3.5">
                <BrandMark className="size-12 sm:size-14" />
                <div>
                  <p className="text-sm font-semibold tracking-normal text-white">HEALTH TRACE</p>
                  <p className="mt-0.5 text-sm font-medium text-trace-green">Chog Guardian</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 border-l border-white/18 pl-5 text-xs font-semibold uppercase tracking-normal text-white/58 sm:flex">
                <span className="size-2 rounded-full bg-trace-green shadow-[0_0_16px_rgba(255,123,172,0.9)]" />
                Monad mainnet
              </div>
            </header>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-1 flex-col justify-end pb-6 pt-24 sm:pb-9 sm:pt-28 lg:justify-center lg:pb-0 lg:pt-14"
            >
              <div className="max-w-[47rem]">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-normal text-trace-green">
                  <ShieldCheck className="size-4" />
                  Wallet-gated health intelligence
                </div>
                <h1 className="mt-6 text-[2.3rem] font-medium leading-[0.88] tracking-normal min-[360px]:text-[2.6rem] min-[430px]:text-5xl sm:text-7xl lg:text-[6.5rem] xl:text-[7.5rem]">
                  Own your
                  <span className="block whitespace-nowrap text-trace-green">health context.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                  Your private health signals shape a calmer Web3 routine. Your Chog turns the actions you complete into Care XP and onchain recovery proofs.
                </p>

                <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-2">
                  <Button
                    onClick={connectWallet}
                    disabled={isWalletConnecting}
                    className="h-16 rounded-full bg-trace-green px-7 text-base font-semibold text-[#130B20] shadow-[0_18px_58px_rgba(255,123,172,0.24)] transition hover:-translate-y-0.5 hover:bg-[#FF9DCA]"
                  >
                    <Wallet className="mr-2 size-5" />
                    {isWalletConnecting ? "Connecting wallet..." : "Create account"}
                  </Button>
                  <Button
                    onClick={connectWallet}
                    disabled={isWalletConnecting}
                    className="h-16 rounded-full border border-white/32 bg-[#170D26]/[0.52] px-7 text-base font-semibold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/[0.12]"
                  >
                    Log in with wallet
                    <ArrowRight className="ml-2 size-5" />
                  </Button>
                </div>
                {walletError ? (
                  <p className="mt-5 max-w-2xl border-l-2 border-rose-300 pl-4 text-sm leading-6 text-rose-100">
                    {walletError}
                  </p>
                ) : null}

                <div className="mt-10 grid max-w-2xl grid-cols-3 border-t border-white/18 pt-5">
                  {[
                    [LockKeyhole, "Private", "Signals stay yours"],
                    [Zap, "Care XP", "Healthy actions evolve"],
                    [BadgeCheck, "Onchain", "Proof without raw data"],
                  ].map(([Icon, label, detail]) => {
                    const SignalIcon = Icon as typeof LockKeyhole;
                    return (
                      <div key={String(label)} className="pr-3 sm:pr-6">
                        <SignalIcon className="size-4 text-trace-green" />
                        <p className="mt-2 text-sm font-semibold text-white">{String(label)}</p>
                        <p className="mt-1 text-[0.68rem] leading-4 text-white/46 sm:text-xs">{String(detail)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <div className="hidden justify-end border-t border-white/14 pt-4 text-right lg:flex">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-trace-green">Chog Guardian</p>
                <p className="mt-1 text-sm text-white/54">Your recovery companion on Monad.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!isDemoAccount && !displayName.trim()) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#F3F0FF] text-[#21143A]">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_28%_0%,rgba(255,123,172,0.28),transparent_27rem),radial-gradient(circle_at_75%_12%,rgba(131,110,249,0.34),transparent_30rem),linear-gradient(180deg,#FCFBFF,#EEE9FF_54%,#F9F7FF)]" />
        <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full overflow-hidden rounded-[3rem] border border-[#DDD4F4] bg-white/78 p-5 shadow-[0_42px_150px_rgba(52,35,92,0.18)] backdrop-blur-3xl sm:p-8"
          >
            <div className="rounded-[2.45rem] border border-white/20 bg-[#171022] p-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] sm:p-10 lg:p-12">
              <div className="flex items-center gap-3">
                <BrandMark className="size-13" />
                <div>
                  <p className="text-sm font-semibold tracking-[0.26em] text-white/82">HEALTH TRACE</p>
                  <p className="text-sm text-white/46">Wallet {formatWalletAddress(walletAddress)}</p>
                </div>
              </div>

              <div className="mt-16 max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-trace-green/72">Create your profile</p>
                <h1 className="mt-4 text-[clamp(3.2rem,7vw,6.6rem)] font-medium leading-[0.88] tracking-normal">
                  What should Trace call you?
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
                  This nickname is saved to this wallet profile only. Health data, rewards, proofs, and settings will be tagged to the wallet you connected.
                </p>
              </div>

              <form
                className="mt-10 grid gap-4 sm:grid-cols-[1fr_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveProfileName();
                }}
              >
                <input
                  value={pendingDisplayName}
                  onChange={(event) => setPendingDisplayName(event.target.value)}
                  placeholder="Enter name or nickname"
                  className="h-16 rounded-full border border-white/16 bg-white/[0.08] px-6 text-lg font-medium text-white outline-none transition placeholder:text-white/32 focus:border-trace-green/70 focus:bg-white/[0.12]"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={!pendingDisplayName.trim()}
                  className="h-16 rounded-full bg-trace-green px-9 text-base font-semibold text-[#130B20] shadow-[0_18px_54px_rgba(255,123,172,0.24)] hover:bg-[#FF9DCA] disabled:opacity-45"
                >
                  Continue
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </form>
            </div>
          </motion.div>
        </section>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-[#F7F5FC] text-[#21143A]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_36%_-14%,rgba(255,123,172,0.22),transparent_34rem),radial-gradient(circle_at_96%_14%,rgba(131,110,249,0.3),transparent_34rem),linear-gradient(180deg,#FBFAFF,#F0ECFA_48%,#FAF9FD)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1520px] gap-4 px-3 py-3 sm:px-5 sm:py-5 lg:gap-6 lg:px-6 lg:py-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 flex-col rounded-[2rem] border border-[#DED6EE] bg-white/76 p-5 shadow-[0_28px_90px_rgba(52,35,92,0.1)] backdrop-blur-2xl lg:flex">
          <div className="flex items-center gap-3 px-2 py-2">
            <BrandMark className="size-12" />
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-[#53476B]">HEALTH TRACE</p>
              <p className="text-sm font-medium text-[#7555DA]">Chog Guardian</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveTab(item.label)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-[#21143A] text-white shadow-[0_16px_44px_rgba(52,35,92,0.22)]"
                      : "text-[#716982] hover:bg-[#F0ECFF] hover:text-[#302345]"
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? "text-trace-green" : "text-[#9285AF]"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-5 rounded-full border border-[#DED6EE] bg-white/74 px-4 py-2 text-center text-sm text-[#65587A] shadow-[0_18px_60px_rgba(52,35,92,0.07)]">
            {syncedAt ? `Synced at ${syncedAt}` : "Synced"}
          </div>

          <div className="mt-auto rounded-[1.5rem] border border-[#DED6EE] bg-[#F7F4FF] p-5">
            <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-[#EAE4FF] text-[#7555DA]">
              <ShieldCheck size={18} />
            </div>
            <p className="text-sm font-medium text-[#2B1F3E]">Private by default</p>
            <p className="mt-2 text-sm leading-6 text-[#817793]">
              Raw health data stays private. Only completed healthy actions can become proofs.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <Reveal className="mb-3 rounded-[1.5rem] border border-[#DED6EE] bg-white/82 p-3 shadow-[0_18px_55px_rgba(52,35,92,0.08)] backdrop-blur-2xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <BrandMark className="size-10 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold tracking-[0.2em] text-[#53476B]">HEALTH TRACE</p>
                  <p className="truncate text-xs font-medium text-[#7555DA]">Chog Guardian</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[#E1DAEC] bg-white/70 px-3 py-1 text-[0.68rem] text-[#5F526F]">
                Synced
              </span>
            </div>

          </Reveal>

          <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-[#DED6EE] bg-white/82 p-3 shadow-[0_18px_55px_rgba(52,35,92,0.07)] backdrop-blur-2xl lg:hidden">
            <div className="grid grid-cols-4 gap-2">
              {mobilePrimaryNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.label);
                      setMobileMoreOpen(false);
                    }}
                    className={`group flex min-h-[4.45rem] flex-col items-center justify-center gap-1 rounded-[1.1rem] border px-1.5 py-2 text-center text-[0.66rem] font-medium leading-tight transition ${
                      isActive
                        ? "border-[#21143A] bg-[#21143A] text-white shadow-[0_14px_34px_rgba(52,35,92,0.22)]"
                        : "border-transparent bg-transparent text-[#716982] hover:bg-[#F0ECFF] hover:text-[#302345]"
                    }`}
                  >
                    <span
                      className={`flex size-8 items-center justify-center rounded-2xl transition ${
                        isActive ? "bg-trace-green/16 text-trace-green" : "bg-[#F0ECFF] text-[#7555DA]"
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="line-clamp-2">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence initial={false}>
              {mobileMoreOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 grid grid-cols-4 gap-2 pt-1">
                    {mobileOverflowNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.label;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.label);
                          }}
                          className={`group flex min-h-[4.45rem] flex-col items-center justify-center gap-1 rounded-[1.1rem] border px-1.5 py-2 text-center text-[0.66rem] font-medium leading-tight transition ${
                            isActive
                              ? "border-[#21143A] bg-[#21143A] text-white shadow-[0_14px_34px_rgba(52,35,92,0.22)]"
                              : "border-transparent bg-transparent text-[#716982] hover:bg-[#F0ECFF] hover:text-[#302345]"
                          }`}
                        >
                          <span
                            className={`flex size-8 items-center justify-center rounded-2xl transition ${
                              isActive ? "bg-trace-green/16 text-trace-green" : "bg-[#F0ECFF] text-[#7555DA]"
                            }`}
                          >
                            <Icon className="size-4" />
                          </span>
                          <span className="line-clamp-2">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setMobileMoreOpen((open) => !open)}
              className={`mx-auto mt-2 flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.68rem] font-medium transition ${
                isMobileOverflowActive || mobileMoreOpen
                  ? "bg-[#21143A] text-white"
                  : "bg-[#F0ECFF] text-[#716982]"
              }`}
            >
              <span>{isMobileOverflowActive && !mobileMoreOpen ? activeTab : "More"}</span>
              <ArrowRight className={`size-3.5 transition ${mobileMoreOpen ? "-rotate-90" : "rotate-90"}`} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab !== "Home" ? (
                <div className="lg:hidden">
                  <MobileTabScreen
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    walletAddress={walletAddress}
                    walletError={walletError}
                    isWalletConnecting={isWalletConnecting}
                    onConnectWallet={connectWallet}
                    selectedHealthApp={selectedHealthApp}
                    setSelectedHealthApp={setSelectedHealthApp}
                    connectedHealthApps={connectedHealthApps}
                    connectHealthApp={connectHealthApp}
                    requestDisconnectHealthApp={requestDisconnectHealthApp}
                    healthPermissions={healthPermissions}
                    toggleHealthPermission={toggleHealthPermission}
                    eyeBreakMetrics={eyeBreakMetrics}
                    onEyeResetComplete={completeEyeReset}
                    isEyeResetOnCooldown={isEyeResetOnCooldown}
                    eyeResetCooldownSeconds={eyeResetCooldownSeconds}
                    completedGuardianActions={completedGuardianActions}
                    toggleGuardianAction={toggleGuardianAction}
                    completedMarketActions={completedMarketActions}
                    toggleMarketAction={toggleMarketAction}
                    journalSelections={journalSelections}
                    openJournalCheckIn={openJournalCheckIn}
                    rewardPoints={rewardPoints}
                    completedRewardMissions={completedRewardMissions}
                    chogGuardian={chogGuardian}
                    ownedChogTokens={ownedChogTokens}
                    isDiscoveringChog={isDiscoveringChog}
                    chogActivationError={chogActivationError}
                    discoverChogGuardian={discoverChogGuardian}
                    selectOwnedChogGuardian={selectOwnedChogGuardian}
                    careXp={careXp}
                    guardianLevel={guardianLevel}
                    guardianLevelProgress={guardianLevelProgress}
                    guardianTraits={guardianTraits}
                    lastChogQuestDate={lastChogQuestDate}
                    chogQuestStreak={chogQuestStreak}
                    todayKey={todayKey}
                    guardianOwnershipState={guardianOwnershipState}
                    verifyActiveChogOwnership={verifyActiveChogOwnership}
                    completeChogQuest={completeChogQuest}
                    currentDayRecord={currentDayRecord}
                    isDemoAccount={isDemoAccount}
                    proofActions={proofActions}
                    proofStreakLabel={proofStreakLabel}
                    weeklyRangeLabel={weeklyRangeLabel}
                    weeklyReportStats={weeklyReportStats}
                    weeklyReportSummary={weeklyReportSummary}
                    syncProofAction={syncProofAction}
                    guardianWeeklyProofReady={guardianWeeklyProofReady}
                    guardianWeeklyProofClaimed={guardianWeeklyProofClaimed}
                    guardianClaimState={guardianClaimState}
                    claimWeeklyGuardianProof={claimWeeklyGuardianProof}
                  />
                </div>
              ) : null}

              {activeTab === "Home" ? (
                <>
                <div className="space-y-4 lg:hidden">
                  <Reveal>
                    <section className="relative overflow-hidden rounded-[2rem] bg-[#21143A] p-5 text-white shadow-[0_28px_80px_rgba(52,35,92,0.3)]">
                      <motion.div
                        aria-hidden
                        className="absolute -right-16 -top-16 size-48 rounded-full bg-[#FF7BAC]/24 blur-3xl"
                        animate={{ opacity: [0.45, 0.8, 0.45], scale: [0.92, 1.08, 0.92] }}
                        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <div className="relative">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-trace-green/76">
                              Today
                            </p>
                            <h1 className="mt-2 font-medium tracking-normal">
                              <span className="block whitespace-nowrap text-[2.05rem] leading-[0.95]">Stay sharp.</span>
                              <span className="mt-1 block whitespace-nowrap text-[1.72rem] leading-[0.95]">Don&apos;t burn out.</span>
                            </h1>
                          </div>
                          <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#FF7BAC_0deg,#FF7BAC_310deg,rgba(255,255,255,0.13)_310deg)] p-1.5 shadow-[0_18px_55px_rgba(255,123,172,0.18)]">
                            <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#21143A]">
                              <p className="text-2xl font-medium leading-none">{healthScore}</p>
                              <p className="mt-1 text-[0.58rem] text-trace-green">Score</p>
                            </div>
                          </div>
                        </div>

                        <p className="mt-5 text-sm leading-6 text-white/62">
                          Market pressure is elevated, but your recovery buffer is still usable. Do
                          the next focused block before checking charts again.
                        </p>

                        <div className="mt-5 grid grid-cols-3 gap-2">
                          {mobileSummaryStats.map(([label, value, status]) => (
                            <div key={label} className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
                              <p className="text-[0.65rem] text-white/42">{label}</p>
                              <p className="mt-1 text-lg font-medium leading-none">{value}</p>
                              <p className="mt-1 text-[0.62rem] text-trace-green">{status}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  </Reveal>

                  {chogGuardian ? (
                    <Reveal delay={0.04}>
                      <button
                        type="button"
                        onClick={() => setActiveTab("Rewards")}
                        className="grid w-full grid-cols-[6.5rem_1fr] gap-4 overflow-hidden rounded-[1.75rem] bg-[#21143a] p-3 text-left text-white shadow-[0_22px_70px_rgba(33,20,58,0.22)]"
                      >
                        <GuardianArtwork className="aspect-square" src={chogGuardian.image} alt={chogGuardian.label} />
                        <div className="min-w-0 py-2 pr-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/72">
                              {chogGuardian.label}
                            </p>
                            <span className="rounded-full bg-white/10 px-2 py-1 text-[0.6rem] text-white/56">Lv {guardianLevel}</span>
                          </div>
                          <p className={`mt-2 text-2xl font-medium ${guardianMood.tone}`}>{guardianMood.label}</p>
                          <p className="mt-1 text-xs leading-5 text-white/48">
                            {careXp} Care XP · {careXpMultiplier}× earning · {guardianTraits.length} traits
                          </p>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-trace-green" style={{ width: `${guardianLevelProgress}%` }} />
                          </div>
                        </div>
                      </button>
                    </Reveal>
                  ) : null}

                  <Reveal delay={0.06}>
                    <section className="rounded-[1.75rem] border border-[#E5DFF2] bg-white/86 p-4 shadow-[0_22px_70px_rgba(16,21,16,0.08)] backdrop-blur-2xl">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F617F]">
                            Live Signals
                          </p>
                          <h2 className="mt-1 text-2xl font-medium leading-tight">Your Health Trace state</h2>
                        </div>
                        <span className="rounded-full bg-[#171022] px-3 py-1 text-xs font-medium text-trace-green">
                          Live
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {dashboardSignals.map((signal, index) => {
                          const Icon = signal.icon;
                          return (
                            <motion.div
                              key={signal.label}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.42, delay: index * 0.04 }}
                              className={`rounded-[1.35rem] border p-3 shadow-[0_14px_40px_rgba(16,21,16,0.045)] ${
                                index === 0
                                  ? "col-span-2 border-[#D9D0F1] bg-[#F8F0FF]"
                                  : "border-[#E8E2F2] bg-[#FCFAFF]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex size-9 items-center justify-center rounded-2xl bg-white text-[#836EF9] shadow-[0_10px_25px_rgba(16,21,16,0.05)]">
                                  <Icon className={`size-4 ${signal.tone}`} />
                                </div>
                                <span className="rounded-full border border-[#E1DAEF] bg-white/72 px-2 py-1 text-[0.62rem] text-[#756A82]">
                                  {index === 0 ? "Primary" : "Signal"}
                                </span>
                              </div>
                              <p className="mt-4 text-xs text-[#756A82]">{signal.label}</p>
                              <p className={`${index === 0 ? "text-4xl" : "text-2xl"} mt-1 font-medium leading-none text-[#171022]`}>
                                {signal.value}
                              </p>
                              <p className="mt-2 min-h-8 text-xs leading-4 text-[#7A6F86]">{signal.detail}</p>
                              {index === 0 ? (
                                <div className="mt-3 h-10">
                                  <MiniChart data={signal.chart} />
                                </div>
                              ) : null}
                            </motion.div>
                          );
                        })}
                      </div>
                    </section>
                  </Reveal>

                  <Reveal delay={0.1}>
                    <section className="rounded-[1.75rem] border border-[#E5DFF2] bg-[#FAF7FF] p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#171022] text-trace-green">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#21182C]">Guardian protocol</p>
                          <p className="text-xs text-[#7A6F86]">For the next 90 minutes</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {[
                          ["Finish one deep-work block before opening markets.", "Market Stress"],
                          ["Take a 20-second eye reset now.", "Eye Break"],
                          ["Delay high-stress decisions until after lunch.", "Market Stress"],
                        ].map(([item, target], index) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setActiveTab(target as HealthTab)}
                            className="flex w-full gap-3 rounded-[1.15rem] border border-[#E8E2F2] bg-white/78 px-3 py-3 text-left text-sm leading-5 text-[#3B2D4A] transition hover:border-[#D9D0F1] hover:bg-white"
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FF7BAC] text-xs font-semibold text-[#171022]">
                              {index + 1}
                            </span>
                            {item}
                          </button>
                        ))}
                      </div>
                    </section>
                  </Reveal>
                </div>

                <div className="hidden gap-4 lg:grid lg:h-[calc(100vh-3rem)] lg:grid-rows-[auto_1fr] lg:gap-6">
                  <div className="grid gap-4 xl:grid-cols-[1.04fr_0.96fr] xl:gap-6">
                    <Reveal className="h-full">
                      <div className="h-full rounded-[1.6rem] border border-[#DED6EE] bg-white/82 p-4 shadow-[0_28px_90px_rgba(52,35,92,0.1)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-5">
                        <div className="grid gap-4 sm:grid-cols-[1fr_8.5rem] lg:grid-cols-[1fr_9rem]">
                          <div>
                            <div className="mb-3 flex items-center gap-2 text-[#716982]">
                              <Sparkles size={16} />
                              <p className="text-sm font-medium">Good Morning, {profileName}</p>
                            </div>
                            <h1 className="max-w-xl text-[clamp(2.15rem,11vw,3.45rem)] font-medium leading-[0.95] tracking-normal text-[#21143A] sm:text-[clamp(2.05rem,3vw,3.45rem)]">
                              Here&apos;s your
                              <br />
                              Health Trace
                              <br />
                              summary
                            </h1>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:mt-8 sm:block sm:space-y-2">
                            <div className="rounded-[1.35rem] border border-[#836EF9]/35 bg-[#21143A] p-3 text-center text-white shadow-[0_18px_48px_rgba(52,35,92,0.2)]">
                              <p className="mb-2 text-center text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-white/38">
                                Health Trace Score
                              </p>
                              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[conic-gradient(#FF7BAC_0deg,#FF7BAC_235deg,#836EF9_310deg,rgba(255,255,255,0.13)_310deg)] p-1.5">
                                <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#21143A]">
                                  <p className="text-2xl font-medium leading-none">{healthScore}</p>
                                  <p className="mt-1 text-[0.62rem] text-trace-green">{healthScoreLabel}</p>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-[1.35rem] border border-[#E5DFF2] bg-[#FAF7FF] p-3 text-center">
                              <p className="text-[0.68rem] text-[#766B80]">Current state</p>
                              <p className="mt-1 text-lg font-medium leading-tight text-[#21182C]">
                                {currentState}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 h-32 overflow-hidden rounded-[1.5rem] border border-[#E5DFF0] bg-[#FCFAFF] px-3 pb-3 pt-2 sm:h-40 sm:px-4">
                          <div className="mb-1 flex items-center justify-between text-[0.68rem] text-[#85788F]">
                            <span>Week</span>
                            <span>{weeklyRangeLabel}</span>
                          </div>
                          <ResponsiveContainer width="100%" height="86%">
                            <LineChart data={dashboardTrend} margin={{ left: 8, right: 8, top: 6, bottom: 2 }}>
                              <XAxis
                                dataKey="day"
                                axisLine={false}
                                interval={0}
                                minTickGap={0}
                                padding={{ left: 8, right: 8 }}
                                tickLine={false}
                                tick={{ fill: "#85788F", fontSize: 11 }}
                              />
                              <YAxis hide domain={[-12, 100]} />
                              <Tooltip
                                cursor={{ stroke: "#C9BED8", strokeDasharray: "4 6" }}
                                contentStyle={{
                                  border: "1px solid #E5DFF2",
                                  borderRadius: 18,
                                  boxShadow: "0 18px 50px rgba(16,21,16,0.1)",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#836EF9"
                                strokeWidth={3}
                                dot={{ r: 3, strokeWidth: 0, fill: "#836EF9" }}
                                activeDot={{ r: 5, strokeWidth: 0, fill: "#836EF9" }}
                              />
                              <Line
                                type="monotone"
                                dataKey="sleep"
                                stroke="#7bb5ff"
                                strokeWidth={2}
                                dot={{ r: 2.8, strokeWidth: 0, fill: "#7bb5ff" }}
                                activeDot={{ r: 4.5, strokeWidth: 0, fill: "#7bb5ff" }}
                              />
                              <Line
                                type="monotone"
                                dataKey="market"
                                stroke="#efb84f"
                                strokeWidth={2}
                                dot={{ r: 2.8, strokeWidth: 0, fill: "#efb84f" }}
                                activeDot={{ r: 4.5, strokeWidth: 0, fill: "#efb84f" }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </Reveal>

                    <Reveal delay={0.08} className="h-full">
                      <section className="h-full rounded-[1.6rem] border border-[#DED6EE] bg-white/82 p-4 shadow-[0_28px_90px_rgba(52,35,92,0.09)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-5">
                        {chogGuardian ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab("Rewards")}
                            className="mb-3 grid w-full grid-cols-[5rem_1fr_auto] items-center gap-3 overflow-hidden rounded-[1.2rem] bg-[#21143a] p-2.5 text-left text-white shadow-[0_14px_40px_rgba(33,20,58,0.16)]"
                          >
                            <GuardianArtwork className="aspect-square" />
                            <div className="min-w-0">
                              <p className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-violet-200/68">{chogGuardian.label}</p>
                              <p className={`mt-1 text-lg font-medium ${guardianMood.tone}`}>{guardianMood.label}</p>
                              <p className="mt-1 text-[0.68rem] text-white/42">{careXp} Care XP · {guardianTraits.length} traits</p>
                            </div>
                            <div className="rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-xs text-trace-green">Lv {guardianLevel}</div>
                          </button>
                        ) : null}
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#6F617F]">
                          Today&apos;s Health Trace Brief
                        </p>
                        <div className="space-y-2.5">
                          {dashboardBriefItems.map((item) => (
                            <div key={item.title} className="rounded-[1.35rem] border border-[#E8E2F2] bg-[#FBF8FF] p-3">
                              <div className="flex gap-3">
                                <span className={`mt-1.5 size-2.5 rounded-full ${item.color}`} />
                                <div>
                                  <p className="text-xs font-medium text-[#766A82]">{item.status}</p>
                                  <p className="mt-1 text-base font-medium text-[#21182C]">{item.title}</p>
                                  <p className="mt-1 text-xs leading-5 text-[#756A82]">{item.detail}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 rounded-[1.35rem] border border-[#E1DAEF] bg-[#F7F0FF] p-3">
                          <p className="text-xs font-semibold text-[#7555DA]">Guardian Recommendation</p>
                          <p className="mt-1.5 text-sm font-medium leading-6 text-[#302345]">
                            {guardianRecommendation}
                          </p>
                        </div>
                      </section>
                    </Reveal>
                  </div>

                  <Reveal delay={0.14} className="min-h-0">
                    <section className="flex h-full min-h-0 flex-col rounded-[1.6rem] border border-[#E5DFF2] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-5">
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6F617F]">
                          Live Signals
                        </p>
                        <h2 className="mt-1 text-2xl font-medium">Health signals for onchain behavior</h2>
                      </div>
                      <div className="grid flex-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                        {dashboardSignals.map((signal) => (
                          <MetricCard key={signal.label} {...signal} />
                        ))}
                      </div>
                    </section>
                  </Reveal>
                </div>
                </>
              ) : null}

              {activeTab === "Chog Quest" ? (
                <Reveal className="hidden lg:block">
                  <ChogQuest
                    guardian={chogGuardian}
                    careXp={careXp}
                    level={guardianLevel}
                    levelProgress={guardianLevelProgress}
                    traits={guardianTraits}
                    streak={chogQuestStreak}
                    lastCompletedDate={lastChogQuestDate}
                    todayKey={todayKey}
                    ownershipState={guardianOwnershipState}
                    detectionError={chogActivationError}
                    onDetect={discoverChogGuardian}
                    onVerifyOwnership={verifyActiveChogOwnership}
                    onComplete={completeChogQuest}
                  />
                </Reveal>
              ) : null}

              {activeTab === "Guardian" ? (
                <Reveal className="hidden lg:block">
                  <section className="overflow-hidden rounded-[1.6rem] border border-[#D9D0F1] bg-white/88 shadow-[0_36px_120px_rgba(45,92,52,0.12)] backdrop-blur-2xl sm:rounded-[2.25rem]">
                    <button
                      type="button"
                      onClick={() => setGuardianOpen((open) => !open)}
                      className="relative w-full overflow-hidden p-4 text-left transition hover:bg-[#FAF7FF] sm:p-7"
                    >
                      <motion.div
                        aria-hidden
                        className="absolute right-0 top-8 size-52 rounded-full bg-[#FF7BAC]/18 blur-3xl sm:right-10 sm:size-72"
                        animate={{ opacity: [0.42, 0.82, 0.42], scale: [0.9, 1.05, 0.9] }}
                        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <div className="relative grid gap-8 xl:grid-cols-[1fr_20rem]">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7555DA]">
                            CHOG GUARDIAN
                          </p>
                          <h2 className="mt-4 text-[clamp(2.05rem,10vw,4.9rem)] font-medium leading-[0.95] tracking-normal text-[#171022] sm:text-[clamp(2.3rem,4vw,4.9rem)]">
                            {guardianTitle}
                          </h2>
                          <p className="mt-4 max-w-4xl text-base leading-7 text-[#51445F] sm:mt-5 sm:text-xl sm:leading-9">
                            {guardianCopy}
                          </p>
                          <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
                            {guardianPills.map((item) => (
                              <span
                                key={item.label}
                                className={`rounded-full border px-3 py-2 text-xs font-medium sm:px-4 ${item.className}`}
                              >
                                {item.label}
                                <span className="ml-2 opacity-65">{item.detail}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-[1.5rem] border border-[#E1DAEF] bg-[#171022] p-5 text-white shadow-[0_24px_70px_rgba(16,21,16,0.2)]">
                          <div className="flex items-start gap-4">
                            <GuardianArtwork className="size-24 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200/64">{chogGuardian?.label}</p>
                              <p className={`mt-2 text-2xl font-medium ${guardianMood.tone}`}>{guardianMood.label}</p>
                              <p className="mt-1 text-xs leading-5 text-white/42">Your Chog translates private context into today&apos;s protocol.</p>
                            </div>
                          </div>
                          <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                            <div>
                              <p className="text-xs text-white/42">Guardian readout</p>
                              <p className="mt-1 text-3xl font-medium">{guardianReadout.value}</p>
                              <p className="mt-1 text-xs text-trace-green">{guardianReadout.label}</p>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/62">Lv {guardianLevel}</div>
                          </div>
                          <div className="mt-3 h-12">
                            <MiniChart data={guardianReadout.chart} />
                          </div>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {guardianOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden border-t border-[#E8E2F2]"
                        >
                          <div className="grid gap-4 p-4 sm:gap-5 sm:p-7 xl:grid-cols-[1fr_0.7fr]">
                            <div className="grid gap-3 md:grid-cols-2 sm:gap-4">
                              {guardianEvidence.map(([title, detail, href]) => (
                                <div key={title} className="rounded-[1.35rem] border border-[#E8E2F2] bg-[#FAF7FF] p-4 sm:rounded-3xl sm:p-5">
                                  <p className="text-sm font-medium text-[#6C6079]">{title}</p>
                                  <p className="mt-2 text-base font-medium leading-6 text-[#21182C] sm:text-lg sm:leading-7">{detail}</p>
                                  {href ? (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-3 inline-flex rounded-full border border-[#E1DAEF] bg-white px-3 py-1.5 text-xs font-medium text-[#7555DA] transition hover:border-[#FF7BAC]"
                                    >
                                      Open live volatility
                                    </a>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                            <div className="rounded-[1.75rem] border border-[#E1DAEF] bg-[#171022] p-5 text-white">
                              <p className="text-sm font-medium text-trace-green">Recommended protocol</p>
                              <p className="mt-2 text-xs leading-5 text-white/46">
                                Daily guardian actions. Tap each item when complete so Trace can update your context.
                              </p>
                              <div className="mt-5 space-y-3">
                                {dailyGuardianProtocol.map((action, index) => {
                                  return (
                                  <button
                                    key={action.title}
                                    type="button"
                                    onClick={() => {
                                      setActiveTab(action.targetTab);
                                    }}
                                    className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-sm text-white/72 transition hover:bg-white/[0.075]"
                                  >
                                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-trace-green text-xs font-semibold text-[#171022]">
                                      {index + 1}
                                    </span>
                                    <span>
                                      <span className="block font-medium">{action.title}</span>
                                      <span className="mt-1 block text-xs leading-5 text-white/48">{action.detail}</span>
                                    </span>
                                  </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </section>
                </Reveal>
              ) : null}

              {activeTab === "Market Stress" ? (
                <Reveal className="hidden lg:block">
                  <section className="overflow-hidden rounded-[2rem] border border-[#E5DFF2] bg-white/78 shadow-[0_32px_110px_rgba(16,21,16,0.09)] backdrop-blur-2xl">
                    <div className="grid xl:grid-cols-[1.03fr_0.97fr]">
                      <div className="relative overflow-hidden bg-[#171022] p-7 text-white">
                        <motion.div
                          aria-hidden
                          className="absolute -right-24 -top-24 size-80 rounded-full bg-amber-300/16 blur-3xl"
                          animate={{ opacity: [0.26, 0.62, 0.26], scale: [0.92, 1.1, 0.92] }}
                          transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                          aria-hidden
                          className="absolute -bottom-28 left-16 size-72 rounded-full bg-trace-green/20 blur-3xl"
                          animate={{ opacity: [0.22, 0.58, 0.22], scale: [1, 1.15, 1] }}
                          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <div className="relative">
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-trace-green/72">
                            Market Stress Index
                          </p>
                          <h2 className="mt-5 max-w-3xl text-[clamp(3rem,5.1vw,6.4rem)] font-medium leading-[0.86] tracking-normal">
                            Trade calm before trading fast.
                          </h2>
                          <p className="mt-6 max-w-xl text-base leading-8 text-white/62">
                            {marketStressCopy}
                          </p>

                          <div className="mt-8 grid grid-cols-[13rem_1fr] items-center gap-8">
                            <div className="flex size-52 items-center justify-center rounded-full bg-[conic-gradient(#fbbf24_0deg,#FF7BAC_224deg,rgba(255,255,255,0.1)_224deg)] p-2 shadow-[0_0_90px_rgba(251,191,36,0.18)]">
                              <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#171022] ring-1 ring-white/10">
                                <p className="text-7xl font-medium leading-none">{marketStressScore}</p>
                                <p className="mt-2 text-sm font-medium text-amber-200">{marketStressLabel}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {dashboardMarketDrivers.map((driver) => (
                                <div key={driver.label} className="rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-4">
                                  <div className="flex items-center justify-between gap-4">
                                    <div>
                                      <p className="text-sm text-white/46">{driver.label}</p>
                                      <p className="mt-1 text-3xl font-medium">{driver.value}</p>
                                    </div>
                                    <div className="w-28">
                                      <MiniChart data={driver.chart} />
                                    </div>
                                  </div>
                                  <p className="mt-2 text-xs text-white/50">{driver.note}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-7">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6F617F]">
                              Guardian protocol
                            </p>
                            <h3 className="mt-2 text-3xl font-medium leading-tight text-[#171022]">
                              Convert market pressure into safe behavior.
                            </h3>
                          </div>
                          <div className="rounded-full bg-[#171022] px-4 py-2 text-sm font-medium text-trace-green">
                            {completedMarketActions.length} / {marketStressActions.length} done
                          </div>
                        </div>

                        <div className="mt-6 rounded-[1.5rem] border border-[#E1DAEF] bg-[#FAF7FF] p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                              <CircleAlert size={20} />
                            </div>
                            <div>
                              <p className="text-lg font-medium text-[#21182C]">Why this matters now</p>
                              <p className="mt-2 text-sm leading-6 text-[#746A80]">
                                Volatility is above baseline while screen exposure is already high. Trace is not giving trading advice. It is protecting your decision state before impulse risk rises.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 space-y-3">
                          {marketStressActions.map((action, index) => {
                            const isDone = completedMarketActions.includes(action.title);
                            return (
                              <button
                                key={action.title}
                                type="button"
                                onClick={() => toggleMarketAction(action.title)}
                                className={`flex w-full items-start gap-4 rounded-[1.35rem] border p-4 text-left transition ${
                                  isDone
                                    ? "border-[#171022] bg-[#171022] text-white shadow-[0_18px_55px_rgba(16,21,16,0.16)]"
                                    : "border-[#E8E2F2] bg-white text-[#21182C] hover:border-[#D9D0F1] hover:bg-[#FCFAFF]"
                                }`}
                              >
                                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-trace-green text-sm font-semibold text-[#171022]">
                                  {isDone ? <Check size={15} strokeWidth={3} /> : index + 1}
                                </span>
                                <span>
                                  <span className="block text-base font-medium">{action.title}</span>
                                  <span className={`mt-1 block text-sm leading-6 ${isDone ? "text-white/52" : "text-[#746A80]"}`}>
                                    {action.detail}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {activeTab === "Recovery" ? (
                <Reveal className="hidden lg:block">
                  <section className="overflow-hidden rounded-[2rem] border border-[#E5DFF2] bg-white/78 shadow-[0_32px_110px_rgba(16,21,16,0.09)] backdrop-blur-2xl">
                    <div className="relative grid gap-0 xl:grid-cols-[0.95fr_1.05fr]">
                      <div className="relative overflow-hidden bg-[#171022] p-7 text-white">
                        <motion.div
                          aria-hidden
                          className="absolute -right-20 -top-24 size-72 rounded-full bg-[#FF7BAC]/20 blur-3xl"
                          animate={{ opacity: [0.36, 0.78, 0.36], scale: [0.9, 1.1, 0.9] }}
                          transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                          aria-hidden
                          className="absolute bottom-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-trace-green/40 to-transparent"
                          animate={{ opacity: [0.25, 0.72, 0.25] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <div className="relative">
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-trace-green/72">
                            Night Watch Recovery
                          </p>
                          <h2 className="mt-5 text-[clamp(2.65rem,4.4vw,5.8rem)] font-medium leading-[0.88] tracking-normal">
                            {recoveryTitle}
                          </h2>
                          <p className="mt-5 max-w-xl text-base leading-8 text-white/62">
                            {recoveryCopy}
                          </p>

                          <div className="mt-8 grid grid-cols-[12rem_1fr] items-center gap-8">
                            <div className="flex size-48 items-center justify-center rounded-full bg-[conic-gradient(#FF7BAC_0deg,#FF7BAC_302deg,rgba(255,255,255,0.1)_302deg)] p-2 shadow-[0_0_80px_rgba(255,123,172,0.2)]">
                              <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#171022] ring-1 ring-white/10">
                                <p className="text-6xl font-medium leading-none">{recoveryScore}</p>
                                <p className="mt-2 text-sm text-trace-green">Recovery readiness</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {[
                                ...(hasLiveHealthContext
                                  ? [
                                      ["Sleep debt", "1h 48m", "Mild accumulated fatigue"],
                                      ["Deep sleep", "Stable", "No sharp overnight drop"],
                                      ["Decision load", "Watch", "Markets can still tax recovery"],
                                    ]
                                  : [
                                      ["Sleep debt", "--", "Connect a sleep source"],
                                      ["Deep sleep", "--", "No recovery baseline yet"],
                                      ["Decision load", "--", "Connect journal and screen signals"],
                                    ]),
                              ].map(([label, value, detail]) => (
                                <div key={label} className="rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm text-white/46">{label}</p>
                                    <p className="text-xl font-medium">{value}</p>
                                  </div>
                                  <p className="mt-1 text-xs text-white/50">{detail}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-7">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6F617F]">
                              Tonight protocol
                            </p>
                            <h3 className="mt-2 text-3xl font-medium leading-tight text-[#171022]">
                              Make recovery feel automatic.
                            </h3>
                          </div>
                          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#F5EDFF] text-[#7555DA]">
                            <Moon size={20} />
                          </div>
                        </div>

                        <div className="mt-6 grid gap-3">
                          {[
                            ...(hasLiveHealthContext
                              ? [
                                  [
                                    "3:00 PM",
                                    "Caffeine boundary",
                                    "Late caffeine is one of the easiest ways to turn mild sleep debt into delayed sleep onset. Trace is watching whether your resting heart rate settles earlier tonight.",
                                    "Signal watched: sleep latency + resting HR",
                                  ],
                                  [
                                    "10:00 PM",
                                    "Screen dimming window",
                                    "Charts, X, and Discord keep your attention system elevated even after you close them. Dim screens, reduce motion, and move to low-stimulation input.",
                                    "Signal watched: screen streak + stress drift",
                                  ],
                                  [
                                    "11:30 PM",
                                    "Market hard stop",
                                    "Your recovery drops most when late volatility checks follow a high-load day. Stop active decisions before midnight to protect tomorrow's readiness.",
                                    "Signal watched: midnight activity + sleep debt",
                                  ],
                                ]
                              : [
                                  [
                                    "Now",
                                    "Connect sleep source",
                                    "Recovery protocols need sleep duration, timing, and consistency before Health Trace can make personal recommendations.",
                                    "Signal needed: sleep duration + timing",
                                  ],
                                  [
                                    "Next",
                                    "Connect activity source",
                                    "Movement and recovery context will stay blank until a wearable or health app is connected.",
                                    "Signal needed: steps + workouts",
                                  ],
                                  [
                                    "Then",
                                    "Create first check-in",
                                    "Journal context helps the Guardian separate market stress from actual recovery issues.",
                                    "Signal needed: FOMO / FUD check-in",
                                  ],
                                ]),
                          ].map(([time, title, detail, signal], index) => (
                            <motion.article
                              key={title}
                              whileHover={{ y: -4, scale: 1.01 }}
                              className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 rounded-[1.45rem] border border-[#E8E2F2] bg-[#FCFAFF] p-4 shadow-[0_14px_42px_rgba(16,21,16,0.04)]"
                            >
                              <p className="text-sm font-semibold text-[#7555DA]">{time}</p>
                              <div>
                                <p className="text-lg font-medium text-[#21182C]">{title}</p>
                                <p className="mt-1 text-sm leading-6 text-[#746A80]">{detail}</p>
                                <p className="mt-2 text-xs font-medium text-[#7555DA]">{signal}</p>
                              </div>
                              <span className="flex size-8 items-center justify-center rounded-full bg-[#F3EEFF] text-xs font-semibold text-[#7555DA]">
                                {index + 1}
                              </span>
                            </motion.article>
                          ))}
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                        {(hasLiveHealthContext
                          ? [
                              ["Recovery forecast", "Better if asleep before midnight"],
                              ["Guardian note", "No urgency. Protect the buffer."],
                            ]
                          : [
                              ["Recovery forecast", "Waiting for health sources"],
                              ["Guardian note", "Connect data before personal guidance."],
                            ]
                        ).map(([title, detail]) => (
                            <div key={title} className="rounded-[1.35rem] border border-[#E5DFF2] bg-[#FAF7FF] p-5">
                              <p className="text-sm font-medium text-[#21182C]">{title}</p>
                              <p className="mt-2 text-sm leading-5 text-[#746A80]">{detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {activeTab === "Eye Break" ? (
                <Reveal className="hidden lg:block">
                  <section className="rounded-[1.6rem] border border-[#E5DFF2] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6F617F]">
                          K-line Eye Break
                        </p>
                        <h2 className="mt-2 text-3xl font-medium leading-tight sm:text-4xl">Protect attention before it burns out.</h2>
                      </div>
                    </div>
                    <div className="mt-6">
                      <EyeResetPanel
                        onComplete={completeEyeReset}
                        isOnCooldown={isEyeResetOnCooldown}
                        cooldownSecondsLeft={eyeResetCooldownSeconds}
                      />
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-3 sm:mt-6 sm:gap-4">
                      {eyeBreakMetrics.map((item) => (
                        <div key={item.label} className="rounded-[1.5rem] border border-[#E8E2F2] bg-[#FCFAFF] p-4 sm:p-5">
                          <p className="text-sm text-[#756A82]">{item.label}</p>
                          <p className="mt-2 text-3xl font-medium text-[#171022] sm:mt-3 sm:text-4xl">{item.value}</p>
                          <p className="mt-3 text-sm leading-6 text-[#746A80]">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {activeTab === "Journal" ? (
                <Reveal className="hidden lg:block">
                  <section className="grid gap-4 rounded-[1.6rem] border border-[#E5DFF2] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7 xl:grid-cols-[0.85fr_1.15fr] xl:gap-6">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6F617F]">
                        FOMO / FUD Journal
                      </p>
                      <h2 className="mt-2 text-3xl font-medium leading-tight sm:text-4xl">
                        Not a mood tracker. A decision-state tracker.
                      </h2>
                      <p className="mt-4 text-base leading-7 text-[#756A82]">
                        Capture market-specific emotions so the Guardian knows when stress is
                        coming from volatility, losses, Discord noise, or airdrop fatigue.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {journalEntries.map((entry) => {
                        const selectedLevel = journalSelections[entry.label];
                        const response = selectedLevel ? journalResponseCopy[entry.label]?.[selectedLevel] : null;
                        return (
                        <button
                          key={entry.label}
                          type="button"
                          onClick={() => openJournalCheckIn(entry.label)}
                          className="w-full rounded-[1.5rem] border border-[#E8E2F2] bg-[#FCFAFF] p-4 text-left transition hover:border-[#D9D0F1] sm:p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-[#756A82]">{entry.label}</p>
                              <p className="mt-2 text-2xl font-medium text-[#21182C]">{selectedLevel ?? entry.value}</p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs ${
                              selectedLevel ? "border-[#171022] bg-[#171022] text-white" : "border-[#E1DAEF] bg-white text-[#756A82]"
                            }`}>
                              {selectedLevel ? "Checked in" : "Check-in"}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-[#746A80]">{response?.detail ?? entry.detail}</p>
                          <p className="mt-3 text-sm font-medium text-[#7555DA]">{response?.action ?? entry.action}</p>
                        </button>
                        );
                      })}
                      <div className="rounded-[1.5rem] border border-[#E1DAEF] bg-[#171022] p-5 text-white">
                        <p className="text-sm font-medium text-trace-green">Today&apos;s check-ins</p>
                        <p className="mt-2 text-xs leading-5 text-white/46">Complete these from the cards above. Each result updates your behavior context.</p>
                        <div className="mt-4 space-y-3">
                          {journalCheckIns.map((action, index) => {
                            const isDone = Boolean(journalSelections[action.title]);
                            return (
                              <button
                                key={action.title}
                                type="button"
                                onClick={() => openJournalCheckIn(action.title)}
                                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                                  isDone
                                    ? "border-trace-green/30 bg-trace-green/15 text-white"
                                    : "border-white/10 bg-white/[0.045] text-white/72 hover:bg-white/[0.075]"
                                }`}
                              >
                                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-trace-green text-xs font-semibold text-[#171022]">
                                  {isDone ? <Check size={13} strokeWidth={3} /> : index + 1}
                                </span>
                                <span>
                                  <span className="block font-medium">{action.title}</span>
                                  <span className="mt-1 block text-xs leading-5 text-white/48">{action.detail}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {activeTab === "Proofs" ? (
                <Reveal className="hidden lg:block">
                  <section className="rounded-[1.6rem] border border-[#E5DFF2] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7">
                    <div className="mb-5 flex flex-col gap-4 xl:mb-6 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6F617F]">
                          Proof of Healthy Action
                        </p>
                        <h2 className="mt-2 text-3xl font-medium leading-tight sm:text-4xl">
                          Prove actions, not health data.
                        </h2>
                        <p className="mt-4 max-w-3xl text-base leading-7 text-[#756A82]">
                          Raw sleep, heart rate, and stress data stay private. The chain can record
                          that a healthy action was completed, without exposing the underlying signal.
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] border border-[#E1DAEF] bg-[#171022] p-4 text-white sm:p-5 xl:w-80">
                        <p className="text-sm text-white/42">Current streak</p>
                        <p className="mt-2 text-4xl font-medium">{proofStreakLabel}</p>
                        <p className="mt-2 text-sm text-trace-green">Builder Balance Badge pending</p>
                      </div>
                    </div>

                    <div className="mb-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                      <div className="overflow-hidden rounded-[1.65rem] border border-[#E1DAEF] bg-[#171022] p-6 text-white shadow-[0_24px_80px_rgba(16,21,16,0.18)]">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-trace-green/70">
                              Weekly report poster
                            </p>
                            <h3 className="mt-4 text-4xl font-medium leading-none">{weeklyReport.title}</h3>
                            <p className="mt-3 text-sm text-white/46">{weeklyRangeLabel}</p>
                          </div>
                          <FileText className="size-7 text-trace-green" />
                        </div>
                        <p className="mt-5 text-sm leading-6 text-white/62">{weeklyReportSummary}</p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                          {weeklyReportStats.map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                              <p className="text-2xl font-medium">{value}</p>
                              <p className="mt-1 text-xs text-white/42">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-5 rounded-[1.65rem] border border-[#E1DAEF] bg-[#FAF7FF] p-5 sm:grid-cols-[8rem_1fr] sm:p-6">
                        <GuardianArtwork className="aspect-square self-start shadow-[0_18px_44px_rgba(33,20,58,0.16)]" />
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium text-[#21182C]">Weekly Chog Recovery Proof</p>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${guardianWeeklyProofClaimed ? "bg-[#171022] text-trace-green" : guardianWeeklyProofReady ? "bg-[#F2EAFF] text-[#7555DA]" : "bg-[#F0EBF7] text-[#746A80]"}`}>
                              {!hasVerifiedChog ? "NFT required" : guardianWeeklyProofClaimed ? "Claimed" : guardianWeeklyProofReady ? "Ready" : `${Math.min(3, completedProofCount)}/3 actions`}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-[#746A80]">
                            Claim a high-level action summary for {chogGuardian?.label}. Sleep, heart rate, stress values, and journal text remain private.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              onClick={claimWeeklyGuardianProof}
                              disabled={!hasVerifiedChog || !guardianWeeklyProofReady || guardianWeeklyProofClaimed || Boolean(guardianClaimState)}
                              className="rounded-full bg-[#171022] text-white hover:bg-[#302345] disabled:bg-[#E5DFF2] disabled:text-[#756A82]"
                            >
                              {guardianClaimState === "preparing" || guardianClaimState === "wallet" ? (
                                <RefreshCw className="mr-2 size-4 animate-spin" />
                              ) : guardianWeeklyProofClaimed ? (
                                <Check className="mr-2 size-4" />
                              ) : (
                                <ShieldCheck className="mr-2 size-4" />
                              )}
                              {!hasVerifiedChog
                                ? "CHOG NFT required"
                                : guardianClaimState === "preparing"
                                ? "Preparing proof..."
                                : guardianClaimState === "wallet"
                                  ? "Confirm in wallet..."
                                  : guardianWeeklyProofClaimed
                                    ? "Weekly proof claimed"
                                    : traceChogGuardianContractAddress && chogGuardian?.mode === "wallet"
                                      ? "Claim on Monad"
                                      : "Claim weekly proof"}
                            </Button>
                            <Button className="rounded-full border border-[#E1DAEF] bg-white text-[#21182C] hover:bg-[#F3EEFF]">
                              Prepare poster
                            </Button>
                          </div>
                          {guardianProofTxHash ? (
                            <p className="mt-3 break-all text-[0.68rem] text-[#756A82]">Proof reference: {guardianProofTxHash}</p>
                          ) : null}
                          {chogActivationError ? (
                            <p className="mt-3 text-xs leading-5 text-rose-600">{chogActivationError}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-4">
                      {proofActions.map((proof) => {
                        const Icon = proof.icon;
                        return (
                          <motion.article
                            key={proof.label}
                            whileHover={{ y: -5, scale: 1.015 }}
                            className={`rounded-[1.5rem] border p-4 sm:p-5 ${
                              proof.completed ? "border-[#D9D0F1] bg-[#F8F0FF]" : "border-[#E8E2F2] bg-[#FCFAFF]"
                            }`}
                          >
                            <div className="mb-5 flex items-start justify-between sm:mb-6">
                              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#F3EEFF] text-[#836EF9]">
                                {proof.completed ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                              </div>
                              <span className="rounded-full border border-[#E1DAEF] bg-white px-3 py-1 text-xs text-[#756A82]">
                                {proof.status}
                              </span>
                            </div>
                            <h3 className="text-xl font-medium text-[#21182C]">{proof.label}</h3>
                            <Button
                              onClick={() => syncProofAction(proof)}
                              disabled={proof.completed && proof.syncable}
                              className="mt-5 w-full rounded-full bg-[#171022] text-white hover:bg-[#302345] disabled:bg-[#E5DFF2] disabled:text-[#756A82]"
                            >
                              {proof.actionLabel}
                            </Button>
                          </motion.article>
                        );
                      })}
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {activeTab === "Rewards" ? (
                <Reveal className="hidden lg:block">
                  <section className="grid gap-5 rounded-[1.6rem] border border-[#E5DFF2] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="rounded-[1.75rem] bg-[#171022] p-6 text-white shadow-[0_28px_90px_rgba(16,21,16,0.18)]">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-trace-green/72">
                        On-chain health tasks
                      </p>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {rewardStats.map(([label, value]) => (
                          <div
                            key={label}
                            className="relative overflow-hidden rounded-[1.3rem] border border-trace-green/20 bg-[radial-gradient(circle_at_20%_10%,rgba(255,123,172,0.18),transparent_36%),rgba(255,255,255,0.055)] p-4 ring-1 ring-white/5"
                          >
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/42">{label}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <p className="text-xl font-medium leading-tight">{value}</p>
                              {label === "Badge status" ? (
                                <button
                                  type="button"
                                  onClick={() => setBadgeHintOpen((current) => (current === "stats" ? "" : "stats"))}
                                  className="flex size-5 items-center justify-center rounded-full border border-trace-green/30 bg-trace-green/10 text-[0.65rem] font-bold text-trace-green"
                                  aria-label="Badge status requirement"
                                >
                                  !
                                </button>
                              ) : null}
                            </div>
                            {label === "Badge status" && badgeHintOpen === "stats" ? (
                              <p className="mt-3 rounded-xl border border-trace-green/20 bg-trace-green/10 px-3 py-2 text-xs leading-5 text-trace-green">
                                {hasVerifiedChog ? "Reach level 6 to mint badge." : "Verified CHOG NFT required to mint badge."}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      {chogGuardian ? (
                        <div className="mt-4 grid grid-cols-[6.25rem_1fr] gap-4 rounded-[1.35rem] border border-violet-200/15 bg-[#21143a] p-3">
                          <GuardianArtwork className="aspect-square" />
                          <div className="min-w-0 py-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-violet-200/72">{chogGuardian.label}</p>
                              <span className="text-xs text-trace-green">{careXp} XP · {careXpMultiplier}×</span>
                            </div>
                            <p className={`mt-2 text-xl font-medium ${guardianMood.tone}`}>{guardianMood.label}</p>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-trace-green" style={{ width: `${guardianLevelProgress}%` }} />
                            </div>
                            <p className="mt-2 text-[0.68rem] text-white/42">
                              {guardianLevel >= 6 ? "Maximum guardian level" : `${100 - guardianLevelProgress} XP to level ${guardianLevel + 1}`}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {guardianTraits.length ? (
                          guardianTraits.map((trait) => (
                            <span key={trait} className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[0.68rem] text-white/62">
                              {trait}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-white/38">Complete healthy actions to unlock your first Chog trait.</span>
                        )}
                      </div>
                      <h2 className="mt-7 text-[clamp(2rem,3.1vw,3.85rem)] font-medium leading-[0.95]">
                        Rewards for recovery, not speculation.
                      </h2>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        {rewardMissions.map((mission) => {
                          const Icon = mission.icon;
                          const isDone = completedRewardMissions.includes(mission.label);
                          return (
                            <motion.button
                              type="button"
                              key={mission.label}
                              onClick={() => setActiveTab(mission.targetTab as HealthTab)}
                              whileHover={{ y: -4 }}
                              className={`rounded-[1.45rem] border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-[#FF7BAC]/60 ${isDone ? "border-[#171022] bg-[#171022] text-white" : "border-[#E8E2F2] bg-[#FCFAFF] hover:border-[#D9D0F1]"}`}
                            >
                              <div className="mb-5 flex items-start justify-between gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#F3EEFF] text-[#836EF9]">
                                  {isDone ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                                </div>
                                <span className={`rounded-full border px-3 py-1 text-xs ${isDone ? "border-trace-green/30 bg-trace-green/15 text-trace-green" : "border-[#E1DAEF] bg-white text-[#756A82]"}`}>
                                  {isDone ? "Completed" : mission.status}
                                </span>
                              </div>
                              <h3 className={`text-lg font-medium leading-tight ${isDone ? "text-white" : "text-[#21182C]"}`}>
                                {mission.label === "Complete 20-20-20 eye break" ? (
                                  <>
                                    <span className="block">Complete 20-20-20</span>
                                    <span className="block">eye break</span>
                                  </>
                                ) : mission.label === "Log FOMO / FUD check-in" ? (
                                  <>
                                    <span className="block">Log FOMO / FUD</span>
                                    <span className="block">check in</span>
                                  </>
                                ) : (
                                  mission.label
                                )}
                              </h3>
                              <p className="mt-3 text-sm font-semibold text-[#7555DA]">{isDone ? "Reward earned" : mission.reward}</p>
                            </motion.button>
                          );
                        })}
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        {dashboardBadges.map((badge) => (
                          <div key={badge.label} className="rounded-[1.35rem] border border-[#E8E2F2] bg-[#FAF7FF] p-5">
                            <ShieldCheck className="size-5 text-[#7555DA]" />
                            <p className="mt-4 whitespace-nowrap text-base font-medium text-[#21182C]">{badge.label}</p>
                            <p className="mt-2 text-sm leading-5 text-[#746A80]">{badge.detail}</p>
                            <div className="mt-4 flex items-center gap-2">
                              <p className="whitespace-nowrap text-sm font-medium text-[#7555DA]">{badge.status}</p>
                              {badge.label === "Builder Balance" ? (
                                <button
                                  type="button"
                                  onClick={() => setBadgeHintOpen((current) => (current === "builder" ? "" : "builder"))}
                                  className="flex size-5 items-center justify-center rounded-full border border-[#D2C6EA] bg-white text-[0.65rem] font-bold text-[#7555DA]"
                                  aria-label="Builder Balance badge requirement"
                                >
                                  !
                                </button>
                              ) : null}
                            </div>
                            {badge.label === "Builder Balance" && badgeHintOpen === "builder" ? (
                              <p className="mt-3 rounded-xl border border-[#E1DAEF] bg-white px-3 py-2 text-xs leading-5 text-[#7555DA]">
                                  {hasVerifiedChog ? "Reach level 6 to mint badge." : "Verified CHOG NFT required to mint badge."}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {activeTab === "AI Chat" ? (
                <Reveal className="hidden lg:block">
                  <section className="grid gap-5 rounded-[1.6rem] border border-[#E5DFF2] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7 xl:grid-cols-[0.82fr_1.18fr]">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6F617F]">
                        AI Health Guardian Chat
                      </p>
                      <h2 className="mt-2 text-[clamp(2.3rem,4vw,4.8rem)] font-medium leading-[0.94]">
                        Ask what your body and behavior are saying.
                      </h2>
                      <p className="mt-5 text-base leading-7 text-[#756A82]">
                        The chat explains onchain stress, recovery, and healthy action proofs in plain
                        English. It is a companion layer, not a medical diagnosis.
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {chatPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            className="rounded-full border border-[#E1DAEC] bg-white px-4 py-2 text-sm text-[#5F526F] transition hover:border-[#FF7BAC] hover:text-[#21182C]"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-[#E1DAEF] bg-[#FAF7FF] p-5">
                      <div className="space-y-4">
                        {chatMessages.map((message, index) => (
                          <div
                            key={`${message.role}-desktop-${index}`}
                            className={`max-w-[84%] rounded-[1.35rem] p-5 text-sm leading-6 ${
                              message.role === "assistant"
                                ? "bg-[#171022] text-white shadow-[0_18px_55px_rgba(16,21,16,0.16)]"
                                : "ml-auto border border-[#E5DFF2] bg-white text-[#21182C]"
                            }`}
                          >
                            {message.text}
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex items-center gap-3 rounded-full border border-[#E1DAEC] bg-white px-5 py-4 text-sm text-[#85788F]">
                        <MessageCircle size={17} />
                        Ask about your stress, recovery, proof streak, or market behavior...
                        <Button className="ml-auto rounded-full bg-[#171022] text-white hover:bg-[#302345]">
                          Send
                        </Button>
                      </div>
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {activeTab === "Settings" ? (
                <Reveal className="hidden lg:block">
                  <section className="flex flex-col rounded-[1.6rem] border border-[#E5DFF2] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-5 lg:h-[calc(100vh-3rem)] lg:overflow-hidden">
                    <div className="grid flex-1 content-start gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                      <motion.article
                        whileHover={{ y: -4 }}
                        className="rounded-[1.65rem] border border-[#E8E2F2] bg-[#FCFAFF] p-5 shadow-[0_16px_50px_rgba(16,21,16,0.04)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6F617F]">
                              Wallet
                            </p>
                            <h3 className="mt-3 text-3xl font-medium text-[#21182C]">
                              {walletAddress ? "Wallet connected" : "Connect wallet"}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-[#746A80]">
                              {walletAddress
                                ? `Wallet ${formatWalletAddress(walletAddress)}`
                                : "Connect for consent records, healthy action proofs, and badge ownership."}
                            </p>
                          </div>
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3EEFF] text-[#836EF9]">
                            <Wallet size={20} />
                          </div>
                        </div>
                        <div className="mt-6 grid gap-2">
                          {walletAddress ? (
                            <div className="rounded-[1.25rem] border border-[#E5DFF2] bg-white p-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#85788F]">Profile name</p>
                              <div className="mt-2 flex gap-2">
                                <input
                                  value={pendingDisplayName}
                                  onChange={(event) => setPendingDisplayName(event.target.value)}
                                  className="min-w-0 flex-1 rounded-full border border-[#E5DFF2] bg-[#FAF7FF] px-4 py-2 text-sm font-medium text-[#21182C] outline-none focus:border-[#FF7BAC]"
                                  placeholder="Name or nickname"
                                />
                                <Button
                                  onClick={saveProfileName}
                                  disabled={!pendingDisplayName.trim()}
                                  className="rounded-full bg-[#171022] px-4 text-white hover:bg-[#302345]"
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : null}
                          {chogGuardian ? (
                            <div className="flex items-center gap-3 border-y border-[#E8E2F2] py-3">
                              <GuardianArtwork className="size-14 shrink-0" src={chogGuardian.image} alt={chogGuardian.label} />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-[#6F617F]">Active Chog guardian</p>
                                <p className="mt-1 truncate text-sm font-medium text-[#21182C]">{chogGuardian.label} · Level {guardianLevel}</p>
                                <p className="mt-1 text-xs text-[#85788F]">Ownership verified</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void discoverChogGuardian()}
                                disabled={isDiscoveringChog}
                                className="rounded-full border border-[#E5DFF2] px-3 py-2 text-xs font-medium text-[#5F526F] transition hover:border-[#171022] hover:text-[#171022]"
                              >
                                {isDiscoveringChog ? "Scanning..." : "Change"}
                              </button>
                            </div>
                          ) : null}
                          <ChogTokenPicker tokens={ownedChogTokens} onSelect={selectOwnedChogGuardian} />
                          {!chogGuardian && !ownedChogTokens.length ? (
                            <div className="rounded-[1.25rem] border border-[#E1DAEF] bg-[#FAF7FF] p-4">
                              <p className="text-sm font-medium text-[#21182C]">No NFT detected</p>
                              <p className="mt-1 text-xs leading-5 text-[#746A80]">
                                Scan again after buying or receiving a CHOG NFT.
                              </p>
                              <Button
                                type="button"
                                onClick={() => void discoverChogGuardian()}
                                disabled={isDiscoveringChog}
                                className="mt-3 h-11 w-full rounded-full bg-[#21143A] text-white hover:bg-[#33204F]"
                              >
                                {isDiscoveringChog ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Gem className="mr-2 size-4" />}
                                {isDiscoveringChog ? "Scanning Monad..." : "Detect CHOG NFT"}
                              </Button>
                            </div>
                          ) : null}
                          {chogActivationError ? <p className="text-xs leading-5 text-[#7555DA]">{chogActivationError}</p> : null}
                          <Button
                            onClick={connectWallet}
                            disabled={isWalletConnecting || Boolean(walletAddress)}
                            className="h-11 w-full rounded-full bg-[#171022] text-white hover:bg-[#302345] disabled:opacity-100"
                          >
                            {walletAddress ? "Wallet connected" : isWalletConnecting ? "Connecting..." : "Connect wallet"}
                          </Button>
                          {walletAddress ? (
                            <Button
                              onClick={() => {
                                setWalletError("");
                                setWalletAddress("");
                                setActiveTab("Home");
                              }}
                              className="h-11 w-full rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              Log out
                            </Button>
                          ) : null}
                        </div>
                        {walletError ? <p className="mt-3 text-xs leading-5 text-rose-500">{walletError}</p> : null}
                      </motion.article>

                      <div className="rounded-[1.65rem] border border-[#E8E2F2] bg-[#FCFAFF] p-5 shadow-[0_16px_50px_rgba(16,21,16,0.04)]">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6F617F]">
                              Health Apps
                            </p>
                            <p className="mt-3 text-sm leading-6 text-[#746A80]">
                              Choose a source, then select exactly which health signals Health Trace can read.
                            </p>
                          </div>
                          <HeartPulse className="size-6 text-[#7555DA]" />
                        </div>

                        <div className="mt-5 grid grid-cols-4 gap-3">
                          {healthApps.map((app) => {
                            const Icon = app.icon;
                            const isSelected = selectedHealthApp === app.label;
                            const isConnected = connectedHealthApps.includes(app.label);
                            const connectedCount = healthPermissions[app.label]?.length ?? 0;
                            return (
                              <button
                                key={app.label}
                                type="button"
                                onClick={() => setSelectedHealthApp(app.label)}
                                className={`relative rounded-[1.35rem] border p-4 text-center transition ${
                                  isSelected
                                    ? "border-[#171022] bg-[#171022] text-white shadow-[0_16px_44px_rgba(16,21,16,0.18)]"
                                    : "border-[#E8E2F2] bg-white text-[#756A82] hover:border-[#D9D0F1]"
                                }`}
                              >
                                {isConnected ? (
                                  <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-trace-green text-[#171022]">
                                    <Check size={12} strokeWidth={3} />
                                  </span>
                                ) : null}
                                <span className={`mx-auto flex size-12 items-center justify-center rounded-2xl ${isSelected ? "bg-trace-green/15 text-trace-green" : "bg-[#F3EEFF] text-[#836EF9]"}`}>
                                  <Icon size={20} />
                                </span>
                                <span className="mt-3 block text-sm font-medium leading-tight">{app.label}</span>
                                <span className={`mt-2 block text-xs ${isSelected ? "text-white/46" : "text-[#85788F]"}`}>
                                  {isConnected ? `${connectedCount} signals` : "Not connected"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-[1.65rem] border border-[#E8E2F2] bg-[#FCFAFF] p-5 shadow-[0_16px_50px_rgba(16,21,16,0.04)] xl:col-span-2">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6F617F]">
                              {selectedHealthApp} permissions
                            </p>
                            <h3 className="mt-2 text-2xl font-medium text-[#21182C]">
                              {connectedHealthApps.includes(selectedHealthApp)
                                ? "Select the data you want to connect."
                                : "Connect this app to choose data."}
                            </h3>
                          </div>
                          <p className="text-sm text-[#746A80]">
                            {connectedHealthApps.includes(selectedHealthApp)
                              ? `${healthPermissions[selectedHealthApp]?.length ?? 0} selected`
                              : "Not connected"}
                          </p>
                        </div>
                        {connectedHealthApps.includes(selectedHealthApp) ? (
                          <>
                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                              {healthPermissionOptions.map((permission) => {
                                const isEnabled = healthPermissions[selectedHealthApp]?.includes(permission);
                                return (
                                  <button
                                    key={permission}
                                    type="button"
                                    onClick={() => toggleHealthPermission(selectedHealthApp, permission)}
                                    className={`flex items-center justify-between rounded-[1.2rem] border px-4 py-3 text-left text-sm font-medium transition ${
                                      isEnabled
                                        ? "border-[#171022] bg-[#171022] text-white"
                                        : "border-[#E5DFF2] bg-white text-[#756A82] hover:border-[#D9D0F1]"
                                    }`}
                                  >
                                    {permission}
                                    <span className={`size-3 rounded-full ${isEnabled ? "bg-trace-green" : "bg-[#E5DFF2]"}`} />
                                  </button>
                                );
                              })}
                            </div>
                            <Button
                              onClick={() => requestDisconnectHealthApp(selectedHealthApp)}
                              className="mt-4 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              Disconnect {selectedHealthApp}
                            </Button>
                          </>
                        ) : (
                          <div className="mt-5 rounded-[1.35rem] border border-[#E5DFF2] bg-white p-5">
                            <p className="text-sm leading-6 text-[#746A80]">
                              {selectedHealthApp} is not connected yet. Connect to it to simulate the consent flow.
                            </p>
                            <Button
                              onClick={() => connectHealthApp(selectedHealthApp)}
                              className="mt-4 rounded-full bg-[#171022] text-white hover:bg-[#302345]"
                            >
                              Connect to {selectedHealthApp}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 lg:mt-auto lg:grid-cols-3 lg:pt-3">
                      {[
                        ["Consent log", "Review which apps accessed context and for what reason."],
                        ["Data boundary", "Choose what stays local, permissioned, or provable."],
                        ["Trusted circle", "Optional private alerts for late-night recovery risk."],
                      ].map(([title, detail]) => (
                        <div key={title} className="rounded-[1.35rem] border border-[#E5DFF2] bg-[#FAF7FF] p-4">
                          <p className="text-base font-medium text-[#21182C]">{title}</p>
                          <p className="mt-2 text-xs leading-5 text-[#746A80]">{detail}</p>
                        </div>
                      ))}
                    </div>

                    {isAdminWallet ? (
                      <div className="mt-3 rounded-[1.35rem] border border-[#171022] bg-[#171022] p-4 text-white shadow-[0_18px_60px_rgba(16,21,16,0.18)]">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-trace-green">
                              Admin wallet registry
                            </p>
                            <p className="mt-1 text-sm text-white/58">
                              Visible only to {formatWalletAddress(savedContextWalletAddress)}.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              onClick={refreshAdminWalletRegistry}
                              className="h-9 rounded-full border border-white/12 bg-white/8 px-4 text-sm text-white hover:bg-white/12"
                            >
                              Refresh
                            </Button>
                            <p className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-sm text-white/72">
                              {walletRegistry.length} wallet{walletRegistry.length === 1 ? "" : "s"} tracked
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2">
                          {walletRegistry.length ? (
                            walletRegistry.map((entry) => {
                              const isProtectedAdmin = entry.wallet.toLowerCase() === savedContextWalletAddress.toLowerCase();
                              return (
                                <div
                                  key={entry.wallet}
                                  className="grid gap-3 rounded-[1.05rem] border border-white/10 bg-white/7 p-3 text-sm md:grid-cols-[1.1fr_0.7fr_0.45fr_0.45fr_auto] md:items-center"
                                >
                                  <div>
                                    <p className="font-medium text-white">{formatWalletAddress(entry.wallet)}</p>
                                    <p className="mt-1 text-xs text-white/42">
                                      {entry.displayName || "Unnamed wallet"}
                                      {entry.resetAt ? ` · reset ${entry.resetAt.slice(0, 10)}` : ""}
                                    </p>
                                  </div>
                                  <p className="text-white/58">Last seen {entry.lastSeen.slice(0, 10)}</p>
                                  <p className="text-white/58">{entry.connectedApps} app{entry.connectedApps === 1 ? "" : "s"}</p>
                                  <p className="text-white/58">{entry.rewardPoints} HT</p>
                                  <Button
                                    type="button"
                                    disabled={isProtectedAdmin}
                                    onClick={() => resetWalletProfile(entry.wallet)}
                                    className="rounded-full border border-red-300/30 bg-red-400/12 px-4 text-red-200 hover:bg-red-400/20 disabled:border-white/10 disabled:bg-white/8 disabled:text-white/28"
                                  >
                                    {isProtectedAdmin ? "Protected" : "Reset"}
                                  </Button>
                                </div>
                              );
                            })
                          ) : (
                            <div className="rounded-[1.05rem] border border-white/10 bg-white/7 p-4 text-sm text-white/52">
                              No wallet profiles tracked in this browser yet.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </section>
                </Reveal>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      <AnimatePresence>
        {syncingProofAction ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#171022]/35 px-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-[1.75rem] border border-[#E5DFF2] bg-white p-5 text-center shadow-[0_34px_110px_rgba(16,21,16,0.2)]"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#171022] text-trace-green">
                <Activity size={22} />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#6F617F]">Sync in progress</p>
              <h2 className="mt-2 text-2xl font-medium leading-tight text-[#171022]">{syncingProofAction}</h2>
              <p className="mt-3 text-sm leading-6 text-[#746A80]">
                Health Trace is syncing this healthy action to your connected health apps for proof creation.
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {pendingDisconnectApp ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#171022]/45 px-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="disconnect-health-app-title"
              className="w-full max-w-md rounded-[1.75rem] border border-[#E5DFF2] bg-white p-5 shadow-[0_34px_110px_rgba(16,21,16,0.22)]"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <CircleAlert size={22} />
              </div>
              <h2 id="disconnect-health-app-title" className="mt-5 text-2xl font-medium leading-tight text-[#171022]">
                Disconnect {pendingDisconnectApp}?
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#746A80]">
                Health Trace will stop reading this app&apos;s health signals and remove its selected data permissions.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setPendingDisconnectApp("")}
                  className="h-11 rounded-full bg-[#F3EEFF] text-[#5F526F] hover:bg-[#E9E2F3]"
                >
                  No, keep connected
                </Button>
                <Button
                  onClick={confirmDisconnectHealthApp}
                  className="h-11 rounded-full bg-red-600 text-white hover:bg-red-700"
                >
                  Yes, disconnect
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {pendingJournalCheckIn ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#171022]/45 px-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="journal-check-in-title"
              className="w-full max-w-lg rounded-[1.75rem] border border-[#E5DFF2] bg-white p-5 shadow-[0_34px_110px_rgba(16,21,16,0.22)]"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#F3EEFF] text-[#7555DA]">
                  <MessageCircle size={22} />
                </div>
                <button
                  type="button"
                  onClick={() => setPendingJournalCheckIn("")}
                  className="rounded-full border border-[#E5DFF2] px-3 py-1 text-xs font-medium text-[#746A80] transition hover:border-[#D8CFEB] hover:text-[#171022]"
                >
                  Cancel
                </button>
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#6F617F]">Journal check-in</p>
              <h2 id="journal-check-in-title" className="mt-2 text-3xl font-medium leading-tight text-[#171022]">
                {pendingJournalCheckIn}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#746A80]">
                Choose how strong this signal feels right now. Health Trace will translate it into a private decision-state note.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["Low", "Mid", "High"].map((level) => {
                  const response = journalResponseCopy[pendingJournalCheckIn]?.[level];
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => selectJournalLevel(level)}
                      className="rounded-[1.25rem] border border-[#E5DFF2] bg-[#FCFAFF] p-4 text-left transition hover:border-[#171022] hover:bg-white"
                    >
                      <span className="text-xl font-medium text-[#171022]">{level}</span>
                      <span className="mt-3 block text-xs font-medium text-[#7555DA]">{response?.action}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 rounded-[1.25rem] border border-[#E5DFF2] bg-[#FAF7FF] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F617F]">What happens next</p>
                <p className="mt-2 text-sm leading-6 text-[#746A80]">
                  The selected level marks today&apos;s check-in complete, updates Rewards, and changes the Journal card&apos;s response.
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
