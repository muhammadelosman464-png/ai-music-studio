'use client'

import clsx from 'clsx'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Locale, translations } from '@/lib/translations'

interface ProductionStepperProps {
  currentStep: number // 0-3; -1 = none started yet
  locale: Locale
}

export default function ProductionStepper({ currentStep, locale }: ProductionStepperProps) {
  const t = translations[locale]

  const steps = [
    {
      icon: '☁️',
      title: t.stepUpload,
      subtitle: t.stepUploadDesc,
    },
    {
      icon: '🎼',
      title: t.stepMelody,
      subtitle: t.stepMelodyDesc,
    },
    {
      icon: '🎤',
      title: t.stepVoice,
      subtitle: t.stepVoiceDesc,
    },
    {
      icon: '🎛️',
      title: t.stepStems,
      subtitle: t.stepStemsDesc,
    },
  ]

  return (
    <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent">
          {t.producingWait}
        </h2>
        <p className="text-xs text-white/40 mt-1">
          {locale === 'ar' ? 'يرجى الانتظار بينما يعالج الذكاء الاصطناعي عملك الفني' : 'Hang tight — your masterpiece is being crafted by neural audio models'}
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep
          const isFuture = index > currentStep

          return (
            <div
              key={index}
              className={clsx(
                'flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 border',
                isActive && 'bg-gold/10 border-gold/40 shadow-lg shadow-gold/5',
                isCompleted && 'bg-white/[0.02] border-white/5',
                isFuture && 'opacity-25 border-transparent'
              )}
            >
              {/* Step indicator */}
              <div className="relative shrink-0">
                {isActive && (
                  <>
                    <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-gold animate-spin" />
                    <div className="absolute -inset-1 rounded-full border border-gold/20" />
                  </>
                )}
                <div
                  className={clsx(
                    'w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300',
                    isCompleted && 'bg-gold/20 text-gold',
                    isActive && 'bg-gold/10 text-gold-light',
                    isFuture && 'bg-white/5 text-white/30'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-gold" />
                  ) : isActive ? (
                    <Loader2 className="w-6 h-6 text-gold animate-spin" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
              </div>

              {/* Step content */}
              <div className="flex-1">
                <p
                  className={clsx(
                    'font-bold text-sm transition-colors duration-300',
                    isCompleted && 'text-gold',
                    isActive && 'text-gold-light',
                    isFuture && 'text-white/60'
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={clsx(
                    'text-xs transition-colors duration-300',
                    isActive ? 'text-white/70' : 'text-white/30'
                  )}
                >
                  {step.subtitle}
                </p>
              </div>

              {/* Status indicator */}
              <div className="shrink-0">
                {isCompleted && (
                  <span className="text-[11px] text-gold font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20">
                    Done ✓
                  </span>
                )}
                {isActive && (
                  <span className="text-[11px] text-gold-light font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 animate-pulse">
                    Active
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall progress bar */}
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-xs text-white/40 font-mono">
          <span>{locale === 'ar' ? 'التقدم الإجمالي' : 'Overall Progress'}</span>
          <span>{Math.min(100, Math.round(((currentStep + 1) / steps.length) * 100))}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, ((currentStep + 1) / steps.length) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
