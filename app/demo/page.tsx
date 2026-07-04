"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  Command,
  Dumbbell,
  Droplets,
  Gamepad2,
  GitBranch,
  HeartPulse,
  Home,
  LineChart,
  LockKeyhole,
  MessageCircle,
  Moon,
  MousePointer2,
  Plus,
  Send,
  Smartphone,
  Sparkles,
  Target,
  UserRound,
  Waves,
} from "lucide-react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Screen =
  | "Home"
  | "Capture"
  | "Behavioral Graph"
  | "AI Chat"
  | "Insights"
  | "Memory"
  | "Timeline"
  | "Profile";

type BehaviorNode = {
  name: string;
  confidence: string;
  connected: string;
  evidence: string;
  updated: string;
  icon: string;
};

const navigation: { label: Screen; icon: typeof Home }[] = [
  { label: "Home", icon: Home },
  { label: "Capture", icon: Plus },
  { label: "Behavioral Graph", icon: GitBranch },
  { label: "AI Chat", icon: MessageCircle },
  { label: "Insights", icon: LineChart },
  { label: "Memory", icon: BrainCircuit },
  { label: "Timeline", icon: Clock3 },
  { label: "Profile", icon: UserRound },
];

const patterns = [
  {
    title:
      "Coffee is strongly associated with increased evening nicotine consumption.",
    confidence: "96%",
    evidence: "127 Traces",
    impact: "Late-day regulation",
  },
  {
    title: "Sleep quality improves significantly when gaming stays below two hours.",
    confidence: "91%",
    evidence: "84 Traces",
    impact: "Recovery",
  },
  {
    title: "Exercise before focused work reduces afternoon stress markers.",
    confidence: "88%",
    evidence: "63 Traces",
    impact: "Focus stability",
  },
];

const traceEvents = [
  ["08:15", "Coffee", "Trace Created", "Morning intake logged"],
  ["09:40", "Focus", "Graph Updated", "Deep work session linked to energy"],
  ["13:05", "Stress", "Confidence Increased", "Pressure spike matched prior pattern"],
  ["18:20", "Exercise", "Pattern Reinforced", "Workout improved mood baseline"],
  ["22:10", "Gaming", "Boundary Detected", "Session stayed below two hours"],
];

const traceSources = [
  "Manual check-ins",
  "Calendar context",
  "Focus sessions",
  "Sleep import",
];

const integrations = [
  {
    name: "Apple Health",
    status: "Ready",
    detail: "Sleep, workouts, heart rate",
    icon: Smartphone,
  },
  {
    name: "Google Health Connect",
    status: "Ready",
    detail: "Sleep duration, activity, recovery",
    icon: HeartPulse,
  },
  {
    name: "Samsung Health",
    status: "Ready",
    detail: "Sleep stages, stress, exercise",
    icon: Waves,
  },
  {
    name: "Calendar",
    status: "Connected",
    detail: "Work blocks and meeting load",
    icon: CalendarDays,
  },
];

const memoryRows = [
  ["Preference", "Works best with quiet prompts and low interruption"],
  ["Recovery", "Sleep improves when caffeine ends before 2 PM"],
  ["Focus", "Morning planning increases deep work completion"],
  ["Risk", "Stress plus low sleep predicts nicotine cravings"],
];

const stats = [
  ["Graph Size", "42 behaviors", Waves],
  ["Total Traces", "2,847", MessageCircle],
  ["AI Confidence", "93%", BrainCircuit],
  ["Insights Generated", "318", Sparkles],
  ["Memory Age", "41 days", Moon],
  ["User Control", "Owned", LockKeyhole],
];

const conditionActions = [
  "Move caffeine before 2 PM to protect sleep confidence.",
  "Keep gaming below two hours and end before 11 PM.",
  "Add a short recovery block after dense meeting periods.",
];

const graphNodes: Node<BehaviorNode>[] = [
  {
    id: "coffee",
    type: "behavior",
    position: { x: 80, y: 150 },
    data: {
      name: "Coffee",
      confidence: "96%",
      connected: "Nicotine, Energy, Sleep",
      evidence: "127 Traces",
      updated: "18 min ago",
      icon: "coffee",
    },
  },
  {
    id: "sleep",
    type: "behavior",
    position: { x: 560, y: 85 },
    data: {
      name: "Sleep",
      confidence: "91%",
      connected: "Mood, Focus, Gaming",
      evidence: "84 Traces",
      updated: "2h ago",
      icon: "moon",
    },
  },
  {
    id: "stress",
    type: "behavior",
    position: { x: 560, y: 360 },
    data: {
      name: "Stress",
      confidence: "89%",
      connected: "Nicotine, Work, Sleep",
      evidence: "104 Traces",
      updated: "41 min ago",
      icon: "pulse",
    },
  },
  {
    id: "focus",
    type: "behavior",
    position: { x: 330, y: 235 },
    data: {
      name: "Focus",
      confidence: "94%",
      connected: "Work, Water, Exercise",
      evidence: "156 Traces",
      updated: "7 min ago",
      icon: "target",
    },
  },
  {
    id: "exercise",
    type: "behavior",
    position: { x: 80, y: 360 },
    data: {
      name: "Exercise",
      confidence: "88%",
      connected: "Mood, Stress, Energy",
      evidence: "63 Traces",
      updated: "3h ago",
      icon: "dumbbell",
    },
  },
  {
    id: "gaming",
    type: "behavior",
    position: { x: 330, y: 85 },
    data: {
      name: "Gaming",
      confidence: "86%",
      connected: "Sleep, Mood, Energy",
      evidence: "52 Traces",
      updated: "1h ago",
      icon: "gamepad",
    },
  },
  {
    id: "water",
    type: "behavior",
    position: { x: 80, y: 245 },
    data: {
      name: "Water",
      confidence: "82%",
      connected: "Energy, Focus",
      evidence: "44 Traces",
      updated: "4h ago",
      icon: "water",
    },
  },
];

const graphEdges: Edge[] = [
  {
    id: "coffee-focus",
    source: "coffee",
    sourceHandle: "right-source",
    target: "focus",
    targetHandle: "left-target",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,184,107,0.72)" },
    style: { stroke: "rgba(255,184,107,0.52)", strokeWidth: 1.7 },
  },
  {
    id: "water-focus",
    source: "water",
    sourceHandle: "right-source",
    target: "focus",
    targetHandle: "left-target",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(109,211,255,0.72)" },
    style: { stroke: "rgba(109,211,255,0.5)", strokeWidth: 1.7 },
  },
  {
    id: "sleep-focus",
    source: "sleep",
    sourceHandle: "bottom-source",
    target: "focus",
    targetHandle: "right-target",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(183,151,255,0.72)" },
    style: { stroke: "rgba(183,151,255,0.5)", strokeWidth: 1.7 },
  },
  {
    id: "gaming-sleep",
    source: "gaming",
    sourceHandle: "right-source",
    target: "sleep",
    targetHandle: "left-target",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,119,166,0.72)" },
    style: { stroke: "rgba(255,119,166,0.5)", strokeWidth: 1.7 },
  },
  {
    id: "exercise-focus",
    source: "exercise",
    sourceHandle: "right-source",
    target: "focus",
    targetHandle: "left-target",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(157,255,122,0.72)" },
    style: { stroke: "rgba(157,255,122,0.5)", strokeWidth: 1.7 },
  },
  {
    id: "exercise-stress",
    source: "exercise",
    sourceHandle: "right-source",
    target: "stress",
    targetHandle: "left-target",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(91,230,196,0.72)" },
    style: { stroke: "rgba(91,230,196,0.5)", strokeWidth: 1.7 },
  },
].map((edge) => ({
  ...edge,
  type: "smoothstep",
}));

const iconMap = {
  coffee: Coffee,
  moon: Moon,
  pulse: HeartPulse,
  target: Target,
  dumbbell: Dumbbell,
  gamepad: Gamepad2,
  water: Droplets,
};

function BehaviorNodeCard({ data }: NodeProps<BehaviorNode>) {
  const Icon = iconMap[data.icon as keyof typeof iconMap] ?? Waves;

  return (
    <div className="group relative">
      <Handle id="left-target" type="target" position={Position.Left} className="opacity-0" />
      <Handle id="right-target" type="target" position={Position.Right} className="opacity-0" />
      <Handle id="top-target" type="target" position={Position.Top} className="opacity-0" />
      <Handle id="bottom-target" type="target" position={Position.Bottom} className="opacity-0" />
      <div className="rounded-full border border-white/12 bg-[#101110]/95 px-4 py-3 text-white shadow-soft backdrop-blur-xl transition duration-300 group-hover:scale-105 group-hover:border-trace-green/45">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-trace-green/14 text-trace-green">
            <Icon className="size-3.5" />
          </span>
          <span className="text-sm font-medium">{data.name}</span>
        </div>
      </div>
      <Handle id="left-source" type="source" position={Position.Left} className="opacity-0" />
      <Handle id="right-source" type="source" position={Position.Right} className="opacity-0" />
      <Handle id="top-source" type="source" position={Position.Top} className="opacity-0" />
      <Handle id="bottom-source" type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      key={String(delay)}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.62, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function InsightCard({
  title,
  confidence,
  evidence,
  impact,
}: (typeof patterns)[number]) {
  return (
    <article className="min-h-[232px] rounded-[30px] border border-white/8 bg-white/[0.032] p-6 shadow-soft transition duration-300 hover:border-white/14 hover:bg-white/[0.052]">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/38">{impact}</span>
        <span className="rounded-full bg-trace-green/12 px-3 py-1 text-sm text-trace-green">
          {confidence}
        </span>
      </div>
      <h2 className="mt-8 text-xl font-medium leading-7 text-white">{title}</h2>
      <p className="mt-6 text-sm text-white/42">Evidence: {evidence}</p>
    </article>
  );
}

export default function DemoHome() {
  const [activeScreen, setActiveScreen] = useState<Screen>("Home");
  const [tracesEnabled, setTracesEnabled] = useState(false);
  const [createdTraces, setCreatedTraces] = useState<string[][]>([]);
  const [pendingChatPrompt, setPendingChatPrompt] = useState("");
  const [enabledSources, setEnabledSources] = useState<string[]>([
    "Manual check-ins",
    "Calendar context",
  ]);
  const nodeTypes = useMemo(() => ({ behavior: BehaviorNodeCard }), []);

  function toggleSource(source: string) {
    setEnabledSources((current) =>
      current.includes(source)
        ? current.filter((item) => item !== source)
        : [...current, source],
    );
  }

  function addTrace(trace: string[]) {
    setTracesEnabled(true);
    setCreatedTraces((current) => [trace, ...current].slice(0, 6));
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="trace-grid pointer-events-none fixed inset-0 opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(157,255,122,0.095),transparent_32rem)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col p-3 md:flex-row md:p-4">
        <aside className="glass z-10 flex shrink-0 flex-col rounded-[28px] p-3 md:min-h-[calc(100vh-2rem)] md:w-[284px]">
          <div className="flex items-center justify-between px-3 py-3">
            <a
              href="/"
              className="flex items-center gap-2 text-sm font-semibold tracking-[0.22em] text-white"
            >
              TRACE
            </a>
            <a
              href="/"
              aria-label="Back to landing page"
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/58 transition hover:text-white"
            >
              <ArrowLeft className="size-4" />
            </a>
          </div>

          <div className="mt-5 rounded-3xl border border-white/8 bg-black/26 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-trace-green text-black shadow-glow">
                <Command className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Personal AI</p>
                <p className="text-xs text-white/42">
                  {tracesEnabled ? "Trace capture enabled" : "Sample mode"}
                </p>
              </div>
            </div>
          </div>

          <nav className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.label;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveScreen(item.label)}
                  className={cn(
                    "flex h-11 shrink-0 items-center gap-3 rounded-full px-4 text-sm transition-all md:w-full",
                    isActive
                      ? "bg-white text-black shadow-[0_16px_44px_rgba(255,255,255,0.1)]"
                      : "text-white/52 hover:bg-white/[0.045] hover:text-white",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto hidden pt-8 md:block">
            <div className="rounded-3xl border border-white/8 bg-white/[0.025] p-4">
              <div className="flex items-center gap-2 text-sm text-white/62">
                <MousePointer2 className="size-4 text-trace-green" />
                Try it out
              </div>
              <p className="mt-3 text-xs leading-5 text-white/38">
                Enable traces, click the navigation, and hover graph nodes to
                inspect evidence.
              </p>
            </div>
          </div>
        </aside>

        <section className="relative z-10 flex min-w-0 flex-1 flex-col px-1 py-4 md:px-5 md:py-0">
          <header className="flex items-center justify-between px-2 py-3 md:px-0">
            <div className="flex items-center gap-3 text-sm text-white/46">
              <span className="hidden md:inline">{activeScreen}</span>
              <span className="hidden h-px w-8 bg-white/12 md:inline" />
              <span>Good evening</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white/58 backdrop-blur-xl">
              <span className="size-2 rounded-full bg-trace-green shadow-[0_0_18px_rgba(157,255,122,0.85)]" />
              {tracesEnabled ? "Tracing enabled" : "Sample traces"}
              <button
                type="button"
                onClick={() => setTracesEnabled((enabled) => !enabled)}
                className={cn(
                  "ml-2 rounded-full border px-3 py-1 text-xs transition",
                  tracesEnabled
                    ? "border-white/10 bg-black/30 text-white/70 hover:border-white/18 hover:text-white"
                    : "border-trace-green/30 bg-trace-green/12 text-trace-green hover:bg-trace-green/18",
                )}
              >
                {tracesEnabled ? "Pause" : "Enable"}
              </button>
            </div>
          </header>

          {activeScreen === "Home" && (
            <HomeScreen
              onOpenCapture={() => setActiveScreen("Capture")}
              onOpenChat={(prompt) => {
                setPendingChatPrompt(prompt);
                setActiveScreen("AI Chat");
              }}
              onOpenGraph={() => setActiveScreen("Behavioral Graph")}
              onOpenInsights={() => setActiveScreen("Insights")}
              tracesEnabled={tracesEnabled}
              createdTraces={createdTraces}
            />
          )}
          {activeScreen === "Capture" && (
            <CaptureScreen
              enabledSources={enabledSources}
              onToggleSource={toggleSource}
              onAddTrace={addTrace}
              onSaved={() => {
                setTracesEnabled(true);
                window.setTimeout(() => setActiveScreen("Home"), 650);
              }}
            />
          )}
          {activeScreen === "Behavioral Graph" && (
            <GraphScreen nodeTypes={nodeTypes} />
          )}
          {activeScreen === "AI Chat" && (
            <ChatScreen
              initialPrompt={pendingChatPrompt}
              onAddTrace={addTrace}
              onPromptConsumed={() => setPendingChatPrompt("")}
            />
          )}
          {activeScreen === "Insights" && <InsightsScreen />}
          {activeScreen === "Memory" && (
            <MemoryScreen tracesEnabled={tracesEnabled} />
          )}
          {activeScreen === "Timeline" && (
            <TimelineScreen
              createdTraces={createdTraces}
              tracesEnabled={tracesEnabled}
            />
          )}
          {activeScreen === "Profile" && (
            <ProfileScreen tracesEnabled={tracesEnabled} />
          )}
        </section>
      </div>
    </main>
  );
}

function HomeScreen({
  onOpenCapture,
  onOpenChat,
  onOpenGraph,
  onOpenInsights,
  tracesEnabled,
  createdTraces,
}: {
  onOpenCapture: () => void;
  onOpenChat: (prompt: string) => void;
  onOpenGraph: () => void;
  onOpenInsights: () => void;
  tracesEnabled: boolean;
  createdTraces: string[][];
}) {
  const [miniChat, setMiniChat] = useState("");

  function submitMiniChat() {
    const prompt = miniChat.trim();
    onOpenChat(prompt);
    setMiniChat("");
  }

  return (
    <>
      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Reveal className="glass relative flex min-h-[430px] overflow-hidden rounded-[36px] p-7 md:p-10 lg:min-h-[460px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(157,255,122,0.12),transparent_26rem)]" />
            <div className="relative flex w-full flex-col">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/24 px-3.5 py-2 text-sm text-white/58">
                <Sparkles className="size-4 text-trace-green" />
                {tracesEnabled
                  ? "Live simulated traces are flowing"
                  : "Sample traces are loaded for the prototype"}
              </div>
              <h1 className="text-balance text-5xl font-medium leading-[1.02] text-white md:text-7xl">
                Good evening.
                <span className="mt-3 block text-white/52">
                  {tracesEnabled
                    ? "I'm learning from approved signals."
                    : "Trace capture is paused."}
                </span>
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-white/56">
                {tracesEnabled
                  ? "I've captured a new trace and updated your Behavioral Graph."
                  : "The graph below is mock data. Use Enable at top right to simulate how behavioral memory would start with your consent."}
              </p>
              <div className="mt-auto pt-10">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" variant="secondary" onClick={onOpenCapture}>
                    Add Trace <Plus className="size-4" />
                  </Button>
                  <Button size="lg" onClick={onOpenInsights}>
                    Explore Patterns <Sparkles className="size-4" />
                  </Button>
                  <Button size="lg" variant="secondary" onClick={onOpenGraph}>
                    Open Behavioral Graph <GitBranch className="size-4" />
                  </Button>
                </div>

                <div className="mt-8 rounded-[28px] border border-white/10 bg-black/28 p-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      className="min-h-[52px] flex-1 rounded-full border border-white/8 bg-white/[0.035] px-5 text-white outline-none placeholder:text-white/30 focus:border-trace-green/35"
                      onChange={(event) => setMiniChat(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") submitMiniChat();
                      }}
                      placeholder="Ask Trace or log something..."
                      value={miniChat}
                    />
                    <Button size="lg" onClick={submitMiniChat}>
                      Open Chat <Send className="size-4" />
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </Reveal>
          <ProfileStats compact />
        </div>

        <SideRail
          createdTraces={createdTraces}
          onOpenGraph={onOpenGraph}
          tracesEnabled={tracesEnabled}
        />
      </div>
    </>
  );
}

function CaptureScreen({
  enabledSources,
  onToggleSource,
  onAddTrace,
  onSaved,
}: {
  enabledSources: string[];
  onToggleSource: (source: string) => void;
  onAddTrace: (trace: string[]) => void;
  onSaved: () => void;
}) {
  const [coffeeType, setCoffeeType] = useState("Latte");
  const [coffeeSize, setCoffeeSize] = useState("Medium");
  const [sleepHours, setSleepHours] = useState("6.5");
  const [context, setContext] = useState("Before focused work");
  const [saved, setSaved] = useState(false);

  function submitTrace() {
    setSaved(true);
    onAddTrace([
      "Now",
      "Coffee",
      "Manual Trace Created",
      `${coffeeSize} ${coffeeType.toLowerCase()} logged after ${sleepHours}h sleep`,
    ]);
    onSaved();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
      <Reveal className="glass rounded-[36px] p-7 md:p-10">
        <p className="text-sm uppercase tracking-[0.2em] text-trace-green/70">
          Capture Trace
        </p>
        <h1 className="mt-4 max-w-4xl text-balance text-4xl font-medium leading-tight text-white md:text-6xl">
          Turn a real moment into behavioral memory.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/52">
          This is the product layer: the user can add context manually, while
          approved sources fill in sleep, activity and schedule signals.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Field label="What happened?">
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/24 p-4">
              <Coffee className="size-5 text-trace-green" />
              <span className="font-medium text-white">I had coffee today</span>
            </div>
          </Field>

          <Field label="Coffee type">
            <Segmented
              options={["Espresso", "Latte", "Cold brew", "Energy drink"]}
              value={coffeeType}
              onChange={setCoffeeType}
            />
          </Field>

          <Field label="Size">
            <Segmented
              options={["Small", "Medium", "Large"]}
              value={coffeeSize}
              onChange={setCoffeeSize}
            />
          </Field>

          <Field label="Sleep last night">
            <div className="rounded-2xl border border-white/8 bg-black/24 p-4">
              <div className="flex items-center justify-between">
                <span className="text-white/52">Hours slept</span>
                <span className="text-2xl font-medium text-white">
                  {sleepHours}h
                </span>
              </div>
              <input
                aria-label="Sleep hours"
                className="mt-5 w-full accent-[#9DFF7A]"
                max="10"
                min="3"
                onChange={(event) => setSleepHours(event.target.value)}
                step="0.5"
                type="range"
                value={sleepHours}
              />
            </div>
          </Field>

          <Field label="Context">
            <Segmented
              options={["Before focused work", "After lunch", "Late evening"]}
              value={context}
              onChange={setContext}
            />
          </Field>

          <Field label="Graph preview">
            <div className="rounded-2xl border border-trace-green/20 bg-trace-green/8 p-4">
              <p className="text-sm text-white/48">This will strengthen</p>
              <p className="mt-2 text-lg font-medium text-white">
                Coffee {"->"} Energy {"->"} Focus
              </p>
              <p className="mt-3 text-sm leading-6 text-white/42">
                Trace will compare this against sleep and later stress signals.
              </p>
            </div>
          </Field>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" disabled={saved} onClick={submitTrace}>
            {saved ? "Saved" : "Save Trace"} <Check className="size-4" />
          </Button>
          {saved && (
            <div className="flex items-center gap-2 rounded-full border border-trace-green/20 bg-trace-green/10 px-4 py-3 text-sm text-trace-green">
              <Check className="size-4" />
              Trace saved and graph updated
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.08} className="rounded-[36px] border border-white/8 bg-white/[0.032] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/42">Approved sources</p>
            <h2 className="mt-1 text-2xl font-medium text-white">
              Connect signal layers
            </h2>
          </div>
          <LockKeyhole className="size-5 text-trace-green" />
        </div>

        <div className="mt-6 space-y-3">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const active =
              enabledSources.includes("Sleep import") &&
              integration.name !== "Calendar";

            return (
              <div
                key={integration.name}
                className="rounded-2xl border border-white/8 bg-black/22 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-white/[0.045] text-trace-green">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{integration.name}</p>
                    <p className="mt-1 text-sm text-white/40">
                      {integration.detail}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs",
                      active || integration.status === "Connected"
                        ? "bg-trace-green/12 text-trace-green"
                        : "bg-white/[0.04] text-white/42",
                    )}
                  >
                    {active || integration.status === "Connected"
                      ? "Connected"
                      : "Ready"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3">
          {traceSources.map((source) => {
            const active = enabledSources.includes(source);

            return (
              <button
                key={source}
                type="button"
                onClick={() => onToggleSource(source)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition",
                  active
                    ? "border-trace-green/36 bg-trace-green/10 text-white"
                    : "border-white/8 bg-white/[0.025] text-white/42",
                )}
              >
                {source}
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border",
                    active
                      ? "border-trace-green bg-trace-green text-black"
                      : "border-white/12",
                  )}
                >
                  {active && <Check className="size-3" />}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}

function ChatScreen({
  initialPrompt,
  onAddTrace,
  onPromptConsumed,
}: {
  initialPrompt: string;
  onAddTrace: (trace: string[]) => void;
  onPromptConsumed: () => void;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Ask me about your graph, or tell me something to log. For example: I had a double espresso at 2 PM.",
    },
  ]);
  const [replyCount, setReplyCount] = useState(0);

  useEffect(() => {
    if (!initialPrompt) return;
    setInput(initialPrompt);
    onPromptConsumed();
  }, [initialPrompt, onPromptConsumed]);

  function getTraceReply(message: string) {
    const lower = message.toLowerCase();
    const isGreeting = /^(hi|hello|hey|yo|gm|good evening|good morning)[\s!.]*$/.test(lower);
    const logsCoffee = ["coffee", "espresso", "latte", "cappuccino", "americano"].some((term) =>
      lower.includes(term),
    );
    const logsSleep = lower.includes("slept") || lower.includes("sleep") || lower.includes("hours");
    const logsGaming = lower.includes("gaming") || lower.includes("played") || lower.includes("game");
    const logsExercise = lower.includes("exercise") || lower.includes("workout") || lower.includes("run");
    const logsWater = lower.includes("water") || lower.includes("hydrated");
    const asksWeek = lower.includes("changed this week") || lower.includes("this week");
    const asksGamingSleep = lower.includes("gaming") && lower.includes("sleep");
    const asksFocus = lower.includes("focus") || lower.includes("productive") || lower.includes("deep work");
    const asksWhy = lower.includes("why") || lower.includes("explain") || lower.includes("what happened");
    const asksStress = lower.includes("stress") || lower.includes("anxious") || lower.includes("pressure");
    const asksToday = [
      "today",
      "how am i doing",
      "how do i look",
      "right now",
      "currently",
    ].some((term) => lower.includes(term));
    const asksRecommendation = [
      "recommend",
      "suggest",
      "advice",
      "what should i do",
    ].some((term) => lower.includes(term));
    const asksHelp = [
      "help",
      "help me",
      "what can you do",
      "how do i use",
      "guide me",
    ].some((term) => lower.includes(term));
    const asksImprove = [
      "improve",
      "better",
      "what can i do",
      "optimize",
      "fix",
      "plan",
    ].some((term) => lower.includes(term));
    const asksCondition = [
      "condition",
      "state",
      "how am i doing",
      "readout",
      "status",
      "health",
      "recovery",
    ].some((term) => lower.includes(term));

    if (isGreeting) {
      return {
        text: "Hey. I can read your Behavioral Graph, explain patterns, or turn what you tell me into a new Trace. Try: \"Why was my focus lower today?\" or \"I slept 6 hours last night.\"",
        trace: null,
      };
    }

    if (logsCoffee) {
      return {
        text: "Logged a Coffee trace. I linked it to Energy, Focus, and Sleep risk because late caffeine has been one of your stronger recurring signals. I will watch whether tonight's sleep changes the confidence score.",
        trace: ["Now", "Coffee", "Chat Trace Created", "Caffeine logged from AI chat"],
      };
    }

    if (logsSleep && !asksWhy) {
      const hours = message.match(/\d+(\.\d+)?/)?.[0] ?? "sleep";
      return {
        text: `Logged a Sleep trace for ${hours} hours. This updates Recovery and Focus predictions, especially for your afternoon work window where sleep below baseline usually lowers confidence.`,
        trace: ["Now", "Sleep", "Chat Trace Created", "Sleep duration logged from AI chat"],
      };
    }

    if (logsGaming && !asksGamingSleep) {
      return {
        text: "Logged a Gaming trace. I will compare duration and end time against Sleep and Mood, because your graph shows the threshold matters more than gaming itself.",
        trace: ["Now", "Gaming", "Chat Trace Created", "Gaming behavior logged from AI chat"],
      };
    }

    if (logsExercise) {
      return {
        text: "Logged an Exercise trace. This strengthens the Exercise to Stress Recovery relationship and may raise tomorrow morning focus confidence if sleep holds steady.",
        trace: ["Now", "Exercise", "Chat Trace Created", "Exercise logged from AI chat"],
      };
    }

    if (logsWater) {
      return {
        text: "Logged a Water trace. I linked it to Energy and Focus. Hydration is still a lower-confidence signal, but it becomes useful when paired with sleep and caffeine timing.",
        trace: ["Now", "Water", "Chat Trace Created", "Hydration logged from AI chat"],
      };
    }

    if (asksHelp && !asksImprove && !asksRecommendation) {
      return {
        text: "I can do three things in this demo: explain your Behavioral Graph, recommend the next experiment, or log a new Trace from plain language. Try asking \"why was focus lower today?\", \"what should I improve first?\", or tell me \"I slept 6 hours last night.\"",
        trace: null,
      };
    }

    if (asksWeek) {
      return {
        text: "Three things changed this week: caffeine moved later by about 90 minutes, gaming stayed under two hours on more nights, and exercise appeared before focused work twice. The strongest new signal is that sleep quality improved when gaming ended earlier.",
        trace: null,
      };
    }

    if (asksToday) {
      return {
        text: "Today you look focus-capable, but recovery-sensitive. The graph is positive for morning focus, neutral on energy, and cautious on sleep recovery. I would avoid late caffeine and keep the evening low-stimulation so tomorrow's focus does not borrow from tonight's recovery.",
        trace: null,
      };
    }

    if (asksCondition) {
      return {
        text: "Your current condition is not \"bad\"; it is uneven. Focus is still available, but recovery is fragile. The evidence comes from three connected signals: sleep below baseline, caffeine timing drifting later, and stress rising after dense work blocks.",
        trace: null,
      };
    }

    if (asksRecommendation) {
      return {
        text: "My strongest recommendation is a three-night recovery experiment: caffeine before 2 PM, gaming under two hours, and a 10-minute decompression block after meetings. If Sleep and Focus confidence both rise, Trace will promote that into a stronger personal rule.",
        trace: null,
      };
    }

    if (asksImprove) {
      return {
        text: replyCount > 1
          ? "The next improvement is not adding more habits; it is reducing noise. Pick one lever for 72 hours: caffeine cutoff, sleep window, or post-work recovery. Based on your graph, I would start with caffeine timing because it touches Energy, Sleep and Focus at once."
          : "To improve, start with the lever that affects the most connected nodes: caffeine timing. Move caffeine before 2 PM for three days, keep gaming below two hours, and add a short recovery block after dense meetings. Then compare Sleep, Focus and Stress confidence.",
        trace: null,
      };
    }

    if (asksGamingSleep) {
      return {
        text: "Yes. The graph shows gaming affects sleep mostly through timing and duration. Sessions under two hours have weak impact, but sessions ending after 11 PM are associated with lower sleep quality the next morning.",
        trace: null,
      };
    }

    if (asksFocus) {
      return {
        text: "Today's focus dipped for two likely reasons: sleep was below your baseline and meeting load was higher than usual. Coffee improved morning energy, but after 3 PM the graph weights Sleep and Workload more heavily than caffeine.",
        trace: null,
      };
    }

    if (asksStress) {
      return {
        text: "Your stress pattern is most sensitive to low sleep plus dense work blocks. Exercise has been the strongest recovery behavior, especially when it happens before the evening transition.",
        trace: null,
      };
    }

    return {
      text: "I read your graph as focus-ready but recovery-sensitive. The clearest next step is to protect sleep tonight: caffeine before 2 PM, gaming under two hours, and a short recovery block after work. You can also tell me what happened today and I will log it as a Trace.",
      trace: null,
    };
  }

  function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const reply = getTraceReply(trimmed);

    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
      { role: "ai", text: reply.text },
    ]);

    if (reply.trace) {
      onAddTrace(reply.trace);
    }

    setReplyCount((count) => count + 1);
    setInput("");
  }

  return (
    <div className="grid min-h-[calc(100vh-7rem)] gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Reveal className="glass flex min-h-[680px] flex-col rounded-[36px] p-5 md:p-7">
        <div className="border-b border-white/8 pb-5">
          <p className="text-sm uppercase tracking-[0.2em] text-trace-green/70">
            AI Chat
          </p>
          <h1 className="mt-3 text-4xl font-medium text-white md:text-6xl">
            Chat with the graph.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/48">
            This is not a generic assistant. It can read behavioral memory and
            create new traces from conversation.
          </p>
        </div>

        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto py-6">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "max-w-[82%] rounded-[26px] border p-4 text-base leading-7",
                message.role === "ai"
                  ? "border-white/8 bg-white/[0.04] text-white/68"
                  : "ml-auto border-trace-green/20 bg-trace-green/12 text-white",
              )}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/32 p-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="min-h-[52px] flex-1 rounded-full border border-white/8 bg-white/[0.035] px-5 text-white outline-none placeholder:text-white/28 focus:border-trace-green/35"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              placeholder="Ask or log a trace..."
              value={input}
            />
            <Button size="lg" onClick={() => sendMessage()}>
              Send <Send className="size-4" />
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08} className="rounded-[36px] border border-white/8 bg-white/[0.032] p-6">
        <h2 className="text-2xl font-medium text-white">Try prompts</h2>
        <div className="mt-5 space-y-3">
          {[
            "What can I do to improve?",
            "How am I doing today?",
            "I had a double espresso at 2 PM",
            "Did gaming affect my sleep recently?",
            "What changed this week?",
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="w-full rounded-2xl border border-white/8 bg-black/22 p-4 text-left text-sm leading-6 text-white/62 transition hover:border-trace-green/25 hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm text-white/42">{label}</span>
      {children}
    </label>
  );
}

function Segmented({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-white/8 bg-black/24 p-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full px-3.5 py-2 text-sm transition",
            value === option
              ? "bg-white text-black"
              : "text-white/46 hover:bg-white/[0.05] hover:text-white",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function GraphScreen({
  nodeTypes,
}: {
  nodeTypes: NodeTypes;
}) {
  const [hoveredBehavior, setHoveredBehavior] = useState<BehaviorNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const graphContainerRef = useRef<HTMLDivElement | null>(null);

  function moveTooltip(event: React.MouseEvent) {
    const graphBounds = graphContainerRef.current?.getBoundingClientRect();
    if (!graphBounds) return;

    const x = event.clientX - graphBounds.left + 14;
    const y = event.clientY - graphBounds.top + 14;
    const maxX = Math.max(16, graphBounds.width - 292);
    const maxY = Math.max(16, graphBounds.height - 176);

    setTooltipPosition({
      x: Math.min(Math.max(x, 16), maxX),
      y: Math.min(Math.max(y, 16), maxY),
    });
  }

  return (
    <Reveal className="glass relative overflow-hidden rounded-[36px] p-5 md:p-7">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-trace-green/70">
            Behavioral Graph
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-medium leading-tight text-white md:text-5xl">
            A living map of what shapes your behavior.
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-white/46">
          Hover any node for evidence. The graph stays quiet until a
          relationship has enough traces to matter.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div
          ref={graphContainerRef}
          className="trace-flow relative h-[600px] overflow-hidden rounded-[30px] border border-white/8 bg-black/28"
        >
          <ReactFlow
            nodes={graphNodes}
            edges={graphEdges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.65}
            maxZoom={1.05}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            panOnDrag={false}
            onNodeMouseEnter={(event, node) => {
              setHoveredBehavior(node.data);
              moveTooltip(event);
            }}
            onNodeMouseMove={(event) => moveTooltip(event)}
            onNodeMouseLeave={() => setHoveredBehavior(null)}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="rgba(255,255,255,0.055)" gap={36} />
          </ReactFlow>

          {hoveredBehavior && (
            <div
              className="pointer-events-none absolute z-30 w-[274px] rounded-2xl border border-white/18 bg-[#090909] p-4 shadow-soft"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
              }}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{hoveredBehavior.name}</p>
                <p className="text-sm text-trace-green">
                  {hoveredBehavior.confidence}
                </p>
              </div>
              <div className="mt-3 space-y-2 text-xs leading-5 text-white/50">
                <p>Connected: {hoveredBehavior.connected}</p>
                <p>Evidence: {hoveredBehavior.evidence}</p>
                <p>Last updated: {hoveredBehavior.updated}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-trace-green/18 bg-trace-green/[0.05] p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-trace-green/70">
              Primary insight
            </p>
            <h2 className="mt-4 text-2xl font-medium leading-tight text-white">
              Focus is the central behavior today.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/52">
              Coffee, water, sleep and exercise are all pushing on Focus.
              Gaming is only shown because it crosses the sleep threshold.
            </p>
          </div>

          {[
            ["Coffee -> Focus", "Morning lift", "96%", "bg-[#ffb86b]", "text-[#ffb86b]"],
            ["Gaming -> Sleep", "Threshold risk", "86%", "bg-[#ff77a6]", "text-[#ff77a6]"],
            ["Exercise -> Stress", "Downshift signal", "88%", "bg-[#5be6c4]", "text-[#5be6c4]"],
          ].map(([path, meaning, confidence, dotColor, textColor]) => (
            <div
              key={path}
              className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", dotColor)} />
                  <p className="font-medium text-white">{path}</p>
                </div>
                <p className={cn("text-sm", textColor)}>{confidence}</p>
              </div>
              <p className="mt-2 text-sm text-white/42">{meaning}</p>
            </div>
          ))}

          <div className="rounded-[24px] border border-white/8 bg-black/24 p-4">
            <p className="text-sm text-white/40">Graph rule</p>
            <p className="mt-2 text-sm leading-6 text-white/58">
              Trace hides weak relationships. More traces make a connection
              brighter, not noisier.
            </p>
          </div>
        </div>
      </div>

    </Reveal>
  );
}

function InsightsScreen() {
  return (
    <div className="space-y-4">
      <Reveal className="glass rounded-[36px] p-7 md:p-10">
        <p className="text-sm uppercase tracking-[0.2em] text-trace-green/70">
          Insights
        </p>
        <h1 className="mt-4 max-w-4xl text-balance text-4xl font-medium leading-tight text-white md:text-6xl">
          What Trace has learned from your behavior.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/52">
          Insights are not logs. They are evidence-backed interpretations the
          AI can use before it answers you.
        </p>
      </Reveal>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Reveal className="rounded-[34px] border border-trace-green/18 bg-trace-green/[0.055] p-7 md:p-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-trace-green/70">
                Current readout
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-medium leading-tight text-white md:text-6xl">
                Focus-ready. Recovery fragile.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/56">
                Your graph suggests you can still do focused work, but recovery
                is sensitive today because sleep, late stimulation and workload
                are pulling in different directions.
              </p>
            </div>
            <div className="grid min-w-[180px] gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
                <p className="text-sm text-white/42">AI confidence</p>
                <p className="mt-2 text-4xl font-medium text-trace-green">87%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
                <p className="text-sm text-white/42">Based on</p>
                <p className="mt-2 text-2xl font-medium text-white">274 traces</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              ["Main driver", "Sleep below baseline"],
              ["Risk window", "After 3 PM"],
              ["Best lever", "Move caffeine earlier"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/8 bg-black/22 p-4"
              >
                <p className="text-xs text-white/38">{label}</p>
                <p className="mt-2 text-base font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08} className="rounded-[34px] border border-white/8 bg-white/[0.032] p-6">
          <h2 className="text-2xl font-medium text-white">What changed</h2>
          <div className="mt-5 space-y-3">
            {[
              ["Caffeine drifted later", "+90 min"],
              ["Gaming stayed bounded", "3 nights"],
              ["Exercise preceded focus", "2 sessions"],
              ["Sleep confidence softened", "-6%"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/22 p-4"
              >
                <span className="text-sm text-white/58">{label}</span>
                <span className="text-sm text-trace-green">{value}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            icon: Coffee,
            label: "Pattern",
            title: "Late caffeine is the strongest sleep-risk signal.",
            detail: "Coffee after 2 PM is repeatedly followed by lower recovery confidence.",
            metric: "96%",
          },
          {
            icon: Gamepad2,
            label: "Threshold",
            title: "Gaming is fine below two hours.",
            detail: "Duration matters more than the category. Ending before 11 PM is the cleaner signal.",
            metric: "91%",
          },
          {
            icon: Dumbbell,
            label: "Counter-signal",
            title: "Exercise protects the afternoon stress window.",
            detail: "Short movement before focused work reduces stress markers later in the day.",
            metric: "88%",
          },
        ].map((insight, index) => {
          const Icon = insight.icon;

          return (
            <Reveal key={insight.title} delay={index * 0.08}>
              <div className="h-full rounded-[30px] border border-white/8 bg-white/[0.028] p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full bg-white/[0.045] text-trace-green">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm text-trace-green">{insight.metric}</span>
                </div>
                <p className="mt-6 text-sm text-white/38">{insight.label}</p>
                <h3 className="mt-3 text-2xl font-medium leading-tight text-white">
                  {insight.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/50">
                  {insight.detail}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1fr]">
        <Reveal className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-trace-green/70">
              Next experiment
            </p>
            <h2 className="mt-4 text-3xl font-medium leading-tight text-white">
              Protect sleep for three nights.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/52">
              Move caffeine before 2 PM and keep gaming below two hours. Trace
              will compare Focus, Sleep and Stress confidence against your
              current baseline.
            </p>
          </Reveal>

        <Reveal delay={0.08} className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-medium text-white">Suggested actions</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {conditionActions.map((action) => (
              <div
              key={action}
              className="rounded-2xl border border-white/8 bg-black/22 p-4 text-sm leading-6 text-white/62"
              >
                {action}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function MemoryScreen({ tracesEnabled }: { tracesEnabled: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
      <Reveal className="glass rounded-[36px] p-7 md:p-10">
        <p className="text-sm uppercase tracking-[0.2em] text-trace-green/70">
          Memory
        </p>
        <h1 className="mt-4 text-4xl font-medium leading-tight text-white md:text-6xl">
          {tracesEnabled
            ? "Behavioral memory is being shaped by approved signals."
            : "Behavioral memory needs permission before it compounds."}
        </h1>
        <div className="mt-10 space-y-3">
          {memoryRows.map(([type, value]) => (
            <div
              key={type}
              className="grid gap-3 rounded-2xl border border-white/8 bg-black/24 p-4 md:grid-cols-[140px_1fr]"
            >
              <p className="text-sm text-trace-green/75">{type}</p>
              <p className="text-white/62">{value}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.08} className="rounded-[36px] border border-white/8 bg-white/[0.032] p-7">
        <LockKeyhole className="size-6 text-trace-green" />
        <h2 className="mt-5 text-3xl font-medium text-white">
          User-owned by default.
        </h2>
        <p className="mt-5 text-base leading-7 text-white/52">
          The demo still uses mock data, but this is the intended model:
          traces only begin after the user chooses what signals are allowed.
        </p>
      </Reveal>
    </div>
  );
}

function TimelineScreen({
  createdTraces,
  tracesEnabled,
}: {
  createdTraces: string[][];
  tracesEnabled: boolean;
}) {
  const events = createdTraces.length > 0
    ? [...createdTraces, ...traceEvents]
    : tracesEnabled
      ? []
      : traceEvents;

  return (
    <Reveal className="glass rounded-[36px] p-7 md:p-10">
      <p className="text-sm uppercase tracking-[0.2em] text-trace-green/70">
        Timeline
      </p>
      <h1 className="mt-4 text-4xl font-medium text-white md:text-6xl">
        {tracesEnabled
          ? "Approved behavior is now creating Traces."
          : "Sample Traces show how the timeline will work."}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-white/48">
        {tracesEnabled
          ? "This is live simulated capture for the prototype, not real tracking."
          : "Nothing real is being captured yet. Use Enable in the top-right status control to simulate consent."}
      </p>
      <div className="mt-10 space-y-4">
        {events.length > 0 ? (
          events.map(([time, behavior, state, detail]) => (
            <div key={`${time}-${behavior}`} className="grid gap-4 md:grid-cols-[96px_1fr]">
              <p className="pt-5 text-sm text-white/36">{time}</p>
              <div className="rounded-[26px] border border-white/8 bg-black/22 p-5">
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-trace-green" />
                  <p className="text-lg font-medium text-white">{behavior}</p>
                  <span className="text-white/24">/</span>
                  <p className="text-sm text-trace-green/75">{state}</p>
                </div>
                <p className="mt-3 text-white/46">{detail}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border border-white/8 bg-black/24 p-6">
            <p className="text-lg font-medium text-white">No live traces yet.</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/46">
              Save a manual trace or tell the AI chat something to log. New
              behavioral events will appear here as they update the graph.
            </p>
          </div>
        )}
      </div>
    </Reveal>
  );
}

function ProfileScreen({ tracesEnabled }: { tracesEnabled: boolean }) {
  return (
    <div className="space-y-4">
      <Reveal className="glass rounded-[36px] p-7 md:p-10">
        <p className="text-sm uppercase tracking-[0.2em] text-trace-green/70">
          Profile
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-medium leading-tight text-white md:text-6xl">
          {tracesEnabled
            ? "A personal AI profile built from allowed behavior."
            : "A personal AI profile starts only after consent."}
        </h1>
      </Reveal>
      <ProfileStats />
    </div>
  );
}

function SideRail({
  createdTraces,
  onOpenGraph,
  tracesEnabled,
}: {
  createdTraces: string[][];
  onOpenGraph: () => void;
  tracesEnabled: boolean;
}) {
  const railEvents = createdTraces.length > 0
    ? [...createdTraces, ...traceEvents].slice(0, 4)
    : tracesEnabled
      ? []
      : traceEvents.slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      <Reveal delay={0.12} className="glass rounded-[36px] p-6">
        <button
          type="button"
          onClick={onOpenGraph}
          className="w-full text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/42">Behavioral Graph</p>
              <h2 className="mt-1 text-2xl font-medium text-white">
                Live map preview
              </h2>
            </div>
            <span className="flex size-10 items-center justify-center rounded-full border border-trace-green/20 bg-trace-green/10 text-trace-green">
              <GitBranch className="size-5" />
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-black/24 p-4">
              <p className="text-xs text-white/38">Active behaviors</p>
              <p className="mt-2 text-3xl font-medium text-white">11</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/24 p-4">
              <p className="text-xs text-white/38">Strengthened today</p>
              <p className="mt-2 text-3xl font-medium text-trace-green">
                {createdTraces.length || 3}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {[
              ["Coffee", "Focus", "94%"],
              ["Sleep", "Recovery", "91%"],
              ["Exercise", "Stress", "88%"],
            ].map(([source, target, confidence]) => (
              <div
                key={`${source}-${target}`}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/22 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-2 text-sm text-white">
                  <span className="size-2 rounded-full bg-trace-green" />
                  <span>{source}</span>
                  <span className="text-white/24">{"->"}</span>
                  <span>{target}</span>
                </div>
                <span className="text-xs text-trace-green">{confidence}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-5 text-white/38">
            Click to inspect evidence, confidence, and connected behaviors.
          </p>
        </button>
      </Reveal>

      <Reveal
        delay={0.16}
        className="rounded-[36px] border border-trace-green/16 bg-trace-green/[0.045] p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/42">AI readout</p>
            <h2 className="mt-1 text-2xl font-medium text-white">
              Recovery fragile
            </h2>
          </div>
          <BrainCircuit className="size-5 text-trace-green" />
        </div>
        <p className="mt-4 text-sm leading-6 text-white/52">
          Your graph reads as focus-ready, but sleep and late stimulation are
          pulling recovery below baseline.
        </p>
        <div className="mt-5 space-y-2">
          {conditionActions.slice(0, 2).map((action) => (
            <div
              key={action}
              className="rounded-2xl border border-white/8 bg-black/22 p-3 text-xs leading-5 text-white/58"
            >
              {action}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal
        delay={0.18}
        className="rounded-[36px] border border-white/8 bg-white/[0.032] p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/42">Today&apos;s timeline</p>
            <h2 className="mt-1 text-2xl font-medium text-white">
              {createdTraces.length > 0
                ? "Latest traces"
                : tracesEnabled
                  ? "Ready to update"
                  : "Sample preview"}
            </h2>
          </div>
          <Activity className="size-5 text-trace-green" />
        </div>
        <p className="mt-4 text-sm leading-6 text-white/42">
          {createdTraces.length > 0
            ? "These update when you save traces or log behavior through chat."
            : tracesEnabled
              ? "No live traces have been created yet."
              : "Preview data only. It becomes live after you create a trace."}
        </p>
        <div className="mt-6 space-y-4">
          {railEvents.length > 0 ? (
            railEvents.map(([time, behavior, state], index) => (
              <div key={`${time}-${behavior}-${index}`} className="flex gap-4">
                <p className="w-12 pt-1 text-sm text-white/36">{time}</p>
                <div className="relative flex flex-1 gap-3 rounded-2xl border border-white/7 bg-black/20 p-3">
                  <span className="mt-1 size-2 rounded-full bg-trace-green" />
                  <div>
                    <p className="text-sm font-medium text-white">{behavior}</p>
                    <p className="mt-1 text-xs text-white/38">{state}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/8 bg-black/22 p-4 text-sm leading-6 text-white/48">
              Waiting for your first approved trace.
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

function ProfileStats({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("mt-4 grid gap-4", compact ? "md:grid-cols-4" : "md:grid-cols-3")}>
      {stats.slice(0, compact ? 4 : stats.length).map(([label, value, Icon], index) => (
        <Reveal key={label as string} delay={0.05 * index}>
          <div className="rounded-[26px] border border-white/8 bg-white/[0.028] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/38">{label as string}</p>
              <Icon className="size-4 text-trace-green/75" />
            </div>
            <p className="mt-5 text-2xl font-medium text-white">
              {value as string}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
