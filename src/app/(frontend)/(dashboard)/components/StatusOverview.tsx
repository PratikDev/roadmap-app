import { RoadmapItem } from "@/db/schemas/roadmap-schema";
import { cn } from "@/lib/utils";

export default function StatusOverviewCard({
  title,
  value,
  variant,
}: {
  title: string;
  value: number;
  variant: RoadmapItem["status"] | "total";
}) {
  const getStatusColor = (status: RoadmapItem["status"] | "total") => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-blue-600";
      case "planned":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      case "archived":
        return "text-gray-600";
      case "total":
        return "text-gray-800";
    }
  };

  return (
    <div className="rounded-lg bg-white/70 px-6 py-3 backdrop-blur-sm">
      <div className="text-dark text-2xl font-bold">{value}</div>
      <div className={cn("text-sm", getStatusColor(variant))}>{title}</div>
    </div>
  );
}
