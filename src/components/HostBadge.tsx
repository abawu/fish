import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Award, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface HostBadgeProps {
  type: "verified" | "expert" | "experienced" | "top-rated" | "cultural";
  className?: string;
}

const badgeConfig = {
  verified: {
    icon: CheckCircle,
    label: "Verified Host",
    variant: "default" as const,
    className: "bg-green-500/10 text-green-700 border-green-500/20",
  },
  expert: {
    icon: Award,
    label: "Cultural Expert",
    variant: "secondary" as const,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  experienced: {
    icon: Star,
    label: "Experienced",
    variant: "secondary" as const,
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  "top-rated": {
    icon: Star,
    label: "Top Rated",
    variant: "secondary" as const,
    className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  },
  cultural: {
    icon: Shield,
    label: "Cultural Ambassador",
    variant: "secondary" as const,
    className: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  },
};

const HostBadge = ({ type, className }: HostBadgeProps) => {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

export default HostBadge;


