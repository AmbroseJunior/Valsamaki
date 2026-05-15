export default function ThankYouPage() {
  return (
    <div
      className="fixed inset-0 z-[9000] flex flex-col items-center justify-center p-5 sm:p-8 overflow-y-auto"
      style={{ background: 'linear-gradient(150deg, #0f1a0f 0%, #1c2a0e 40%, #1a1c0a 100%)' }}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #FCDA06 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v1.png" alt="Valsamaki" className="w-14 h-14 object-contain drop-shadow-lg" />
          <div className="text-left">
            <p className="font-display font-bold text-white text-3xl tracking-tight leading-none">valsamaki</p>
            <p className="text-[#FCDA06] text-xs font-semibold mt-0.5 tracking-widest uppercase">Authentic Crete</p>
          </div>
        </div>

        {/* Olive branch icon */}
        <div className="text-7xl">🫒</div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            You&apos;re on the list!
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            Thank you for joining. We&apos;ll contact you personally when Valsamaki launches — you&apos;ll be among the very first to experience authentic Crete.
          </p>
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mt-2"
            style={{ background: 'rgba(252,218,6,0.12)', border: '1px solid rgba(252,218,6,0.25)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FCDA06] animate-pulse" />
            <span className="text-[#FCDA06] text-sm font-semibold">Watch this space</span>
          </div>
        </div>

        <p className="text-white/15 text-xs">
          © {new Date().getFullYear()} Valsamaki · Heraklion, Crete, Greece
        </p>
      </div>
    </div>
  )
}
