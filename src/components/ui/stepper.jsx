import * as React from "react"
import { cn } from "@/lib/utils"

const Stepper = React.forwardRef(({ steps, currentStep, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex items-center justify-between", className)} {...props}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                index < currentStep
                  ? "border-primary-800 bg-primary-800 text-primary-foreground"
                  : index === currentStep
                    ? "border-primary-800 text-primary-800"
                    : "border-gray-300 text-gray-300",
              )}
            >
              {index < currentStep ? <CheckIcon className="h-5 w-5" /> : <span>{index + 1}</span>}
            </div>
            <span className={cn("mt-2 text-xs", index <= currentStep ? "text-primary-800" : "text-gray-300")}>{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn("h-[2px] flex-1", index < currentStep ? "bg-primary-800" : "bg-gray-300")} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
})

// Stepper.displayName = "Stepper"

function CheckIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export { Stepper }

