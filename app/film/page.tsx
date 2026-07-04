"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  Code2,
  Github,
  HeartPulse,
  MessageSquare,
  Moon,
  MousePointer2,
  Music2,
  Sparkles,
  Smartphone,
  Target,
  UsersRound,
} from "lucide-react";

const scenes = [
  { key: "zero", duration: 7000 },
  { key: "split", duration: 9000 },
  { key: "graph", duration: 8500 },
  { key: "signals", duration: 10500 },
  { key: "permissions", duration: 8500 },
  { key: "finale", duration: 8500 },
] as const;

const sources = [
  { label: "Apple Health", icon: HeartPulse, x: "-20rem", y: "-9rem" },
  { label: "Calendar", icon: CalendarDays, x: "-6.5rem", y: "-9rem" },
  { label: "GitHub", icon: Github, x: "6.5rem", y: "-9rem" },
  { label: "Cursor", icon: MousePointer2, x: "20rem", y: "-9rem" },
  { label: "Slack", icon: MessageSquare, x: "-20rem", y: "9rem" },
  { label: "Spotify", icon: Music2, x: "-6.5rem", y: "9rem" },
  { label: "Oura", icon: Moon, x: "6.5rem", y: "9rem" },
  { label: "Screen Time", icon: Smartphone, x: "20rem", y: "9rem" },
];

const graphNodes = [
  { label: "Sleep", icon: Moon, x: "12%", y: "18%", color: "rgba(183,151,255,0.9)" },
  { label: "Calendar", icon: CalendarDays, x: "42%", y: "18%", color: "rgba(109,211,255,0.9)" },
  { label: "Meetings", icon: UsersRound, x: "72%", y: "18%", color: "rgba(255,184,107,0.9)" },
  { label: "Productivity", icon: Sparkles, x: "12%", y: "47%", color: "rgba(157,255,122,0.9)" },
  { label: "Focus", icon: Target, x: "42%", y: "47%", color: "rgba(157,255,122,0.9)" },
  { label: "Screen Time", icon: Smartphone, x: "12%", y: "76%", color: "rgba(255,119,166,0.9)" },
  { label: "Coding", icon: Code2, x: "42%", y: "76%", color: "rgba(91,230,196,0.9)" },
  { label: "Projects", icon: Github, x: "72%", y: "76%", color: "rgba(255,255,255,0.75)" },
];

const permissions = [
  ["ChatGPT", ["Productivity", "Writing Style"], "Health"],
  ["Claude", ["Coding", "Projects"], "Personal"],
  ["Cursor", ["Code Style", "Repository Context"], "Calendar"],
];

function useSceneIndex() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setIndex((current) => Math.min(current + 1, scenes.length - 1)),
      scenes[index].duration,
    );

    return () => window.clearTimeout(timeout);
  }, [index]);

  return index;
}

function TypeLine({ lines }: { lines: string[] }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState("");

  const current = lines[lineIndex] ?? lines.at(-1) ?? "";

  useEffect(() => {
    let timeout: number | undefined;

    if (text.length < current.length) {
      timeout = window.setTimeout(() => setText(current.slice(0, text.length + 1)), 48);
    } else if (lineIndex < lines.length - 1) {
      timeout = window.setTimeout(() => {
        setText("");
        setLineIndex((value) => value + 1);
      }, 1200);
    }

    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [current, lineIndex, lines.length, text]);

  return (
    <p className="text-balance text-[clamp(4rem,8vw,9rem)] font-medium leading-[0.92] tracking-normal text-white">
      {text}
      <motion.span
        className="ml-3 inline-block h-[0.82em] w-[0.045em] translate-y-[0.08em] bg-trace-green"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.52, 0.53, 1] }}
      />
    </p>
  );
}

export default function Film() {
  const index = useSceneIndex();
  const current = scenes[index].key;

  const progress = useMemo(
    () => ((index + 1) / scenes.length) * 100,
    [index],
  );

  return (
    <main className="relative h-screen overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(157,255,122,0.08),transparent_34rem)]" />
      <div className="absolute left-8 top-7 z-50 text-sm font-semibold tracking-[0.42em] text-white/38">
        TRACE
      </div>
      <div className="absolute inset-x-8 bottom-7 z-50 h-px bg-white/10">
        <motion.div className="h-px bg-trace-green" animate={{ width: `${progress}%` }} transition={{ duration: 0.7 }} />
      </div>

      <AnimatePresence mode="wait">
        {current === "zero" && (
          <motion.section
            key="zero"
            className="absolute inset-0 flex items-center justify-center px-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(18px)" }}
            transition={{ duration: 1 }}
          >
            <TypeLine lines={["Every AI starts from zero.", "What if it didn't?"]} />
          </motion.section>
        )}

        {current === "split" && (
          <motion.section
            key="split"
            className="absolute inset-0 flex flex-col justify-center px-16"
            initial={{ opacity: 0, y: 30, filter: "blur(18px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(18px)" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-10 text-center text-2xl text-white/74">What should I focus on today?</div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-white/12 bg-white/[0.025] p-8">
                <p className="mb-16 text-sm font-semibold uppercase tracking-[0.35em] text-white/38">Standard AI</p>
                <p className="max-w-xl text-3xl font-medium leading-tight text-white/86">
                  Start with your most important task, avoid distractions, and use a timer.
                </p>
                <p className="mt-10 text-lg text-white/36">Helpful. Generic. No memory of you.</p>
              </div>
              <div className="rounded-[2rem] border border-trace-green/28 bg-[#0b120b] p-8">
                <p className="mb-8 text-sm font-semibold uppercase tracking-[0.35em] text-trace-green/72">AI + Trace</p>
                <div className="space-y-3">
                  {["Connecting Trace", "Loading Personal Context", "Permission Verified", "Context Ready"].map((step, stepIndex) => (
                    <motion.div
                      key={step}
                      className="flex items-center gap-3 rounded-full border border-white/10 bg-black/28 px-4 py-3 text-white/68"
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + stepIndex * 0.55 }}
                    >
                      <CheckCircle2 className="text-trace-green" size={17} />
                      {step}
                    </motion.div>
                  ))}
                </div>
                <motion.p
                  className="mt-9 rounded-[1.5rem] border border-trace-green/20 bg-black/30 p-6 text-2xl font-medium leading-snug"
                  initial={{ opacity: 0, y: 22, filter: "blur(14px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 3.5, duration: 1 }}
                >
                  Your highest focus window is 9:30 to 11:00 AM. I&apos;ve reorganized your schedule accordingly.
                </motion.p>
              </div>
            </div>
          </motion.section>
        )}

        {current === "graph" && (
          <motion.section
            key="graph"
            className="absolute inset-0 grid items-center gap-10 px-16 lg:grid-cols-[1fr_0.44fr]"
            initial={{ opacity: 0, scale: 0.97, filter: "blur(18px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(18px)" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div>
              <h1 className="mb-8 text-[clamp(4rem,7vw,8rem)] font-medium leading-none">Here&apos;s why.</h1>
              <div className="relative h-[29rem] rounded-[2rem] border border-white/12 bg-[#070807] trace-grid">
                {graphNodes.map((node, nodeIndex) => {
                  const Icon = node.icon;
                  return (
                    <motion.div
                      key={node.label}
                      className="absolute rounded-full border bg-[#0b0d0b] px-5 py-3 text-sm font-medium shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                      style={{ left: node.x, top: node.y, borderColor: node.color, color: "white" }}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + nodeIndex * 0.12 }}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={15} style={{ color: node.color }} />
                        {node.label}
                      </span>
                    </motion.div>
                  );
                })}
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[
                    "20,22 42,22 72,22",
                    "20,51 42,51 42,80 72,80",
                    "20,80 42,80",
                    "42,22 42,51",
                  ].map((points, pathIndex) => (
                    <motion.polyline
                      key={points}
                      points={points}
                      fill="none"
                      stroke="rgba(157,255,122,0.38)"
                      strokeWidth="0.28"
                      strokeDasharray="1.4 1.4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 1 + pathIndex * 0.25, duration: 1.4 }}
                    />
                  ))}
                </svg>
              </div>
            </div>
            <div className="rounded-[2rem] border border-trace-green/24 bg-[#0c120c] p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-trace-green/72">Personal Context</p>
              <p className="mt-7 text-4xl font-medium leading-tight">It remembers patterns.</p>
              <p className="mt-6 text-lg leading-8 text-white/58">Sleep, calendar pressure, coding output, projects, and attention signals become one usable context layer.</p>
            </div>
          </motion.section>
        )}

        {current === "signals" && (
          <motion.section
            key="signals"
            className="absolute inset-0 flex flex-col justify-center px-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(18px)" }}
            transition={{ duration: 1 }}
          >
            <h1 className="max-w-5xl text-[clamp(4rem,7vw,8rem)] font-medium leading-[0.94]">
              Your life already produces millions of signals.
            </h1>
            <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
              <div className="relative h-[28rem]">
                {sources.map((source, sourceIndex) => {
                  const Icon = source.icon;
                  return (
                    <motion.div
                      key={source.label}
                      className="absolute left-1/2 top-1/2 rounded-full border border-white/12 bg-[#101110] px-4 py-3"
                      initial={{ x: "0rem", y: "0rem", opacity: 0, scale: 0.8 }}
                      animate={{
                        x: ["0rem", source.x, source.x, "0rem"],
                        y: ["0rem", source.y, source.y, "0rem"],
                        opacity: [0, 1, 1, 0],
                        scale: [0.8, 1, 1, 0.25],
                      }}
                      transition={{ duration: 6.6, delay: sourceIndex * 0.16, times: [0, 0.35, 0.7, 1] }}
                    >
                      <span className="flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 whitespace-nowrap">
                        <Icon className="text-trace-green" size={15} />
                        {source.label}
                      </span>
                    </motion.div>
                  );
                })}
                <motion.div
                  className="absolute left-1/2 top-1/2 flex h-64 w-64 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-trace-green/30 bg-[#071007] text-center shadow-[0_0_120px_rgba(157,255,122,0.14)]"
                  initial={{ opacity: 0, scale: 0.72, filter: "blur(18px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 1.6, delay: 6.6 }}
                >
                  <div>
                    <Sparkles className="mx-auto mb-5 text-trace-green" />
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-trace-green/78">Personal</p>
                    <p className="mt-2 text-3xl font-medium">Context</p>
                  </div>
                </motion.div>
              </div>
              <motion.p
                className="text-[clamp(3rem,5vw,6rem)] font-medium leading-none"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 7.4, duration: 1 }}
              >
                Data is abundant.
                <br />
                <span className="text-white/44">Understanding is scarce.</span>
              </motion.p>
            </div>
          </motion.section>
        )}

        {current === "permissions" && (
          <motion.section
            key="permissions"
            className="absolute inset-0 flex flex-col justify-center px-16"
            initial={{ opacity: 0, y: 30, filter: "blur(18px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(18px)" }}
          >
            <h1 className="mb-12 text-[clamp(4rem,7vw,8rem)] font-medium leading-none">You own your context.</h1>
            <div className="grid gap-5 lg:grid-cols-3">
              {permissions.map(([app, grants, denied], cardIndex) => (
                <motion.div
                  key={app as string}
                  className="rounded-[2rem] border border-white/12 bg-white/[0.03] p-7"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: cardIndex * 0.18 }}
                >
                  <Bot className="mb-6 text-trace-green" />
                  <h2 className="text-3xl font-medium">{app}</h2>
                  <div className="mt-8 space-y-3">
                    {(grants as string[]).map((grant) => (
                      <div key={grant} className="flex items-center justify-between rounded-2xl border border-trace-green/20 bg-trace-green/[0.07] p-4">
                        {grant}
                        <CheckCircle2 className="text-trace-green" size={18} />
                      </div>
                    ))}
                    <div className="rounded-2xl border border-white/10 bg-black/26 p-4 text-white/42">{denied}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="mt-12 text-[clamp(2.5rem,4vw,5rem)] font-medium leading-none text-white/42">Not your AI provider.</p>
          </motion.section>
        )}

        {current === "finale" && (
          <motion.section
            key="finale"
            className="absolute inset-0 flex items-center justify-center px-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <TypeLine lines={["Foundation models gave AI intelligence.", "Trace gives AI continuity.", "Personal context should be a primitive of AI."]} />
              <motion.p
                className="mt-16 text-[clamp(4rem,9vw,9rem)] font-semibold tracking-[0.18em]"
                initial={{ opacity: 0, y: 28, filter: "blur(18px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 5.8, duration: 1.5 }}
              >
                TRACE
              </motion.p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
