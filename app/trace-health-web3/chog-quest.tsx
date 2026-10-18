"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Eye,
  Gamepad2,
  Gem,
  LockKeyhole,
  Move3d,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wind,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type QuestGuardian = {
  tokenId: string;
  label: string;
  image: string;
};

type QuestPhase = "idle" | "vision" | "breathing" | "posture" | "finish" | "complete";

type ChogQuestProps = {
  guardian: QuestGuardian | null;
  careXp: number;
  level: number;
  levelProgress: number;
  traits: string[];
  streak: number;
  lastCompletedDate: string;
  todayKey: string;
  ownershipState: "idle" | "checking" | "verified" | "missing";
  detectionError?: string;
  onDetect: () => void;
  onVerifyOwnership: () => Promise<boolean>;
  onComplete: () => void;
};

const stages = [
  { phase: "vision" as const, label: "Distance Vision", duration: 20, icon: Eye },
  { phase: "breathing" as const, label: "Calm Flight", duration: 40, icon: Wind },
  { phase: "posture" as const, label: "Posture Charge", duration: 30, icon: Move3d },
];

const stageDuration: Record<Exclude<QuestPhase, "idle" | "finish" | "complete">, number> = {
  vision: 20,
  breathing: 40,
  posture: 30,
};

const evolutionNames = [
  "Base guardian",
  "Focus antenna",
  "Recovery aura",
  "Calm Trader trail",
  "Monad portal",
  "Builder Balance",
];

export function ChogQuest({
  guardian,
  careXp,
  level,
  levelProgress,
  traits,
  streak,
  lastCompletedDate,
  todayKey,
  ownershipState,
  detectionError = "",
  onDetect,
  onVerifyOwnership,
  onComplete,
}: ChogQuestProps) {
  const reduceMotion = useReducedMotion();
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdCompletedRef = useRef(false);
  const [phase, setPhase] = useState<QuestPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [questError, setQuestError] = useState("");
  const [completionRewarded, setCompletionRewarded] = useState(false);

  const rewardAvailable = lastCompletedDate !== todayKey;
  const isPlaying = phase === "vision" || phase === "breathing" || phase === "posture" || phase === "finish";
  const currentStageIndex = stages.findIndex((stage) => stage.phase === phase);
  const currentDuration = phase === "vision" || phase === "breathing" || phase === "posture" ? stageDuration[phase] : 0;
  const stageProgress = currentDuration ? ((currentDuration - secondsLeft) / currentDuration) * 100 : phase === "finish" ? 100 : 0;
  const breathElapsed = phase === "breathing" ? 40 - secondsLeft : 0;
  const breathingIn = breathElapsed % 10 < 4;
  const postureCue = secondsLeft > 20 ? "Roll shoulders back" : secondsLeft > 10 ? "Lengthen your neck" : "Release your jaw";
  const evolutionName = evolutionNames[Math.min(5, Math.max(0, level - 1))];

  useEffect(() => {
    if (phase !== "vision" && phase !== "breathing" && phase !== "posture") return;
    if (secondsLeft > 0) {
      const timer = window.setTimeout(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
      return () => window.clearTimeout(timer);
    }

    if (phase === "vision") {
      setPhase("breathing");
      setSecondsLeft(40);
    } else if (phase === "breathing") {
      setPhase("posture");
      setSecondsLeft(30);
    } else {
      setPhase("finish");
    }
  }, [phase, secondsLeft]);

  useEffect(
    () => () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    },
    [],
  );

  const startQuest = async () => {
    setQuestError("");
    setIsStarting(true);
    const verified = await onVerifyOwnership();
    setIsStarting(false);
    if (!verified) {
      setQuestError("CHOG ownership could not be verified. Scan the wallet again.");
      return;
    }

    holdCompletedRef.current = false;
    setHoldProgress(0);
    setCompletionRewarded(false);
    setPhase("vision");
    setSecondsLeft(20);
  };

  const stopHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const finishQuest = () => {
    if (holdCompletedRef.current) return;
    holdCompletedRef.current = true;
    stopHold();
    setHoldProgress(100);
    setCompletionRewarded(rewardAvailable);
    onComplete();
    setPhase("complete");
  };

  const beginHold = () => {
    if (phase !== "finish" || holdTimerRef.current) return;
    holdTimerRef.current = setInterval(() => {
      setHoldProgress((current) => {
        const next = Math.min(100, current + 5);
        if (next >= 100) window.setTimeout(finishQuest, 0);
        return next;
      });
    }, 100);
  };

  const cancelHold = () => {
    if (holdCompletedRef.current) return;
    stopHold();
    setHoldProgress(0);
  };

  if (!guardian) {
    return (
      <section className="relative isolate min-h-[34rem] overflow-hidden rounded-[2rem] bg-[#171022] p-5 text-white shadow-[0_30px_100px_rgba(33,20,58,0.26)] sm:p-8 lg:min-h-[40rem] lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,123,172,0.2),transparent_25rem),radial-gradient(circle_at_8%_86%,rgba(131,110,249,0.28),transparent_28rem)]" />
        <div className="relative flex min-h-[29rem] flex-col justify-between lg:min-h-[34rem]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/70">
              <Gamepad2 className="size-4 text-[#FF7BAC]" />
              Chog Quest
            </div>
            <span className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/46">NFT gated</span>
          </div>

          <div className="max-w-3xl py-10">
            <div className="flex size-16 items-center justify-center rounded-[1.4rem] border border-[#FF7BAC]/25 bg-[#FF7BAC]/10 text-[#FF7BAC]">
              <LockKeyhole className="size-7" />
            </div>
            <h1 className="mt-7 text-[clamp(3rem,7vw,7rem)] font-medium leading-[0.86] tracking-normal">
              Your recovery companion is locked.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/58 sm:text-lg sm:leading-8">
              A verified CHOG Genesis NFT becomes the character for daily resets, evolving traits, and weekly recovery proofs.
            </p>
          </div>

          <div className="grid gap-5 border-t border-white/12 pt-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid gap-3 sm:grid-cols-3">
              {["90-second reset", "3× Care XP", "On-chain weekly proof"].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-white/62">
                  <ShieldCheck className="size-4 shrink-0 text-[#FF7BAC]" />
                  {benefit}
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={onDetect}
              disabled={ownershipState === "checking"}
              className="h-12 rounded-full bg-[#FF7BAC] px-6 font-semibold text-[#171022] hover:bg-[#FF9DCA]"
            >
              {ownershipState === "checking" ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Gem className="mr-2 size-4" />}
              {ownershipState === "checking" ? "Scanning Monad..." : "Detect CHOG NFT"}
            </Button>
          </div>
          {detectionError ? <p className="mt-4 text-sm text-rose-200">{detectionError}</p> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#D9D0F1] bg-[#F8F4FF] shadow-[0_30px_100px_rgba(52,35,92,0.15)]">
      <div className="grid min-h-[39rem] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative isolate flex min-h-[30rem] flex-col overflow-hidden bg-[#171022] p-5 text-white sm:p-8 lg:min-h-full lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(131,110,249,0.34),transparent_22rem),radial-gradient(circle_at_78%_12%,rgba(255,123,172,0.22),transparent_18rem)]" />
          {level >= 5 ? (
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-[46%] size-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF7BAC]/40 shadow-[0_0_80px_rgba(131,110,249,0.32),inset_0_0_70px_rgba(255,123,172,0.18)]"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            />
          ) : null}

          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF7BAC]">Chog Reset Quest</p>
              <p className="mt-1 text-sm text-white/50">{guardian.label} · Level {level}</p>
            </div>
            <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs text-white/58">
              {rewardAvailable ? "+75 HT · +90 Care XP" : "Daily reward claimed"}
            </span>
          </div>

          <div className="relative flex flex-1 items-center justify-center py-10">
            {level >= 4 && !reduceMotion ? (
              <motion.div
                aria-hidden
                className="absolute h-3 w-48 rounded-full bg-gradient-to-r from-transparent via-[#FF7BAC]/60 to-transparent blur-sm"
                animate={{ x: [-80, 80, -80], opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}
            <motion.div
              className={`relative size-48 overflow-hidden rounded-[2.4rem] border bg-[#21143A] sm:size-60 ${
                level >= 3
                  ? "border-[#FF7BAC]/70 shadow-[0_0_0_10px_rgba(255,123,172,0.08),0_0_75px_rgba(131,110,249,0.42)]"
                  : "border-white/16 shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
              }`}
              animate={
                reduceMotion
                  ? undefined
                  : phase === "breathing"
                    ? { y: breathingIn ? -24 : 12, scale: breathingIn ? 1.06 : 0.97 }
                    : isPlaying
                      ? { y: [0, -8, 0] }
                      : { y: 0 }
              }
              transition={
                phase === "breathing"
                  ? { duration: breathingIn ? 4 : 6, ease: "easeInOut" }
                  : { duration: 3, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }
              }
            >
              <Image src={guardian.image} alt={guardian.label} fill priority sizes="240px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171022]/36 via-transparent to-white/5" />
              {level >= 2 ? (
                <div className="absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-1 text-[#FF7BAC] drop-shadow-[0_0_10px_rgba(255,123,172,0.8)]">
                  <Sparkles className="size-4" />
                  <Sparkles className="size-3" />
                </div>
              ) : null}
            </motion.div>
          </div>

          <div className="relative min-h-28 text-center">
            {phase === "idle" ? (
              <>
                <p className="text-2xl font-medium">Ready for today&apos;s reset?</p>
                <p className="mt-2 text-sm text-white/50">Vision, breathing, and posture in one quiet sequence.</p>
                <Button
                  type="button"
                  onClick={() => void startQuest()}
                  disabled={isStarting || ownershipState === "checking"}
                  className="mt-5 h-12 rounded-full bg-[#FF7BAC] px-7 font-semibold text-[#171022] hover:bg-[#FF9DCA]"
                >
                  {isStarting || ownershipState === "checking" ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Gamepad2 className="mr-2 size-4" />}
                  {isStarting || ownershipState === "checking" ? "Verifying CHOG..." : rewardAvailable ? "Begin daily quest" : "Replay reset"}
                </Button>
              </>
            ) : phase === "vision" ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF7BAC]">Distance Vision</p>
                <p className="mt-2 text-2xl font-medium">Look at something far away.</p>
                <p className="mt-2 text-sm text-white/50">{secondsLeft} seconds · let the screen rest</p>
              </>
            ) : phase === "breathing" ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF7BAC]">Calm Flight</p>
                <p className="mt-2 text-3xl font-medium">{breathingIn ? "Inhale" : "Exhale"}</p>
                <p className="mt-2 text-sm text-white/50">{secondsLeft} seconds · follow your guardian</p>
              </>
            ) : phase === "posture" ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF7BAC]">Posture Charge</p>
                <p className="mt-2 text-3xl font-medium">{postureCue}</p>
                <p className="mt-2 text-sm text-white/50">{secondsLeft} seconds · move slowly</p>
              </>
            ) : phase === "finish" ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF7BAC]">Reset complete</p>
                <p className="mt-2 text-2xl font-medium">Hold to seal the quest.</p>
                <button
                  type="button"
                  onPointerDown={beginHold}
                  onPointerUp={cancelHold}
                  onPointerLeave={cancelHold}
                  onKeyDown={(event) => {
                    if (event.key === " " || event.key === "Enter") beginHold();
                  }}
                  onKeyUp={(event) => {
                    if (event.key === " " || event.key === "Enter") cancelHold();
                  }}
                  className="relative mt-5 h-12 w-full max-w-xs overflow-hidden rounded-full border border-white/16 bg-white/[0.07] text-sm font-semibold"
                >
                  <span className="absolute inset-y-0 left-0 bg-[#FF7BAC]" style={{ width: `${holdProgress}%` }} />
                  <span className={`relative ${holdProgress > 52 ? "text-[#171022]" : "text-white"}`}>Hold for 2 seconds</span>
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#FF7BAC] text-[#171022]">
                  <Check className="size-5" strokeWidth={3} />
                </div>
                <p className="mt-3 text-2xl font-medium">Recovery reset logged.</p>
                <p className="mt-2 text-sm text-white/50">
                  {completionRewarded ? "+75 HT Points · +90 Care XP" : "Replay complete · rewards already claimed today"}
                </p>
                <Button
                  type="button"
                  onClick={() => setPhase("idle")}
                  className="mt-5 h-10 rounded-full border border-white/14 bg-white/[0.07] px-5 text-white hover:bg-white/[0.12]"
                >
                  <RotateCcw className="mr-2 size-4" />
                  Return to quest
                </Button>
              </>
            )}
            {questError ? <p className="mt-3 text-sm text-rose-200">{questError}</p> : null}
          </div>
        </div>

        <div className="flex flex-col p-5 sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7555DA]">Guardian evolution</p>
              <h2 className="mt-2 text-3xl font-medium leading-tight text-[#21143A]">{evolutionName}</h2>
            </div>
            <span className="rounded-full bg-[#21143A] px-3 py-1 text-xs font-medium text-white">Level {level}</span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-[#756A82]">
              <span>{careXp} Care XP</span>
              <span>{level >= 6 ? "Maximum level" : `${100 - levelProgress} XP to level ${level + 1}`}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5DFF2]">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#836EF9] to-[#FF7BAC]" animate={{ width: `${levelProgress}%` }} />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="border-t border-[#E1DAEF] pt-4">
              <p className="text-3xl font-medium text-[#21143A]">{streak}</p>
              <p className="mt-1 text-xs text-[#756A82]">day quest streak</p>
            </div>
            <div className="border-t border-[#E1DAEF] pt-4">
              <p className="text-3xl font-medium text-[#21143A]">3×</p>
              <p className="mt-1 text-xs text-[#756A82]">holder Care XP</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F617F]">Quest stages</p>
            <div className="mt-4 space-y-1">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const isCurrent = stage.phase === phase;
                const isDone = phase === "finish" || phase === "complete" || (currentStageIndex > index && currentStageIndex >= 0);
                return (
                  <div key={stage.phase} className={`flex items-center gap-3 border-y border-[#E8E2F2] py-3 ${index > 0 ? "-mt-px" : ""}`}>
                    <span className={`flex size-9 items-center justify-center rounded-xl ${isCurrent || isDone ? "bg-[#21143A] text-[#FF7BAC]" : "bg-[#F0EBF7] text-[#756A82]"}`}>
                      {isDone ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#21143A]">{stage.label}</p>
                      <p className="mt-0.5 text-xs text-[#85788F]">{stage.duration} seconds</p>
                    </div>
                    {isCurrent ? <span className="text-xs font-medium text-[#7555DA]">Active</span> : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F617F]">Unlocked traits</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {traits.length ? (
                traits.map((trait) => (
                  <span key={trait} className="rounded-full border border-[#D9D0F1] bg-white px-3 py-1.5 text-xs text-[#5F526F]">
                    {trait}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#85788F]">Complete quests to unlock the first trait.</span>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-[#E1DAEF] pt-5 text-xs leading-5 text-[#85788F]">
            {lastCompletedDate === todayKey ? "Today’s rewarded quest is complete. Replays remain available." : "Today’s guardian reward is available."}
          </div>
        </div>
      </div>
    </section>
  );
}
