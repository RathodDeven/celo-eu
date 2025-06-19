import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react" // Added Loader2 import

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "font-bold bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-2xl", // Changed bg-colors-secondary to bg-primary
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 rounded-2xl", // Added text-destructive-foreground
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-2xl", // Changed hover:text-white to hover:text-accent-foreground
        secondary:
          "font-bold bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 rounded-2xl", // Changed bg-colors-secondary to bg-secondary
        ghost: "hover:bg-accent hover:text-accent-foreground", // Changed hover:text-white to hover:text-accent-foreground
        link: "text-primary underline-offset-4 hover:underline", // Added text-primary
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  title: string
  onClick: () => void
  widthFull?: boolean
  disabled?: boolean
  loading?: boolean
  className?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      title,
      children,
      onClick,
      widthFull = false,
      disabled,
      loading,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        onClick={onClick}
        disabled={disabled ?? loading}
        className={cn(
          buttonVariants({ variant, size, className }),
          `${widthFull ? "w-full" : ""}` // Removed px-4 as size variants should handle padding
        )}
        ref={ref}
        aria-label={size === "icon" && children ? title : undefined} // Use title for aria-label on icon buttons
        title={size !== "icon" && !asChild ? title : undefined} // HTML title attribute for tooltip, not for icon buttons or if asChild
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {size !== "icon" && <span>Loading...</span>}
          </>
        ) : size === "icon" ? (
          <>{children}</>
        ) : (
          <>{children || title}</>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
