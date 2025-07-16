import { Zap } from "lucide-react";

export const MetricsCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  progress,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle?: string;
  progress?: {
    value: number;
    gradient: string;
  };
  color?: string;
}) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <Icon className={`w-8 h-8 ${color}`} />
      <div className="text-right">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{title}</div>
      </div>
    </div>
    {progress !== undefined && (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-gradient-to-r ${progress.gradient} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(progress.value, 100)}%` }}
        />
      </div>
    )}
    {subtitle && (
      <div className="flex items-center gap-2 mt-2">
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className="text-sm text-gray-300">{subtitle}</span>
      </div>
    )}
  </div>
);