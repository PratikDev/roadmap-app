import { Comments, RoadmapItem, User } from "@/db";

export type RoadmapItemsResponse = Omit<RoadmapItem, "category"> & {
  category: string;
  hasUpvoted: boolean;
};

export type RoadmapItemDetailResponse = RoadmapItemsResponse & {
  comments: CommentsResponse[];
};

export type CommentsResponse = Omit<Comments, "userId"> & {
  user: User;
};
