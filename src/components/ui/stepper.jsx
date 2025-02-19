// import { Check, User, Book, CreditCard, FileSignature } from "lucide-react" //Import Icons
// import { cn } from "@/lib/utils"

// const stepIcons = [User, Book, CreditCard, FileSignature]; // Add the icons

// export function Stepper({ steps, currentStep, className }) {
//   return (
//     <div className={cn("w-full", className)}>
//       <div className="flex items-center justify-between">
//         {steps.map((step, index) => {
//           const IconComponent = stepIcons[index]; // Get the icon component for the step
//           return (
//             <div key={step} className="flex-1 flex flex-col items-center text-center">
//               <div className="relative">
//                 <div
//                   className={cn(
//                     "h-8 w-8 rounded-full border-2 flex items-center justify-center",
//                     index <= currentStep
//                       ? "border-primary bg-primary text-primary-foreground"
//                       : "border-muted bg-background",
//                   )}
//                 >
//                   {index < currentStep ? (
//                     <Check className="h-4 w-4" />
//                   ) : (
//                     <IconComponent className="h-4 w-4" />  // Show the right Icon
//                   )}
//                 </div>
//                 {/* <span className="absolute -bottom-6 text-sm break-words">{step}</span> */}
//               </div>
//               {index < steps.length - 1 && (
//                 <div className="h-[2px] flex-1 bg-muted" />
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


export const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="flex space-x-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center ${
              index <= currentStep ? "bg-blue-500 text-white" : ""
            }`}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && <div className="flex-grow border-t border-gray-300"></div>}
          {index <= currentStep && <span className="ml-2">{step}</span>}
        </div>
      ))}
    </div>
  )
}

