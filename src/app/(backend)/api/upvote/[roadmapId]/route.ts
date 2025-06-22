import { NextResponse } from "next/server";

import { dbAPI } from "@/db/api";

type Props = {
  params: Promise<{
    roadmapId: string;
  }>;
};
export async function PUT(_: any, { params }: Props) {
  try {
    const { roadmapId } = await params;
    const response = await dbAPI.roadmaps.upvote(roadmapId);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error upvoting:", error);
    return NextResponse.json(
      { error: "Failed to upvote post" },
      { status: 500 },
    );
  }
}
