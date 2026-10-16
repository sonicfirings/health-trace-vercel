"use client";

export default function TraceHealthWeb3MobilePreview() {
  return (
    <main className="min-h-screen bg-[#080a08] px-4 py-6 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF7BAC]/72">
            Mobile Preview
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-normal">Health Trace Web3</h1>
          <p className="mt-2 text-sm text-white/48">390 x 844 live viewport</p>
        </div>

        <div className="rounded-[3rem] border border-white/18 bg-[#111511] p-3 shadow-[0_40px_120px_rgba(0,0,0,0.48)]">
          <div className="overflow-hidden rounded-[2.35rem] border border-white/12 bg-white">
            <iframe
              title="Health Trace Web3 mobile preview"
              src="/trace-health-web3"
              className="h-[844px] w-[390px] border-0"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
