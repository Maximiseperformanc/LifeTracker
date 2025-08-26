import { Clock, CheckSquare, Moon, Target, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: "clock" | "check" | "moon" | "target";
  trend: "up" | "down" | "neutral";
  "data-testid"?: string;
}

const iconMap = {
  clock: Clock,
  check: CheckSquare,
  moon: Moon,
  target: Target,
};

const iconColorMap = {
  clock: "text-primary",
  check: "text-secondary",
  moon: "text-purple-600",
  target: "text-accent",
};

const iconBgMap = {
  clock: "bg-blue-100",
  check: "bg-green-100",
  moon: "bg-purple-100",
  target: "bg-orange-100",
};

export default function StatCard({ title, value, change, icon, trend, ...props }: StatCardProps) {
  const IconComponent = iconMap[icon];
  const iconColor = iconColorMap[icon];
  const iconBg = iconBgMap[icon];

  return (
    <div className="bg-surface p-6 rounded-xl border border-gray-200" {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1" data-testid="stat-value">
            {value}
          </p>
          <p className="text-secondary text-sm mt-1 flex items-center">
            {trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
            <span data-testid="stat-change">{change}</span>
          </p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <IconComponent className={`${iconColor} text-xl h-6 w-6`} />
        </div>
      </div>
    </div>
  );
}
