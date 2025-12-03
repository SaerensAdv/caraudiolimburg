import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0a760] focus-visible:ring-offset-2 focus-visible:border-[#d0a760] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300 ease-out hover:border-[#d0a760]/50 focus:shadow-[0_0_0_3px_rgba(208,167,96,0.1)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
