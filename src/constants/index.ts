import { roadmapCategoryEnum, roadmapStatusEnum } from "@/db";

const COMMENT_MAX_DEPTH = 3;

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 50;

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 300;

const MIN_COMMENT_LENGTH = 1;
const MAX_COMMENT_LENGTH = 1000;

const MAX_POST_PER_PAGE = 20;

const ROADMAP_CATEGORIES: {
  value: (typeof roadmapCategoryEnum.enumValues)[number];
  label: string;
}[] = [
  { value: "api", label: "API" },
  { value: "backend", label: "Backend" },
  { value: "bugfix", label: "Bugfix" },
  { value: "frontend", label: "Frontend" },
  { value: "infra", label: "Infrastructure" },
  { value: "mobile", label: "Mobile" },
  { value: "performance", label: "Performance" },
  { value: "security", label: "Security" },
  { value: "ux", label: "UX" },
];

const ROADMAP_STATUSES: {
  value: (typeof roadmapStatusEnum.enumValues)[number];
  label: string;
}[] = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "archived", label: "Archived" },
];

export {
  COMMENT_MAX_DEPTH,
  MAX_COMMENT_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_POST_PER_PAGE,
  MIN_COMMENT_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  ROADMAP_CATEGORIES,
  ROADMAP_STATUSES,
};
