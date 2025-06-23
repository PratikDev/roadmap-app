import Pagination from "@/components/ui/pagination";
import RoadmapsView from "./components/RoadmapsView";
import StatusOverviewCard from "./components/StatusOverview";

import { MAX_POST_PER_PAGE } from "@/constants";
import { dbAPI } from "@/db/api";
import { RoadmapItemsResponse } from "@/types/Responses";

const getStatusCounts = (
  data: RoadmapItemsResponse[],
): Record<string, number> => {
  return {
    total: data.length,
    planned: data.filter((item) => item.status === "planned").length,
    in_progress: data.filter((item) => item.status === "in_progress").length,
    completed: data.filter((item) => item.status === "completed").length,
  };
};

type Props = {
  searchParams?: Promise<{ page: string | string[] | undefined }>;
};
export default async function Home({ searchParams }: Props) {
  const pageParam = (await searchParams)?.page || "1";
  const page = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;

  const { total, data: roadmapItems } = await dbAPI.roadmaps.getAll(page);
  const totalPages = Math.ceil(total / MAX_POST_PER_PAGE);

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

      <RoadmapsView roadmapItems={roadmapItems} />

      {roadmapItems.length > 0 && totalPages > 1 && (
        <Pagination
          className="mb-8"
          totalPages={totalPages}
          currentPage={page}
        />
      )}
    </div>
  );
}
