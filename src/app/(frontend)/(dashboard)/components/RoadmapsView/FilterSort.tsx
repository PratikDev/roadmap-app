import { ArrowUpDown, Filter } from "lucide-react";

import { ROADMAP_STATUSES } from "@/constants";

interface FilterSortProps {
  statusFilter: string;
  categoryFilter: string;
  sortBy: string;
  onChange: (variant: "status" | "category" | "sortBy", value: string) => void;
  categories: { value: string; label: string }[];
}

const FilterSort = ({
  statusFilter,
  categoryFilter,
  sortBy,
  onChange,
  categories,
}: FilterSortProps) => {
  const statusOptions = [
    { value: "all", label: "All Status" },
    ...ROADMAP_STATUSES,
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "most_upvoted", label: "Most Upvoted" },
    { value: "least_upvoted", label: "Least Upvoted" },
  ];

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Status Filter */}
        <SelectSection
          value={statusFilter}
          onChange={(value) => onChange("status", value)}
          options={statusOptions}
        >
          <Filter className="size-4" />
          Status
        </SelectSection>

        {/* Category Filter */}
        <SelectSection
          value={categoryFilter}
          onChange={(value) => onChange("category", value)}
          options={[{ value: "all", label: "All Categories" }, ...categories]}
        >
          Category
        </SelectSection>

        {/* Sort */}
        <SelectSection
          value={sortBy}
          onChange={(value) => onChange("sortBy", value)}
          options={sortOptions}
        >
          <ArrowUpDown className="size-4" />
          Sort By
        </SelectSection>
      </div>
    </div>
  );
};

const SelectSection = ({
  value,
  onChange,
  options,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  children: React.ReactNode;
}) => (
  <div>
    <label className="text-dark mb-2 flex items-center gap-2 text-sm font-medium">
      {children}
    </label>

    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-dark w-full rounded-lg border border-gray-200 bg-white px-3 py-2"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default FilterSort;
