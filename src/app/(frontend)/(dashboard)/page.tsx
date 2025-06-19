import RoadmapItem from "@/components/RoadmapItem";

import { roadmapItems } from "@/data/roadmap";
import { type RoadmapItem as RoadmapItemType } from "@/db/schemas/roadmap-schema";
import { cn } from "@/lib/utils";

export default function Home() {
  const getStatusCounts = (data: RoadmapItemType[]): Record<string, number> => {
    return {
      total: data.length,
      planned: data.filter((item) => item.status === "planned").length,
      in_progress: data.filter((item) => item.status === "in_progress").length,
      completed: data.filter((item) => item.status === "completed").length,
    };
  };
  const statusCounts = getStatusCounts(roadmapItems);

  return (
    <div className="container space-y-8 py-6">
      <div className="space-y-4 text-center">
        <h1 className="text-dark text-4xl font-bold md:text-5xl">
          Product Roadmap
        </h1>

        <p className="mx-auto max-w-2xl pb-2 text-xl text-gray-600">
          Explore our product roadmap, vote on features you'd like to see, and
          join the conversation about our future development.
        </p>

        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
          <StatusOverviewCard
            title="Total"
            value={statusCounts.total}
            variant="total"
          />

          <StatusOverviewCard
            title="Planned"
            value={statusCounts.planned}
            variant="planned"
          />

          <StatusOverviewCard
            title="In Progress"
            value={statusCounts.in_progress}
            variant="in_progress"
          />

          <StatusOverviewCard
            title="Completed"
            value={statusCounts.completed}
            variant="completed"
          />
        </div>
      </div>

      <div className="space-y-4">
        {roadmapItems.map((item) => (
          <RoadmapItem key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}

function StatusOverviewCard({
  title,
  value,
  variant,
}: {
  title: string;
  value: number;
  variant: RoadmapItemType["status"] | "total";
}) {
  const getStatusColor = (status: RoadmapItemType["status"] | "total") => {
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
