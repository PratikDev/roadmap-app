import { type RoadmapItem } from "@/db";

export const roadmapItems: RoadmapItem[] = [
  {
    id: "b1a7e7b0-1c2d-4e3f-9a5b-1a2b3c4d5e6f",
    title: "Dark Mode Support",
    description:
      "Add comprehensive dark mode theme support across all components and pages for better user experience during nighttime usage.",
    status: "planned",
    category: "api",
    upvotes: 45,
    commentsCount: 18,
    createdAt: new Date("2025-06-15T10:30:00.000Z"),
    updatedAt: new Date("2024-01-20T14:22:00.000Z"),
  },
  {
    id: "c2b8f8c1-2d3e-5f4a-0b1c-2d3e4f5a6b7c",
    title: "Advanced Search Filters",
    description:
      "Implement powerful search functionality with multiple filters, sorting options, and saved search preferences.",
    status: "in_progress",
    category: "api",
    upvotes: 32,
    commentsCount: 18,
    createdAt: new Date("2024-01-10T09:15:00.000Z"),
    updatedAt: new Date("2024-01-25T16:45:00.000Z"),
  },
  {
    id: "d3c9g9d2-3e4f-6a5b-1c2d-3e4f5a6b7c8d",
    title: "Mobile App Release",
    description:
      "Launch dedicated mobile applications for iOS and Android platforms with full feature parity.",
    status: "planned",
    category: "mobile",
    upvotes: 78,
    commentsCount: 22,
    createdAt: new Date("2024-01-05T11:20:00.000Z"),
    updatedAt: new Date("2024-01-18T13:30:00.000Z"),
  },
  {
    id: "e4d0h0e3-4f5a-7b6c-2d3e-4f5a6b7c8d9e",
    title: "Real-time Notifications",
    description:
      "Add instant push notifications for roadmap updates, comments, and important announcements.",
    status: "completed",
    category: "frontend",
    upvotes: 56,
    commentsCount: 4,
    createdAt: new Date("2023-12-20T08:45:00.000Z"),
    updatedAt: new Date("2024-01-12T10:15:00.000Z"),
  },
  {
    id: "f5e1i1f4-5a6b-8c7d-3e4f-5a6b7c8d9e0f",
    title: "API Documentation Portal",
    description:
      "Create comprehensive API documentation with interactive examples and testing capabilities.",
    status: "in_progress",
    category: "api",
    upvotes: 23,
    commentsCount: 9,
    createdAt: new Date("2024-01-08T14:00:00.000Z"),
    updatedAt: new Date("2024-01-22T09:30:00.000Z"),
  },
  {
    id: "a6f2j2g5-6b7c-9d8e-4f5a-6b7c8d9e0f1a",
    title: "Advanced Analytics Dashboard",
    description:
      "Build detailed analytics and reporting features with customizable charts and export options.",
    status: "planned",
    category: "backend",
    upvotes: 41,
    commentsCount: 0,
    createdAt: new Date("2024-01-12T16:20:00.000Z"),
    updatedAt: new Date("2024-01-24T11:45:00.000Z"),
  },
  {
    id: "b7f2j2g5-6b7c-9d8e-4f5a-6b7c8d9e0f1b",
    title: "User Feedback Collection",
    description:
      "Implement a system for collecting and analyzing user feedback on the product roadmap.",
    status: "archived",
    category: "bugfix",
    upvotes: 25,
    commentsCount: 5,
    createdAt: new Date("2024-01-15T10:00:00.000Z"),
    updatedAt: new Date("2024-01-30T12:00:00.000Z"),
  },
  {
    id: "c8f3k3h6-7b8c-0d9e-5a6b-7c8d9e0f1a2b",
    title: "Performance Optimization",
    description:
      "Enhance application performance with code refactoring, caching strategies, and load balancing.",
    status: "cancelled",
    category: "performance",
    upvotes: 12,
    commentsCount: 2,
    createdAt: new Date("2024-01-18T13:30:00.000Z"),
    updatedAt: new Date("2024-02-01T15:00:00.000Z"),
  },
];
