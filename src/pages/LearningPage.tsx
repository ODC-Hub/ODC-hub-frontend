import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const modules = [
  { id: "html-css-js", title: "HTML, CSS & JavaScript", category: "frontend" },
  { id: "typescript", title: "TypeScript", category: "frontend" },
  { id: "react", title: "React.js", category: "frontend" },
  { id: "angular", title: "Angular", category: "frontend" },
  { id: "java", title: "Java", category: "backend" },
  { id: "spring-boot", title: "Spring Boot", category: "backend" },
  { id: "nodejs", title: "Node.js", category: "backend" },
  { id: "databases", title: "Databases", category: "database" },
  { id: "docker", title: "Docker", category: "devops" },
  { id: "aws", title: "AWS", category: "cloud" },
];
const categoryColors: Record<string, string> = {
  frontend: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
  backend: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
  database: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  devops: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  cloud: "bg-gradient-to-r from-cyan-500 to-sky-500 text-white",
};
const categories = ["all", "frontend", "backend", "database", "devops", "cloud"];

export default function LearningPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchCategory =
        activeCategory === "all" || module.category === activeCategory;

      const matchSearch = module.title
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [activeCategory, search]);

return (
  <div className="p-10 space-y-8 bg-gray-50 dark:bg-[#0f172a] min-h-screen transition-colors duration-300">
    {/* Header */}
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Learning Modules
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        AI-powered learning paths based on your modules.
      </p>
    </div>

    {/* Search + Filters */}
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search module..."
        className="w-full md:w-96 px-4 py-2 rounded-xl 
        bg-white dark:bg-[#1e293b]
        border border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              activeCategory === cat
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-[#1e293b] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>

    {/* Modules Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {filteredModules.map((module) => (
        <Link
          key={module.id}
          to={`/learning/${module.id}`}
          className="group rounded-2xl p-6
          bg-white dark:bg-[#1e293b]
          border border-gray-100 dark:border-gray-700
          shadow-sm hover:shadow-xl
          hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex justify-between items-center">
            <span
              className={`text-xs px-3 py-1 rounded-full shadow-sm capitalize ${categoryColors[module.category]}`}
            >
              {module.category}
            </span>
          </div>

          <h2 className="mt-4 text-lg font-semibold 
            text-gray-800 dark:text-white 
            group-hover:text-blue-600 transition">
            {module.title}
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Explore recommended learning resources and improve your skills.
          </p>
        </Link>
      ))}
    </div>
  </div>
);
}