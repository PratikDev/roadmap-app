import { NextRequest, NextResponse } from "next/server";

import { dbAPI } from "@/db/api";

type Props = {
  params: Promise<{
    roadmapId: string;
  }>;
};

// To post a comment on a roadmap item or a reply to an existing comment
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { roadmapId } = await params;

    const body = await request.json();
    const { content, parentId } = body;

    const response = await dbAPI.roadmaps.comment(roadmapId, {
      content,
      parentId,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error commenting:", error);
    return NextResponse.json(
      { error: "Failed to comment on post" },
      { status: 500 },
    );
  }
}

// To get replies of a comment
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { roadmapId } = await params;

    const url = new URL(request.url);
    const parentCommentId = url.searchParams.get("parentCommentId");

    if (!parentCommentId) {
      return NextResponse.json(
        { error: "parentCommentId is required" },
        { status: 400 },
      );
    }

    const response = await dbAPI.roadmaps.getReplies(
      roadmapId,
      parentCommentId,
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching replies:", error);
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 },
    );
  }
}

// To edit a comment
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { roadmapId } = await params;

    const body = await request.json();
    const { content, id } = body;

    const response = await dbAPI.roadmaps.editComment(roadmapId, {
      content,
      commentId: id,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 },
    );
  }
}

// To delete a comment
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { roadmapId } = await params;

    const body = await request.json();
    const { commentId } = body;

    if (
      !commentId ||
      commentId.trim() === "" ||
      typeof commentId !== "string"
    ) {
      return NextResponse.json(
        { error: "commentId is required" },
        { status: 400 },
      );
    }

    const response = await dbAPI.roadmaps.deleteComment(roadmapId, commentId);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
