import { Check, User, Book, CreditCard, FileSignature } from "lucide-react" //Import Icons
import { cn } from "@/lib/utils"

const stepIcons = [User, Book, CreditCard, FileSignature]; // Add the icons

export function Stepper({ steps, currentStep, className }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const IconComponent = stepIcons[index]; // Get the icon component for the step
          return (
            <div key={step} className="flex-1 flex flex-col items-center text-center">
              <div className="relative">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full border-2 flex items-center justify-center",
                    index <= currentStep
                      ? "border-primary-800 bg-primary-800 text-primary-foreground"
                      : "border-muted bg-background",
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <IconComponent className="h-4 w-4" />  // Show the right Icon
                  )}
                </div>
                {/* <span className="absolute -bottom-6 text-sm break-words">{step}</span> */}
              </div>
              {index < steps.length - 1 && (
                <div className="h-[2px] flex-1 bg-muted" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}