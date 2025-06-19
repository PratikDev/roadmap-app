import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 left-0 z-50 flex items-center justify-between px-6 py-4 shadow-md">
      <Link
        href="/"
        className="text-dark text-2xl font-bold transition-opacity hover:opacity-80"
      >
        RoadmapApp
      </Link>
    </nav>
  );
}
