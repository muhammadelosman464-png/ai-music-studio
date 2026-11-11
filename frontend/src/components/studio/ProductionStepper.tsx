'use client'

import clsx from 'clsx'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface Step {
  icon: string
  title: string
  subtitle: string
}

const STEPS: Step[] = [
  {
    icon: '☁️',
    title: 'Uploading Audio',
    subtitle: 'Sending your recording to the cloud',
  },
  {
    icon: '🎼',
    title: 'Generating Melody',
    subtitle: 'AI is composing your musical arrangement',
  },
  {
    icon: '🎤',
    title: 'Transforming Voice',
    subtitle: 'Neural voice synthesis in progress',
  },
  {
    icon: '🎛️',
    title: 'Separating Stems',
    subtitle: 'Isolating vocals and instrumentals',
  },
]

interface ProductionStepperProps {
  currentStep: number // 0-3; -1 = none started yet
}

export default function ProductionStepper({ currentStep }: ProductionStepperProps) {
  return (
    <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-white/90">Producing Your Track</h2>
        <p className="text-sm text-white/40 mt-1">
          Hang tight — your masterpiece is being crafted
        </p>
      </div>

      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep
          const isFuture = index > currentStep

          return (
            <div
              key={index}
              className={clsx(
                'flex items-center gap-4 p-4 rounded-xl transition-all duration-500',
                isActive && 'bg-gold/5 border border-gold/20',
                isCompleted && 'bg-white/[0.02]',
                isFuture && 'opacity-30',
              )}
            >
              {/* Step indicator */}
              <div className="relative flex-shrink-0">
                {isActive && (
                  <>
                    {/* Spinning ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
                    <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
                  </>
                )}
                <div
                  className={clsx(
                    'w-12 h-12 rounded-full flex items-center justify-center text-xl',
                    'transition-all duration-300',
                    isCompleted && 'bg-gold/10',
                    isActive && 'bg-gold/5',
                    isFuture && 'bg-white/5',
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
                    'font-semibold transition-colors duration-300',
                    isCompleted && 'text-gold',
                    isActive && 'text-gold-light',
                    isFuture && 'text-white/60',
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={clsx(
                    'text-sm transition-colors duration-300',
                    isActive ? 'text-white/60' : 'text-white/30',
                  )}
                >
                  {step.subtitle}
                </p>
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0">
                {isCompleted && (
                  <span className="text-xs text-gold font-medium uppercase tracking-wider">
                    Done
                  </span>
                )}
                {isActive && (
                  <span className="text-xs text-gold/70 font-medium uppercase tracking-wider animate-pulse">
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
        <div className="flex justify-between text-xs text-white/30">
          <span>Progress</span>
          <span>{Math.round((currentStep / STEPS.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
