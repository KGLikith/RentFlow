import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  labels,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full space-y-2">
      {/* Progress bar */}
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              index < currentStep
                ? 'bg-emerald-600'
                : index === currentStep
                  ? 'bg-emerald-600'
                  : 'bg-gray-200 dark:bg-gray-700'
            )}
          />
        ))}
      </div>

      {/* Step labels */}
      {labels && (
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          {labels.map((label, index) => (
            <span key={index} className="text-center flex-1">
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Step counter */}
      <div className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  )
}
