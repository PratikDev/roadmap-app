import RoadmapItem from "@/components/RoadmapItem";
import CommentsArea from "./components/CommentsArea";

import { dbAPI } from "@/db/api";

type Props = {
  params: Promise<{ roadmapId: string }>;
};
export default async function page({ params }: Props) {
  const { roadmapId } = await params;

  const roadmap = await dbAPI.roadmaps.get(roadmapId);
  if (!roadmap) {
    return <div>Roadmap not found</div>;
  }

  return (
    <div className="container py-6">
      <RoadmapItem
        {...roadmap}
        className="rounded-b-none border-b-0 hover:shadow-none"
      />

      <CommentsArea
        roadmapItemId={roadmapId}
        threads={roadmap.comments}
        depth={0}
        className="rounded-b-lg border border-t-0 pt-0"
      />
    </div>
  );
}
