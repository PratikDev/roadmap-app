import { faker } from "@faker-js/faker";

import db, { type RoadmapItem, roadmapItems } from "@/db";

const statuses: RoadmapItem["status"][] = [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
  "archived",
];

const categories: RoadmapItem["category"][] = [
  "frontend",
  "backend",
  "api",
  "ux",
  "bugfix",
  "infra",
  "performance",
  "security",
  "mobile",
];

async function seedRoadmapItems(count = 50) {
  const items = Array.from({ length: count }).map(() => ({
    title: faker.lorem.sentence({ min: 3, max: 8 }),
    description: faker.lorem.paragraphs({ min: 1, max: 3 }),
    status: faker.helpers.arrayElement(statuses),
    category: faker.helpers.arrayElement(categories),
    upvotes: faker.number.int({ min: 0, max: 1000 }),
    commentsCount: faker.number.int({ min: 0, max: 50 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }));

  await db.insert(roadmapItems).values(items);
  console.log(`Seeded ${count} roadmap items.`);
}

seedRoadmapItems()
  .then(() => console.log("Seeding completed."))
  .catch((error) => console.error("Seeding failed:", error));
