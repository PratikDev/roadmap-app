import { RoadmapItem } from "@/db";

export type RoadmapItemsResponse = Omit<RoadmapItem, "category"> & {
  category: string;
  hasUpvoted: boolean;
};
