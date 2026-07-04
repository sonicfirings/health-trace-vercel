"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  ChevronDown,
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
  Stethoscope,
  SunMedium,
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

const recoveryTrend = [
  { day: "Mon", score: 84, sleep: 68, heart: 72 },
  { day: "Tue", score: 86, sleep: 72, heart: 71 },
  { day: "Wed", score: 88, sleep: 78, heart: 72 },
  { day: "Thu", score: 87, sleep: 74, heart: 74 },
  { day: "Fri", score: 90, sleep: 82, heart: 73 },
  { day: "Sat", score: 91, sleep: 86, heart: 72 },
  { day: "Today", score: 92, sleep: 88, heart: 72 },
];

const guardianEvidence = [
  {
    label: "Sleep history",
    value: "5 nights under your 7h 50m baseline",
    change: "-42 min avg",
    icon: Moon,
    chart: [82, 79, 74, 70, 66, 72, 78],
  },
  {
    label: "Heart rate trend",
    value: "Resting heart rate up 8% this week",
    change: "+5 bpm",
    icon: HeartPulse,
    chart: [66, 67, 68, 70, 72, 73, 72],
  },
  {
    label: "Supporting evidence",
    value: "Stress markers elevated for 3 consecutive days",
    change: "+18%",
    icon: Waves,
    chart: [32, 34, 38, 45, 55, 58, 52],
  },
  {
    label: "Confidence",
    value: "89% pattern confidence",
    change: "18 matched days",
    icon: ShieldCheck,
    chart: [62, 64, 70, 73, 80, 86, 89],
  },
];

const guardianActions = [
  "Move intense work after 11 AM",
  "Take a 20-minute zone 2 walk",
  "Avoid caffeine after 3 PM",
  "Start wind-down 45 minutes earlier",
];

const healthSignals = [
  {
    label: "Sleep",
    value: "7h 42m",
    detail: "+38m vs yesterday",
    tone: "text-sky-200",
    icon: Moon,
    chart: [62, 58, 64, 70, 76, 78, 82],
  },
  {
    label: "Heart Rate",
    value: "72 bpm",
    detail: "Slightly above baseline",
    tone: "text-rose-200",
    icon: HeartPulse,
    chart: [67, 68, 69, 71, 73, 72, 72],
  },
  {
    label: "Stress",
    value: "Moderate",
    detail: "Elevated for 3 days",
    tone: "text-amber-200",
    icon: Activity,
    chart: [34, 38, 42, 50, 58, 55, 52],
  },
  {
    label: "Activity",
    value: "8,241",
    detail: "steps today",
    tone: "text-trace-green",
    icon: Dumbbell,
    chart: [46, 54, 48, 62, 70, 67, 74],
  },
  {
    label: "Blood Pressure",
    value: "120/80",
    detail: "Normal range",
    tone: "text-emerald-200",
    icon: Stethoscope,
    chart: [54, 55, 56, 55, 57, 56, 56],
  },
];

const briefItems = [
  {
    status: "Good",
    title: "Sleep recovery is improving.",
    detail: "Your sleep duration and consistency moved closer to baseline.",
    color: "bg-trace-green",
  },
  {
    status: "Watch",
    title: "Resting heart rate is slightly above normal.",
    detail: "The increase is mild, but it overlaps with lower recovery signals.",
    color: "bg-amber-300",
  },
  {
    status: "Elevated",
    title: "Stress levels have increased over the past three days.",
    detail: "Calendar density and shorter wind-down windows appear connected.",
    color: "bg-rose-300",
  },
];

const insights = [
  {
    title: "Your sleep quality has steadily improved over the past week.",
    body: "This is likely contributing to your better recovery score.",
    confidence: "96%",
    evidence: "Sleep efficiency rose from 78% to 86% while nighttime interruptions decreased.",
    action: "Keep the same bedtime window for three more nights.",
    chart: [64, 66, 68, 72, 78, 83, 86],
  },
  {
    title: "Late-night screen time appears strongly associated with poorer sleep quality.",
    body: "The relationship appears on 11 of the last 14 comparable nights.",
    confidence: "91%",
    evidence: "Nights with screen use after 11 PM averaged 41 minutes less restorative sleep.",
    action: "Set a 10:30 PM screen wind-down boundary tonight.",
    chart: [78, 74, 70, 66, 62, 65, 68],
  },
  {
    title: "Your highest activity days usually begin with meetings after 9 AM.",
    body: "Lower morning pressure appears to protect movement and recovery.",
    confidence: "88%",
    evidence: "Step count is 22% higher when the first meeting starts after 9 AM.",
    action: "Protect a 30-minute movement window before the first call.",
    chart: [48, 52, 49, 61, 68, 72, 76],
  },
];

const actions = [
  { label: "Drink more water", icon: Droplets },
  { label: "Take a walk", icon: Dumbbell },
  { label: "Stretch", icon: Activity },
  { label: "Schedule a health check", icon: CalendarCheck },
  { label: "Improve sleep routine", icon: Moon },
];

const timelineEvents = [
  {
    time: "07:18",
    label: "Sleep imported",
    detail: "7h 42m sleep, recovery trend improved.",
    icon: Moon,
    status: "Improving",
  },
  {
    time: "08:06",
    label: "Resting heart rate flagged",
    detail: "72 bpm, slightly above your normal baseline.",
    icon: HeartPulse,
    status: "Watch",
  },
  {
    time: "11:30",
    label: "Stress pattern updated",
    detail: "Third elevated day linked to dense calendar load.",
    icon: Waves,
    status: "Elevated",
  },
  {
    time: "15:00",
    label: "Recommended action",
    detail: "20-minute walk scheduled to support recovery.",
    icon: Dumbbell,
    status: "Action",
  },
];

const reportMarkers = [
  { label: "LDL cholesterol", value: "142 mg/dL", status: "Above optimal" },
  { label: "Vitamin D", value: "24 ng/mL", status: "Low range" },
  { label: "HbA1c", value: "5.3%", status: "Normal" },
];

const chatPrompts = [
  "Explain this cholesterol result",
  "Why is my recovery score dropping?",
  "What should I ask my doctor?",
];

const chatMessages = [
  {
    role: "user",
    text: "Why is my recovery score dropping?",
  },
  {
    role: "assistant",
    text: "Your recovery score is being pulled down by three connected signals: shorter sleep earlier this week, resting heart rate up 8%, and stress markers elevated for three days. The pattern looks more like accumulated fatigue than an urgent signal.",
  },
  {
    role: "assistant",
    text: "A practical plan for today: keep intense work later, take a light walk, hydrate earlier, and protect bedtime. If the heart-rate trend persists, consider discussing it with a clinician.",
  },
];

type HealthTab = "Home" | "Guardian" | "Insights" | "Timeline" | "Reports" | "AI Chat" | "Actions" | "Settings";

const navigation: { label: HealthTab; icon: typeof LayoutDashboard }[] = [
  { label: "Home", icon: LayoutDashboard },
  { label: "Guardian", icon: Sparkles },
  { label: "Insights", icon: BrainCircuit },
  { label: "Timeline", icon: Clock3 },
  { label: "Reports", icon: FileText },
  { label: "AI Chat", icon: MessageCircle },
  { label: "Actions", icon: CalendarCheck },
  { label: "Settings", icon: Settings },
];

const tabDescriptions: Record<HealthTab, string> = {
  Home: "Dashboard",
  Guardian: "AI health reasoning",
  Insights: "Pattern intelligence",
  Timeline: "Health event history",
  Reports: "PDF health reports",
  "AI Chat": "Ask your graph",
  Actions: "Daily care plan",
  Settings: "Connections and permissions",
};

const connections = [
  { label: "Wallet", detail: "Connect for user-owned consent records", status: "Not connected", icon: Wallet },
  { label: "Apple Health", detail: "Sleep, workouts, heart rate, trends", status: "Ready to connect", icon: HeartPulse },
  { label: "Samsung Health", detail: "Steps, sleep, activity, body composition", status: "Ready to connect", icon: Smartphone },
  { label: "Google Fit", detail: "Activity, heart points, sessions", status: "Ready to connect", icon: Activity },
  { label: "Oura Ring", detail: "Readiness, HRV, recovery", status: "Ready to connect", icon: Watch },
  { label: "Garmin", detail: "Training, stress, body battery", status: "Ready to connect", icon: Waves },
];

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
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
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
          <linearGradient id="miniSignal" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#9DFF7A" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#9DFF7A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="#9DFF7A"
          strokeWidth={2}
          fill="url(#miniSignal)"
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function TraceHealthPage() {
  const [guardianOpen, setGuardianOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(0);
  const [activeTab, setActiveTab] = useState<HealthTab>("Home");
  const activeInsight = insights[selectedInsight];

  return (
    <main className="min-h-screen bg-[#f6f8f4] text-[#101510]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_48%_-14%,rgba(157,255,122,0.28),transparent_38rem),radial-gradient(circle_at_100%_18%,rgba(148,203,255,0.12),transparent_30rem),linear-gradient(180deg,#f8faf6,#eef3ed_48%,#f8faf7)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1520px] gap-6 px-6 py-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 flex-col rounded-[2rem] border border-[#dfe7dc] bg-white/72 p-5 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl lg:flex">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#101510] text-trace-green shadow-[0_18px_60px_rgba(16,21,16,0.18)]">
              <HeartPulse size={21} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-[#526152]">HEALTH TRACE</p>
              <p className="text-sm text-[#7b877b]">AI health guardian</p>
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
            Last sync 08:42 AM
          </div>

          <div className="mt-auto rounded-[1.5rem] border border-[#dfe7dc] bg-[#f8fbf6] p-5">
            <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-[#e9f9e4] text-[#2f7d3c]">
              <ShieldCheck size={18} />
            </div>
            <p className="text-sm font-medium text-[#172117]">Private health context</p>
            <p className="mt-2 text-sm leading-6 text-[#6d786d]">
              No wallet. No tokens. Only user-permissioned health intelligence.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 py-0">
          <Reveal className="mb-5 flex items-center justify-between lg:hidden">
            <div className="lg:hidden flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#101510] text-trace-green shadow-[0_18px_60px_rgba(16,21,16,0.18)]">
                <HeartPulse size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.22em] text-[#526152]">HEALTH TRACE</p>
                <p className="text-sm text-[#6d766d]">Personal health intelligence</p>
              </div>
            </div>
            <div className="rounded-full border border-[#d9e1d7] bg-white/70 px-4 py-2 text-sm text-[#526152] shadow-[0_18px_60px_rgba(16,21,16,0.06)] backdrop-blur-xl">
              Last sync 08:42 AM
            </div>
          </Reveal>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveTab(item.label)}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
                    isActive
                      ? "border-[#101510] bg-[#101510] text-white"
                      : "border-[#dce6d9] bg-white/72 text-[#657265]"
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? "text-trace-green" : "text-[#8a978a]"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
        {activeTab === "Home" ? (
        <div className="grid h-[calc(100vh-3rem)] grid-rows-[auto_1fr] gap-6">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Reveal className="h-full">
            <div className="h-full rounded-[2rem] border border-[#dfe7dc] bg-white/78 p-5 shadow-[0_28px_90px_rgba(16,21,16,0.08)] backdrop-blur-2xl">
              <div className="grid gap-4 lg:grid-cols-[1fr_8.5rem]">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-[#5d6b5d]">
                    <SunMedium size={16} />
                    <p className="text-sm font-medium">Good Morning, Mervyn</p>
                  </div>
                  <h1 className="max-w-xl text-[clamp(2.1rem,3.05vw,3.55rem)] font-medium leading-[0.94] tracking-normal text-[#101510]">
                    Here&apos;s your
                    <br />
                    health
                    <br />
                    summary
                  </h1>
                </div>
                <div className="mt-8 grid content-start gap-2">
                  <div className="rounded-[1.35rem] border border-[#dfe7dc] bg-[#101510] p-3 text-center text-white">
                    <p className="mb-2 text-center text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-white/38">
                      AI Health Score
                    </p>
                    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[conic-gradient(#9DFF7A_0deg,#9DFF7A_331deg,rgba(255,255,255,0.13)_331deg)] p-1.5">
                      <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#101510]">
                        <p className="text-2xl font-medium leading-none">92</p>
                        <p className="mt-1 text-[0.62rem] text-trace-green">Excellent</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.35rem] border border-[#dfe7dc] bg-[#f7faf5] p-3 text-center">
                    <p className="text-[0.68rem] text-[#6b756b]">Current state</p>
                    <p className="mt-1 text-lg font-medium leading-tight text-[#172117]">Stable recovery</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 h-40 overflow-visible rounded-[1.5rem] border border-[#e0e8dd] bg-[#fbfdf9] px-6 py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recoveryTrend} margin={{ left: 22, right: 34, top: 8, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} interval={0} minTickGap={0} padding={{ left: 12, right: 18 }} tickLine={false} tick={{ fill: "#7a867a", fontSize: 12 }} />
                    <YAxis hide domain={[60, 100]} />
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
                    <Line type="monotone" dataKey="heart" stroke="#ef8c8c" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="h-full">
            <section className="h-full rounded-[2rem] border border-[#dfe7dc] bg-white/78 p-5 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#607260]">
                Today&apos;s Health Brief
              </p>
              <div className="space-y-2.5">
                {briefItems.map((item) => (
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
                <p className="text-xs font-semibold text-[#2f7d3c]">Today&apos;s Recommendation</p>
                <p className="mt-1.5 text-sm font-medium leading-6 text-[#253525]">
                  Take a 20-minute walk this afternoon and avoid caffeine after 3 PM to improve
                  tonight&apos;s recovery.
                </p>
              </div>
            </section>
          </Reveal>
        </div>

          <Reveal delay={0.14} className="min-h-0">
            <section className="flex h-full min-h-0 flex-col rounded-[2rem] border border-[#dfe7dc] bg-white/78 p-5 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#607260]">
                    Health Signals
                  </p>
                  <h2 className="mt-1 text-2xl font-medium">Live personal baseline</h2>
                </div>
              </div>
              <div className="grid flex-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
                {healthSignals.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <motion.div
                      key={signal.label}
                      whileHover={{ y: -5, scale: 1.015 }}
                      transition={{ duration: 0.25 }}
                      className="flex h-full min-h-[13.4rem] flex-col rounded-[1.35rem] border border-[#e1e9df] bg-[#fbfdf9] p-4 shadow-[0_16px_50px_rgba(16,21,16,0.04)]"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex size-9 items-center justify-center rounded-2xl bg-[#eef5ec]">
                          <Icon className={`size-4 ${signal.tone}`} />
                        </div>
                        <TrendingUp className="size-4 text-[#9aac9a]" />
                      </div>
                      <p className="text-xs text-[#6b776b]">{signal.label}</p>
                      <p className="mt-1 text-2xl font-medium text-[#101510]">{signal.value}</p>
                      <p className="mt-1 text-xs text-[#7a867a]">{signal.detail}</p>
                      <div className="mt-auto pt-4">
                        <MiniChart data={signal.chart} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </Reveal>
        </div>
        ) : null}

        {activeTab === "Guardian" ? (
        <Reveal delay={0.12}>
          <div className="overflow-hidden rounded-[2.25rem] border border-[#cfe0cb] bg-white/88 shadow-[0_36px_120px_rgba(45,92,52,0.12)] backdrop-blur-2xl">
            <button
              type="button"
              onClick={() => setGuardianOpen((open) => !open)}
              className="relative w-full overflow-hidden p-7 text-left transition hover:bg-[#f7faf5]"
            >
              <motion.div
                aria-hidden
                className="absolute right-10 top-8 size-72 rounded-full bg-[#9DFF7A]/18 blur-3xl"
                animate={{ opacity: [0.42, 0.82, 0.42], scale: [0.9, 1.05, 0.9] }}
                transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-5xl">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#e7f8df] text-[#2f7d3c] shadow-[0_18px_50px_rgba(65,130,70,0.16)]">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4b7d4d]">
                        Health Guardian
                      </p>
                      <p className="text-sm text-[#718071]">Reasoning across sleep, heart rate, stress, and recovery</p>
                    </div>
                  </div>
                  <h2 className="text-[clamp(2rem,3.6vw,4.2rem)] font-medium leading-[0.98] tracking-normal text-[#101510]">
                    Good morning, Mervyn.
                  </h2>
                  <p className="mt-5 max-w-4xl text-xl leading-9 text-[#425042]">
                    Based on your recent trends, there&apos;s nothing urgent today. However, your
                    resting heart rate has increased by 8% over the past week while your sleep
                    quality has declined. These two changes often occur together and may indicate
                    accumulated fatigue or stress.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {["No urgent signal", "Recovery watch", "89% confidence"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#dce6d9] bg-white/72 px-4 py-2 text-sm font-medium text-[#4d5d4d]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 xl:w-80">
                  <div className="rounded-[1.5rem] border border-[#dce6d9] bg-[#101510] p-5 text-white shadow-[0_24px_70px_rgba(16,21,16,0.2)]">
                    <p className="text-sm text-white/46">Guardian readout</p>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-4xl font-medium">Low</p>
                        <p className="mt-1 text-sm text-trace-green">Risk level</p>
                      </div>
                      <div className="flex size-12 items-center justify-center rounded-full border border-trace-green/24 bg-trace-green/10 text-trace-green">
                        <ShieldCheck size={19} />
                      </div>
                    </div>
                    <div className="mt-5 h-16">
                      <MiniChart data={[72, 69, 66, 62, 68, 76, 82]} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-3 rounded-full border border-[#dce6d9] bg-white px-5 py-3 text-sm font-medium text-[#304030] shadow-[0_14px_40px_rgba(16,21,16,0.07)]">
                    Why am I seeing this?
                    <motion.span animate={{ rotate: guardianOpen ? 180 : 0 }}>
                      <ChevronDown size={16} />
                    </motion.span>
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
                  <div className="grid gap-5 p-7 xl:grid-cols-[1fr_0.74fr]">
                    <div className="rounded-[1.75rem] border border-[#e1e9df] bg-[#f8fbf6] p-5">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#607260]">
                            Evidence trail
                          </p>
                          <p className="mt-2 text-2xl font-medium text-[#172117]">
                            Four signals moved together.
                          </p>
                        </div>
                        <BrainCircuit className="size-6 text-[#3a8f4d]" />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                    {guardianEvidence.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="rounded-3xl border border-[#e1e9df] bg-white/78 p-5 shadow-[0_16px_50px_rgba(16,21,16,0.04)]">
                          <div className="mb-5 flex items-start justify-between gap-4">
                            <Icon className="size-5 text-[#3a8f4d]" />
                            <span className="rounded-full bg-[#edf6e9] px-3 py-1 text-xs font-medium text-[#477247]">
                              {item.change}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-[#5d6b5d]">{item.label}</p>
                          <p className="mt-2 min-h-12 text-base font-medium leading-6 text-[#172117]">{item.value}</p>
                          <div className="mt-4">
                            <MiniChart data={item.chart} />
                          </div>
                        </div>
                      );
                    })}
                      </div>
                    </div>
                    <div className="rounded-[1.75rem] border border-[#dce6d9] bg-[#101510] p-5 text-white">
                      <p className="text-sm font-medium text-trace-green">Recommended actions</p>
                      <p className="mt-3 text-lg leading-8 text-white/74">
                        Prioritize recovery today. These are practical adjustments, not medical
                        instructions.
                      </p>
                      <div className="mt-5 space-y-3">
                        {guardianActions.map((action, index) => (
                          <motion.div
                            key={action}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.42, delay: index * 0.06 }}
                            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white/72"
                          >
                            <span className="flex size-6 items-center justify-center rounded-full bg-trace-green text-xs font-semibold text-[#101510]">
                              {index + 1}
                            </span>
                            {action}
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-5 rounded-2xl border border-trace-green/18 bg-trace-green/10 p-4">
                        <p className="text-sm leading-6 text-white/66">
                          If elevated heart rate or fatigue persists, Health Trace would recommend
                          discussing the pattern with a clinician.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </Reveal>
        ) : null}

        {activeTab === "Timeline" ? (
        <Reveal delay={0.21} className="mt-6">
          <section className="rounded-[2rem] border border-[#dfe7dc] bg-white/78 p-7 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl">
            <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#607260]">
                  Health Timeline
                </p>
                <h2 className="mt-2 text-3xl font-medium">What Health Trace noticed today</h2>
              </div>
              <div className="rounded-full border border-[#dce6d9] bg-[#f8fbf6] px-4 py-2 text-sm text-[#647264]">
                Live context stream
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              {timelineEvents.map((event, index) => {
                const Icon = event.icon;
                return (
                  <motion.article
                    key={`${event.time}-${event.label}`}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.62, delay: 0.08 * index }}
                    className="relative rounded-3xl border border-[#e1e9df] bg-[#fbfdf9] p-5 shadow-[0_16px_50px_rgba(16,21,16,0.04)]"
                  >
                    <div className="mb-8 flex items-center justify-between">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#eef5ec] text-[#3a8f4d]">
                        <Icon size={18} />
                      </div>
                      <span className="rounded-full border border-[#dce6d9] bg-white px-3 py-1 text-xs font-medium text-[#657365]">
                        {event.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#6d786d]">{event.time}</p>
                    <h3 className="mt-2 text-xl font-medium leading-tight text-[#172117]">{event.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#687668]">{event.detail}</p>
                  </motion.article>
                );
              })}
            </div>
          </section>
        </Reveal>
        ) : null}

        {activeTab === "Reports" ? (
        <Reveal delay={0.22} className="mt-6">
          <section className="grid gap-6 rounded-[2rem] border border-[#dfe7dc] bg-white/78 p-7 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl xl:grid-cols-[0.78fr_1.22fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#607260]">
                PDF Health Report
              </p>
              <h2 className="mt-2 text-3xl font-medium leading-tight">
                Upload a blood test. Get plain English.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#667466]">
                Phase 1 prototype only. Health Trace shows how a report could be summarized,
                connected to your trends, and turned into questions for a clinician.
              </p>

              <motion.button
                type="button"
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="mt-6 flex w-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[#b8c9b4] bg-[#f8fbf6] p-8 text-center"
              >
                <FileText className="mb-4 size-8 text-[#3a8f4d]" />
                <p className="text-lg font-medium text-[#172117]">Drop blood_report.pdf here</p>
                <p className="mt-2 text-sm text-[#748174]">PDF upload interaction, frontend mock</p>
              </motion.button>
            </div>

            <div className="rounded-[1.75rem] border border-[#dfe7dc] bg-[#101510] p-6 text-white">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-trace-green">AI report explanation</p>
                  <h3 className="mt-2 text-3xl font-medium">Blood test summary</h3>
                </div>
                <Stethoscope className="size-6 text-trace-green" />
              </div>

              <p className="text-base leading-7 text-white/66">
                Your report is mostly within normal ranges. Two markers are worth discussing:
                LDL cholesterol is above optimal, and Vitamin D appears low. This is not a
                diagnosis; Health Trace would explain what these markers usually mean and prepare
                clinician questions.
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {reportMarkers.map((marker) => (
                  <div key={marker.label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/34">{marker.label}</p>
                    <p className="mt-3 text-xl font-medium">{marker.value}</p>
                    <p className="mt-2 text-sm text-trace-green/76">{marker.status}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-trace-green/18 bg-trace-green/10 p-4">
                <p className="text-sm font-medium text-trace-green">Questions to ask</p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Should I repeat this lipid panel fasting? Could lifestyle changes be enough for
                  now? Should Vitamin D be rechecked after supplementation?
                </p>
              </div>
            </div>
          </section>
        </Reveal>
        ) : null}

        {activeTab === "Insights" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.22fr_0.78fr]">
          <Reveal delay={0.22}>
            <section className="rounded-[2rem] border border-[#dfe7dc] bg-[#101510] p-7 text-white shadow-[0_34px_110px_rgba(16,21,16,0.2)]">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-trace-green/72">
                    AI Insights
                  </p>
                  <h2 className="mt-2 text-4xl font-medium">Health intelligence, explained.</h2>
                </div>
                <BrainCircuit className="size-7 text-trace-green" />
              </div>
              <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-3">
                {insights.map((insight, index) => (
                  <motion.button
                    key={insight.title}
                    type="button"
                    onClick={() => setSelectedInsight(index)}
                    whileHover={{ y: -6 }}
                    className={`w-full rounded-3xl border p-5 text-left transition ${
                      selectedInsight === index
                        ? "border-trace-green/42 bg-trace-green/[0.08] shadow-[0_24px_70px_rgba(157,255,122,0.08)]"
                        : "border-white/12 bg-white/[0.045] hover:border-white/22"
                    }`}
                  >
                    <div className="mb-7 flex items-center justify-between">
                      <p className="text-sm text-white/42">Insight</p>
                      <p className="text-lg font-medium text-trace-green">{insight.confidence}</p>
                    </div>
                    <h3 className="text-xl font-medium leading-7">{insight.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-white/50">{insight.body}</p>
                    <p className="mt-7 text-xs uppercase tracking-[0.22em] text-white/30">
                      Confidence
                    </p>
                  </motion.button>
                ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeInsight.title}
                    initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
                    transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-[1.75rem] border border-white/12 bg-white/[0.055] p-6"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-trace-green">Selected insight</p>
                        <p className="mt-1 text-2xl font-medium leading-tight">{activeInsight.confidence} confidence</p>
                      </div>
                      <div className="flex size-12 items-center justify-center rounded-full border border-trace-green/24 bg-trace-green/10 text-trace-green">
                        <Sparkles size={18} />
                      </div>
                    </div>

                    <h3 className="text-3xl font-medium leading-tight">{activeInsight.title}</h3>
                    <p className="mt-4 text-base leading-7 text-white/58">{activeInsight.evidence}</p>

                    <div className="mt-6 h-44 rounded-3xl border border-white/10 bg-black/20 p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activeInsight.chart.map((value, index) => ({ index, value }))}>
                          <defs>
                            <linearGradient id="insightGradient" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#9DFF7A" stopOpacity={0.32} />
                              <stop offset="100%" stopColor="#9DFF7A" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="index" hide />
                          <YAxis hide domain={["dataMin - 8", "dataMax + 8"]} />
                          <Tooltip
                            cursor={{ stroke: "rgba(157,255,122,0.32)", strokeDasharray: "4 6" }}
                            contentStyle={{
                              background: "#101510",
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: 16,
                              color: "#fff",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#9DFF7A"
                            strokeWidth={3}
                            fill="url(#insightGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-5 rounded-3xl border border-trace-green/18 bg-trace-green/10 p-5">
                      <p className="text-sm font-medium text-trace-green">Suggested next step</p>
                      <p className="mt-2 text-base leading-7 text-white/76">{activeInsight.action}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.26}>
            <section className="h-full rounded-[2rem] border border-[#dfe7dc] bg-white/78 p-7 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#fff2d7] text-[#9a6b12]">
                  <CircleAlert size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#866b35]">
                    Potential Risks
                  </p>
                  <p className="text-sm text-[#7b837b]">Non-diagnostic monitoring</p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-[#eadfc8] bg-[#fffaf0] p-5">
                <p className="text-sm font-medium text-[#8a6b28]">Low Risk</p>
                <h3 className="mt-3 text-3xl font-medium text-[#211a10]">Accumulated Fatigue</h3>
                <p className="mt-4 text-base leading-7 text-[#6d604b]">
                  You&apos;ve slept less than your usual average for the past four days.
                </p>
                <div className="mt-6 rounded-2xl bg-white/72 p-4">
                  <p className="text-sm font-medium text-[#6d604b]">Suggested Action</p>
                  <p className="mt-2 text-lg font-medium text-[#211a10]">
                    Aim for at least seven hours of sleep tonight.
                  </p>
                </div>
              </div>
            </section>
          </Reveal>
        </div>
        ) : null}

        {activeTab === "Actions" ? (
        <Reveal delay={0.28} className="mt-6">
          <section className="rounded-[2rem] border border-[#dfe7dc] bg-white/78 p-7 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#607260]">
                  Recommended Actions
                </p>
                <h2 className="mt-2 text-3xl font-medium">Small steps for today</h2>
              </div>
              <Button className="rounded-full bg-[#101510] text-white hover:bg-[#253525]">
                Plan my day
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    type="button"
                    whileHover={{ y: -5, scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-3xl border border-[#e1e9df] bg-[#fbfdf9] p-5 text-left shadow-[0_16px_50px_rgba(16,21,16,0.04)]"
                  >
                    <Icon className="mb-8 size-6 text-[#3a8f4d]" />
                    <p className="text-lg font-medium text-[#172117]">{action.label}</p>
                  </motion.button>
                );
              })}
            </div>
          </section>
        </Reveal>
        ) : null}

        {activeTab === "AI Chat" ? (
        <Reveal delay={0.3} className="mt-6">
          <section className="grid gap-6 rounded-[2rem] border border-[#dfe7dc] bg-white/78 p-7 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl xl:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#607260]">
                AI Chat
              </p>
              <h2 className="mt-2 text-4xl font-medium leading-tight">
                Ask about your health context.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#667466]">
                Health Trace answers with your signals, trends, and report context. It explains
                in plain language and keeps medical boundaries clear.
              </p>
              <div className="mt-6 space-y-3">
                {chatPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="flex w-full items-center justify-between rounded-2xl border border-[#dfe7dc] bg-[#f8fbf6] px-4 py-3 text-left text-sm font-medium text-[#304030] transition hover:border-[#b8c9b4] hover:bg-white"
                  >
                    {prompt}
                    <ArrowRight className="size-4 text-[#8a978a]" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#dfe7dc] bg-[#101510] p-5 text-white">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-trace-green/12 text-trace-green">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Health Trace AI</p>
                    <p className="text-xs text-white/36">Context-aware, non-diagnostic</p>
                  </div>
                </div>
                <span className="rounded-full border border-trace-green/20 bg-trace-green/10 px-3 py-1 text-xs text-trace-green">
                  Online
                </span>
              </div>

              <div className="space-y-4">
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={`${message.role}-${index}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42, delay: index * 0.08 }}
                    className={`max-w-[86%] rounded-3xl border p-4 text-sm leading-6 ${
                      message.role === "user"
                        ? "ml-auto border-trace-green/22 bg-trace-green/10 text-white"
                        : "border-white/12 bg-white/[0.045] text-white/70"
                    }`}
                  >
                    {message.text}
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.045] p-2">
                <div className="flex-1 px-4 text-sm text-white/34">
                  Ask about a result, trend, or recommendation...
                </div>
                <Button className="rounded-full bg-trace-green px-5 text-[#101510] hover:bg-white">
                  Ask
                </Button>
              </div>
            </div>
          </section>
        </Reveal>
        ) : null}

        {activeTab === "Settings" ? (
          <Reveal>
            <section className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[2rem] border border-[#dfe7dc] bg-white/78 p-5 shadow-[0_28px_90px_rgba(16,21,16,0.07)] backdrop-blur-2xl">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#607260]">
                    Settings
                  </p>
                  <h2 className="mt-1 whitespace-nowrap text-[clamp(2rem,3.15vw,3.9rem)] font-medium leading-none tracking-normal">
                    Connect your health context
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667466]">
                    Link wallets and health sources to control where Health Trace can read signals
                    from. These are frontend-only connection states for the prototype.
                  </p>
                </div>
                <div className="rounded-[1.35rem] border border-[#dce6d9] bg-[#101510] p-4 text-white xl:w-72">
                  <p className="text-sm text-white/42">Permission model</p>
                  <p className="mt-1 text-xl font-medium">User controlled</p>
                  <p className="mt-2 text-xs leading-5 text-white/54">
                    Connections are scoped, revocable, and separated from medical diagnosis.
                  </p>
                </div>
              </div>

              <div className="grid flex-1 content-start gap-3 md:grid-cols-2 xl:grid-cols-3">
                {connections.map((connection, index) => {
                  const Icon = connection.icon;
                  return (
                    <motion.article
                      key={connection.label}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="rounded-[1.35rem] border border-[#e1e9df] bg-[#fbfdf9] p-4 shadow-[0_16px_50px_rgba(16,21,16,0.04)]"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#eef5ec] text-[#3a8f4d]">
                          <Icon size={18} />
                        </div>
                        <span className="rounded-full border border-[#dce6d9] bg-white px-3 py-1 text-xs font-medium text-[#657365]">
                          {connection.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-medium text-[#172117]">{connection.label}</h3>
                      <p className="mt-2 min-h-10 text-xs leading-5 text-[#687668]">{connection.detail}</p>
                      <Button className="mt-4 h-9 w-full rounded-full bg-[#101510] text-sm text-white hover:bg-[#253525]">
                        Connect
                      </Button>
                    </motion.article>
                  );
                })}
              </div>

              <div className="mt-auto grid gap-3 pt-3 lg:grid-cols-3">
                {[
                  ["Consent log", "Review which apps accessed health context and why."],
                  ["Data boundaries", "Choose whether reports, wearables, or calendar data are visible."],
                  ["Emergency mode", "Prepare a clinician-safe summary without exposing everything."],
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
    </main>
  );
}
