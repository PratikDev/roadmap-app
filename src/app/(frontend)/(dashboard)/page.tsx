import RoadmapItem from "@/components/RoadmapItem";

import { roadmapItems } from "@/data/roadmap";

export default function Home() {
  return (
    <div className="container space-y-4 py-6">
      {roadmapItems.map((item) => (
        <RoadmapItem key={item.id} {...item} />
      ))}
    </div>
  );
}
