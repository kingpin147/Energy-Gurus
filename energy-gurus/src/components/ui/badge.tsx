import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-amber text-ink text-ink hover:bg-amber/80 text-ink",
                secondary:
                    "border-transparent bg-paper text-slate-custom hover:bg-paper/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-graphite",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    logoUrl?: string | null;
}

function Badge({ className, variant, logoUrl, children, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), "flex items-center gap-1.5", className)} {...props}>
            {logoUrl && (
                <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-3.5 h-3.5 rounded-full object-contain bg-white"
                />
            )}
            {children}
        </div>
    )
}

export { Badge, badgeVariants }
