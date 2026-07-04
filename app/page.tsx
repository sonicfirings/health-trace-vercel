"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Bot,
  CalendarDays,
  CheckCircle2,
  Code2,
  Clock3,
  CircleDot,
  FolderKanban,
  Github,
  HeartPulse,
  LockKeyhole,
  MessageSquare,
  MousePointer2,
  Moon,
  MousePointerClick,
  Music2,
  Sparkles,
  Smartphone,
  Target,
  UsersRound,
  XCircle,
} from "lucide-react";
import ReactFlow, {
  Background,
  Handle,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

type Phase = "typing-zero" | "hold-zero" | "deleting-zero" | "typing-if" | "hold-if" | "reveal";
type FinalePhase = "typing-foundation" | "hold-foundation" | "deleting-foundation" | "typing-continuity" | "hold-continuity" | "deleting-continuity" | "typing-primitive" | "reveal";

const firstLine = "Every AI starts from zero.";
const secondLine = "What if it didn't?";
const finaleLines = {
  foundation: "Foundation models gave AI intelligence.",
  continuity: "Trace gives AI continuity.",
  primitive: "Personal context should be a primitive of AI.",
};

const timings = {
  firstType: 56,
  firstHold: 1050,
  delete: 34,
  secondType: 68,
  secondHold: 820,
};

const traceSteps = [
  "Connecting Trace...",
  "Loading Personal Context...",
  "Permission Verified...",
  "Context Ready...",
];

type ContextNode = {
  label: string;
  detail: string;
  icon: keyof typeof contextIcons;
  tone: string;
};

const contextIcons = {
  sleep: Moon,
  calendar: CalendarDays,
  meetings: UsersRound,
  coding: Code2,
  focus: Target,
  productivity: BrainCircuit,
  screen: Clock3,
  projects: FolderKanban,
};

const contextNodes: Node<ContextNode>[] = [
  {
    id: "focus",
    type: "context",
    position: { x: 410, y: 230 },
    data: {
      label: "Focus",
      detail: "Highest clarity between 9:30 and 11:00 AM",
      icon: "focus",
      tone: "rgba(157,255,122,0.9)",
    },
  },
  {
    id: "sleep",
    type: "context",
    position: { x: 110, y: 80 },
    data: {
      label: "Sleep",
      detail: "Seven hours predicts stronger morning output",
      icon: "sleep",
      tone: "rgba(183,151,255,0.88)",
    },
  },
  {
    id: "calendar",
    type: "context",
    position: { x: 410, y: 80 },
    data: {
      label: "Calendar",
      detail: "Meetings after 10 AM preserve deep work",
      icon: "calendar",
      tone: "rgba(109,211,255,0.88)",
    },
  },
  {
    id: "meetings",
    type: "context",
    position: { x: 710, y: 80 },
    data: {
      label: "Meetings",
      detail: "Late starts correlate with better coding sessions",
      icon: "meetings",
      tone: "rgba(255,184,107,0.9)",
    },
  },
  {
    id: "coding",
    type: "context",
    position: { x: 410, y: 380 },
    data: {
      label: "Coding",
      detail: "Best commits arrive before email context-switching",
      icon: "coding",
      tone: "rgba(91,230,196,0.88)",
    },
  },
  {
    id: "productivity",
    type: "context",
    position: { x: 110, y: 230 },
    data: {
      label: "Productivity",
      detail: "Output rises when focus begins before inbox",
      icon: "productivity",
      tone: "rgba(157,255,122,0.82)",
    },
  },
  {
    id: "screen-time",
    type: "context",
    position: { x: 110, y: 380 },
    data: {
      label: "Screen Time",
      detail: "Early notifications reduce sustained attention",
      icon: "screen",
      tone: "rgba(255,119,166,0.86)",
    },
  },
  {
    id: "projects",
    type: "context",
    position: { x: 710, y: 380 },
    data: {
      label: "Projects",
      detail: "Trace reorders work by personal momentum",
      icon: "projects",
      tone: "rgba(255,255,255,0.78)",
    },
  },
];

const contextEdges: Edge[] = [
  {
    id: "sleep-calendar",
    source: "sleep",
    sourceHandle: "right-source",
    target: "calendar",
    targetHandle: "left-target",
    color: "rgba(183,151,255,0.52)",
  },
  {
    id: "calendar-meetings",
    source: "calendar",
    sourceHandle: "right-source",
    target: "meetings",
    targetHandle: "left-target",
    color: "rgba(109,211,255,0.52)",
  },
  {
    id: "calendar-focus",
    source: "calendar",
    sourceHandle: "bottom-source",
    target: "focus",
    targetHandle: "top-target",
    color: "rgba(109,211,255,0.62)",
  },
  {
    id: "productivity-focus",
    source: "productivity",
    sourceHandle: "right-source",
    target: "focus",
    targetHandle: "left-target",
    color: "rgba(157,255,122,0.58)",
  },
  {
    id: "focus-coding",
    source: "focus",
    sourceHandle: "bottom-source",
    target: "coding",
    targetHandle: "top-target",
    color: "rgba(91,230,196,0.62)",
  },
  {
    id: "screen-coding",
    source: "screen-time",
    sourceHandle: "right-source",
    target: "coding",
    targetHandle: "left-target",
    color: "rgba(255,119,166,0.52)",
  },
  {
    id: "coding-projects",
    source: "coding",
    sourceHandle: "right-source",
    target: "projects",
    targetHandle: "left-target",
    color: "rgba(255,255,255,0.42)",
  },
  {
    id: "meetings-projects",
    source: "meetings",
    sourceHandle: "bottom-source",
    target: "projects",
    targetHandle: "top-target",
    color: "rgba(255,184,107,0.48)",
  },
].map(({ color, ...edge }) => ({
  ...edge,
  animated: true,
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed, color },
  style: { stroke: color, strokeWidth: 1.8 },
}));

const contextNodeTypes: NodeTypes = {
  context: ContextNodeCard,
};

const signalSources = [
  { label: "Apple Health", icon: HeartPulse, x: "-22rem", y: "-10.5rem", midX: "-10rem", midY: "-5rem", delay: 0.05 },
  { label: "Google Calendar", icon: CalendarDays, x: "-7.5rem", y: "-10.5rem", midX: "-3.5rem", midY: "-5rem", delay: 0.16 },
  { label: "GitHub", icon: Github, x: "7.5rem", y: "-10.5rem", midX: "3.5rem", midY: "-5rem", delay: 0.27 },
  { label: "Cursor", icon: MousePointer2, x: "22rem", y: "-10.5rem", midX: "10rem", midY: "-5rem", delay: 0.38 },
  { label: "Slack", icon: MessageSquare, x: "-22rem", y: "10.5rem", midX: "-10rem", midY: "5rem", delay: 0.49 },
  { label: "Spotify", icon: Music2, x: "-7.5rem", y: "10.5rem", midX: "-3.5rem", midY: "5rem", delay: 0.6 },
  { label: "Oura", icon: CircleDot, x: "7.5rem", y: "10.5rem", midX: "3.5rem", midY: "5rem", delay: 0.71 },
  { label: "Screen Time", icon: Smartphone, x: "22rem", y: "10.5rem", midX: "10rem", midY: "5rem", delay: 0.82 },
];

const permissionCards = [
  {
    app: "ChatGPT",
    status: "Can read",
    grants: ["Productivity", "Writing Style"],
    denied: ["Health"],
  },
  {
    app: "Claude",
    status: "Can read",
    grants: ["Coding", "Projects"],
    denied: ["Personal"],
  },
  {
    app: "Cursor",
    status: "Can read",
    grants: ["Code Style", "Repository Context"],
    denied: ["Calendar"],
  },
];

function ContextNodeCard({ data }: NodeProps<ContextNode>) {
  const Icon = contextIcons[data.icon];

  return (
    <div className="group relative">
      <Handle id="left-target" type="target" position={Position.Left} className="opacity-0" />
      <Handle id="right-target" type="target" position={Position.Right} className="opacity-0" />
      <Handle id="top-target" type="target" position={Position.Top} className="opacity-0" />
      <Handle id="bottom-target" type="target" position={Position.Bottom} className="opacity-0" />
      <motion.div
        className="min-w-[11rem] rounded-full border border-white/14 bg-[#0b0d0b]/95 px-4 py-3 shadow-[0_26px_80px_rgba(0,0,0,0.48)] backdrop-blur-xl"
        style={{ boxShadow: `0 0 0 1px ${data.tone.replace("0.9", "0.28")}` }}
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.22 }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex size-8 items-center justify-center rounded-full border"
            style={{ borderColor: data.tone, color: data.tone, background: "rgba(255,255,255,0.035)" }}
          >
            <Icon className="size-3.5" />
          </span>
          <span className="text-sm font-medium text-white">{data.label}</span>
        </div>
      </motion.div>
      <div className="pointer-events-none absolute left-1/2 top-[calc(100%+0.75rem)] z-20 w-60 -translate-x-1/2 rounded-2xl border border-white/12 bg-[#050505] p-4 text-sm leading-6 text-white/60 opacity-0 shadow-[0_28px_90px_rgba(0,0,0,0.6)] transition duration-300 group-hover:translate-y-1 group-hover:opacity-100">
        {data.detail}
      </div>
      <Handle id="left-source" type="source" position={Position.Left} className="opacity-0" />
      <Handle id="right-source" type="source" position={Position.Right} className="opacity-0" />
      <Handle id="top-source" type="source" position={Position.Top} className="opacity-0" />
      <Handle id="bottom-source" type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

function FinaleTypewriter() {
  const [phase, setPhase] = useState<FinalePhase>("typing-foundation");
  const [text, setText] = useState("");

  useEffect(() => {
    let timeout: number | undefined;

    if (phase === "typing-foundation") {
      if (text.length < finaleLines.foundation.length) {
        timeout = window.setTimeout(
          () => setText(finaleLines.foundation.slice(0, text.length + 1)),
          50,
        );
      } else {
        timeout = window.setTimeout(() => setPhase("hold-foundation"), 1050);
      }
    }

    if (phase === "hold-foundation") {
      timeout = window.setTimeout(() => setPhase("deleting-foundation"), 220);
    }

    if (phase === "deleting-foundation") {
      if (text.length > 0) {
        timeout = window.setTimeout(() => setText(text.slice(0, -1)), 26);
      } else {
        timeout = window.setTimeout(() => setPhase("typing-continuity"), 360);
      }
    }

    if (phase === "typing-continuity") {
      if (text.length < finaleLines.continuity.length) {
        timeout = window.setTimeout(
          () => setText(finaleLines.continuity.slice(0, text.length + 1)),
          58,
        );
      } else {
        timeout = window.setTimeout(() => setPhase("hold-continuity"), 950);
      }
    }

    if (phase === "hold-continuity") {
      timeout = window.setTimeout(() => setPhase("deleting-continuity"), 220);
    }

    if (phase === "deleting-continuity") {
      if (text.length > 0) {
        timeout = window.setTimeout(() => setText(text.slice(0, -1)), 28);
      } else {
        timeout = window.setTimeout(() => setPhase("typing-primitive"), 420);
      }
    }

    if (phase === "typing-primitive") {
      if (text.length < finaleLines.primitive.length) {
        timeout = window.setTimeout(
          () => setText(finaleLines.primitive.slice(0, text.length + 1)),
          46,
        );
      } else {
        timeout = window.setTimeout(() => setPhase("reveal"), 760);
      }
    }

    return () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    };
  }, [phase, text]);

  const isFinal = phase === "typing-primitive" || phase === "reveal";

  return (
    <div className="flex min-h-[34rem] w-full max-w-6xl flex-col items-center justify-center text-center">
      <motion.p
        className="min-h-[9rem] max-w-6xl text-balance text-[clamp(3rem,6.8vw,7.2rem)] font-medium leading-[0.95] tracking-normal text-white"
        animate={{ opacity: isFinal ? 1 : 0.82, scale: isFinal ? 1 : 0.985 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {text}
        {phase !== "reveal" && (
          <motion.span
            className="ml-2 inline-block h-[0.84em] w-[0.055em] translate-y-[0.08em] bg-trace-green"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.52, 0.53, 1] }}
          />
        )}
      </motion.p>

      <motion.div
        className="mt-14 flex flex-col items-center"
        initial={{ opacity: 0, y: 26, filter: "blur(18px)" }}
        animate={{
          opacity: phase === "reveal" ? 1 : 0,
          y: phase === "reveal" ? 0 : 26,
          filter: phase === "reveal" ? "blur(0px)" : "blur(18px)",
        }}
        transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative">
          <motion.div
            aria-hidden
            className="absolute inset-[-42px] rounded-full bg-trace-green/10 blur-3xl"
            animate={{ opacity: [0.55, 1, 0.55], scale: [0.95, 1.04, 0.95] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="relative text-[clamp(3.8rem,9vw,8rem)] font-semibold leading-none tracking-[0.18em] text-white">
            TRACE
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("typing-zero");
  const [displayText, setDisplayText] = useState("");
  const [showLogo, setShowLogo] = useState(false);

  const currentLine = useMemo(
    () => (phase === "typing-zero" || phase === "hold-zero" || phase === "deleting-zero"
      ? firstLine
      : secondLine),
    [phase],
  );

  useEffect(() => {
    let timeout: number | undefined;

    if (phase === "typing-zero") {
      if (displayText.length < firstLine.length) {
        timeout = window.setTimeout(
          () => setDisplayText(firstLine.slice(0, displayText.length + 1)),
          timings.firstType,
        );
      } else {
        timeout = window.setTimeout(() => setPhase("hold-zero"), timings.firstHold);
      }
    }

    if (phase === "hold-zero") {
      timeout = window.setTimeout(() => setPhase("deleting-zero"), 160);
    }

    if (phase === "deleting-zero") {
      if (displayText.length > 0) {
        timeout = window.setTimeout(
          () => setDisplayText(displayText.slice(0, -1)),
          timings.delete,
        );
      } else {
        timeout = window.setTimeout(() => setPhase("typing-if"), 280);
      }
    }

    if (phase === "typing-if") {
      if (displayText.length < secondLine.length) {
        timeout = window.setTimeout(
          () => setDisplayText(secondLine.slice(0, displayText.length + 1)),
          timings.secondType,
        );
      } else {
        timeout = window.setTimeout(() => setPhase("hold-if"), timings.secondHold);
      }
    }

    if (phase === "hold-if") {
      timeout = window.setTimeout(() => {
        setShowLogo(true);
        setPhase("reveal");
      }, 520);
    }

    return () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    };
  }, [displayText, phase]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(157,255,122,0.06),transparent_30rem)]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ opacity: 0, scaleX: 0.2 }}
          animate={{ opacity: showLogo ? 0.45 : 0.18, scaleX: showLogo ? 1 : 0.56 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="flex min-h-[34rem] w-full max-w-6xl flex-col items-center justify-center">
          <motion.div
            className="relative min-h-[9rem] w-full text-center"
            animate={{
              y: showLogo ? -34 : 0,
              opacity: showLogo ? 0.46 : 1,
              scale: showLogo ? 0.96 : 1,
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mx-auto max-w-5xl text-balance text-[clamp(3rem,7vw,7rem)] font-medium leading-[0.95] tracking-normal text-white">
              {displayText}
              <motion.span
                className="ml-2 inline-block h-[0.84em] w-[0.055em] translate-y-[0.08em] bg-trace-green"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.52, 0.53, 1] }}
              />
            </p>
            <p className="sr-only">{currentLine}</p>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-col items-center"
            initial={{ opacity: 0, y: 28, filter: "blur(18px)" }}
            animate={{
              opacity: showLogo ? 1 : 0,
              y: showLogo ? 0 : 28,
              filter: showLogo ? "blur(0px)" : "blur(18px)",
            }}
            transition={{ duration: 1.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative">
              <motion.div
                aria-hidden
                className="absolute inset-[-42px] rounded-full bg-trace-green/10 blur-3xl"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: showLogo ? 1 : 0, scale: showLogo ? 1 : 0.7 }}
                transition={{ duration: 1.8, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
              />
              <h1 className="relative text-[clamp(4.5rem,11vw,10rem)] font-semibold leading-none tracking-[0.18em] text-white">
                TRACE
              </h1>
            </div>
            <motion.p
              className="mt-7 max-w-2xl text-center text-lg leading-8 text-white/52"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: showLogo ? 1 : 0, y: showLogo ? 0 : 16 }}
              transition={{ duration: 1, delay: 0.92, ease: [0.16, 1, 0.3, 1] }}
            >
              The personal context layer for AI.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 min-h-screen px-6 py-24">
        <motion.div
          className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-7xl flex-col justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.42 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.16 } },
          }}
        >
          <motion.div
            className="mb-12 flex items-end justify-between gap-8"
            variants={{
              hidden: { opacity: 0, y: 26 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            <div>
              <h2 className="max-w-4xl text-balance text-[clamp(3rem,6vw,6.25rem)] font-medium leading-[0.95] tracking-normal">
                The same prompt.
                <br />
                A different kind of memory.
              </h2>
            </div>
            <p className="hidden max-w-sm text-lg leading-8 text-white/52 lg:block">
              Today, AI answers from the conversation. Trace lets it answer from the person.
            </p>
          </motion.div>

          <motion.div
            className="mb-7 flex justify-center"
            variants={{
              hidden: { opacity: 0, y: 22, filter: "blur(12px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            <div className="rounded-full border border-white/14 bg-white/[0.035] px-7 py-4 text-lg text-white shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
              What should I focus on today?
            </div>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-2">
            <motion.article
              className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-white/12 bg-[#0d0d0d] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
              variants={{
                hidden: { opacity: 0, x: -34, filter: "blur(14px)" },
                visible: {
                  opacity: 1,
                  x: 0,
                  filter: "blur(0px)",
                  transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_22rem)]" />
              <div className="relative flex h-full flex-col">
                <div className="mb-12 flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/36">
                      Standard AI
                    </p>
                    <p className="mt-2 text-sm text-white/36">No persistent context</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-white/28" />
                </div>

                <div className="mt-8 max-w-xl">
                  <p className="text-2xl font-medium leading-snug text-white/86">
                    You could start with your most important task, avoid distractions, and use a timer
                    to stay focused.
                  </p>
                  <div className="mt-8 grid gap-3">
                    {["Prioritize important work", "Block distractions", "Use a focus timer"].map((item) => (
                      <div
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-white/42"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 h-px w-full bg-gradient-to-r from-white/16 to-transparent" />
                  <p className="mt-6 text-base leading-7 text-white/38">
                    Helpful, but generic. It knows the question. It does not know the person asking.
                  </p>
                </div>
              </div>
            </motion.article>

            <motion.article
              className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-trace-green/35 bg-[#0d120d] p-8 shadow-[0_34px_120px_rgba(89,255,122,0.08)]"
              variants={{
                hidden: { opacity: 0, x: 34, filter: "blur(14px)" },
                visible: {
                  opacity: 1,
                  x: 0,
                  filter: "blur(0px)",
                  transition: { duration: 1, delay: 0.08, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <motion.div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_72%_12%,rgba(157,255,122,0.2),transparent_24rem)]"
                animate={{ opacity: [0.55, 0.85, 0.55] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex h-full flex-col">
                <div className="mb-10 flex items-center justify-between border-b border-trace-green/18 pb-5">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.28em] text-trace-green/78">
                      AI + Trace
                    </p>
                    <p className="mt-2 text-sm text-white/46">Permissioned personal context</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-trace-green/30 bg-trace-green/10 text-trace-green">
                    <Sparkles size={17} />
                  </div>
                </div>

                <div className="space-y-3">
                  {traceSteps.map((step, index) => (
                    <motion.div
                      key={step}
                      className="flex items-center gap-3 rounded-full border border-white/10 bg-black/28 px-4 py-3 text-sm text-white/66"
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.55,
                            delay: 0.5 + index * 0.42,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        },
                      }}
                    >
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <motion.span
                          className="absolute h-2.5 w-2.5 rounded-full bg-trace-green"
                          variants={{
                            hidden: { opacity: 0, scale: 0.7 },
                            visible: {
                              opacity: [0, 1, 0.55, 1, 0],
                              scale: [0.7, 1.45, 1, 1.35, 0.8],
                              transition: {
                                duration: 0.95,
                                delay: 0.55 + index * 0.42,
                                times: [0, 0.24, 0.48, 0.72, 1],
                              },
                            },
                          }}
                        />
                        <motion.span
                          className="absolute text-trace-green"
                          variants={{
                            hidden: { opacity: 0, scale: 0.7 },
                            visible: {
                              opacity: 1,
                              scale: 1,
                              transition: {
                                duration: 0.22,
                                delay: 1.42 + index * 0.42,
                                ease: [0.16, 1, 0.3, 1],
                              },
                            },
                          }}
                        >
                          <CheckCircle2 size={16} />
                        </motion.span>
                      </span>
                      <span>{step}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="mt-8 rounded-[1.5rem] border border-trace-green/22 bg-black/32 p-6 backdrop-blur-xl"
                  variants={{
                    hidden: { opacity: 0, y: 24, filter: "blur(16px)" },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: { duration: 1, delay: 3.05, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  <p className="text-2xl font-medium leading-snug text-white">
                    Based on six months of your work patterns, your highest focus window is between
                    9:30 and 11:00 AM.
                  </p>
                  <p className="mt-5 text-base leading-7 text-white/58">
                    You consistently perform better before checking email, after seven hours of
                    sleep, and when meetings begin after 10 AM. I&apos;ve reorganized your schedule
                    accordingly.
                  </p>
                </motion.div>
              </div>
            </motion.article>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 min-h-screen px-6 py-20">
        <motion.div
          className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-7xl flex-col justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.34 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.18 } },
          }}
        >
          <motion.div
            className="mb-8"
            variants={{
              hidden: { opacity: 0, y: 28 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            <h2 className="text-balance text-[clamp(3.6rem,7vw,7.6rem)] font-medium leading-[0.92] tracking-normal">
              Here&apos;s why.
            </h2>
          </motion.div>

          <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_23rem]">
            <motion.div
              className="relative h-full min-h-[34rem] overflow-hidden rounded-[2rem] border border-white/12 bg-[#070807] shadow-[0_34px_120px_rgba(0,0,0,0.52)]"
              variants={{
                hidden: { opacity: 0, y: 36, filter: "blur(18px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <motion.div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_52%_46%,rgba(157,255,122,0.14),transparent_25rem)]"
                animate={{ opacity: [0.35, 0.78, 0.35] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 trace-grid opacity-70" />
              <div className="absolute left-8 top-8 z-20">
                <p className="text-sm font-medium uppercase tracking-[0.32em] text-white/34">
                  Personal Context
                </p>
              </div>
              <div className="absolute right-8 top-7 z-20 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm text-white/56 backdrop-blur-xl">
                8 signals connected
              </div>

              <motion.div
                className="absolute inset-x-0 bottom-0 top-16"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 1.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <ReactFlow
                  nodes={contextNodes}
                  edges={contextEdges}
                  nodeTypes={contextNodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.16 }}
                  minZoom={0.78}
                  maxZoom={1.05}
                  panOnDrag={false}
                  zoomOnScroll={false}
                  zoomOnPinch={false}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  preventScrolling={false}
                  proOptions={{ hideAttribution: true }}
                  className="story-flow"
                >
                  <Background color="rgba(255,255,255,0.055)" gap={38} size={1} />
                </ReactFlow>
              </motion.div>
            </motion.div>

            <motion.aside
              className="relative h-full min-h-[34rem] overflow-hidden rounded-[2rem] border border-trace-green/24 bg-[#0c120c] p-7 shadow-[0_34px_120px_rgba(89,255,122,0.07)]"
              variants={{
                hidden: { opacity: 0, x: 26, filter: "blur(16px)" },
                visible: {
                  opacity: 1,
                  x: 0,
                  filter: "blur(0px)",
                  transition: { duration: 1, delay: 0.18, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <motion.div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(157,255,122,0.18),transparent_19rem)]"
                animate={{ opacity: [0.42, 0.8, 0.42] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex h-full flex-col">
                <div className="mb-10 flex size-12 items-center justify-center rounded-full border border-trace-green/30 bg-trace-green/10 text-trace-green">
                  <MousePointerClick size={18} />
                </div>
                <p className="text-sm font-medium uppercase tracking-[0.32em] text-trace-green/78">
                  Personal Context
                </p>
                <h3 className="mt-5 text-4xl font-medium leading-tight text-white">
                  It does not remember a chat.
                  <br />
                  It remembers patterns.
                </h3>
                <p className="mt-7 text-lg leading-8 text-white/58">
                  The answer comes from relationships across sleep, calendar pressure,
                  coding output, projects, and attention signals.
                </p>

                <div className="mt-auto space-y-3 pt-10">
                  {[
                    "Seven hours of sleep strengthens morning focus.",
                    "Meetings before 10 AM reduce deep work quality.",
                    "Email before coding weakens project momentum.",
                  ].map((line, index) => (
                    <motion.div
                      key={line}
                      className="rounded-2xl border border-white/10 bg-black/28 p-4 text-sm leading-6 text-white/66"
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.65, delay: 0.55 + index * 0.18 }}
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 min-h-screen overflow-hidden px-6 py-24">
        <motion.div
          className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-7xl flex-col justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.36 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.18 } },
          }}
        >
          <motion.div
            className="mx-auto max-w-6xl text-center"
            variants={{
              hidden: { opacity: 0, y: 28 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            <h2 className="text-balance text-[clamp(3.2rem,6.6vw,7rem)] font-medium leading-[0.94] tracking-normal">
              Your life already produces
              <br />
              millions of signals.
            </h2>
          </motion.div>

          <motion.div
            className="relative mx-auto mt-10 h-[38rem] w-full max-w-7xl"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.8 } },
            }}
          >
            <div className="absolute inset-0">
              {signalSources.map((source) => {
                const Icon = source.icon;

                return (
                <motion.div
                  key={source.label}
                  className="absolute left-1/2 top-1/2 z-10"
                  initial={{ x: "0rem", y: "0rem", opacity: 0, scale: 0.82, filter: "blur(14px)" }}
                  whileInView={{
                    x: [source.x, source.x, source.x, source.midX, "0rem"],
                    y: [source.y, source.y, source.y, source.midY, "0rem"],
                    opacity: [0, 1, 1, 1, 0],
                    scale: [0.82, 1, 1, 1, 0.16],
                    filter: ["blur(14px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(16px)"],
                  }}
                  viewport={{ once: true, amount: 0.36 }}
                  transition={{
                    duration: 5.25,
                    delay: 0.25,
                    times: [0, 0.14, 0.5, 0.88, 1],
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <div className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-white/13 bg-[#101110]/92 px-4 py-3 text-white shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <span className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-trace-green">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="text-sm font-medium">{source.label}</span>
                    </div>
                  </div>
                </motion.div>
                );
              })}

              <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-[42%] flex-col items-center">
                <motion.div
                  className="relative flex h-72 w-72 items-center justify-center rounded-full bg-[#071007] shadow-[0_0_150px_rgba(157,255,122,0.2)]"
                  initial={{ opacity: 0, scale: 0.72, filter: "blur(18px)" }}
                  whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: 3.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    aria-hidden
                    className="rainbow-context-ring absolute inset-[-5px] rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5.8, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-[2px] rounded-full bg-[#071007]" />
                  <motion.div
                    aria-hidden
                    className="absolute inset-[-86px] rounded-full bg-trace-green/14 blur-3xl"
                    animate={{ opacity: [0.58, 1, 0.58], scale: [0.95, 1.09, 0.95] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="relative text-center">
                    <Sparkles className="mx-auto mb-5 size-7 text-trace-green" />
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-trace-green/78">
                      Personal
                    </p>
                    <p className="mt-2 text-3xl font-medium leading-none text-white">Context</p>
                  </div>
                </motion.div>

                <motion.div
                  className="mt-16 text-center"
                  initial={{ opacity: 0, y: 22, filter: "blur(14px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.85, delay: 3.65, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="text-[clamp(2.35rem,3.6vw,4rem)] font-medium leading-[1.02] tracking-normal text-white">
                    <span className="whitespace-nowrap">Data is abundant.</span>
                    <br />
                    <span className="whitespace-nowrap text-white/44">Understanding is scarce.</span>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 min-h-screen overflow-hidden px-6 py-28">
        <motion.div
          className="mx-auto flex min-h-[calc(100vh-14rem)] w-full max-w-7xl flex-col justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.34 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.18 } },
          }}
        >
          <motion.div
            className="grid items-end gap-10 lg:grid-cols-[0.9fr_1.1fr]"
            variants={{
              hidden: { opacity: 0, y: 28 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            <div>
              <h2 className="text-balance text-[clamp(3.4rem,6.8vw,7.4rem)] font-medium leading-[0.92] tracking-normal">
                You own your context.
              </h2>
            </div>
            <p className="max-w-xl text-balance text-[clamp(2.2rem,4vw,4.7rem)] font-medium leading-[0.98] text-white/42">
              Not your AI provider.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {permissionCards.map((card, index) => (
              <motion.article
                key={card.app}
                className="relative min-h-[31rem] overflow-hidden rounded-[2.35rem] border border-white/12 bg-[#0d0e0d] p-6 shadow-[0_34px_120px_rgba(0,0,0,0.48)]"
                variants={{
                  hidden: { opacity: 0, y: 34, filter: "blur(16px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.95, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <motion.div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(157,255,122,0.12),transparent_20rem)] opacity-70"
                  animate={{ opacity: [0.45, 0.78, 0.45] }}
                  transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative flex h-full flex-col">
                  <div className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.045] text-trace-green">
                        <Bot size={20} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-medium text-white">{card.app}</h3>
                        <p className="mt-1 text-sm text-white/38">{card.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-trace-green/24 bg-trace-green/10 px-3 py-1.5 text-xs font-medium text-trace-green">
                      <LockKeyhole size={13} />
                      Authorized
                    </div>
                  </div>

                  <div className="space-y-3">
                    {card.grants.map((grant, grantIndex) => (
                      <motion.div
                        key={grant}
                        className="flex items-center justify-between rounded-2xl border border-trace-green/22 bg-trace-green/[0.075] px-4 py-4 text-white"
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.35 + index * 0.12 + grantIndex * 0.1 }}
                      >
                        <span className="font-medium">{grant}</span>
                        <CheckCircle2 className="text-trace-green" size={18} />
                      </motion.div>
                    ))}
                    {card.denied.map((deny, denyIndex) => (
                      <motion.div
                        key={deny}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/26 px-4 py-4 text-white/48"
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.62 + index * 0.12 + denyIndex * 0.1 }}
                      >
                        <span className="font-medium">{deny}</span>
                        <XCircle className="text-white/32" size={18} />
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-auto pt-10">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
                    <p className="mt-5 text-sm leading-6 text-white/42">
                      Context is scoped, revocable, and portable. The app receives only what you allow.
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            className="mx-auto mt-14 max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 text-center shadow-[0_34px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
            variants={{
              hidden: { opacity: 0, y: 26, filter: "blur(14px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 1, delay: 0.42, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            <p className="text-lg leading-8 text-white/58">
              Trace does not ask every AI company to rebuild memory. It gives the user one personal
              context layer, then lets each AI access only the parts the user chooses.
            </p>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden bg-[#030303] px-6 py-28">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ opacity: 0, scaleX: 0.2 }}
          whileInView={{ opacity: 0.4, scaleX: 1 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(157,255,122,0.08),transparent_28rem)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 1.8 }}
        />
        <FinaleTypewriter />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.2, delay: 4.8 }}
        />
      </section>
    </main>
  );
}
