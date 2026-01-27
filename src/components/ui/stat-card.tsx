import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const statCardVariants = cva(
  "rounded-xl p-6 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card border shadow-sm hover:shadow-md",
        primary: "bg-primary text-primary-foreground shadow-md",
        gradient: "gradient-primary text-primary-foreground shadow-lg",
        glass: "glass-card",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface StatCardProps extends VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant,
  className,
}: StatCardProps) {
  const isLight = variant === "primary" || variant === "gradient";

  return (
    <div className={cn(statCardVariants({ variant }), className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn(
            "text-sm font-medium",
            isLight ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-sm",
              isLight ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "rounded-lg p-2.5",
            isLight ? "bg-primary-foreground/20" : "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              isLight ? "text-primary-foreground" : "text-primary"
            )} />
          </div>
        )}
      </div>
    </div>
  );
}
