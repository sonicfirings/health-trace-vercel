"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  Check,
  CircleAlert,
  Clock3,
  Droplets,
  Dumbbell,
  FileText,
  HeartPulse,
  LayoutDashboard,
  MessageCircle,
  Moon,
  Settings,
  ShieldCheck,
  Sparkles,
  Smartphone,
  TrendingUp,
  Wallet,
  Waves,
  Watch,
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

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

type HealthTab =
  | "Home"
  | "Guardian"
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
  Home: "Web3 health dashboard",
  Guardian: "AI health reasoning",
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

const homeSignals = [
  {
    label: "Web3 Health Score",
    value: "86",
    detail: "Stable, with market pressure elevated",
    icon: HeartPulse,
    tone: "text-trace-green",
    chart: [72, 75, 71, 78, 74, 84, 86],
  },
  {
    label: "Market Stress",
    value: "62",
    detail: "BTC/ETH volatility is above normal",
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
    signal.label === "Web3 Health Score"
      ? "0"
      : signal.label === "Proof Streak"
        ? "0 days"
        : "--",
  detail:
    signal.label === "Web3 Health Score"
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

const proofActions = [
  { label: "Eye break completed", status: "Ready to prove", icon: Activity },
  { label: "Recovery walk", status: "Verified locally", icon: Dumbbell },
  { label: "FOMO reflection", status: "Private proof", icon: MessageCircle },
  { label: "Sleep boundary", status: "Tonight", icon: Moon },
  { label: "Hydration check", status: "Pending", icon: Droplets },
  { label: "Builder balance", status: "6-day streak", icon: ShieldCheck },
];

const rewardMissions = [
  { label: "Complete 20-20-20 eye break", reward: "+30 HT Points", status: "Ready", icon: Activity },
  { label: "Log FOMO / FUD check-in", reward: "+45 HT Points", status: "New", icon: MessageCircle },
  { label: "Take a recovery walk", reward: "+60 HT Points", status: "Suggested", icon: Dumbbell },
  { label: "Keep midnight boundary", reward: "+90 HT Points", status: "Tonight", icon: Moon },
];

const healthBadges = [
  { label: "Builder Balance", detail: "Identity badge for consistently completing healthy builder routines.", status: "Mint-ready" },
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
            <stop offset="0%" stopColor="#9DFF7A" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#9DFF7A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="#9DFF7A"
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
      className="flex h-full min-h-[10.5rem] flex-col rounded-[1.35rem] border border-[#e1e9df] bg-[#fbfdf9] p-4 shadow-[0_16px_50px_rgba(16,21,16,0.04)] sm:min-h-[12.5rem]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-[#eef5ec]">
          <Icon className={`size-4 ${tone}`} />
        </div>
        <TrendingUp className="size-4 text-[#9aac9a]" />
      </div>
      <p className="text-xs text-[#6b776b]">{label}</p>
      <p className="mt-1 text-2xl font-medium text-[#101510]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#7a867a]">{detail}</p>
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
      className={`overflow-hidden rounded-[2rem] p-5 shadow-[0_28px_80px_rgba(16,21,16,0.12)] ${
        dark
          ? "bg-[#101510] text-white"
          : "border border-[#dfe7dc] bg-white/86 text-[#101510] backdrop-blur-2xl"
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${dark ? "text-trace-green/76" : "text-[#607260]"}`}>
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
    <div className="rounded-[1.4rem] border border-[#e1e9df] bg-[#fbfdf9] p-4 shadow-[0_14px_40px_rgba(16,21,16,0.045)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[#667466]">{label}</p>
          <p className="mt-1 text-2xl font-medium leading-none text-[#101510]">{value}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-2xl bg-[#eef5ec] text-[#3a8f4d]">
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#687668]">{detail}</p>
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
          : "border-[#dfe7dc] bg-[#101510] p-5 text-white shadow-[0_24px_75px_rgba(16,21,16,0.16)]"
      }`}
    >
      <motion.div
        aria-hidden
        className="absolute -right-12 -top-16 size-40 rounded-full bg-trace-green/20 blur-3xl"
        animate={{ opacity: [0.38, 0.76, 0.38], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex size-32 items-center justify-center rounded-full bg-[conic-gradient(#9DFF7A_var(--eye-progress),rgba(255,255,255,0.12)_0deg)] p-1.5" style={{ "--eye-progress": `${progress * 3.6}deg` } as React.CSSProperties}>
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#101510] ring-1 ring-white/10">
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
            className="mt-5 h-11 w-full rounded-full bg-trace-green text-[#101510] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
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
}) {
  if (activeTab === "Guardian") {
    return (
      <div className="space-y-4">
        <MobileShell eyebrow="Guardian" title="High attention day." dark>
          <p className="text-sm leading-6 text-white/62">
            ETH volatility is elevated, sleep is below baseline, and your screen streak crossed
            your stress threshold.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {guardianStatus.map((item) => (
              <div key={item.label} className={`rounded-[1.15rem] border p-3 text-center ${item.className}`}>
                <p className="text-xs font-semibold leading-tight">{item.label}</p>
                <p className="mt-1 text-[0.58rem] leading-tight opacity-70">{item.detail}</p>
              </div>
            ))}
          </div>
        </MobileShell>
        <section className="rounded-[1.75rem] border border-[#dfe7dc] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <p className="text-sm font-medium text-[#172117]">Recommended protocol</p>
          <div className="mt-3 space-y-2">
            {[
              ...guardianProtocolActions,
            ].map((item, index) => {
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.targetTab);
                  }}
                  className="flex w-full gap-3 rounded-[1.15rem] bg-[#f8fbf6] px-3 py-3 text-left text-sm leading-5 text-[#304030] transition hover:bg-white"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#9DFF7A] text-xs font-semibold text-[#101510]">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#687668]">{item.detail}</span>
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
        <section className="relative overflow-hidden rounded-[2.15rem] bg-[#101510] p-5 text-white shadow-[0_34px_100px_rgba(16,21,16,0.34)]">
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
              <div className="flex size-32 items-center justify-center rounded-full bg-[conic-gradient(#fbbf24_0deg,#9DFF7A_224deg,rgba(255,255,255,0.12)_224deg)] p-1.5 shadow-[0_0_70px_rgba(251,191,36,0.16)]">
                <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#101510] ring-1 ring-white/10">
                  <p className="text-5xl font-medium leading-none">62</p>
                  <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-amber-200">Elevated</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  ["Volatility", "+18%"],
                  ["Screen load", "6h 14m"],
                  ["Body stress", "Moderate"],
                ].map(([label, value]) => (
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
                Market movement is not dangerous by itself. The risk appears when volatility, screen time, and sleep debt stack together.
              </p>
            </div>
          </div>
        </section>
        <section className="rounded-[1.9rem] border border-[#dfe7dc] bg-white/90 p-4 shadow-[0_24px_70px_rgba(16,21,16,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#607260]">Stress protocol</p>
              <p className="mt-1 text-sm font-medium text-[#172117]">
                {completedMarketActions.length} / {marketStressActions.length} actions done
              </p>
            </div>
            <div className="rounded-full bg-[#101510] px-3 py-1 text-xs font-medium text-trace-green">Watch mode</div>
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
                      ? "border-[#101510] bg-[#101510] text-white shadow-[0_16px_44px_rgba(16,21,16,0.16)]"
                      : "border-[#dfe7dc] bg-[#f8fbf6] text-[#304030] hover:border-[#cfe0cb]"
                  }`}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#9DFF7A] text-xs font-semibold text-[#101510]">
                    {isDone ? <Check size={13} strokeWidth={3} /> : index + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{action.title}</span>
                    <span className={`mt-1 block text-xs leading-5 ${isDone ? "text-white/54" : "text-[#687668]"}`}>{action.detail}</span>
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
        <section className="relative overflow-hidden rounded-[2rem] bg-[#101510] p-5 text-white shadow-[0_30px_90px_rgba(16,21,16,0.32)]">
          <motion.div
            aria-hidden
            className="absolute -right-16 -top-20 size-56 rounded-full bg-[#9DFF7A]/20 blur-3xl"
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
                  Recovery is still protected.
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/62">
                  You have mild sleep debt, but HRV and morning movement are keeping your buffer intact.
                </p>
              </div>
              <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#9DFF7A_0deg,#9DFF7A_302deg,rgba(255,255,255,0.12)_302deg)] p-1.5 shadow-[0_0_48px_rgba(157,255,122,0.18)]">
                <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#101510]">
                  <p className="text-3xl font-medium leading-none">84</p>
                  <p className="mt-1 text-[0.6rem] text-trace-green">Ready</p>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                ["Sleep debt", "1h 48m"],
                ["Deep sleep", "Stable"],
                ["Wind-down", "Due"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.15rem] border border-white/10 bg-white/[0.06] p-3">
                  <p className="text-lg font-medium leading-none">{value}</p>
                  <p className="mt-2 text-[0.62rem] text-white/42">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-[1.75rem] border border-[#dfe7dc] bg-white/88 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#172117]">Tonight&apos;s recovery protocol</p>
            <Moon className="size-5 text-[#2f7d3c]" />
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
              <div key={title} className="grid grid-cols-[4.5rem_1fr] gap-3 rounded-[1.25rem] bg-[#f8fbf6] p-3">
                <p className="text-sm font-medium text-[#2f7d3c]">{time}</p>
                <div>
                  <p className="text-sm font-medium text-[#172117]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#687668]">{detail}</p>
                  <p className="mt-2 text-xs font-medium text-[#2f7d3c]">{outcome}</p>
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
          <p className="text-sm leading-6 text-[#667466]">
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
              className="w-full rounded-[1.5rem] border border-[#e1e9df] bg-white/86 p-4 text-left shadow-[0_14px_40px_rgba(16,21,16,0.045)] transition hover:border-[#cfe0cb]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#667466]">{entry.label}</p>
                  <p className="mt-1 text-2xl font-medium text-[#172117]">{selectedLevel ?? entry.value}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${selectedLevel ? "bg-[#101510] text-white" : "bg-[#eef5ec] text-[#3a8f4d]"}`}>
                  {selectedLevel ? "Checked in" : "Check-in"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#687668]">{response?.detail ?? entry.detail}</p>
              <p className="mt-3 text-sm font-medium text-[#2f7d3c]">{response?.action ?? entry.action}</p>
            </button>
            );
          })}
        </div>
        <section className="rounded-[1.75rem] border border-[#dfe7dc] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <p className="text-sm font-medium text-[#172117]">Today&apos;s check-ins</p>
          <div className="mt-3 space-y-2">
            {journalCheckIns.map((action, index) => {
              const isDone = Boolean(journalSelections[action.title]);
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => openJournalCheckIn(action.title)}
                  className={`flex w-full gap-3 rounded-[1.15rem] px-3 py-3 text-left text-sm leading-5 transition ${
                    isDone ? "bg-[#101510] text-white" : "bg-[#f8fbf6] text-[#304030]"
                  }`}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#9DFF7A] text-xs font-semibold text-[#101510]">
                    {isDone ? <Check size={13} strokeWidth={3} /> : index + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{action.title}</span>
                    <span className={`mt-1 block text-xs leading-5 ${isDone ? "text-white/54" : "text-[#687668]"}`}>{action.detail}</span>
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
              <p className="mt-2 text-sm text-trace-green">Level 4 Guardian</p>
            </div>
            <div className="rounded-[1.15rem] border border-trace-green/20 bg-trace-green/10 px-3 py-2 text-center">
              <p className="text-2xl font-medium">6</p>
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/46">Streak</p>
            </div>
          </div>
        </MobileShell>
        <section className="rounded-[1.75rem] border border-[#dfe7dc] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <p className="text-sm font-medium text-[#172117]">Today&apos;s missions</p>
          <div className="mt-3 space-y-2">
            {rewardMissions.map((mission) => {
              const Icon = mission.icon;
              const isDone = completedRewardMissions.includes(mission.label);
              return (
                <button
                  key={mission.label}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-[1.2rem] p-3 text-left ${isDone ? "bg-[#101510] text-white" : "bg-[#f8fbf6]"}`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#e9f9e4] text-[#2f7d3c]">
                    {isDone ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-medium leading-5 ${isDone ? "text-white" : "text-[#172117]"}`}>
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
                    <span className={`mt-0.5 block text-xs ${isDone ? "text-white/54" : "text-[#687668]"}`}>{isDone ? "Completed" : mission.status}</span>
                  </span>
                  <span className="text-xs font-semibold text-[#2f7d3c]">{isDone ? "Earned" : mission.reward}</span>
                </button>
              );
            })}
          </div>
        </section>
        <div className="grid gap-3">
          {healthBadges.map((badge) => (
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
            The Guardian answers with your health signals, proof history, and Web3 behavior context.
          </p>
        </MobileShell>
        <section className="rounded-[1.75rem] border border-[#dfe7dc] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <div className="space-y-3">
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-[1.35rem] p-4 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "bg-[#101510] text-white shadow-[0_20px_55px_rgba(16,21,16,0.16)]"
                    : "ml-8 bg-[#eef5ec] text-[#172117]"
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
                className="rounded-full border border-[#d9e1d7] bg-white px-3 py-2 text-xs text-[#526152]"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-[#d9e1d7] bg-[#f8fbf6] px-4 py-3 text-sm text-[#7b877b]">
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
            <p className="mt-1 text-4xl font-medium">6 days</p>
            <p className="mt-2 text-sm text-trace-green">Builder Balance Badge pending</p>
          </div>
        </MobileShell>
        <section className="rounded-[1.75rem] border border-[#dfe7dc] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#607260]">Weekly report</p>
              <h3 className="mt-2 text-2xl font-medium leading-tight text-[#172117]">{weeklyReport.title}</h3>
            </div>
            <FileText className="size-6 text-[#2f7d3c]" />
          </div>
          <p className="mt-3 text-sm leading-6 text-[#687668]">{weeklyReport.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {weeklyReport.stats.map(([label, value]) => (
              <div key={label} className="rounded-[1.1rem] bg-[#f8fbf6] p-3">
                <p className="text-lg font-medium text-[#172117]">{value}</p>
                <p className="mt-1 text-[0.68rem] text-[#687668]">{label}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="grid grid-cols-2 gap-3">
          {proofActions.map((proof) => {
            const Icon = proof.icon;
            return (
              <button
                key={proof.label}
                type="button"
                className="rounded-[1.35rem] border border-[#e1e9df] bg-white/86 p-3 text-left shadow-[0_14px_40px_rgba(16,21,16,0.045)]"
              >
                <div className="flex size-9 items-center justify-center rounded-2xl bg-[#eef5ec] text-[#3a8f4d]">
                  <Icon size={16} />
                </div>
                <p className="mt-4 text-sm font-medium leading-5 text-[#172117]">{proof.label}</p>
                <p className="mt-2 text-[0.68rem] text-[#6d786d]">{proof.status}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[1.75rem] border border-[#dfe7dc] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#172117]">Wallet</p>
            <p className="mt-1 text-xs leading-5 text-[#687668]">
              {walletAddress ? `Wallet ${formatWalletAddress(walletAddress)}` : "Connect for proofs and consent records"}
            </p>
          </div>
          <Wallet className="size-5 text-[#2f7d3c]" />
        </div>
        <Button
          onClick={onConnectWallet}
          disabled={isWalletConnecting}
          className="mt-4 h-11 w-full rounded-full bg-[#101510] text-white hover:bg-[#253525]"
        >
          {walletAddress ? "Wallet connected" : isWalletConnecting ? "Connecting..." : "Connect wallet"}
        </Button>
        {walletError ? <p className="mt-3 text-xs leading-5 text-rose-500">{walletError}</p> : null}
      </section>
      <section className="rounded-[1.75rem] border border-[#dfe7dc] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
        <p className="text-sm font-medium text-[#172117]">Health Apps</p>
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
                  isSelected ? "border-[#101510] bg-[#101510] text-white" : "border-transparent bg-[#f8fbf6] text-[#657265]"
                }`}
              >
                {isConnected ? (
                  <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-trace-green text-[#101510]">
                    <Check size={10} strokeWidth={3} />
                  </span>
                ) : null}
                <span className={`mx-auto flex size-10 items-center justify-center rounded-2xl ${isSelected ? "bg-trace-green/15 text-trace-green" : "bg-[#eef5ec] text-[#3a8f4d]"}`}>
                  <Icon size={17} />
                </span>
                <span className="mt-2 block text-[0.62rem] font-medium leading-tight">{app.label}</span>
                <span className={`mt-1 block text-[0.58rem] ${isSelected ? "text-white/46" : "text-[#3a8f4d]"}`}>
                  {isConnected ? `${connectedCount} data` : "Tap to connect"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="rounded-[1.75rem] border border-[#dfe7dc] bg-white/86 p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
        <p className="text-sm font-medium text-[#172117]">{selectedHealthApp} data permissions</p>
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
                        ? "border-[#101510] bg-[#101510] text-white"
                        : "border-[#dfe7dc] bg-[#f8fbf6] text-[#657265]"
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
          <div className="mt-3 rounded-[1.25rem] bg-[#f8fbf6] p-3">
            <p className="text-xs leading-5 text-[#687668]">
              Connect to {selectedHealthApp} first, then choose what health data to share.
            </p>
            <Button
              onClick={() => connectHealthApp(selectedHealthApp)}
              className="mt-3 h-10 w-full rounded-full bg-[#101510] text-white hover:bg-[#253525]"
            >
              Connect to {selectedHealthApp}
            </Button>
          </div>
        )}
      </section>
      <Button onClick={() => setActiveTab("Proofs")} className="h-12 w-full rounded-full bg-[#101510] text-white hover:bg-[#253525]">
        Review proof model
      </Button>
    </div>
  );
}

export default function Web3HealthPage() {
  const [activeTab, setActiveTab] = useState<HealthTab>("Home");
  const [syncedAt, setSyncedAt] = useState("");
  const [guardianOpen, setGuardianOpen] = useState(true);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [eyeBreakCount, setEyeBreakCount] = useState(0);
  const [isEyeResetOnCooldown, setIsEyeResetOnCooldown] = useState(false);
  const [eyeResetCooldownSeconds, setEyeResetCooldownSeconds] = useState(0);
  const [postureResetDone, setPostureResetDone] = useState(false);
  const [completedGuardianActions, setCompletedGuardianActions] = useState<string[]>([]);
  const [completedMarketActions, setCompletedMarketActions] = useState<string[]>([]);
  const [journalSelections, setJournalSelections] = useState<Record<string, string>>({});
  const [pendingJournalCheckIn, setPendingJournalCheckIn] = useState("");
  const [completedRewardMissions, setCompletedRewardMissions] = useState<string[]>([]);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [selectedHealthApp, setSelectedHealthApp] = useState(healthApps[0].label);
  const [connectedHealthApps, setConnectedHealthApps] = useState<string[]>([]);
  const [pendingDisconnectApp, setPendingDisconnectApp] = useState("");
  const [healthPermissions, setHealthPermissions] = useState<Record<string, string[]>>(emptyHealthPermissions);
  const mobilePrimaryNavigation = navigation.slice(0, 8);
  const mobileOverflowNavigation = navigation.slice(8);
  const isMobileOverflowActive = mobileOverflowNavigation.some((item) => item.label === activeTab);
  const isDemoAccount = walletAddress.toLowerCase() === savedContextWalletAddress.toLowerCase();
  const dashboardTrend = isDemoAccount
    ? recoveryTrend
    : recoveryTrend.map((item) => ({ ...item, score: 0, sleep: 0, market: 0 }));
  const dashboardSignals = isDemoAccount ? homeSignals : emptyHomeSignals;
  const dashboardBriefItems = isDemoAccount ? briefItems : emptyBriefItems;
  const healthScore = isDemoAccount ? "86" : "0";
  const healthScoreLabel = isDemoAccount ? "Stable" : "No data";
  const currentState = isDemoAccount ? "High attention load" : "No baseline yet";
  const mobileSummaryStats = isDemoAccount
    ? [
        ["Stress", "62", "Watch"],
        ["Sleep", "1h 48m", "Debt"],
        ["Screen", "91m", "Break"],
      ]
    : [
        ["Apps", "0", "Connect"],
        ["Score", "0", "No data"],
        ["Proofs", "0", "Start"],
      ];
  const guardianRecommendation = isDemoAccount
    ? "Do deep work before checking markets. Take an eye break now, and avoid major decisions after midnight."
    : "Connect a health source in Settings to start building your private baseline.";

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
  }, []);

  useEffect(() => {
    if (!walletAddress) {
      window.localStorage.removeItem(walletStorageKey);
      return;
    }

    window.localStorage.setItem(walletStorageKey, walletAddress);

    if (walletAddress.toLowerCase() === savedContextWalletAddress.toLowerCase()) {
      setEyeBreakCount(2);
      setRewardPoints(1280);
      setConnectedHealthApps(demoConnectedHealthApps);
      setHealthPermissions(demoHealthPermissions);
      return;
    }

    setEyeBreakCount(0);
    setRewardPoints(0);
    setConnectedHealthApps([]);
    setHealthPermissions(emptyHealthPermissions);
    setCompletedRewardMissions([]);
    setCompletedGuardianActions([]);
    setCompletedMarketActions([]);
    setJournalSelections({});
    setPostureResetDone(false);
    setIsEyeResetOnCooldown(false);
    setEyeResetCooldownSeconds(0);
  }, [walletAddress]);

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

  const completeEyeReset = () => {
    setEyeBreakCount((current) => Math.min(6, current + 1));
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
      return [...current, mission];
    });
  };

  const toggleGuardianAction = (action: string) => {
    setCompletedGuardianActions((current) =>
      current.includes(action) ? current.filter((item) => item !== action) : [...current, action],
    );
  };

  const toggleMarketAction = (action: string) => {
    setCompletedMarketActions((current) =>
      current.includes(action) ? current.filter((item) => item !== action) : [...current, action],
    );
  };

  const openJournalCheckIn = (label: string) => {
    setPendingJournalCheckIn(label);
  };

  const selectJournalLevel = (level: string) => {
    if (!pendingJournalCheckIn) return;
    setJournalSelections((current) => ({ ...current, [pendingJournalCheckIn]: level }));
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
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      if (accounts?.[0]) {
        setWalletAddress(accounts[0]);
      } else {
        setWalletError("Wallet did not return an account.");
      }
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Wallet connection was cancelled.");
    } finally {
      setIsWalletConnecting(false);
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
      <main className="min-h-screen overflow-hidden bg-[#f3f7f0] text-[#101510]">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(149,255,122,0.42),transparent_27rem),radial-gradient(circle_at_50%_80%,rgba(16,21,16,0.12),transparent_32rem),linear-gradient(180deg,#fbfff8,#edf4eb_54%,#f9fbf7)]" />
        <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full overflow-hidden rounded-[3rem] border border-[#dfe9dc] bg-white/70 p-5 shadow-[0_42px_150px_rgba(16,21,16,0.16)] backdrop-blur-3xl sm:p-8"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(218,255,205,0.44)_45%,rgba(255,255,255,0.72))]" />
            <div className="absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-trace-green/20 blur-3xl" />

            <div className="relative min-h-[40rem] overflow-hidden rounded-[2.45rem] border border-white/70 bg-[#0d150f] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(149,255,122,0.2),transparent_24rem),radial-gradient(circle_at_75%_70%,rgba(110,190,255,0.12),transparent_20rem)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/36 to-transparent" />

              <div className="relative flex min-h-[40rem] max-w-5xl flex-col justify-between p-7 sm:p-10 lg:p-12">
                <div className="flex items-center gap-3">
                  <div className="flex size-13 items-center justify-center rounded-2xl bg-white text-[#101510] shadow-[0_18px_50px_rgba(157,255,122,0.15)]">
                    <HeartPulse size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-[0.26em] text-white/82">HEALTH TRACE</p>
                    <p className="text-sm text-white/46">Web3 health guardian</p>
                  </div>
                </div>

                <div className="py-14">
                  <h1 className="max-w-5xl text-[clamp(3.8rem,7.6vw,8.1rem)] font-medium leading-[0.86] tracking-normal">
                    Own your
                    <br />
                    <span className="whitespace-nowrap">health context.</span>
                  </h1>
                  <p className="mt-8 max-w-2xl text-xl leading-9 text-white/62">
                    Connect your wallet to restore Health Trace, or create a new private account with no health context shown until you choose what to sync.
                  </p>
                </div>

                <div>
                  <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
                    <Button
                      onClick={connectWallet}
                      disabled={isWalletConnecting}
                      className="h-16 rounded-full bg-trace-green px-8 text-base font-semibold text-[#071006] shadow-[0_18px_54px_rgba(149,255,122,0.28)] hover:bg-[#a7ff84]"
                    >
                      <Wallet className="mr-2 size-5" />
                      {isWalletConnecting ? "Connecting..." : "Create account"}
                    </Button>
                    <Button
                      onClick={connectWallet}
                      disabled={isWalletConnecting}
                      className="h-16 rounded-full border border-white/18 bg-white/[0.08] px-8 text-base font-semibold text-white hover:bg-white/[0.13]"
                    >
                      Log in
                      <ArrowRight className="ml-2 size-5" />
                    </Button>
                  </div>
                  {walletError ? <p className="mt-5 max-w-2xl text-sm leading-6 text-rose-200">{walletError}</p> : null}
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8f4] text-[#101510]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_48%_-14%,rgba(157,255,122,0.28),transparent_38rem),radial-gradient(circle_at_100%_18%,rgba(148,203,255,0.12),transparent_30rem),linear-gradient(180deg,#f8faf6,#eef3ed_48%,#f8faf7)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1520px] gap-4 px-3 py-3 sm:px-5 sm:py-5 lg:gap-6 lg:px-6 lg:py-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 flex-col rounded-[2rem] border border-[#dfe7dc] bg-white/72 p-5 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl lg:flex">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#101510] text-trace-green shadow-[0_18px_60px_rgba(16,21,16,0.18)]">
              <HeartPulse size={21} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-[#526152]">HEALTH TRACE</p>
              <p className="text-sm text-[#7b877b]">Web3 health guardian</p>
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
                      ? "bg-[#101510] text-white shadow-[0_16px_44px_rgba(16,21,16,0.18)]"
                      : "text-[#657265] hover:bg-[#f1f6ee] hover:text-[#172117]"
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? "text-trace-green" : "text-[#8a978a]"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-5 rounded-full border border-[#d9e1d7] bg-white/70 px-4 py-2 text-center text-sm text-[#526152] shadow-[0_18px_60px_rgba(16,21,16,0.06)]">
            {syncedAt ? `Synced at ${syncedAt}` : "Synced"}
          </div>

          <div className="mt-auto rounded-[1.5rem] border border-[#dfe7dc] bg-[#f8fbf6] p-5">
            <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-[#e9f9e4] text-[#2f7d3c]">
              <ShieldCheck size={18} />
            </div>
            <p className="text-sm font-medium text-[#172117]">Private by default</p>
            <p className="mt-2 text-sm leading-6 text-[#6d786d]">
              Raw health data stays private. Only completed healthy actions can become proofs.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <Reveal className="mb-3 rounded-[1.5rem] border border-[#dfe7dc] bg-white/80 p-3 shadow-[0_18px_55px_rgba(16,21,16,0.06)] backdrop-blur-2xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#101510] text-trace-green">
                  <HeartPulse size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold tracking-[0.2em] text-[#526152]">HEALTH TRACE</p>
                  <p className="truncate text-xs text-[#7b877b]">Web3 health guardian</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[#d9e1d7] bg-white/70 px-3 py-1 text-[0.68rem] text-[#526152]">
                Synced
              </span>
            </div>

          </Reveal>

          <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-[#dfe7dc] bg-white/78 p-3 shadow-[0_18px_55px_rgba(16,21,16,0.05)] backdrop-blur-2xl lg:hidden">
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
                        ? "border-[#101510] bg-[#101510] text-white shadow-[0_14px_34px_rgba(16,21,16,0.18)]"
                        : "border-transparent bg-transparent text-[#657265] hover:bg-[#f1f6ee] hover:text-[#172117]"
                    }`}
                  >
                    <span
                      className={`flex size-8 items-center justify-center rounded-2xl transition ${
                        isActive ? "bg-trace-green/16 text-trace-green" : "bg-[#eef5ec] text-[#3a8f4d]"
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
                              ? "border-[#101510] bg-[#101510] text-white shadow-[0_14px_34px_rgba(16,21,16,0.18)]"
                              : "border-transparent bg-transparent text-[#657265] hover:bg-[#f1f6ee] hover:text-[#172117]"
                          }`}
                        >
                          <span
                            className={`flex size-8 items-center justify-center rounded-2xl transition ${
                              isActive ? "bg-trace-green/16 text-trace-green" : "bg-[#eef5ec] text-[#3a8f4d]"
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
                  ? "bg-[#101510] text-white"
                  : "bg-[#eef5ec] text-[#657265]"
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
                  />
                </div>
              ) : null}

              {activeTab === "Home" ? (
                <>
                <div className="space-y-4 lg:hidden">
                  <Reveal>
                    <section className="relative overflow-hidden rounded-[2rem] bg-[#101510] p-5 text-white shadow-[0_28px_80px_rgba(16,21,16,0.28)]">
                      <motion.div
                        aria-hidden
                        className="absolute -right-16 -top-16 size-48 rounded-full bg-[#9DFF7A]/24 blur-3xl"
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
                          <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#9DFF7A_0deg,#9DFF7A_310deg,rgba(255,255,255,0.13)_310deg)] p-1.5 shadow-[0_18px_55px_rgba(157,255,122,0.18)]">
                            <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#101510]">
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

                  <Reveal delay={0.06}>
                    <section className="rounded-[1.75rem] border border-[#dfe7dc] bg-white/86 p-4 shadow-[0_22px_70px_rgba(16,21,16,0.08)] backdrop-blur-2xl">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#607260]">
                            Live Signals
                          </p>
                          <h2 className="mt-1 text-2xl font-medium leading-tight">Your Web3 body state</h2>
                        </div>
                        <span className="rounded-full bg-[#101510] px-3 py-1 text-xs font-medium text-trace-green">
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
                                  ? "col-span-2 border-[#cfe0cb] bg-[#effbe9]"
                                  : "border-[#e1e9df] bg-[#fbfdf9]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex size-9 items-center justify-center rounded-2xl bg-white text-[#3a8f4d] shadow-[0_10px_25px_rgba(16,21,16,0.05)]">
                                  <Icon className={`size-4 ${signal.tone}`} />
                                </div>
                                <span className="rounded-full border border-[#dce6d9] bg-white/72 px-2 py-1 text-[0.62rem] text-[#657365]">
                                  {index === 0 ? "Primary" : "Signal"}
                                </span>
                              </div>
                              <p className="mt-4 text-xs text-[#667466]">{signal.label}</p>
                              <p className={`${index === 0 ? "text-4xl" : "text-2xl"} mt-1 font-medium leading-none text-[#101510]`}>
                                {signal.value}
                              </p>
                              <p className="mt-2 min-h-8 text-xs leading-4 text-[#6d786d]">{signal.detail}</p>
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
                    <section className="rounded-[1.75rem] border border-[#dfe7dc] bg-[#f8fbf6] p-4 shadow-[0_20px_60px_rgba(16,21,16,0.06)]">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#101510] text-trace-green">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#172117]">Guardian protocol</p>
                          <p className="text-xs text-[#6d786d]">For the next 90 minutes</p>
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
                            className="flex w-full gap-3 rounded-[1.15rem] border border-[#e1e9df] bg-white/78 px-3 py-3 text-left text-sm leading-5 text-[#304030] transition hover:border-[#cfe0cb] hover:bg-white"
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#9DFF7A] text-xs font-semibold text-[#101510]">
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
                      <div className="h-full rounded-[1.6rem] border border-[#dfe7dc] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.08)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-5">
                        <div className="grid gap-4 sm:grid-cols-[1fr_8.5rem] lg:grid-cols-[1fr_9rem]">
                          <div>
                            <div className="mb-3 flex items-center gap-2 text-[#5d6b5d]">
                              <Sparkles size={16} />
                              <p className="text-sm font-medium">Good Morning, Mervyn</p>
                            </div>
                            <h1 className="max-w-xl text-[clamp(2.15rem,11vw,3.45rem)] font-medium leading-[0.95] tracking-normal text-[#101510] sm:text-[clamp(2.05rem,3vw,3.45rem)]">
                              Here&apos;s your
                              <br />
                              Web3 health
                              <br />
                              summary
                            </h1>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:mt-8 sm:block sm:space-y-2">
                            <div className="rounded-[1.35rem] border border-[#dfe7dc] bg-[#101510] p-3 text-center text-white">
                              <p className="mb-2 text-center text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-white/38">
                                Web3 Health Score
                              </p>
                              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[conic-gradient(#9DFF7A_0deg,#9DFF7A_310deg,rgba(255,255,255,0.13)_310deg)] p-1.5">
                                <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#101510]">
                                  <p className="text-2xl font-medium leading-none">{healthScore}</p>
                                  <p className="mt-1 text-[0.62rem] text-trace-green">{healthScoreLabel}</p>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-[1.35rem] border border-[#dfe7dc] bg-[#f7faf5] p-3 text-center">
                              <p className="text-[0.68rem] text-[#6b756b]">Current state</p>
                              <p className="mt-1 text-lg font-medium leading-tight text-[#172117]">
                                {currentState}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 h-32 overflow-visible rounded-[1.5rem] border border-[#e0e8dd] bg-[#fbfdf9] px-3 py-4 sm:h-40 sm:px-6">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dashboardTrend} margin={{ left: 22, right: 42, top: 8, bottom: 0 }}>
                              <XAxis
                                dataKey="day"
                                axisLine={false}
                                interval={0}
                                minTickGap={0}
                                padding={{ left: 12, right: 26 }}
                                tickLine={false}
                                tick={{ fill: "#7a867a", fontSize: 12 }}
                              />
                              <YAxis hide domain={[0, 100]} />
                              <Tooltip
                                cursor={{ stroke: "#b7c4b2", strokeDasharray: "4 6" }}
                                contentStyle={{
                                  border: "1px solid #dfe7dc",
                                  borderRadius: 18,
                                  boxShadow: "0 18px 50px rgba(16,21,16,0.1)",
                                }}
                              />
                              <Line type="monotone" dataKey="score" stroke="#3a8f4d" strokeWidth={3} dot={false} />
                              <Line type="monotone" dataKey="sleep" stroke="#7bb5ff" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="market" stroke="#efb84f" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </Reveal>

                    <Reveal delay={0.08} className="h-full">
                      <section className="h-full rounded-[1.6rem] border border-[#dfe7dc] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#607260]">
                          Today&apos;s Web3 Health Brief
                        </p>
                        <div className="space-y-2.5">
                          {dashboardBriefItems.map((item) => (
                            <div key={item.title} className="rounded-[1.35rem] border border-[#e1e9df] bg-[#f9fbf8] p-3">
                              <div className="flex gap-3">
                                <span className={`mt-1.5 size-2.5 rounded-full ${item.color}`} />
                                <div>
                                  <p className="text-xs font-medium text-[#697869]">{item.status}</p>
                                  <p className="mt-1 text-base font-medium text-[#172117]">{item.title}</p>
                                  <p className="mt-1 text-xs leading-5 text-[#657365]">{item.detail}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 rounded-[1.35rem] border border-[#dce6d9] bg-[#eef8ea] p-3">
                          <p className="text-xs font-semibold text-[#2f7d3c]">Guardian Recommendation</p>
                          <p className="mt-1.5 text-sm font-medium leading-6 text-[#253525]">
                            {guardianRecommendation}
                          </p>
                        </div>
                      </section>
                    </Reveal>
                  </div>

                  <Reveal delay={0.14} className="min-h-0">
                    <section className="flex h-full min-h-0 flex-col rounded-[1.6rem] border border-[#dfe7dc] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-5">
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#607260]">
                          Live Signals
                        </p>
                        <h2 className="mt-1 text-2xl font-medium">Health context for Web3 behavior</h2>
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

              {activeTab === "Guardian" ? (
                <Reveal className="hidden lg:block">
                  <section className="overflow-hidden rounded-[1.6rem] border border-[#cfe0cb] bg-white/88 shadow-[0_36px_120px_rgba(45,92,52,0.12)] backdrop-blur-2xl sm:rounded-[2.25rem]">
                    <button
                      type="button"
                      onClick={() => setGuardianOpen((open) => !open)}
                      className="relative w-full overflow-hidden p-4 text-left transition hover:bg-[#f7faf5] sm:p-7"
                    >
                      <motion.div
                        aria-hidden
                        className="absolute right-0 top-8 size-52 rounded-full bg-[#9DFF7A]/18 blur-3xl sm:right-10 sm:size-72"
                        animate={{ opacity: [0.42, 0.82, 0.42], scale: [0.9, 1.05, 0.9] }}
                        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <div className="relative grid gap-8 xl:grid-cols-[1fr_20rem]">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4b7d4d]">
                            AI Web3 Health Guardian
                          </p>
                          <h2 className="mt-4 text-[clamp(2.05rem,10vw,4.9rem)] font-medium leading-[0.95] tracking-normal text-[#101510] sm:text-[clamp(2.3rem,4vw,4.9rem)]">
                            Today is a high-risk attention day.
                          </h2>
                          <p className="mt-4 max-w-4xl text-base leading-7 text-[#425042] sm:mt-5 sm:text-xl sm:leading-9">
                            ETH volatility is elevated, your sleep was below baseline, and your current
                            screen streak crossed your usual stress threshold. Health Trace recommends
                            protecting deep work before markets and avoiding major decisions after midnight.
                          </p>
                          <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
                            {[
                              { label: "No medical urgency", detail: "No acute alert", className: "border-sky-200 bg-sky-50 text-sky-700" },
                              { label: "Attention watch", detail: "Protect decisions", className: "border-amber-200 bg-amber-50 text-amber-700" },
                              { label: "91% confidence", detail: "Strong signal match", className: "border-[#9DFF7A]/50 bg-[#ecffe6] text-[#2f7d3c]" },
                            ].map((item) => (
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
                        <div className="rounded-[1.5rem] border border-[#dce6d9] bg-[#101510] p-5 text-white shadow-[0_24px_70px_rgba(16,21,16,0.2)]">
                          <p className="text-sm text-white/46">Guardian readout</p>
                          <div className="mt-4 flex items-end justify-between">
                            <div>
                              <p className="text-4xl font-medium">Watch</p>
                              <p className="mt-1 text-sm text-trace-green">Attention risk</p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-full border border-trace-green/24 bg-trace-green/10 text-trace-green">
                              <BrainCircuit size={19} />
                            </div>
                          </div>
                          <div className="mt-5 h-16">
                            <MiniChart data={[42, 48, 56, 64, 72, 68, 62]} />
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
                          className="overflow-hidden border-t border-[#e1e9df]"
                        >
                          <div className="grid gap-4 p-4 sm:gap-5 sm:p-7 xl:grid-cols-[1fr_0.7fr]">
                            <div className="grid gap-3 md:grid-cols-2 sm:gap-4">
                              {[
                                ["Market volatility", "BTC/ETH movement is 18% above your baseline watchlist."],
                                ["Sleep debt", "Three late nights created 1h 48m of accumulated sleep debt."],
                                ["Screen fatigue", "91 minutes of uninterrupted chart and Discord exposure."],
                                ["Decision risk", "Higher impulse risk appears when sleep drops and volatility rises."],
                              ].map(([title, detail]) => (
                                <div key={title} className="rounded-[1.35rem] border border-[#e1e9df] bg-[#f8fbf6] p-4 sm:rounded-3xl sm:p-5">
                                  <p className="text-sm font-medium text-[#5d6b5d]">{title}</p>
                                  <p className="mt-2 text-base font-medium leading-6 text-[#172117] sm:text-lg sm:leading-7">{detail}</p>
                                </div>
                              ))}
                            </div>
                            <div className="rounded-[1.75rem] border border-[#dce6d9] bg-[#101510] p-5 text-white">
                              <p className="text-sm font-medium text-trace-green">Recommended protocol</p>
                              <p className="mt-2 text-xs leading-5 text-white/46">
                                Daily guardian actions. Tap each item when complete so Trace can update your context.
                              </p>
                              <div className="mt-5 space-y-3">
                                {guardianProtocolActions.map((action, index) => {
                                  return (
                                  <button
                                    key={action.title}
                                    type="button"
                                    onClick={() => {
                                      setActiveTab(action.targetTab);
                                    }}
                                    className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-sm text-white/72 transition hover:bg-white/[0.075]"
                                  >
                                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-trace-green text-xs font-semibold text-[#101510]">
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
                  <section className="overflow-hidden rounded-[2rem] border border-[#dfe7dc] bg-white/78 shadow-[0_32px_110px_rgba(16,21,16,0.09)] backdrop-blur-2xl">
                    <div className="grid xl:grid-cols-[1.03fr_0.97fr]">
                      <div className="relative overflow-hidden bg-[#101510] p-7 text-white">
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
                            Trace reads volatility, screen intensity, sleep debt, and body stress as one context layer, then tells you when market behavior is starting to tax recovery.
                          </p>

                          <div className="mt-8 grid grid-cols-[13rem_1fr] items-center gap-8">
                            <div className="flex size-52 items-center justify-center rounded-full bg-[conic-gradient(#fbbf24_0deg,#9DFF7A_224deg,rgba(255,255,255,0.1)_224deg)] p-2 shadow-[0_0_90px_rgba(251,191,36,0.18)]">
                              <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#101510] ring-1 ring-white/10">
                                <p className="text-7xl font-medium leading-none">62</p>
                                <p className="mt-2 text-sm font-medium text-amber-200">Elevated, manageable</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {marketDrivers.map((driver) => (
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
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#607260]">
                              Guardian protocol
                            </p>
                            <h3 className="mt-2 text-3xl font-medium leading-tight text-[#101510]">
                              Convert market pressure into safe behavior.
                            </h3>
                          </div>
                          <div className="rounded-full bg-[#101510] px-4 py-2 text-sm font-medium text-trace-green">
                            {completedMarketActions.length} / {marketStressActions.length} done
                          </div>
                        </div>

                        <div className="mt-6 rounded-[1.5rem] border border-[#dce6d9] bg-[#f8fbf6] p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                              <CircleAlert size={20} />
                            </div>
                            <div>
                              <p className="text-lg font-medium text-[#172117]">Why this matters now</p>
                              <p className="mt-2 text-sm leading-6 text-[#687668]">
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
                                    ? "border-[#101510] bg-[#101510] text-white shadow-[0_18px_55px_rgba(16,21,16,0.16)]"
                                    : "border-[#e1e9df] bg-white text-[#172117] hover:border-[#cfe0cb] hover:bg-[#fbfdf9]"
                                }`}
                              >
                                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-trace-green text-sm font-semibold text-[#101510]">
                                  {isDone ? <Check size={15} strokeWidth={3} /> : index + 1}
                                </span>
                                <span>
                                  <span className="block text-base font-medium">{action.title}</span>
                                  <span className={`mt-1 block text-sm leading-6 ${isDone ? "text-white/52" : "text-[#687668]"}`}>
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
                  <section className="overflow-hidden rounded-[2rem] border border-[#dfe7dc] bg-white/78 shadow-[0_32px_110px_rgba(16,21,16,0.09)] backdrop-blur-2xl">
                    <div className="relative grid gap-0 xl:grid-cols-[0.95fr_1.05fr]">
                      <div className="relative overflow-hidden bg-[#101510] p-7 text-white">
                        <motion.div
                          aria-hidden
                          className="absolute -right-20 -top-24 size-72 rounded-full bg-[#9DFF7A]/20 blur-3xl"
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
                            Recovery is still protected.
                          </h2>
                          <p className="mt-5 max-w-xl text-base leading-8 text-white/62">
                            Sleep debt is present, but your morning movement and HRV trend are keeping
                            the buffer intact. Tonight is about preventing a second-order drop.
                          </p>

                          <div className="mt-8 grid grid-cols-[12rem_1fr] items-center gap-8">
                            <div className="flex size-48 items-center justify-center rounded-full bg-[conic-gradient(#9DFF7A_0deg,#9DFF7A_302deg,rgba(255,255,255,0.1)_302deg)] p-2 shadow-[0_0_80px_rgba(157,255,122,0.2)]">
                              <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#101510] ring-1 ring-white/10">
                                <p className="text-6xl font-medium leading-none">84</p>
                                <p className="mt-2 text-sm text-trace-green">Recovery readiness</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {[
                                ["Sleep debt", "1h 48m", "Mild accumulated fatigue"],
                                ["Deep sleep", "Stable", "No sharp overnight drop"],
                                ["Decision load", "Watch", "Markets can still tax recovery"],
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
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#607260]">
                              Tonight protocol
                            </p>
                            <h3 className="mt-2 text-3xl font-medium leading-tight text-[#101510]">
                              Make recovery feel automatic.
                            </h3>
                          </div>
                          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#e9f9e4] text-[#2f7d3c]">
                            <Moon size={20} />
                          </div>
                        </div>

                        <div className="mt-6 grid gap-3">
                          {[
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
                          ].map(([time, title, detail, signal], index) => (
                            <motion.article
                              key={title}
                              whileHover={{ y: -4, scale: 1.01 }}
                              className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 rounded-[1.45rem] border border-[#e1e9df] bg-[#fbfdf9] p-4 shadow-[0_14px_42px_rgba(16,21,16,0.04)]"
                            >
                              <p className="text-sm font-semibold text-[#2f7d3c]">{time}</p>
                              <div>
                                <p className="text-lg font-medium text-[#172117]">{title}</p>
                                <p className="mt-1 text-sm leading-6 text-[#687668]">{detail}</p>
                                <p className="mt-2 text-xs font-medium text-[#2f7d3c]">{signal}</p>
                              </div>
                              <span className="flex size-8 items-center justify-center rounded-full bg-[#eef5ec] text-xs font-semibold text-[#2f7d3c]">
                                {index + 1}
                              </span>
                            </motion.article>
                          ))}
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          {[
                            ["Recovery forecast", "Better if asleep before midnight"],
                            ["Guardian note", "No urgency. Protect the buffer."],
                          ].map(([title, detail]) => (
                            <div key={title} className="rounded-[1.35rem] border border-[#dfe7dc] bg-[#f8fbf6] p-5">
                              <p className="text-sm font-medium text-[#172117]">{title}</p>
                              <p className="mt-2 text-sm leading-5 text-[#687668]">{detail}</p>
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
                  <section className="rounded-[1.6rem] border border-[#dfe7dc] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#607260]">
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
                        <div key={item.label} className="rounded-[1.5rem] border border-[#e1e9df] bg-[#fbfdf9] p-4 sm:p-5">
                          <p className="text-sm text-[#667466]">{item.label}</p>
                          <p className="mt-2 text-3xl font-medium text-[#101510] sm:mt-3 sm:text-4xl">{item.value}</p>
                          <p className="mt-3 text-sm leading-6 text-[#687668]">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {activeTab === "Journal" ? (
                <Reveal className="hidden lg:block">
                  <section className="grid gap-4 rounded-[1.6rem] border border-[#dfe7dc] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7 xl:grid-cols-[0.85fr_1.15fr] xl:gap-6">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#607260]">
                        FOMO / FUD Journal
                      </p>
                      <h2 className="mt-2 text-3xl font-medium leading-tight sm:text-4xl">
                        Not a mood tracker. A decision-state tracker.
                      </h2>
                      <p className="mt-4 text-base leading-7 text-[#667466]">
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
                          className="w-full rounded-[1.5rem] border border-[#e1e9df] bg-[#fbfdf9] p-4 text-left transition hover:border-[#cfe0cb] sm:p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-[#667466]">{entry.label}</p>
                              <p className="mt-2 text-2xl font-medium text-[#172117]">{selectedLevel ?? entry.value}</p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs ${
                              selectedLevel ? "border-[#101510] bg-[#101510] text-white" : "border-[#dce6d9] bg-white text-[#657365]"
                            }`}>
                              {selectedLevel ? "Checked in" : "Check-in"}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-[#687668]">{response?.detail ?? entry.detail}</p>
                          <p className="mt-3 text-sm font-medium text-[#2f7d3c]">{response?.action ?? entry.action}</p>
                        </button>
                        );
                      })}
                      <div className="rounded-[1.5rem] border border-[#dce6d9] bg-[#101510] p-5 text-white">
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
                                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-trace-green text-xs font-semibold text-[#101510]">
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
                  <section className="rounded-[1.6rem] border border-[#dfe7dc] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7">
                    <div className="mb-5 flex flex-col gap-4 xl:mb-6 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#607260]">
                          Proof of Healthy Action
                        </p>
                        <h2 className="mt-2 text-3xl font-medium leading-tight sm:text-4xl">
                          Prove actions, not health data.
                        </h2>
                        <p className="mt-4 max-w-3xl text-base leading-7 text-[#667466]">
                          Raw sleep, heart rate, and stress data stay private. The chain can record
                          that a healthy action was completed, without exposing the underlying signal.
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] border border-[#dce6d9] bg-[#101510] p-4 text-white sm:p-5 xl:w-80">
                        <p className="text-sm text-white/42">Current streak</p>
                        <p className="mt-2 text-4xl font-medium">6 days</p>
                        <p className="mt-2 text-sm text-trace-green">Builder Balance Badge pending</p>
                      </div>
                    </div>

                    <div className="mb-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                      <div className="overflow-hidden rounded-[1.65rem] border border-[#dce6d9] bg-[#101510] p-6 text-white shadow-[0_24px_80px_rgba(16,21,16,0.18)]">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-trace-green/70">
                              Weekly report poster
                            </p>
                            <h3 className="mt-4 text-4xl font-medium leading-none">{weeklyReport.title}</h3>
                          </div>
                          <FileText className="size-7 text-trace-green" />
                        </div>
                        <p className="mt-5 text-sm leading-6 text-white/62">{weeklyReport.summary}</p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                          {weeklyReport.stats.map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                              <p className="text-2xl font-medium">{value}</p>
                              <p className="mt-1 text-xs text-white/42">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-[1.65rem] border border-[#dce6d9] bg-[#f8fbf6] p-6">
                        <p className="text-sm font-medium text-[#172117]">Share without exposing raw health data</p>
                        <p className="mt-3 text-sm leading-6 text-[#687668]">
                          The poster shows completed actions, streaks, and high-level progress. It does
                          not reveal sleep records, heart rate values, or stress data.
                        </p>
                        <Button className="mt-6 rounded-full bg-[#101510] text-white hover:bg-[#253525]">
                          Prepare weekly poster
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-4">
                      {proofActions.map((proof) => {
                        const Icon = proof.icon;
                        return (
                          <motion.article
                            key={proof.label}
                            whileHover={{ y: -5, scale: 1.015 }}
                            className="rounded-[1.5rem] border border-[#e1e9df] bg-[#fbfdf9] p-4 sm:p-5"
                          >
                            <div className="mb-5 flex items-start justify-between sm:mb-6">
                              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#eef5ec] text-[#3a8f4d]">
                                <Icon size={18} />
                              </div>
                              <span className="rounded-full border border-[#dce6d9] bg-white px-3 py-1 text-xs text-[#657365]">
                                {proof.status}
                              </span>
                            </div>
                            <h3 className="text-xl font-medium text-[#172117]">{proof.label}</h3>
                            <Button className="mt-5 w-full rounded-full bg-[#101510] text-white hover:bg-[#253525]">
                              Generate proof
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
                  <section className="grid gap-5 rounded-[1.6rem] border border-[#dfe7dc] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="rounded-[1.75rem] bg-[#101510] p-6 text-white shadow-[0_28px_90px_rgba(16,21,16,0.18)]">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-trace-green/72">
                        On-chain health tasks
                      </p>
                      <h2 className="mt-4 text-[clamp(2rem,3.1vw,3.85rem)] font-medium leading-[0.95]">
                        Rewards for recovery, not speculation.
                      </h2>
                      <div className="mt-7 grid grid-cols-2 gap-3">
                        {[
                          ["HT Points", rewardPoints.toLocaleString()],
                          ["Level", "4"],
                          ["Streak", "6 days"],
                          ["Badge status", "Mint-ready"],
                        ].map(([label, value], index) => (
                          <div
                            key={label}
                            className="relative overflow-hidden rounded-[1.3rem] border border-trace-green/20 bg-[radial-gradient(circle_at_20%_10%,rgba(157,255,122,0.18),transparent_36%),rgba(255,255,255,0.055)] p-4 ring-1 ring-white/5"
                          >
                            <div className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full border border-trace-green/20 bg-trace-green/10 text-[0.65rem] font-semibold text-trace-green">
                              {index + 1}
                            </div>
                            <p className="pr-8 text-xl font-medium leading-tight">{value}</p>
                            <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/42">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        {rewardMissions.map((mission) => {
                          const Icon = mission.icon;
                          const isDone = completedRewardMissions.includes(mission.label);
                          return (
                            <motion.article
                              key={mission.label}
                              whileHover={{ y: -4 }}
                              className={`rounded-[1.45rem] border p-5 ${isDone ? "border-[#101510] bg-[#101510] text-white" : "border-[#e1e9df] bg-[#fbfdf9]"}`}
                            >
                              <div className="mb-5 flex items-start justify-between gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#eef5ec] text-[#3a8f4d]">
                                  {isDone ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                                </div>
                                <span className={`rounded-full border px-3 py-1 text-xs ${isDone ? "border-trace-green/30 bg-trace-green/15 text-trace-green" : "border-[#dce6d9] bg-white text-[#657365]"}`}>
                                  {isDone ? "Completed" : mission.status}
                                </span>
                              </div>
                              <h3 className={`text-lg font-medium leading-tight ${isDone ? "text-white" : "text-[#172117]"}`}>
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
                              <p className="mt-3 text-sm font-semibold text-[#2f7d3c]">{isDone ? "Reward earned" : mission.reward}</p>
                            </motion.article>
                          );
                        })}
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        {healthBadges.map((badge) => (
                          <div key={badge.label} className="rounded-[1.35rem] border border-[#e1e9df] bg-[#f8fbf6] p-5">
                            <ShieldCheck className="size-5 text-[#2f7d3c]" />
                            <p className="mt-4 whitespace-nowrap text-base font-medium text-[#172117]">{badge.label}</p>
                            <p className="mt-2 text-sm leading-5 text-[#687668]">{badge.detail}</p>
                            <p className="mt-4 text-sm font-medium text-[#2f7d3c]">{badge.status}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {activeTab === "AI Chat" ? (
                <Reveal className="hidden lg:block">
                  <section className="grid gap-5 rounded-[1.6rem] border border-[#dfe7dc] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7 xl:grid-cols-[0.82fr_1.18fr]">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#607260]">
                        AI Health Guardian Chat
                      </p>
                      <h2 className="mt-2 text-[clamp(2.3rem,4vw,4.8rem)] font-medium leading-[0.94]">
                        Ask what your body and behavior are saying.
                      </h2>
                      <p className="mt-5 text-base leading-7 text-[#667466]">
                        The chat explains Web3 stress, recovery, and healthy action proofs in plain
                        English. It is a companion layer, not a medical diagnosis.
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {chatPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            className="rounded-full border border-[#d9e1d7] bg-white px-4 py-2 text-sm text-[#526152] transition hover:border-[#9DFF7A] hover:text-[#172117]"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-[#dce6d9] bg-[#f8fbf6] p-5">
                      <div className="space-y-4">
                        {chatMessages.map((message, index) => (
                          <div
                            key={`${message.role}-desktop-${index}`}
                            className={`max-w-[84%] rounded-[1.35rem] p-5 text-sm leading-6 ${
                              message.role === "assistant"
                                ? "bg-[#101510] text-white shadow-[0_18px_55px_rgba(16,21,16,0.16)]"
                                : "ml-auto border border-[#dfe7dc] bg-white text-[#172117]"
                            }`}
                          >
                            {message.text}
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex items-center gap-3 rounded-full border border-[#d9e1d7] bg-white px-5 py-4 text-sm text-[#7b877b]">
                        <MessageCircle size={17} />
                        Ask about your stress, recovery, proof streak, or market behavior...
                        <Button className="ml-auto rounded-full bg-[#101510] text-white hover:bg-[#253525]">
                          Send
                        </Button>
                      </div>
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {activeTab === "Settings" ? (
                <Reveal className="hidden lg:block">
                  <section className="flex flex-col rounded-[1.6rem] border border-[#dfe7dc] bg-white/78 p-4 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-5 lg:h-[calc(100vh-3rem)] lg:overflow-hidden">
                    <div className="grid flex-1 content-start gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                      <motion.article
                        whileHover={{ y: -4 }}
                        className="rounded-[1.65rem] border border-[#e1e9df] bg-[#fbfdf9] p-5 shadow-[0_16px_50px_rgba(16,21,16,0.04)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#607260]">
                              Wallet
                            </p>
                            <h3 className="mt-3 text-3xl font-medium text-[#172117]">
                              {walletAddress ? "Wallet connected" : "Connect wallet"}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-[#687668]">
                              {walletAddress
                                ? `Wallet ${formatWalletAddress(walletAddress)}`
                                : "Connect for consent records, healthy action proofs, and badge ownership."}
                            </p>
                          </div>
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ec] text-[#3a8f4d]">
                            <Wallet size={20} />
                          </div>
                        </div>
                        <div className="mt-6 grid gap-2">
                          <Button
                            onClick={connectWallet}
                            disabled={isWalletConnecting || Boolean(walletAddress)}
                            className="h-11 w-full rounded-full bg-[#101510] text-white hover:bg-[#253525] disabled:opacity-100"
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

                      <div className="rounded-[1.65rem] border border-[#e1e9df] bg-[#fbfdf9] p-5 shadow-[0_16px_50px_rgba(16,21,16,0.04)]">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#607260]">
                              Health Apps
                            </p>
                            <p className="mt-3 text-sm leading-6 text-[#687668]">
                              Choose a source, then select exactly which health signals Health Trace can read.
                            </p>
                          </div>
                          <HeartPulse className="size-6 text-[#2f7d3c]" />
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
                                    ? "border-[#101510] bg-[#101510] text-white shadow-[0_16px_44px_rgba(16,21,16,0.18)]"
                                    : "border-[#e1e9df] bg-white text-[#657265] hover:border-[#cfe0cb]"
                                }`}
                              >
                                {isConnected ? (
                                  <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-trace-green text-[#101510]">
                                    <Check size={12} strokeWidth={3} />
                                  </span>
                                ) : null}
                                <span className={`mx-auto flex size-12 items-center justify-center rounded-2xl ${isSelected ? "bg-trace-green/15 text-trace-green" : "bg-[#eef5ec] text-[#3a8f4d]"}`}>
                                  <Icon size={20} />
                                </span>
                                <span className="mt-3 block text-sm font-medium leading-tight">{app.label}</span>
                                <span className={`mt-2 block text-xs ${isSelected ? "text-white/46" : "text-[#7a867a]"}`}>
                                  {isConnected ? `${connectedCount} signals` : "Not connected"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-[1.65rem] border border-[#e1e9df] bg-[#fbfdf9] p-5 shadow-[0_16px_50px_rgba(16,21,16,0.04)] xl:col-span-2">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#607260]">
                              {selectedHealthApp} permissions
                            </p>
                            <h3 className="mt-2 text-2xl font-medium text-[#172117]">
                              {connectedHealthApps.includes(selectedHealthApp)
                                ? "Select the data you want to connect."
                                : "Connect this app to choose data."}
                            </h3>
                          </div>
                          <p className="text-sm text-[#687668]">
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
                                        ? "border-[#101510] bg-[#101510] text-white"
                                        : "border-[#dfe7dc] bg-white text-[#657265] hover:border-[#cfe0cb]"
                                    }`}
                                  >
                                    {permission}
                                    <span className={`size-3 rounded-full ${isEnabled ? "bg-trace-green" : "bg-[#dfe7dc]"}`} />
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
                          <div className="mt-5 rounded-[1.35rem] border border-[#dfe7dc] bg-white p-5">
                            <p className="text-sm leading-6 text-[#687668]">
                              {selectedHealthApp} is not connected yet. Connect to it to simulate the consent flow.
                            </p>
                            <Button
                              onClick={() => connectHealthApp(selectedHealthApp)}
                              className="mt-4 rounded-full bg-[#101510] text-white hover:bg-[#253525]"
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
                        <div key={title} className="rounded-[1.35rem] border border-[#dfe7dc] bg-[#f8fbf6] p-4">
                          <p className="text-base font-medium text-[#172117]">{title}</p>
                          <p className="mt-2 text-xs leading-5 text-[#687668]">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </Reveal>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      <AnimatePresence>
        {pendingDisconnectApp ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#101510]/45 px-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="disconnect-health-app-title"
              className="w-full max-w-md rounded-[1.75rem] border border-[#dfe7dc] bg-white p-5 shadow-[0_34px_110px_rgba(16,21,16,0.22)]"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <CircleAlert size={22} />
              </div>
              <h2 id="disconnect-health-app-title" className="mt-5 text-2xl font-medium leading-tight text-[#101510]">
                Disconnect {pendingDisconnectApp}?
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#687668]">
                Health Trace will stop reading this app&apos;s health signals and remove its selected data permissions.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setPendingDisconnectApp("")}
                  className="h-11 rounded-full bg-[#eef5ec] text-[#526152] hover:bg-[#e4eee1]"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#101510]/45 px-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="journal-check-in-title"
              className="w-full max-w-lg rounded-[1.75rem] border border-[#dfe7dc] bg-white p-5 shadow-[0_34px_110px_rgba(16,21,16,0.22)]"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef5ec] text-[#2f7d3c]">
                  <MessageCircle size={22} />
                </div>
                <button
                  type="button"
                  onClick={() => setPendingJournalCheckIn("")}
                  className="rounded-full border border-[#dfe7dc] px-3 py-1 text-xs font-medium text-[#687668] transition hover:border-[#cbd9c7] hover:text-[#101510]"
                >
                  Cancel
                </button>
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#607260]">Journal check-in</p>
              <h2 id="journal-check-in-title" className="mt-2 text-3xl font-medium leading-tight text-[#101510]">
                {pendingJournalCheckIn}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#687668]">
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
                      className="rounded-[1.25rem] border border-[#dfe7dc] bg-[#fbfdf9] p-4 text-left transition hover:border-[#101510] hover:bg-white"
                    >
                      <span className="text-xl font-medium text-[#101510]">{level}</span>
                      <span className="mt-3 block text-xs font-medium text-[#2f7d3c]">{response?.action}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 rounded-[1.25rem] border border-[#dfe7dc] bg-[#f8fbf6] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#607260]">What happens next</p>
                <p className="mt-2 text-sm leading-6 text-[#687668]">
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
